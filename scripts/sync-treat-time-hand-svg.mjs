#!/usr/bin/env node
/**
 * Developer utility — sync treat-time hand SVG into scene files.
 *
 * Reads the canonical SVG from `treatTimeHandSvg()` in src/ui/board.ts,
 * inlines it (whitespace-collapsed to a single logical line) into each
 * treat-time-entry scene file, replacing the existing <svg>…</svg> block
 * that follows the `<!-- treatTimeHandSvg() inline … -->` comment anchor.
 *
 * Run after editing treatTimeHandSvg() in board.ts:
 *   node scripts/sync-treat-time-hand-svg.mjs
 *
 * Then commit the updated scene files.  The CI step `validate:hand-svg`
 * will fail on any PR where the files have drifted without running this.
 *
 * ── Canonical form ────────────────────────────────────────────────────────────
 * The SVG is written as a single logical line:
 *   - All whitespace runs collapsed to a single space.
 *   - Leading space removed from inside attribute values (artefact of
 *     multi-line attribute continuation in board.ts).
 * This matches exactly what check-treat-time-hand-svg.mjs expects.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ── 1. Extract canonical SVG from board.ts ────────────────────────────────────

const boardSrc = readFileSync(resolve(ROOT, "src/ui/board.ts"), "utf8");

const fnRe = /function treatTimeHandSvg\(\)[^{]*\{[\s\S]*?return\s*`(<svg[\s\S]*?<\/svg>)`\s*;?\s*\}/;
const fnMatch = boardSrc.match(fnRe);
if (!fnMatch) {
  console.error(
    "ERROR: Could not locate the template-literal return value of treatTimeHandSvg() in src/ui/board.ts.\n" +
    "       Check that the function still returns a backtick template containing <svg...>...</svg>.",
  );
  process.exit(1);
}

// Collapse internal whitespace to produce a clean single-line SVG.
// Must stay in sync with the canonical() function in check-treat-time-hand-svg.mjs.
const cleanSvg = fnMatch[1]
  .replace(/\s+/g, " ")   // collapse all whitespace runs (incl. newlines)
  .replace(/=" /g, '="')  // remove leading space inside attribute values
  .trim();

// ── 2. Update each scene file ─────────────────────────────────────────────────

const SCENE_FILES = [
  "artifacts/mockup-sandbox/public/scenes/treat-time-entry-morning.html",
  "artifacts/mockup-sandbox/public/scenes/treat-time-entry-nighttime.html",
];

const MARKER_RE = /(<!--\s*treatTimeHandSvg\(\)\s+inline[^>]*-->\s*)<svg[\s\S]*?<\/svg>/;

let changed = 0;
for (const relPath of SCENE_FILES) {
  const fullPath = resolve(ROOT, relPath);
  const original = readFileSync(fullPath, "utf8");

  if (!MARKER_RE.test(original)) {
    console.error(
      `ERROR: ${relPath}\n` +
      `       Could not find the comment anchor <!-- treatTimeHandSvg() inline … -->.\n` +
      `       Please add the comment immediately before the <svg> element in the hand div.`,
    );
    process.exit(1);
  }

  const updated = original.replace(MARKER_RE, `$1${cleanSvg}`);
  if (updated === original) {
    console.log(`SKIP: ${relPath}  (already up to date)`);
    continue;
  }

  writeFileSync(fullPath, updated, "utf8");
  console.log(`UPDATED: ${relPath}`);
  changed++;
}

if (changed === 0) {
  console.log("All treat-time hand SVG scene files are already up to date.");
} else {
  console.log(`\n${changed} file(s) updated. Remember to commit the changes.`);
  console.log("Verify with: node scripts/check-treat-time-hand-svg.mjs");
}
