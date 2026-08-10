/**
 * Canvas iframe refresh recipe.
 *
 * PURPOSE
 * -------
 * Re-pins every mockup-sandbox canvas iframe to the current REPLIT_DEV_DOMAIN.
 * Run this after a domain change (e.g. project fork/clone → new REPL_ID) so
 * the design gallery comes back live in seconds rather than requiring manual
 * shape-by-shape repair.
 *
 * HOW TO RUN
 * ----------
 * Canvas callbacks (getCanvasState, applyCanvasActions) are only available
 * inside the agent's CodeExecution sandbox — they are NOT importable from a
 * regular `node` process.
 *
 * Ask the agent: "Refresh all canvas iframe URLs"
 *
 * The agent will read this file and execute it via CodeExecution.  The script
 * reads the registry from scripts/canvas-iframes.json, reads REPLIT_DEV_DOMAIN
 * from the shell, and issues one batched applyCanvasActions call.
 *
 * Alternatively, paste the body of refreshCanvasIframes() directly into a
 * CodeExecution call.
 *
 * ── Registry ─────────────────────────────────────────────────────────────────
 * The source of truth for shape IDs and URL paths lives in:
 *   scripts/canvas-iframes.json
 *
 * When you add a new canvas iframe, add its entry there.  This script reads
 * the registry at runtime so it never goes stale separately.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Reads the iframe registry and the current dev domain, then calls
 * applyCanvasActions to re-pin every iframe.
 *
 * Must be executed inside the agent CodeExecution sandbox where
 * `applyCanvasActions` and `getCanvasState` are pre-registered callbacks.
 */
export async function refreshCanvasIframes() {
  // 1. Read the canonical registry.
  const registry = JSON.parse(
    readFileSync(resolve(ROOT, "scripts/canvas-iframes.json"), "utf8"),
  );

  // 2. Get the current dev domain.
  const domain = process.env.REPLIT_DEV_DOMAIN;
  if (!domain) {
    throw new Error(
      "REPLIT_DEV_DOMAIN is not set.  Run this inside the agent CodeExecution sandbox.",
    );
  }

  console.log(`Re-pinning ${registry.iframes.length} canvas iframes to: ${domain}`);

  // 3. Build one batched update action per iframe.
  const actions = registry.iframes.map((iframe) => ({
    type: "update",
    shapeId: iframe.shapeId,
    updates: {
      shapeType: "iframe",
      state: "live",
      url: `https://${domain}${iframe.path}`,
    },
  }));

  // 4. Apply in a single atomic batch.
  const result = await applyCanvasActions({ actions });
  const ok = result.results?.filter((r) => r.ok !== false).length ?? 0;
  const fail = result.results?.filter((r) => r.ok === false) ?? [];

  console.log(`Updated: ${ok} / ${registry.iframes.length}`);
  if (fail.length > 0) {
    console.warn("Failed updates:");
    for (const f of fail) console.warn(" ", JSON.stringify(f));
  }

  return { domain, updated: ok, failed: fail.length };
}

// ── Self-test: if run directly in a shell (not CodeExecution), print usage. ──
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  console.log(
    [
      "",
      "  Canvas iframe refresh — usage",
      "  ─────────────────────────────",
      "  This script uses canvas callbacks that only exist in the agent's",
      "  CodeExecution sandbox.  You cannot run it with `node` directly.",
      "",
      "  To refresh all canvas iframes, ask the agent:",
      '    "Refresh all canvas iframe URLs"',
      "",
      "  The agent will execute refreshCanvasIframes() in CodeExecution.",
      "  All 26 iframes will be re-pinned to the current REPLIT_DEV_DOMAIN",
      "  in a single batched call — takes about 5 seconds.",
      "",
      "  Registry of all shape IDs and paths: scripts/canvas-iframes.json",
      "  Add new iframes there; this script reads it at runtime.",
      "",
    ].join("\n"),
  );
}
