---
name: Git push approach
description: How to push to github.com/OKHP3/glee-fully-chai-chasers from this workspace.
---

## Durable constraint

The platform blocks its own token paths when a `credential.helper` is configured: the `gitPush` CodeExecution callback and the Replit Git panel both refuse to operate (DANGEROUS_CONFIG / "Unknown Git Error"). Shell `git push` and the platform paths are therefore mutually exclusive modes:

- **Helper configured** (this repo currently uses `credential.helper = store`): push from the shell. Auth comes from `~/.git-credentials`, which must contain a valid GitHub token sourced from the `GITHUB_PAT` secret; if it goes missing or stale, shell push fails with "Invalid username or token" until it is refreshed (never echo the secret while doing so).
- **No helper configured**: use the `gitPush({})` callback or the Git panel instead.

Pick one mode and keep it consistent — flipping the helper on/off breaks whichever path the other mode relies on.
