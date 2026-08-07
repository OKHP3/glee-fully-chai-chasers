---
name: Git push approach
description: How to push to github.com/OKHP3/glee-fully-chai-chasers from this workspace.
---

Always push via the `gitPush` CodeExecution callback. Never configure `credential.helper` in `.git/config` — the platform detects it and blocks `gitPush` with "credential helpers could access the bearer token".

If `gitPush` fails after a credential helper was accidentally set:
```bash
git config --unset credential.helper
```
Then use `gitPush` again.

**Why:** Replit injects a short-lived HTTPS credential that expires quickly; the platform's managed token (used by `gitPush`) is always fresh and authoritative. Configuring credential.helper conflicts with the platform's token injection.

**How to apply:** After any commit, call `gitPush({})` in CodeExecution. Pull from shell with `git fetch && git merge origin/main -X ours --allow-unrelated-histories`; set `git config user.email/name` first if identity is blank.

**Merge strategy (unchanged):** `git merge origin/main -X ours --allow-unrelated-histories` when histories diverge.
