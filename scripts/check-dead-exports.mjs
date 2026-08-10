#!/usr/bin/env node
/**
 * CI guard — dead export check for src/ui/symbols.ts and src/ui/board.ts.
 *
 * These modules previously accumulated exports with zero importers
 * (wheelSvg, askJamieSvg, runJoeyLaundryChapter — removed by an earlier
 * audit). This script fails CI if any exported name from the guarded files
 * has no importer anywhere else under src/.
 *
 * Parsing covers all export forms used in this codebase: declaration
 * exports, `export { A, B as C }` lists,
 * `export { X } from "..."` / `export type { X } from "..."` re-exports,
 * and default exports. Import matching is module-resolved: an import only
 * counts if its specifier resolves to the guarded file — an identically
 * named import from a different module does not satisfy the guard.
 * A namespace import (`import * as ns from "./board"`) or star re-export
 * of a guarded file conservatively counts every export as used.
 *
 * Run directly:  node scripts/check-dead-exports.mjs
 * Self-test:     node scripts/check-dead-exports.mjs --self-test
 * npm alias:     npm run validate:dead-exports
 *
 * Exit codes: 0 = every export has at least one importer, 1 = dead export(s).
 */

import {
  readFileSync,
  readdirSync,
  statSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SELF = fileURLToPath(import.meta.url);
const DEFAULT_ROOT = resolve(dirname(SELF), "..");
const DEFAULT_GUARDED = ["src/ui/symbols.ts", "src/ui/board.ts"];
const STAR = Symbol("star"); // namespace import / star re-export marker

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

/** All names a module exports. Default exports are recorded as "default". */
function exportedNames(source) {
  const names = new Set();
  const declRe =
    /^export\s+(?:async\s+)?(?:function|const|let|var|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/gm;
  for (const m of source.matchAll(declRe)) names.add(m[1]);
  if (/^export\s+default\b/m.test(source)) names.add("default");
  // export { A, B as C }  and  export (type) { X, Y as Z } from "..." —
  // the *exported* name is the alias (C/Z) or the plain name.
  const listRe = /^export\s*(?:type\s*)?\{([^}]*)\}/gm;
  for (const m of source.matchAll(listRe)) {
    for (const raw of m[1].split(",")) {
      const item = raw.trim().replace(/^type\s+/, "");
      if (!item) continue;
      const asMatch = item.match(/^([\w$]+)\s+as\s+([\w$]+)$/);
      names.add(asMatch ? asMatch[2] : item);
    }
  }
  return names;
}

function resolveSpecifier(importerFile, spec) {
  if (!spec.startsWith(".")) return null;
  const base = resolve(dirname(importerFile), spec);
  for (const c of [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")]) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

/**
 * Names a file consumes per resolved module: Map<absPath, Set<name|STAR>>.
 * Covers named/default/namespace imports and `export ... from` re-exports.
 */
function consumedByModule(file, source) {
  const map = new Map();
  const bucket = (spec) => {
    const target = resolveSpecifier(file, spec);
    if (!target) return null;
    if (!map.has(target)) map.set(target, new Set());
    return map.get(target);
  };
  const addNamed = (set, clause) => {
    for (const raw of clause.split(",")) {
      const item = raw.trim().replace(/^type\s+/, "");
      if (!item) continue;
      // exporter-side name is A in `A as B`
      set.add(item.split(/\s+as\s+/)[0].trim());
    }
  };
  // import (type)? [Default][, { named }] from "spec"   |   import * as ns from "spec"
  const importRe =
    /import\s+(?:type\s+)?(?:([\w$]+)\s*,\s*)?(?:\{([^}]*)\}|\*\s*as\s+[\w$]+|([\w$]+))\s*from\s*["']([^"']+)["']/g;
  for (const m of source.matchAll(importRe)) {
    const set = bucket(m[4]);
    if (!set) continue;
    if (m[1] || m[3]) set.add("default"); // default import (with or without named list)
    if (m[2] !== undefined) addNamed(set, m[2]);
    if (m[2] === undefined && !m[3]) set.add(STAR); // namespace import
  }
  // export (type)? { named } from "spec"   |   export * from "spec"
  const reexportRe = /export\s+(?:type\s+)?(?:\{([^}]*)\}|\*)\s*from\s*["']([^"']+)["']/g;
  for (const m of source.matchAll(reexportRe)) {
    const set = bucket(m[2]);
    if (!set) continue;
    if (m[1] !== undefined) addNamed(set, m[1]);
    else set.add(STAR);
  }
  return map;
}

/** Runs the check. Returns true when no dead exports were found. */
function runCheck(root, guarded) {
  const allFiles = walk(resolve(root, "src"));
  const consumed = new Map(guarded.map((g) => [resolve(root, g), new Set()]));

  for (const file of allFiles) {
    const source = readFileSync(file, "utf8");
    for (const [target, names] of consumedByModule(file, source)) {
      const set = consumed.get(target);
      if (!set || resolve(file) === target) continue;
      for (const n of names) set.add(n);
    }
  }

  let failed = false;
  for (const guardedRel of guarded) {
    const abs = resolve(root, guardedRel);
    const names = exportedNames(readFileSync(abs, "utf8"));
    if (names.size === 0) {
      console.error(`ERROR: found no exports in ${guardedRel} — parser out of date?`);
      failed = true;
      continue;
    }
    const used = consumed.get(abs);
    let fileOk = true;
    for (const name of names) {
      if (!used.has(name) && !used.has(STAR)) {
        console.error(
          `DEAD EXPORT: ${guardedRel} exports "${name}" but nothing under src/ imports it from this module — remove the export or wire up its consumer.`,
        );
        failed = true;
        fileOk = false;
      }
    }
    if (fileOk) console.log(`${guardedRel}: ${names.size} exports, all imported at least once.`);
  }
  return !failed;
}

// ── Self-test: fixture-based positive and negative cases ─────────────────────

function selfTest() {
  const SYM = `export function symbolSvg(): string { return ""; }\n`;
  const MAIN_BASE = `import { renderBoard } from "./ui/board";\nimport { symbolSvg } from "./ui/symbols";\nconsole.log(renderBoard(), symbolSvg());\n`;
  const cases = [
    {
      name: "live export imported from the guarded module passes",
      expectFail: false,
      files: {
        "src/ui/board.ts": `export const renderBoard = () => 1;\n`,
        "src/ui/symbols.ts": SYM,
        "src/main.ts": MAIN_BASE,
      },
    },
    {
      name: "same-named import from a DIFFERENT module does not satisfy the guard",
      expectFail: true,
      expectText: 'DEAD EXPORT: src/ui/board.ts exports "LINES"',
      files: {
        "src/engine/economy.ts": `export const LINES = 5;\n`,
        "src/ui/board.ts": `import { LINES } from "../engine/economy";\nexport { LINES };\nexport const renderBoard = () => LINES;\n`,
        "src/ui/symbols.ts": SYM,
        "src/main.ts": `import { LINES } from "./engine/economy";\n${MAIN_BASE}console.log(LINES);\n`,
      },
    },
    {
      name: "export with zero importers anywhere fails",
      expectFail: true,
      expectText: 'DEAD EXPORT: src/ui/symbols.ts exports "unusedSvg"',
      files: {
        "src/ui/board.ts": `export const renderBoard = () => 1;\n`,
        "src/ui/symbols.ts": SYM + `export function unusedSvg(): string { return ""; }\n`,
        "src/main.ts": MAIN_BASE,
      },
    },
    {
      name: "aliased re-export is tracked by its exported alias",
      expectFail: true,
      expectText: 'DEAD EXPORT: src/ui/board.ts exports "BOARD_LINES"',
      files: {
        "src/engine/economy.ts": `export const LINES = 5;\n`,
        "src/ui/board.ts": `import { LINES } from "../engine/economy";\nexport { LINES as BOARD_LINES };\nexport const renderBoard = () => LINES;\n`,
        "src/ui/symbols.ts": SYM,
        "src/main.ts": MAIN_BASE,
      },
    },
    {
      name: "unconsumed `export { X } from` re-export fails",
      expectFail: true,
      expectText: 'DEAD EXPORT: src/ui/board.ts exports "LINES"',
      files: {
        "src/engine/economy.ts": `export const LINES = 5;\n`,
        "src/ui/board.ts": `export { LINES } from "../engine/economy";\nexport const renderBoard = () => 1;\n`,
        "src/ui/symbols.ts": SYM,
        "src/main.ts": MAIN_BASE,
      },
    },
    {
      name: "consumed `export { X } from` re-export passes",
      expectFail: false,
      files: {
        "src/engine/economy.ts": `export const LINES = 5;\n`,
        "src/ui/board.ts": `export { LINES } from "../engine/economy";\nexport const renderBoard = () => 1;\n`,
        "src/ui/symbols.ts": SYM,
        "src/main.ts": `import { LINES } from "./ui/board";\n${MAIN_BASE}console.log(LINES);\n`,
      },
    },
    {
      name: "unconsumed `export type { X } from` re-export fails",
      expectFail: true,
      expectText: 'DEAD EXPORT: src/ui/board.ts exports "GridCell"',
      files: {
        "src/engine/grid.ts": `export type GridCell = { id: string };\n`,
        "src/ui/board.ts": `export type { GridCell } from "../engine/grid";\nexport const renderBoard = () => 1;\n`,
        "src/ui/symbols.ts": SYM,
        "src/main.ts": MAIN_BASE,
      },
    },
    {
      name: "consumed `export type { X } from` re-export passes (via import type)",
      expectFail: false,
      files: {
        "src/engine/grid.ts": `export type GridCell = { id: string };\n`,
        "src/ui/board.ts": `export type { GridCell } from "../engine/grid";\nexport const renderBoard = () => 1;\n`,
        "src/ui/symbols.ts": SYM,
        "src/main.ts": `import type { GridCell } from "./ui/board";\n${MAIN_BASE}const c: GridCell = { id: "x" }; console.log(c);\n`,
      },
    },
    {
      name: "unconsumed default export fails",
      expectFail: true,
      expectText: 'DEAD EXPORT: src/ui/board.ts exports "default"',
      files: {
        "src/ui/board.ts": `export const renderBoard = () => 1;\nexport default function boardWidget(): number { return 2; }\n`,
        "src/ui/symbols.ts": SYM,
        "src/main.ts": MAIN_BASE,
      },
    },
    {
      name: "consumed default export passes",
      expectFail: false,
      files: {
        "src/ui/board.ts": `export const renderBoard = () => 1;\nexport default function boardWidget(): number { return 2; }\n`,
        "src/ui/symbols.ts": SYM,
        "src/main.ts": `import boardWidget from "./ui/board";\n${MAIN_BASE}console.log(boardWidget());\n`,
      },
    },
    {
      name: "namespace import counts every export as used",
      expectFail: false,
      files: {
        "src/ui/board.ts": `export const renderBoard = () => 1;\nexport const LINES = 5;\n`,
        "src/ui/symbols.ts": SYM,
        "src/main.ts": `import * as board from "./ui/board";\nimport { symbolSvg } from "./ui/symbols";\nconsole.log(board, symbolSvg());\n`,
      },
    },
  ];

  let ok = true;
  for (const c of cases) {
    const dir = mkdtempSync(join(tmpdir(), "dead-exports-selftest-"));
    try {
      for (const [rel, content] of Object.entries(c.files)) {
        const p = resolve(dir, rel);
        mkdirSync(dirname(p), { recursive: true });
        writeFileSync(p, content);
      }
      const res = spawnSync(process.execPath, [SELF, "--check-root", dir], { encoding: "utf8" });
      const failedRun = res.status !== 0;
      const textOk = !c.expectText || (res.stderr + res.stdout).includes(c.expectText);
      if (failedRun === c.expectFail && textOk) {
        console.log(`SELF-TEST OK:   ${c.name}`);
      } else {
        console.error(`SELF-TEST FAIL: ${c.name} (exit=${res.status}, expected fail=${c.expectFail}, textOk=${textOk})`);
        console.error(res.stdout + res.stderr);
        ok = false;
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  if (!ok) process.exit(1);
  console.log("\nAll self-test cases behaved as expected.");
}

// ── Entry point ───────────────────────────────────────────────────────────────

if (process.argv.includes("--self-test")) {
  selfTest();
} else {
  const rootFlag = process.argv.indexOf("--check-root");
  const root = rootFlag !== -1 ? process.argv[rootFlag + 1] : DEFAULT_ROOT;
  if (!runCheck(root, DEFAULT_GUARDED)) process.exit(1);
}
