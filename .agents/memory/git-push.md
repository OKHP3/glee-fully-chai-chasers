---
name: Git push approach
description: How to push to github.com/OKHP3/glee-fully-chai-chasers from this workspace.
---

## Two modes — pick one, they conflict

### Shell git push (user preference)
The `GITHUB_PAT` secret is wired into git's credential helper:
```bash
git config credential.helper '!f() { echo "username=x-access-token"; echo "password=$GITHUB_PAT"; }; f'
```
This lives in `.git/config` (local, not committed). When it's set, shell `git push` works but the platform **blocks** the `gitPush` CodeExecution callback.

### gitPush callback (agent fallback)
If the credential helper is missing or the PAT expired, unset the helper first:
```bash
git config --unset credential.helper
```
Then push via `gitPush({})` in CodeExecution. Re-apply the helper afterward if the user wants shell push back.

**Why they conflict:** The platform detects any `credential.helper` entry and refuses `gitPush` to prevent token leakage via the helper subprocess.

## Resetting after a PAT rotation
1. User rotates PAT → asks for "UI to update GITHUB_PAT" → use `requestSecrets({ keys: ["GITHUB_PAT"] })`.
2. Re-apply the credential helper: `git config credential.helper '!f() { echo "username=x-access-token"; echo "password=$GITHUB_PAT"; }; f'`
3. Verify: `git push` should print `Everything up-to-date`.

## Pull / merge
```bash
git fetch origin && git merge origin/main -X ours --allow-unrelated-histories
```
Set `git config user.email` / `user.name` first if git identity is blank.
