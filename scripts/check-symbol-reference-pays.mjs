#!/usr/bin/env node
/**
 * CI guard — SymbolReference payout sync check.
 *
 * Compares every `pays` entry in SymbolReference.tsx against the PAYTABLE
 * constant in src/engine/paylines.ts.  Fails if any value diverges so that
 * a paytable rebalance is not silently missed in the design-canvas reference.
 *
 * Run directly:  node scripts/check-symbol-reference-pays.mjs
 * npm alias:     npm run validate:symbol-pays
 *
 * Exit codes: 0 = all in sync, 1 = mismatch or parse failure.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ── 1. Extract PAYTABLE from paylines.ts ─────────────────────────────────────
//
// Looks for the exported object literal:
//   export const PAYTABLE: ... = {
//     tumbler: { 3: 56, 4: 167, 5: 1112 },
//     ...
//   };

const paylinesSrc = readFileSync(resolve(ROOT, "src/engine/paylines.ts"), "utf8");

// Capture the entire PAYTABLE object body.
const paytableBlockRe = /export\s+const\s+PAYTABLE\s*:[^=]+=\s*\{([\s\S]*?)\};/;
const paytableBlockMatch = paylinesSrc.match(paytableBlockRe);
if (!paytableBlockMatch) {
  console.error(
    "ERROR: Could not locate the PAYTABLE object in src/engine/paylines.ts.\n" +
    "       Expected: export const PAYTABLE: ... = { ... };",
  );
  process.exit(1);
}

/** @type {Map<string, {3:number,4:number,5:number}>} */
const paytable = new Map();

// Each entry looks like:  symbolId: { 3: N, 4: N, 5: N },
const entryRe = /(\w+):\s*\{\s*3:\s*(\d+),\s*4:\s*(\d+),\s*5:\s*(\d+)\s*\}/g;
for (const m of paytableBlockMatch[1].matchAll(entryRe)) {
  paytable.set(m[1], { 3: Number(m[2]), 4: Number(m[3]), 5: Number(m[4]) });
}

if (paytable.size === 0) {
  console.error(
    "ERROR: PAYTABLE block found but no entries parsed.\n" +
    "       Check that each entry has the form:  symbolId: { 3: N, 4: N, 5: N },",
  );
  process.exit(1);
}

// ── 2. Extract pays entries from SymbolReference.tsx ─────────────────────────
//
// Each symbol definition looks like (possibly across multiple lines):
//   { id: "tumbler", ..., pays: { 3: 56, 4: 167, 5: 1112 } },

const symRefPath = resolve(
  ROOT,
  "artifacts/mockup-sandbox/src/components/mockups/design-system/SymbolReference.tsx",
);
const symRefSrc = readFileSync(symRefPath, "utf8");

/** @type {Map<string, {3:number,4:number,5:number}>} */
const refPays = new Map();

// Match id:"..." and pays:{3:N,4:N,5:N} anywhere in the same symbol entry.
// We iterate over id occurrences and look ahead for a pays block within the
// same brace-delimited entry (up to the next top-level closing brace).
const idRe = /id:\s*"([^"]+)"/g;
let idMatch;
while ((idMatch = idRe.exec(symRefSrc)) !== null) {
  const id = idMatch[1];
  // Look for a pays block starting from this id's position, within ~200 chars
  // (covers multi-line entries with atlas coords).
  const slice = symRefSrc.slice(idMatch.index, idMatch.index + 250);
  const paysRe = /pays:\s*\{\s*3:\s*(\d+),\s*4:\s*(\d+),\s*5:\s*(\d+)\s*\}/;
  const pm = slice.match(paysRe);
  if (pm) {
    refPays.set(id, { 3: Number(pm[1]), 4: Number(pm[2]), 5: Number(pm[3]) });
  }
}

if (refPays.size === 0) {
  console.error(
    "ERROR: No pays entries found in SymbolReference.tsx.\n" +
    "       Expected entries of the form:  pays: { 3: N, 4: N, 5: N }",
  );
  process.exit(1);
}

// ── 3. Compare ────────────────────────────────────────────────────────────────

let failed = false;

// Every entry in PAYTABLE must match SymbolReference (the reference must cover
// all paying symbols).
for (const [id, expected] of paytable) {
  const actual = refPays.get(id);
  if (!actual) {
    console.error(
      `MISSING: "${id}" is in PAYTABLE but has no pays entry in SymbolReference.tsx.\n` +
      `         Add: pays: { 3: ${expected[3]}, 4: ${expected[4]}, 5: ${expected[5]} }`,
    );
    failed = true;
    continue;
  }
  for (const count of /** @type {(3|4|5)[]} */([3, 4, 5])) {
    if (actual[count] !== expected[count]) {
      console.error(
        `MISMATCH: "${id}" count-${count} multiplier\n` +
        `          paylines.ts:        ${expected[count]}\n` +
        `          SymbolReference.tsx: ${actual[count]}`,
      );
      failed = true;
    }
  }
  if (!failed || !refPays.has(id)) {
    // Only print OK for entries without any mismatch on this symbol.
  }
}

// Extra entries in SymbolReference that are NOT in PAYTABLE (e.g. stale entries
// from a removed symbol) are reported as warnings but do not fail CI — they
// are harmless for accuracy (they just won't match any game symbol).
for (const id of refPays.keys()) {
  if (!paytable.has(id)) {
    console.warn(
      `WARN: "${id}" has a pays entry in SymbolReference.tsx but is not in PAYTABLE.\n` +
      `      This is harmless but may indicate a stale entry.`,
    );
  }
}

if (failed) {
  console.error(
    "\nTo fix: update the pays values in SymbolReference.tsx to match PAYTABLE in src/engine/paylines.ts.",
  );
  process.exit(1);
}

// Print one OK line per matching symbol.
for (const id of paytable.keys()) {
  if (refPays.has(id)) console.log(`OK:   ${id}`);
}
console.log(
  `\nAll ${paytable.size} PAYTABLE symbol pays are in sync with SymbolReference.tsx.`,
);
