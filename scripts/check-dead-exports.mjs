#!/usr/bin/env node
/**
 * CI guard — dead export check for src/ui/symbols.ts and src/ui/board.ts.
 *
 * These modules previously accumulated exports with zero importers
 * (wheelSvg, askJamieSvg, runJoeyLaundryChapter — removed by an earlier
 * audit). This script fails CI if any exported name from the guarded files
 * has no importer anywhere else under src/.
 *
 * How it works (regex-based, matching the other validate:* scripts):
 *   1. Collect exported names from each guarded file:
 *      - `export function|const|let|var|class|type|interface|enum NAME`
 *      - `export { A, B as C }` re-export/alias lists
 *   2. Scan every other .ts file under src/ for references:
 *      - `import { ... NAME ... } from` (incl. `import type`)
 *      - NAME appearing in any import specifier list
 *   3. Fail with the file + export name for every export with zero importers.
 *
 * Run directly:  node scripts/check-dead-exports.mjs
 * npm alias:     npm run validate:dead-exports
 *
 * Exit codes: 0 = every export has at least one importer, 1 = dead export(s).
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, relative } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const GUARDED = ["src/ui/symbols.ts", "src/ui/board.ts"];

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
  const listRe = /^export\s*\{([^}]*)\}/gm;
  for (const m of source.matchAll(listRe)) {
    for (const raw of m[1].split(",")) {
      const item = raw.trim();
      if (!item) continue;
      const asMatch = item.match(/^([\w$]+)\s+as\s+([\w$]+)$/);
      names.add(asMatch ? asMatch[2] : item.replace(/^type\s+/, ""));
    }
  }
  return names;
}

/** Collect all names imported in a TS source file. */
function importedNames(source) {
  const names = new Set();
  const importRe = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*["'][^"']+["']/g;
  for (const m of source.matchAll(importRe)) {
    for (const raw of m[1].split(",")) {
      const item = raw.trim().replace(/^type\s+/, "");
      if (!item) continue;
      // `A as B` — the exporter-side name is A.
      names.add(item.split(/\s+as\s+/)[0].trim());
    }
  }
  return names;
}

const allFiles = walk(resolve(ROOT, "src"));
const guardedAbs = new Set(GUARDED.map((g) => resolve(ROOT, g)));

// Union of every name imported anywhere in src/ (outside the exporting file).
const importersByName = new Map(); // name -> [files]
for (const file of allFiles) {
  const src = readFileSync(file, "utf8");
  for (const name of importedNames(src)) {
    (importersByName.get(name) ?? importersByName.set(name, []).get(name)).push(file);
  }
}

let failed = false;
for (const guarded of GUARDED) {
  const abs = resolve(ROOT, guarded);
  const source = readFileSync(abs, "utf8");
  const names = exportedNames(source);
  if (names.size === 0) {
    console.error(`ERROR: found no exports in ${guarded} — parser out of date?`);
    failed = true;
    continue;
  }
  for (const name of names) {
    const importers = (importersByName.get(name) ?? []).filter((f) => resolve(f) !== abs);
    if (importers.length === 0) {
      console.error(
        `DEAD EXPORT: ${guarded} exports "${name}" but nothing under src/ imports it — remove the export or wire up its consumer.`,
      );
      failed = true;
    }
  }
  if (!failed) {
    console.log(`${guarded}: ${names.size} exports, all imported at least once.`);
  }
}

process.exit(failed ? 1 : 0);
