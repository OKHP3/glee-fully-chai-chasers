#!/usr/bin/env node
/**
 * CI guard — treat-time hand SVG sync check.
 *
 * Verifies that the hand SVG embedded in each treat-time-entry scene file
 * matches the output of `treatTimeHandSvg()` in src/ui/board.ts.
 *
 * Run directly:  node scripts/check-treat-time-hand-svg.mjs
 * npm alias:     npm run validate:hand-svg
 *
 * If scene files are out of sync, run:
 *   node scripts/sync-treat-time-hand-svg.mjs
 * …then commit the updated scene files.
 *
 * Exit codes: 0 = all in sync, 1 = mismatch or parse failure.
 *
 * ── Normalisation strategy ────────────────────────────────────────────────────
 * Both the source (board.ts) and the scene HTML files contain the same SVG but
 * formatted differently: board.ts uses multi-line attributes and indented path
 * data; the scene files inline everything on one logical line.
 *
 * We canonicalise by:
 *   1. Collapsing every run of whitespace to a single space (deals with
 *      indentation, line breaks, and multi-line attribute continuations).
 *   2. Removing the space that step 1 may insert right after `="` (an artefact
 *      of a newline between the attribute name and its value in board.ts).
 *   3. Trimming outer whitespace.
 *
 * This is deliberately *not* a strip-all-whitespace approach. Token-separator
 * spaces inside attribute values — SVG path data (`M22 90`), `viewBox`, etc. —
 * are preserved as single spaces so that a change from `M22 90` to `M2 290`
 * in board.ts is still caught as a divergence.
 */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ── 1. Extract canonical SVG from treatTimeHandSvg() in board.ts ──────────────

const boardSrc = readFileSync(resolve(ROOT, "src/ui/board.ts"), "utf8");

// Match the template-literal body returned by treatTimeHandSvg().
const fnRe = /function treatTimeHandSvg\(\)[^{]*\{[\s\S]*?return\s*`(<svg[\s\S]*?<\/svg>)`\s*;?\s*\}/;
const fnMatch = boardSrc.match(fnRe);
if (!fnMatch) {
  console.error(
    "ERROR: Could not locate the template-literal return value of treatTimeHandSvg() in src/ui/board.ts.\n" +
    "       Check that the function still returns a backtick template containing <svg...>...</svg>.",
  );
  process.exit(1);
}

// ── 2. Canonical form ─────────────────────────────────────────────────────────
//
// This must match exactly what sync-treat-time-hand-svg.mjs writes.
// Whitespace between tokens is collapsed to a single space; whitespace *within*
// attribute values is also collapsed (multi-space runs → one space) but spaces
// themselves are kept so path-data tokens stay distinct.

function canonical(svg) {
  return svg
    .replace(/\s+/g, " ")   // collapse all whitespace runs (incl. newlines)
    .replace(/=" /g, '="')  // remove leading space inside attribute values
    .trim();
}

const canonicalBoard = canonical(fnMatch[1]);

// ── 3. Check each scene file ──────────────────────────────────────────────────

// Discover treat-time-entry scene files dynamically so any new variant is
// automatically included without editing this script.
const SCENES_DIR = resolve(ROOT, "artifacts/mockup-sandbox/public/scenes");
const SCENE_FILES = readdirSync(SCENES_DIR)
  .filter((f) => f.startsWith("treat-time-entry-") && f.endsWith(".html"))
  .map((f) => `artifacts/mockup-sandbox/public/scenes/${f}`);

if (SCENE_FILES.length === 0) {
  console.error(
    "ERROR: No treat-time-entry-*.html scene files found in artifacts/mockup-sandbox/public/scenes/.\n" +
    "       Expected at least treat-time-entry-morning.html and treat-time-entry-nighttime.html.",
  );
  process.exit(1);
}

// The scene files mark the inline SVG with this comment immediately before
// the <svg> element so the extractor has a reliable anchor.
const MARKER_RE = /<!--\s*treatTimeHandSvg\(\)\s+inline[^>]*-->\s*(<svg[\s\S]*?<\/svg>)/;

let failed = false;

for (const relPath of SCENE_FILES) {
  const fullPath = resolve(ROOT, relPath);
  let html;
  try {
    html = readFileSync(fullPath, "utf8");
  } catch (err) {
    console.error(`ERROR: Could not read ${relPath}: ${err.message}`);
    failed = true;
    continue;
  }

  const svgMatch = html.match(MARKER_RE);
  if (!svgMatch) {
    console.error(
      `ERROR: ${relPath}\n` +
      `       Could not find the inline hand SVG.\n` +
      `       Expected a comment matching /treatTimeHandSvg\\(\\)\\s+inline/ immediately before the <svg> element.\n` +
      `       Run: node scripts/sync-treat-time-hand-svg.mjs`,
    );
    failed = true;
    continue;
  }

  const canonicalScene = canonical(svgMatch[1]);

  if (canonicalBoard !== canonicalScene) {
    console.error(
      `FAIL: ${relPath}\n` +
      `      Hand SVG is out of sync with treatTimeHandSvg() in src/ui/board.ts.\n` +
      `      Run: node scripts/sync-treat-time-hand-svg.mjs`,
    );
    // Print the first divergence point to help with manual diagnosis.
    const shorter = Math.min(canonicalBoard.length, canonicalScene.length);
    let diverge = shorter;
    for (let i = 0; i < shorter; i++) {
      if (canonicalBoard[i] !== canonicalScene[i]) { diverge = i; break; }
    }
    console.error(`      First divergence at character ${diverge}:`);
    console.error(`        board.ts:   …${canonicalBoard.slice(Math.max(0, diverge - 30), diverge + 60)}…`);
    console.error(`        scene file: …${canonicalScene.slice(Math.max(0, diverge - 30), diverge + 60)}…`);
    failed = true;
  } else {
    console.log(`OK:   ${relPath}`);
  }
}

if (failed) {
  console.error("\nTo fix: node scripts/sync-treat-time-hand-svg.mjs && git add <scene files> && git commit");
  process.exit(1);
}

console.log("All treat-time hand SVGs are in sync with src/ui/board.ts.");
