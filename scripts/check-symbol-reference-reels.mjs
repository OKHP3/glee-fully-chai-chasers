#!/usr/bin/env node
/**
 * CI guard — SymbolReference reel-placement sync check.
 *
 * Derives the reel indices each constrained symbol can appear on from
 * src/engine/reels.ts (and UNIGLEE_ACTIVE_REELS in src/engine/uniglee.ts),
 * then compares against the human-readable `reels: "..."` chips in
 * SymbolReference.tsx.  Fails with a per-symbol diff if the design-canvas
 * reference drifts from what the engine actually does.
 *
 * Run directly:  node scripts/check-symbol-reference-reels.mjs
 * npm alias:     npm run validate:symbol-reels
 *
 * Exit codes: 0 = all in sync, 1 = mismatch or parse failure.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REEL_COUNT = 5;

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

// ── 1. Derive engine truth from reels.ts ─────────────────────────────────────

const reelsSrc = readFileSync(resolve(ROOT, "src/engine/reels.ts"), "utf8");

/** @type {Map<string, Set<number>>} symbol id → zero-based reel indices */
const engineReels = new Map();

function addReels(id, indices) {
  const set = engineReels.get(id) ?? new Set();
  for (const i of indices) set.add(i);
  engineReels.set(id, set);
}

// Treat symbols: which symbols are in treatSegments()?
const treatSegBlock = reelsSrc.match(/function treatSegments\(\)[\s\S]*?\n\}/);
if (!treatSegBlock) fail("Could not locate treatSegments() in reels.ts");
const treatIds = [...treatSegBlock[0].matchAll(/repeat\("(\w+)"/g)].map((m) => m[1]);
if (treatIds.length === 0) fail("No treat symbols parsed from treatSegments()");

// Which reels get treatSegments()? Parse the guard in buildStrip:
//   if (reelIndex === 0 || reelIndex === 2 || reelIndex === 4) segments.push(...treatSegments());
const treatGuard = reelsSrc.match(/if \(([^)]+)\) segments\.push\(\.\.\.treatSegments\(\)\)/);
if (!treatGuard) fail("Could not locate the treatSegments() reel guard in buildStrip()");
const treatReels = [...treatGuard[1].matchAll(/reelIndex === (\d+)/g)].map((m) => Number(m[1]));
if (treatReels.length === 0) fail("No reel indices parsed from the treatSegments() guard");
for (const id of treatIds) addReels(id, treatReels);

// Wild stacks: wildStackSegments guard `if (reelIndex < N) return [];` → reels N..4
const wildBlock = reelsSrc.match(/function wildStackSegments\(reelIndex: number\)[\s\S]*?\n\}/);
if (!wildBlock) fail("Could not locate wildStackSegments() in reels.ts");
const wildGuard = wildBlock[0].match(/if \(reelIndex < (\d+)\) return \[\]/);
if (!wildGuard) fail("Could not parse the wildStackSegments() reel guard (reelIndex < N)");
const wildIds = [...new Set([...wildBlock[0].matchAll(/repeat\("(\w+)"/g)].map((m) => m[1]))];
if (wildIds.length === 0) fail("No wild symbols parsed from wildStackSegments()");
const wildReels = [];
for (let i = Number(wildGuard[1]); i < REEL_COUNT; i++) wildReels.push(i);
for (const id of wildIds) addReels(id, wildReels);

// Handbag: handbagWildSegments guard `if (reelIndex !== 4) return [];` → [4]
const handbagBlock = reelsSrc.match(/function handbagWildSegments\(reelIndex: number\)[\s\S]*?\n\}/);
if (!handbagBlock) fail("Could not locate handbagWildSegments() in reels.ts");
const handbagGuard = handbagBlock[0].match(/if \(reelIndex !== (\d+)\) return \[\]/);
if (!handbagGuard) fail("Could not parse the handbagWildSegments() reel guard (reelIndex !== N)");
const handbagIds = [...handbagBlock[0].matchAll(/repeat\("(\w+)"/g)].map((m) => m[1]);
for (const id of handbagIds) addReels(id, [Number(handbagGuard[1])]);

// Blockers: placeBlocker(grid, <reel>, "<symbol>", ...) calls in spinGrid.
const blockerCalls = [...reelsSrc.matchAll(/placeBlocker\(grid,\s*(\d+),\s*"(\w+)"/g)];
if (blockerCalls.length === 0) fail("No placeBlocker() calls found in reels.ts");
for (const m of blockerCalls) addReels(m[2], [Number(m[1])]);

// UniGlee: UNIGLEE_ACTIVE_REELS in uniglee.ts (event-gated, not a strip symbol).
const unigleeSrc = readFileSync(resolve(ROOT, "src/engine/uniglee.ts"), "utf8");
const unigleeMatch = unigleeSrc.match(/UNIGLEE_ACTIVE_REELS\s*=\s*\[([\d,\s]+)\]/);
if (!unigleeMatch) fail("Could not parse UNIGLEE_ACTIVE_REELS in src/engine/uniglee.ts");
addReels("uniglee", unigleeMatch[1].split(",").map((s) => Number(s.trim())));

// ── 2. Parse displayed reels strings from SymbolReference.tsx ────────────────

const symRefPath = resolve(
  ROOT,
  "artifacts/mockup-sandbox/src/components/mockups/design-system/SymbolReference.tsx",
);
const symRefSrc = readFileSync(symRefPath, "utf8");

/** @type {Map<string, string>} symbol id → raw reels display string */
const displayed = new Map();
const idRe = /id:\s*"([^"]+)"/g;
let idMatch;
while ((idMatch = idRe.exec(symRefSrc)) !== null) {
  const slice = symRefSrc.slice(idMatch.index, idMatch.index + 500);
  // Stop before the next symbol entry so we never read its reels string.
  // (Entries can contain `}` inside template literals like `${BASE}...`,
  // so the next `id:` is the reliable boundary.)
  const nextId = slice.slice(1).search(/id:\s*"/);
  const entry = nextId === -1 ? slice : slice.slice(0, nextId + 1);
  const rm = entry.match(/reels:\s*"([^"]+)"/);
  if (rm) displayed.set(idMatch[1], rm[1]);
}

