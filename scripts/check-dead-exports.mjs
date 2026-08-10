#!/usr/bin/env node
/**
 * CI guard — dead export check for src/ui/symbols.ts and src/ui/board.ts.
 *
 * These modules previously accumulated exports with zero importers
 * (wheelSvg, askJamieSvg, runJoeyLaundryChapter — removed by an earlier
 * audit). This script fails CI if any exported name from the guarded files
 * has no importer anywhere else under src/.
 *
 * Import matching is module-resolved: an import only counts if its module
 * specifier actually resolves to the guarded file. An identically named
 * import from a different module (e.g. BET_LEVELS from engine/economy) does
 * NOT satisfy the guard for a board.ts re-export of the same name.
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

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

/** Extract exported names from a TS source file (declarations + export lists). */
function exportedNames(source) {
  const names = new Set();
  const declRe =
    /^export\s+(?:async\s+)?(?:function|const|let|var|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/gm;
  for (const m of source.matchAll(declRe)) names.add(m[1]);
  // export { A, B as C } — the *exported* name is C (or A when no alias).
  const listRe = /^export\s*(?:type\s*)?\{([^}]*)\}(?!\s*from)/gm;
  for (const m of source.matchAll(listRe)) {
    for (const raw of m[1].split(",")) {
      const item = raw.trim();
      if (!item) continue;
      const asMatch = item.match(/^(?:type\s+)?([\w$]+)\s+as\s+([\w$]+)$/);
      names.add(asMatch ? asMatch[2] : item.replace(/^type\s+/, ""));
    }
  }
  return names;
}

/**
 * Resolve a relative import specifier from `importerFile` to an absolute
 * file path (trying .ts/.tsx/index variants). Returns null for bare
 * (package) specifiers or unresolvable paths.
 */
function resolveSpecifier(importerFile, spec) {
  if (!spec.startsWith(".")) return null;
  const base = resolve(dirname(importerFile), spec);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ];
  for (const c of candidates) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

/**
 * Collect named imports per resolved module: Map<absModulePath, Set<name>>.
 * Names recorded are the exporter-side names (`A` in `A as B`).
 */
function importsByModule(file, source) {
  const map = new Map();
  const importRe =
    /import\s+(?:type\s+)?(?:[\w$]+\s*,\s*)?\{([^}]*)\}\s*from\s*["']([^"']+)["']/g;
  for (const m of source.matchAll(importRe)) {
    const target = resolveSpecifier(file, m[2]);
    if (!target) continue;
    const set = map.get(target) ?? new Set();
    for (const raw of m[1].split(",")) {
      const item = raw.trim().replace(/^type\s+/, "");
      if (!item) continue;
      set.add(item.split(/\s+as\s+/)[0].trim());
    }
    map.set(target, set);
  }
  return map;
}

/** Runs the check. Returns true when no dead exports were found. */
function runCheck(root, guarded) {
  const allFiles = walk(resolve(root, "src"));

  // For each guarded file, the set of names imported *from that file* by others.
  const importedFromGuarded = new Map(guarded.map((g) => [resolve(root, g), new Set()]));
  for (const file of allFiles) {
    const source = readFileSync(file, "utf8");
    for (const [target, names] of importsByModule(file, source)) {
      const bucket = importedFromGuarded.get(target);
      if (!bucket || resolve(file) === target) continue;
      for (const n of names) bucket.add(n);
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
    const imported = importedFromGuarded.get(abs);
    let fileOk = true;
    for (const name of names) {
      if (!imported.has(name)) {
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
  const cases = [
    {
      name: "live export imported from the guarded module passes",
      expectFail: false,
      files: {
        "src/ui/board.ts": `export const LINES = 5;\n`,
        "src/ui/symbols.ts": `export function symbolSvg(): string { return ""; }\n`,
        "src/main.ts": `import { LINES } from "./ui/board";\nimport { symbolSvg } from "./ui/symbols";\nconsole.log(LINES, symbolSvg());\n`,
      },
    },
    {
      name: "same-named import from a DIFFERENT module does not satisfy the guard",
      expectFail: true,
      expectText: 'DEAD EXPORT: src/ui/board.ts exports "LINES"',
      files: {
        "src/engine/economy.ts": `export const LINES = 5;\n`,
        "src/ui/board.ts": `import { LINES } from "../engine/economy";\nexport { LINES };\nexport const renderBoard = () => LINES;\n`,
        "src/ui/symbols.ts": `export function symbolSvg(): string { return ""; }\n`,
        "src/main.ts": `import { LINES } from "./engine/economy";\nimport { renderBoard } from "./ui/board";\nimport { symbolSvg } from "./ui/symbols";\nconsole.log(LINES, renderBoard(), symbolSvg());\n`,
      },
    },
    {
      name: "export with zero importers anywhere fails",
      expectFail: true,
      expectText: 'DEAD EXPORT: src/ui/symbols.ts exports "unusedSvg"',
      files: {
        "src/ui/board.ts": `export const renderBoard = () => 1;\n`,
        "src/ui/symbols.ts": `export function symbolSvg(): string { return ""; }\nexport function unusedSvg(): string { return ""; }\n`,
        "src/main.ts": `import { renderBoard } from "./ui/board";\nimport { symbolSvg } from "./ui/symbols";\nconsole.log(renderBoard(), symbolSvg());\n`,
      },
    },
    {
      name: "aliased re-export is tracked by its exported alias",
      expectFail: true,
      expectText: 'DEAD EXPORT: src/ui/board.ts exports "BOARD_LINES"',
      files: {
        "src/engine/economy.ts": `export const LINES = 5;\n`,
        "src/ui/board.ts": `import { LINES } from "../engine/economy";\nexport { LINES as BOARD_LINES };\nexport const renderBoard = () => LINES;\n`,
        "src/ui/symbols.ts": `export function symbolSvg(): string { return ""; }\n`,
        "src/main.ts": `import { renderBoard } from "./ui/board";\nimport { symbolSvg } from "./ui/symbols";\nconsole.log(renderBoard(), symbolSvg());\n`,
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
