---
name: Git push approach
description: How to push to github.com/OKHP3/glee-fully-chai-chasers from this workspace.
---

## Rule: never set credential.helper

Setting `git config credential.helper` in `.git/config` causes the Replit platform Git UI and the `gitPush` CodeExecution callback to both fail with "Unknown Git Error / UNKNOWN". The platform detects any credential.helper entry and blocks its own token from flowing through.

If it was accidentally set, unset immediately:
```bash
git config --unset credential.helper
```

## How to push

**Option 1 (preferred): Ask the agent** — calls `gitPush({})` in CodeExecution. Works reliably as long as credential.helper is not set.

**Option 2: Replit Git panel UI** — works the same way; blocked if credential.helper is set.

**Option 3 (shell) — DO NOT USE** — `git push` from the shell requires a credential.helper which breaks options 1 and 2. Shell git push is not compatible with this workspace setup.

## PAT rotation
When `GITHUB_PAT` is rotated:
1. Use `requestSecrets({ keys: ["GITHUB_PAT"] })` in CodeExecution to prompt the user to update it.
2. No git config changes needed — the platform injects the secret into `gitPush` automatically.
3. Verify with `gitPush({})`.

## Pull / merge
```bash
git fetch origin && git merge origin/main -X ours --allow-unrelated-histories
```
Set `git config user.email` / `user.name` first if git identity is blank.
