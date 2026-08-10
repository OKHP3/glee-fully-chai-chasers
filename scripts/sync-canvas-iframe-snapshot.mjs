/**
 * Canvas iframe snapshot sync — CodeExecution snippet.
 *
 * HOW TO USE
 * ──────────
 * This file is a self-contained CodeExecution snippet, NOT a node script.
 * Canvas callbacks (getCanvasState) are pre-registered only inside the
 * agent's CodeExecution sandbox. Ask the agent:
 *
 *   "sync the canvas iframe snapshot"
 *
 * The agent pastes this body into a CodeExecution call. It:
 *   1. Reads every iframe shapeId from the live canvas (getCanvasState)
 *   2. Rewrites scripts/canvas-iframes-snapshot.json from that live state
 *   3. FAILS LOUDLY if any live non-artifact iframe has no entry in
 *      scripts/canvas-iframes.json — the registry must be updated by hand
 *      (shapeId, name, /__mockup/... path) before committing
 *
 * WHEN? Run this after any canvas change that adds/removes iframe frames
 * (new scene gallery frames, new mockup previews). Commit the regenerated
 * snapshot together with the registry update; CI
 * (npm run validate:canvas-iframes) blocks the merge if they drift.
 */

// ── Step 1: read all iframes from the live canvas ─────────────────────────────
const state = await getCanvasState({ focusArea: { x: -20000, y: -20000, w: 60000, h: 60000 } });
const shapes = [...(state.focusedShapes ?? []), ...(state.blurryShapes ?? [])];
if ((state.peripheralClusters ?? []).length > 0) {
  throw new Error("Canvas has peripheral clusters outside the scan area — enlarge focusArea so every shape is captured.");
}
const liveIds = shapes
  .filter((s) => s.shapeType === "iframe")
  .map((s) => s.shapeId)
  .filter((id) => !id.startsWith("artifact:"))
  .sort();

// ── Step 2: rewrite the snapshot + diff against the registry ─────────────────
const { unregistered, stale } = await (async function (ids) {
  "use impure";
  const fs = await import("node:fs/promises");
  const snapshot = {
    _comment:
      "Snapshot of all non-artifact iframe shapeIds on the canvas. Regenerate via scripts/sync-canvas-iframe-snapshot.mjs (ask the agent: 'sync the canvas iframe snapshot'). Used by scripts/check-canvas-iframe-registry.mjs to keep scripts/canvas-iframes.json complete — artifact:v3:* iframes are Replit-managed and excluded.",
    shapeIds: ids,
  };
  await fs.writeFile(
    "/home/runner/workspace/scripts/canvas-iframes-snapshot.json",
    JSON.stringify(snapshot, null, 2) + "\n",
  );
  const registry = JSON.parse(
    await fs.readFile("/home/runner/workspace/scripts/canvas-iframes.json", "utf8"),
  );
  const registryIds = new Set(registry.iframes.map((i) => i.shapeId));
  return {
    unregistered: ids.filter((id) => !registryIds.has(id)),
    stale: [...registryIds].filter((id) => !ids.includes(id)),
  };
})(liveIds);

console.log(`Snapshot rewritten: ${liveIds.length} live canvas iframes.`);
if (stale.length > 0) {
  console.warn(`Registry entries no longer on the canvas (remove them): ${stale.join(", ")}`);
}
if (unregistered.length > 0) {
  throw new Error(
    `UNREGISTERED canvas iframes (add to scripts/canvas-iframes.json before committing): ${unregistered.join(", ")}`,
  );
}
console.log("Registry covers every live canvas iframe. Run `npm run validate:canvas-iframes`, then commit.");
