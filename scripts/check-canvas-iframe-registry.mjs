#!/usr/bin/env node
/**
 * CI guard — canvas iframe registry accuracy check.
 *
 * scripts/canvas-iframes.json is the source of truth used by
 * scripts/refresh-canvas-iframes.mjs to re-pin canvas iframe URLs after a
 * dev-domain change. If an iframe exists on the canvas without a registry
 * entry, the refresh recipe silently skips it and it breaks on the next
 * domain change.
 *
 * Three layers keep the registry honest:
 *
 * 1. REPO-DERIVED (this script, runs in CI): every registry path must point
 *    at real repo content — /__mockup/scenes/X.html must exist in the
 *    sandbox's public/scenes/, and /__mockup/preview/G/C must exist as
 *    src/components/mockups/G/C.tsx. A gallery addition whose registry
 *    entry is missing, mistyped, or stale fails here.
 *
 * 2. SNAPSHOT (this script, runs in CI): scripts/canvas-iframes-snapshot.json
 *    is a committed capture of every non-artifact iframe shapeId on the live
 *    canvas. Snapshot ↔ registry drift fails CI in both directions.
 *
 * 3. LIVE CANVAS (agent-side): scripts/refresh-canvas-iframes.mjs and
 *    scripts/sync-canvas-iframe-snapshot.mjs read the real board via
 *    getCanvasState and fail loudly on any unregistered iframe — the live
 *    check CI cannot perform. The sync snippet also regenerates the
 *    snapshot, so layer 2 stays current with one ask:
 *    "sync the canvas iframe snapshot".
 *
 * Run directly:  node scripts/check-canvas-iframe-registry.mjs
 * Self-test:     node scripts/check-canvas-iframe-registry.mjs --self-test
 * npm alias:     npm run validate:canvas-iframes
 *
 * Exit codes: 0 = all checks pass, 1 = drift or parse failure.
 */

import {
  readFileSync,
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
const ROOT = resolve(dirname(SELF), "..");

const SCENES_DIR = "artifacts/mockup-sandbox/public/scenes";
const MOCKUPS_DIR = "artifacts/mockup-sandbox/src/components/mockups";

function loadJsonFrom(root, rel) {
  try {
    return JSON.parse(readFileSync(resolve(root, rel), "utf8"));
  } catch (err) {
    console.error(`ERROR: Could not read/parse ${rel}: ${err.message}`);
    process.exit(1);
  }
}

/** Runs the full check against a workspace root. Returns true if it passed. */
function runCheck(root) {
  const registry = loadJsonFrom(root, "scripts/canvas-iframes.json");
  const snapshot = loadJsonFrom(root, "scripts/canvas-iframes-snapshot.json");

  if (!Array.isArray(registry.iframes) || registry.iframes.length === 0) {
    console.error("ERROR: canvas-iframes.json has no iframes array entries.");
    return false;
  }
  if (!Array.isArray(snapshot.shapeIds) || snapshot.shapeIds.length === 0) {
    console.error("ERROR: canvas-iframes-snapshot.json has no shapeIds entries.");
    return false;
  }

  const registryIds = new Set(registry.iframes.map((i) => i.shapeId));
  const snapshotIds = new Set(
    snapshot.shapeIds.filter((id) => !id.startsWith("artifact:")),
  );

  let failed = false;

  // ── Layer 1: registry entries must point at real repo content ────────────
  for (const entry of registry.iframes) {
    const { shapeId, path } = entry;
    if (typeof path !== "string" || !path.startsWith("/")) {
      console.error(
        `BAD ENTRY: "${shapeId}" has no valid path ("${path}") — refresh would pin a broken URL.`,
      );
      failed = true;
      continue;
    }
    const sceneMatch = path.match(/^\/__mockup\/scenes\/([\w.-]+\.html)$/);
    const previewMatch = path.match(/^\/__mockup\/preview\/([\w-]+)\/([\w-]+)$/);
    if (sceneMatch) {
      if (!existsSync(resolve(root, SCENES_DIR, sceneMatch[1]))) {
        console.error(
          `STALE PATH: "${shapeId}" points at ${path} but ${SCENES_DIR}/${sceneMatch[1]} does not exist.`,
        );
        failed = true;
      }
    } else if (previewMatch) {
      const comp = join(MOCKUPS_DIR, previewMatch[1], `${previewMatch[2]}.tsx`);
      if (!existsSync(resolve(root, comp))) {
        console.error(
          `STALE PATH: "${shapeId}" points at ${path} but ${comp} does not exist.`,
        );
        failed = true;
      }
    } else {
      console.error(
        `UNRECOGNIZED PATH: "${shapeId}" path ${path} matches neither /__mockup/scenes/*.html nor /__mockup/preview/<group>/<Component> — extend this script if a new URL shape is intentional.`,
      );
      failed = true;
    }
  }

  // Duplicate shapeIds would double-update one shape and hide a missing one.
  if (registryIds.size !== registry.iframes.length) {
    const seen = new Set();
    for (const { shapeId } of registry.iframes) {
      if (seen.has(shapeId)) console.error(`DUPLICATE: registry lists "${shapeId}" more than once.`);
      seen.add(shapeId);
    }
    failed = true;
  }

  // ── Layer 2: snapshot ↔ registry, both directions ────────────────────────
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
        `STALE: registry entry "${id}" is not in canvas-iframes-snapshot.json — either the canvas shape was removed (delete the registry entry) or the snapshot is outdated (ask the agent: "sync the canvas iframe snapshot").`,
      );
      failed = true;
    }
  }

  if (failed) {
    console.error(
      "\nTo fix: add new canvas iframes to scripts/canvas-iframes.json when placing them, and " +
      'regenerate the snapshot via scripts/sync-canvas-iframe-snapshot.mjs (ask the agent: "sync the canvas iframe snapshot").',
    );
    return false;
  }

  console.log(
    `All ${snapshotIds.size} canvas iframes are registered with valid repo-backed paths (registry: ${registryIds.size} entries).`,
  );
  return true;
}