if (displayed.size === 0) {
  fail('No reels entries found in SymbolReference.tsx (expected reels: "..." fields)');
}

/**
 * Normalizes a display string into a set of ZERO-based reel indices.
 * Handles "1 · 3 · 5", "5 only", "1–2 only", "3 · 4 · 5 (event-gated)".
 * Returns null for purely event-placed strings with no reel numbers.
 */
function parseDisplay(str) {
  const withoutParens = str.replace(/\([^)]*\)/g, "");
  const set = new Set();
  // Ranges first (en-dash or hyphen), e.g. "1–2"
  for (const m of withoutParens.matchAll(/(\d)\s*[–-]\s*(\d)/g)) {
    for (let i = Number(m[1]); i <= Number(m[2]); i++) set.add(i - 1);
  }
  // Standalone digits not part of a range
  const noRanges = withoutParens.replace(/\d\s*[–-]\s*\d/g, "");
  for (const m of noRanges.matchAll(/\d/g)) set.add(Number(m[0]) - 1);
  return set.size > 0 ? set : null;
}

// ── 3. Compare ────────────────────────────────────────────────────────────────

const fmt = (set) => [...set].sort().map((i) => i + 1).join(", ");
let failed = false;

for (const [id, expected] of engineReels) {
  const raw = displayed.get(id);
  if (raw === undefined) {
    console.error(
      `MISSING: "${id}" is reel-constrained in the engine (reels ${fmt(expected)}) ` +
      `but has no reels chip in SymbolReference.tsx.`,
    );
    failed = true;
    continue;
  }
  const shown = parseDisplay(raw);
  if (shown === null) {
    console.error(
      `UNPARSEABLE: "${id}" reels chip "${raw}" contains no reel numbers, ` +
      `but the engine constrains it to reels ${fmt(expected)}.`,
    );
    failed = true;
    continue;
  }
  const same = shown.size === expected.size && [...expected].every((i) => shown.has(i));
  if (!same) {
    console.error(
      `MISMATCH: "${id}" reel placement\n` +
      `          engine:              reels ${fmt(expected)}\n` +
      `          SymbolReference.tsx: "${raw}" (reels ${fmt(shown)})`,
    );
    failed = true;
  }
}

// Displayed chips with reel numbers for symbols the engine does NOT constrain
// (or that this script doesn't derive) are warnings only.
for (const [id, raw] of displayed) {
  if (!engineReels.has(id) && parseDisplay(raw) !== null) {
    console.warn(
      `WARN: "${id}" shows reels chip "${raw}" but this script derives no ` +
      `engine constraint for it — verify manually or extend the script.`,
    );
  }
}

if (failed) {
  console.error(
    "\nTo fix: update the reels strings in SymbolReference.tsx to match src/engine/reels.ts " +
    "(and UNIGLEE_ACTIVE_REELS in src/engine/uniglee.ts).",
  );
  process.exit(1);
}

for (const id of engineReels.keys()) console.log(`OK:   ${id}`);
console.log(
  `\nAll ${engineReels.size} reel-constrained symbols are in sync with SymbolReference.tsx.`,
);
