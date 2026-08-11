---
name: Git push approach
description: How to push to github.com/OKHP3/glee-fully-chai-chasers from this workspace.
---

## Durable constraint

The platform blocks its own token paths when a `credential.helper` is configured: the `gitPush` CodeExecution callback and the Replit Git panel both refuse to operate (DANGEROUS_CONFIG / "Unknown Git Error"). Shell `git push` and the platform paths are therefore mutually exclusive modes:

- **Helper configured** (this repo currently uses `credential.helper = store`): push from the shell. Auth comes from `~/.git-credentials`, which must contain a valid GitHub token sourced from the `GITHUB_PAT` secret; if it goes missing or stale, shell push fails with "Invalid username or token" until it is refreshed (never echo the secret while doing so).
- **No helper configured**: use the `gitPush({})` callback or the Git panel instead.

Pick one mode and keep it consistent — flipping the helper on/off breaks whichever path the other mode relies on.

## Replit subrepl remote hygiene

Old task-agent sessions can leave many `subrepl-*` remotes pointing to `ssh.janeway.replit.dev`. A broad `git fetch --all` may then stall on an interactive SSH host-key prompt even though `git fetch origin` and `git push origin main` are healthy.

**Why:** This workspace accumulated 30 stale subrepl remotes; removing those local remote configurations changed `git fetch --all` from a prompt/hang to a one-second operation.

**How to apply:** When sync appears stuck, compare `git fetch origin` with `git fetch --all`, inspect `git remote`, and remove only stale, verified task-agent remotes after preserving or merging any unique branch work. Keep `origin` and `gitsafe-backup`.