// ── Self-test: prove the negative cases actually fail ─────────────────────────

function fixture(root, { registry, snapshot, sceneFiles = [], previewFiles = [] }) {
  mkdirSync(resolve(root, "scripts"), { recursive: true });
  mkdirSync(resolve(root, SCENES_DIR), { recursive: true });
  mkdirSync(resolve(root, MOCKUPS_DIR), { recursive: true });
  for (const f of sceneFiles) writeFileSync(resolve(root, SCENES_DIR, f), "<html></html>");
  for (const f of previewFiles) {
    const p = resolve(root, MOCKUPS_DIR, f);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, "export const X = 1;");
  }
  writeFileSync(resolve(root, "scripts/canvas-iframes.json"), JSON.stringify({ iframes: registry }));
  writeFileSync(resolve(root, "scripts/canvas-iframes-snapshot.json"), JSON.stringify({ shapeIds: snapshot }));
}

function runAgainst(root) {
  return spawnSync(process.execPath, [SELF, "--check-root", root], { encoding: "utf8" });
}

function selfTest() {
  const entryA = { shapeId: "scene-a", name: "A", path: "/__mockup/scenes/a.html" };
  const entryB = { shapeId: "mock-b", name: "B", path: "/__mockup/preview/group-b/CompB" };
  const cases = [
    {
      name: "in-sync registry passes",
      expectFail: false,
      setup: { registry: [entryA, entryB], snapshot: ["scene-a", "mock-b"], sceneFiles: ["a.html"], previewFiles: ["group-b/CompB.tsx"] },
    },
    {
      name: "new canvas iframe missing from registry fails",
      expectFail: true,
      expectText: 'MISSING: canvas iframe "scene-new"',
      setup: { registry: [entryA], snapshot: ["scene-a", "scene-new"], sceneFiles: ["a.html"] },
    },
    {
      name: "registry entry pointing at a deleted scene file fails",
      expectFail: true,
      expectText: "STALE PATH",
      setup: { registry: [entryA], snapshot: ["scene-a"] }, // a.html not created
    },
    {
      name: "registry entry gone from canvas snapshot fails",
      expectFail: true,
      expectText: 'STALE: registry entry "mock-b"',
      setup: { registry: [entryA, entryB], snapshot: ["scene-a"], sceneFiles: ["a.html"], previewFiles: ["group-b/CompB.tsx"] },
    },
  ];

  let ok = true;
  for (const c of cases) {
    const dir = mkdtempSync(join(tmpdir(), "canvas-registry-selftest-"));
    try {
      fixture(dir, c.setup);
      const res = runAgainst(dir);
      const failedRun = res.status !== 0;
      const textOk = !c.expectText || (res.stderr + res.stdout).includes(c.expectText);
      if (failedRun === c.expectFail && textOk) {
        console.log(`SELF-TEST OK:   ${c.name}`);
      } else {
        console.error(`SELF-TEST FAIL: ${c.name} (exit=${res.status}, expected fail=${c.expectFail}, textOk=${textOk})`);
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
  const root = rootFlag !== -1 ? process.argv[rootFlag + 1] : ROOT;
  if (!runCheck(root)) process.exit(1);
}
