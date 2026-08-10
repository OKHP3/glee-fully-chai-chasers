#!/bin/bash
set -e
pnpm install
pnpm --filter db push

# ── Canvas iframe URLs ────────────────────────────────────────────────────────
# If the REPLIT_DEV_DOMAIN changes (e.g. after a project fork/clone that gives
# a new REPL_ID), canvas iframes pointing to the old domain will silently break.
# To re-pin them all at once, ask the agent:
#   "Refresh all canvas iframe URLs"
# The agent will run scripts/refresh-canvas-iframes.mjs via CodeExecution,
# which reads the registry in scripts/canvas-iframes.json and updates every
# iframe shape in one batched call (~5 seconds for all 26 shapes).
# See scripts/refresh-canvas-iframes.mjs for details.
