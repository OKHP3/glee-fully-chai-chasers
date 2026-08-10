/**
 * Canvas iframe refresh — CodeExecution snippet.
 *
 * HOW TO USE
 * ──────────
 * This file is a self-contained CodeExecution snippet, NOT a node script.
 * Canvas callbacks (getCanvasState, applyCanvasActions) are pre-registered
 * only inside the agent's CodeExecution sandbox.
 *
 * To refresh all canvas iframes after a domain change, ask the agent:
 *
 *   "Refresh all canvas iframe URLs"
 *
 * The agent reads this file and pastes its body into a CodeExecution call.
 * All 26 iframes are re-pinned in one batched update (~5 seconds).
 *
 * WHEN IS THIS NEEDED?
 * ────────────────────
 * REPLIT_DEV_DOMAIN is stable across normal workspace restarts (it is derived
 * from the stable REPL_ID). Re-pinning is only needed after an event that
 * changes the domain — e.g. forking or cloning the project into a new Repl.
 *
 * REGISTRY
 * ────────
 * Shape IDs and URL paths live in scripts/canvas-iframes.json.
 * Add new canvas iframes there; this script reads the file at runtime.
 */

// ── Step 1: read domain + registry from the workspace ─────────────────────────
const { domain, iframes } = await (async function () {
  "use impure";
  const { execSync } = await import("node:child_process");
  const fs = await import("node:fs/promises");

  const domain = execSync("echo $REPLIT_DEV_DOMAIN", { encoding: "utf8" }).trim();
  if (!domain) throw new Error("REPLIT_DEV_DOMAIN is empty — are you in the Replit workspace?");

  const raw = await fs.readFile(
    "/home/runner/workspace/scripts/canvas-iframes.json",
    "utf8",
  );
  const { iframes } = JSON.parse(raw);
  return { domain, iframes };
})();

// ── Step 1b: guard — every live canvas iframe must be in the registry ─────────
// If a frame was added to the canvas without a registry entry, refreshing
// would silently skip it and it would break on the next domain change.
{
  const state = await getCanvasState({ focusArea: { x: -20000, y: -20000, w: 60000, h: 60000 } });
  const live = [...(state.focusedShapes ?? []), ...(state.blurryShapes ?? [])]
    .filter((s) => s.shapeType === "iframe")
    .map((s) => s.shapeId)
    .filter((id) => !id.startsWith("artifact:"));
  const registered = new Set(iframes.map((i) => i.shapeId));
  const unregistered = live.filter((id) => !registered.has(id));
  if (unregistered.length > 0) {
    throw new Error(
      `UNREGISTERED canvas iframes — add to scripts/canvas-iframes.json before refreshing, or they stay broken: ${unregistered.join(", ")}`,
    );
  }
}

// ── Step 2: build one update action per iframe ─────────────────────────────────
const actions = iframes.map(({ shapeId, path }) => ({
  type: "update",
  shapeId,
  updates: {
    shapeType: "iframe",
    state: "live",
    url: `https://${domain}${path}`,
  },
}));

console.log(`Re-pinning ${actions.length} canvas iframes → ${domain}`);

// ── Step 3: apply in a single atomic batch ─────────────────────────────────────
const result = await applyCanvasActions({ actions });

const failed = (result.results ?? []).filter((r) => r.ok === false);
const succeeded = actions.length - failed.length;
console.log(`Done. Updated: ${succeeded} / ${actions.length}`);

if (failed.length > 0) {
  console.warn("Failed updates:");
  for (const f of failed) console.warn(" ", JSON.stringify(f));
}
