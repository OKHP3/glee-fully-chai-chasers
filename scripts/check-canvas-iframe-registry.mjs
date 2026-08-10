#!/usr/bin/env node
/**
 * CI guard — canvas iframe registry completeness check.
 *
 * scripts/canvas-iframes.json is the source of truth used by
 * scripts/refresh-canvas-iframes.mjs to re-pin canvas iframe URLs after a
 * dev-domain change. If an iframe exists on the canvas without a registry
 * entry, the refresh recipe silently skips it and it breaks on the next
 * domain change.
 *
 * CI cannot query the live canvas, so scripts/canvas-iframes-snapshot.json
 * holds a committed snapshot of every non-artifact iframe shapeId on the
 * board (regenerate it by asking the agent: "update the canvas iframe
 * snapshot"). This script compares the snapshot against the registry in
 * both directions:
 *   - snapshot id missing from registry  → FAIL (refresh would skip it)
 *   - registry id missing from snapshot  → FAIL (stale entry or stale
 *     snapshot — either way the two files have drifted and need a re-sync)
 *
 * Run directly:  node scripts/check-canvas-iframe-registry.mjs
 * npm alias:     npm run validate:canvas-iframes
 *
 * Exit codes: 0 = in sync, 1 = drift or parse failure.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadJson(rel) {
  try {
    return JSON.parse(readFileSync(resolve(ROOT, rel), "utf8"));
  } catch (err) {
    console.error(`ERROR: Could not read/parse ${rel}: ${err.message}`);
    process.exit(1);
  }
}

const registry = loadJson("scripts/canvas-iframes.json");
const snapshot = loadJson("scripts/canvas-iframes-snapshot.json");

if (!Array.isArray(registry.iframes) || registry.iframes.length === 0) {
  console.error("ERROR: canvas-iframes.json has no iframes array entries.");
  process.exit(1);
}
if (!Array.isArray(snapshot.shapeIds) || snapshot.shapeIds.length === 0) {
  console.error("ERROR: canvas-iframes-snapshot.json has no shapeIds entries.");
  process.exit(1);
}

const registryIds = new Set(registry.iframes.map((i) => i.shapeId));
const snapshotIds = new Set(
  snapshot.shapeIds.filter((id) => !id.startsWith("artifact:")),
);

// Registry entries must also carry a usable path.
let failed = false;
for (const entry of registry.iframes) {
  if (typeof entry.path !== "string" || !entry.path.startsWith("/")) {
    console.error(
      `BAD ENTRY: registry entry "${entry.shapeId}" has no valid path ("${entry.path}") — refresh would pin a broken URL.`,
    );
    failed = true;
  }
}

// Duplicate shapeIds in the registry would double-update one shape and hide a missing one.
if (registryIds.size !== registry.iframes.length) {
  const seen = new Set();
  for (const { shapeId } of registry.iframes) {
    if (seen.has(shapeId)) console.error(`DUPLICATE: registry lists "${shapeId}" more than once.`);
    seen.add(shapeId);
  }
  failed = true;
}

for (const id of snapshotIds) {
  if (!registryIds.has(id)) {
    console.error(
      `MISSING: canvas iframe "${id}" (in snapshot) has no entry in scripts/canvas-iframes.json — the URL refresh recipe will silently skip it. Add its shapeId, name, and /__mockup/... path to the registry.`,
    );
    failed = true;
  }
}

for (const id of registryIds) {
  if (!snapshotIds.has(id)) {
    console.error(
      `STALE: registry entry "${id}" is not in canvas-iframes-snapshot.json — either the canvas shape was removed (delete the registry entry) or the snapshot is outdated (ask the agent to update the canvas iframe snapshot).`,
    );
    failed = true;
  }
}

if (failed) {
  console.error(
    "\nTo fix: keep scripts/canvas-iframes.json and scripts/canvas-iframes-snapshot.json in sync — " +
    "add new canvas iframes to BOTH when placing them, and regenerate the snapshot after canvas changes.",
  );
  process.exit(1);
}

console.log(
  `All ${snapshotIds.size} canvas iframes are registered in scripts/canvas-iframes.json (registry: ${registryIds.size} entries).`,
);
