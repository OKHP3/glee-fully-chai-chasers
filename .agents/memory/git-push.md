---
name: Git push approach
description: How to push to github.com/OKHP3/glee-fully-chai-chasers from this workspace.
---

Shell `git push` is now the standard approach. The credential helper is configured with:

```
git config credential.helper '!f() { echo "username=x-access-token"; echo "password=$GITHUB_PAT"; }; f'
```

`GITHUB_PAT` is stored as a Replit Secret and is injected into the environment automatically. The config lives in `.git/config` (local, not committed), so it must be re-applied if `.git` is ever recreated.

**Why:** Replit injects a short-lived HTTPS credential that expires; the GITHUB_PAT secret is persistent and controlled by the workspace owner.

**How to apply:** If `git push` fails with "Invalid username or token", re-run the git config command above, or use the `gitPush` CodeExecution callback as a fallback.

**Merge strategy (unchanged):** `git merge origin/main -X ours --allow-unrelated-histories` when histories diverge. Set `git config user.email/name` first if git identity is blank.
