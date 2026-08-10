#!/usr/bin/env node
/**
 * CI guard — scene gallery coverage check.
 *
 * Every scene HTML file under artifacts/mockup-sandbox/public/scenes/ should
 * have a matching canvas gallery frame, tracked via scripts/canvas-iframes.json
 * (the registry the canvas frames are mirrored into). A new scene added
 * without a gallery frame silently disappears from the reviewable canvas.
 *
 * Checks:
 *   - scene file with no registry entry pointing at it  → FAIL (uncovered)
 *   - registry scene entry pointing at a missing file   → FAIL (stale — also
 *     caught by check-canvas-iframe-registry.mjs, repeated here so this check
 *     is self-contained)
 *
 * Run directly:  node scripts/check-scene-gallery-coverage.mjs
 * npm alias:     npm run validate:scene-coverage
 *
 * Exit codes: 0 = full coverage, 1 = gaps found.
 */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCENES_DIR = resolve(ROOT, "artifacts/mockup-sandbox/public/scenes");
const REGISTRY = resolve(ROOT, "scripts/canvas-iframes.json");

let registry;
try {
  registry = JSON.parse(readFileSync(REGISTRY, "utf8"));
} catch (err) {
  console.error(`ERROR: Could not read/parse scripts/canvas-iframes.json: ${err.message}`);
  process.exit(1);
}

let sceneFiles;
try {
  sceneFiles = readdirSync(SCENES_DIR).filter((f) => f.endsWith(".html")).sort();
} catch (err) {
  console.error(`ERROR: Could not list ${SCENES_DIR}: ${err.message}`);
  process.exit(1);
}

if (sceneFiles.length === 0) {
  console.error("ERROR: No scene HTML files found — wrong directory?");
  process.exit(1);
}

const coveredFiles = new Set(
  (registry.iframes ?? [])
    .map((i) => i.path)
    .filter((p) => typeof p === "string" && p.includes("/scenes/"))
    .map((p) => p.split("/").pop()),
);

let failed = false;

for (const file of sceneFiles) {
  if (!coveredFiles.has(file)) {
    console.error(
      `UNCOVERED: scene ${file} has no canvas gallery frame — place an iframe on the canvas and add it to scripts/canvas-iframes.json (then sync the snapshot).`,
    );
    failed = true;
  }
}

for (const file of coveredFiles) {
  if (!sceneFiles.includes(file)) {
    console.error(
      `STALE: registry references scenes/${file} but the file does not exist — remove the registry entry (and the canvas frame) or restore the file.`,
    );
    failed = true;
  }
}

if (failed) process.exit(1);

console.log(
  `All ${sceneFiles.length} scene files have a matching canvas gallery frame in scripts/canvas-iframes.json.`,
);
