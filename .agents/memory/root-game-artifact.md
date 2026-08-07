---
name: Root-game artifact registration
description: How the root Vite game is registered as a Replit artifact and how its preview routing works.
---

## Current setup (working)

The game source lives at the workspace root. It is exposed as a proper Replit artifact via a **shim package** at `artifacts/chai-chasers/`.

- `artifacts/chai-chasers/package.json` — shim with `"dev": "cd ../.. && pnpm run dev"` and `"build": "cd ../.. && pnpm run build"`.
- `artifacts/chai-chasers/.replit-artifact/artifact.toml` — kind=web, previewPath="/", localPort=18364, PORT=18364, BASE_PATH="/".
- `artifacts/chai-chasers: web` workflow — runs the shim dev script, which cd's to root and starts Vite on PORT=18364.

The root `vite.config.ts` reads `Number(process.env.PORT) || 5000` for the port, so the artifact-injected PORT=18364 is honoured. It also has `watch.ignored: ["**/.local/**", "**/node_modules/.pnpm/**"]` to prevent ENOSPC when four Vite instances run concurrently.

## Why a shim under artifacts/ (not a root artifact)

The application router only routes artifacts whose `artifactDir` is under `artifacts/`. A `.replit-artifact/artifact.toml` at the workspace root registers the artifact in the database but does NOT update the proxy routing table — `createArtifact()` (or the platform's internal flow when reading `artifacts/*/`) is what registers routing.

**Key lesson:** `verifyAndReplaceArtifactToml()` at the workspace root = metadata only, no routing. `createArtifact()` at `artifacts/<slug>/` = metadata + routing.

## Production config

- `publicDir = "dist"` in artifact.toml (relative to workspace root — Vite's default output).
- `build.base` in `vite.config.ts` is `/glee-fully-chai-chasers/` for production (GitHub Pages). If deploying via Replit instead, change `base` to `"/"` for the Replit static serve to work correctly.

## ENOSPC fix

Four concurrent Vite instances (game, video, mockup-sandbox, future) exhaust the system's inotify watch limit. Fixed by adding to root `vite.config.ts` server.watch.ignored:
```typescript
watch: { ignored: ["**/.local/**", "**/node_modules/.pnpm/**"] }
```

## Git push

Always use the `gitPush` CodeExecution callback. Never set `git config credential.helper` — the platform detects it and blocks `gitPush`. If accidentally set: `git config --unset credential.helper`.
