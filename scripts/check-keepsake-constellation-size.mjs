#!/usr/bin/env node
/**
 * CI guard — Keepsake Constellation stale size claim.
 *
 * Task #154 corrected six "2×2" absolute claims in README.md, DESIGN-SPEC.md,
 * and two scene HTML files. This script prevents that regression from
 * silently re-entering: it fails when any searched file contains
 * "2×2 … keepsake" or "keepsake … 2×2" (case-insensitive, within one line).
 *
 * Allow-listed:
 *   - src/engine/keepsake-constellation.ts — "width: 2, height: 2" is the
 *     correct engine struct notation, not a prose size claim.
 *   - Any line that contains the qualifier "footprint shown" — these are
 *     accurately-written scene HTML comments noting the scene depicts ONE
 *     example footprint; the engine rolls variable sizes.
 *
 * Run directly:  node scripts/check-keepsake-constellation-size.mjs
 * npm alias:     npm run validate:keepsake-size
 *
 * Exit codes: 0 = no stale claims found, 1 = one or more found.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Glob-expand the target file set. */
function targetFiles() {
  const files = [];

  // README at repo root
  const readme = resolve(ROOT, "README.md");
  if (existsSync(readme)) files.push(readme);

  // All markdown under docs/
  const docsDir = resolve(ROOT, "docs");
  if (existsSync(docsDir)) {
    for (const name of readdirSync(docsDir)) {
      if (name.endsWith(".md")) files.push(join(docsDir, name));
    }
  }

  // Shipped scene HTML files (mockup-sandbox source of truth)
  const scenesDir = resolve(ROOT, "artifacts/mockup-sandbox/public/scenes");
  if (existsSync(scenesDir)) {
    for (const name of readdirSync(scenesDir)) {
      if (name.endsWith(".html")) files.push(join(scenesDir, name));
    }
  }

  return files;
}

/** Return true when a line contains "2×2" near "keepsake" (case-insensitive). */
const TWO_BY_TWO = /2[×x]2/i;
const KEEPSAKE   = /keepsake/i;
const QUALIFIER  = /footprint shown/i; // correctly-qualified scene HTML comment

function hasStaleClaim(line) {
  if (!TWO_BY_TWO.test(line)) return false;
  if (!KEEPSAKE.test(line))   return false;
  if (QUALIFIER.test(line))   return false; // allow qualified form
  return true;
}

let failed = false;
for (const file of targetFiles()) {
  const rel = file.replace(ROOT + "/", "");
  const lines = readFileSync(file, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (hasStaleClaim(lines[i])) {
      console.error(
        `STALE CLAIM: ${rel}:${i + 1}: ${lines[i].trim()}\n` +
        `  Keepsake Constellation is NOT a fixed 2×2. The engine rolls variable sizes.\n` +
        `  Update the text to remove the absolute size claim, or qualify it like:\n` +
        `  "2×2 footprint shown in this scene; engine rolls 2–3 reels wide × 2–4 rows tall"`,
      );
      failed = true;
    }
  }
}

if (!failed) {
  console.log("No stale Keepsake Constellation 2×2 size claims found.");
}
process.exit(failed ? 1 : 0);
