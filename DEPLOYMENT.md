# Designathon Deployment

## Artifacts

| Artifact | Replit autoscale path | GitHub Pages path |
|---|---|---|
| Glee-fully Chai Chasers (game) | `/` | `/glee-fully-chai-chasers/` |
| Glee-fully Chai Chasers — Video | `/chai-chasers-video/` | n/a |

## Production URLs

Populated after first Replit autoscale publish. Both artifacts share a single
`.replit.app` subdomain routed by path:

- **Game:** `https://glee-fully-chai-chasers.replit.app/`
- **Video:** `https://glee-fully-chai-chasers.replit.app/chai-chasers-video/`

GitHub Pages game URL (always live):
`https://okhp3.github.io/glee-fully-chai-chasers/`

## Base-path strategy

| Channel | `BASE_PATH` env | Resolved base |
|---|---|---|
| Replit autoscale | `BASE_PATH=/` (set in `artifact.toml`) | `/` |
| GitHub Pages CI | not set | `/glee-fully-chai-chasers/` (fallback) |
| Local dev | not set | `/` (dev-mode fallback) |

`vite.config.ts` reads `BASE_PATH` first; if absent it falls back to the
GitHub Pages path in production, or `/` in dev — so both channels are
preserved without changes to the CI workflow.

## Build commands

```bash
# Game (Replit)
BASE_PATH=/ NODE_ENV=production pnpm --filter @workspace/chai-chasers run build

# Video
BASE_PATH=/chai-chasers-video/ PORT=22469 pnpm --filter @workspace/chai-chasers-video run build
```
