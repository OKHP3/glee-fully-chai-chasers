---
name: okhp3-repository-garden
description: >
  OverKill Hill P³ single-repository maintenance and reconciliation workflow. Use when a repository needs a daily or weekly health check of local-versus-origin/main variants, worktrees, pull requests, branches, stale locks, temporary files, or accumulated generated material. Also activate when a user asks to garden, tidy, prune, reconcile, or keep one active repository from becoming confusing for human and agent collaborators. This is the authoritative scheduled-maintenance layer for one checkout; use okhp3-repository-janitor instead for a multi-repository mirror estate and okhp3-repl-repo-janitor for a one-time Replit cleanup.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: universal
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope:
    - Audit one repository's local, origin/main, worktree, branch, pull-request, and Git-ref state.
    - Produce an evidence-led decision ledger and a safe recurring-maintenance report.
    - Execute explicitly authorized merges, pruning, and file cleanup with recovery points.
  out_of_scope:
    - Unattended merges, deletions, commits, pushes, force-pushes, or history rewriting.
    - Treating generated folders, old branches, or an agent-named branch as disposable without reachability and worktree evidence.
---

# okhp3-repository-garden

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Keep one active repository legible without making cleanup itself a source of loss. This skill separates a scheduled, audit-only heartbeat from an owner-approved gardening session, so local work, remote work, and recovery points stay visible until their relationship is proved.

---

## Scope

| In scope | Out of scope |
|---|---|
| One checkout, its linked worktrees, `origin`, open/closed PRs, branches, and local variants | A fleet-wide mirror audit or a blind `git clean` |
| Exact detritus and naming findings, including ignored Finder files and malformed local refs | Moving unrelated side projects merely because they are not imported by the primary app |
| Approved merge, archive, delete, or rename batches after evidence is recorded | Unattended mutations in a scheduled run |

## Non-negotiable maintenance posture

1. **Scheduled runs are audit-only.** They may fetch without `--prune`, inspect, and report. They never merge, close a PR, delete a branch, modify a ref, commit, push, or delete files.
2. Treat the checked-out branch, other linked worktrees, dirty files, stashes, `refs/archive/`, and unreachable objects as preservation holds. A branch checked out anywhere is not a pruning candidate.
3. Compare the actual local branch and `origin/main` in both directions. `ahead`, `behind`, and `diverged` are different conditions. Never rebase, reset, or fast-forward `main` as a maintenance shortcut.
4. Branch names are clues, not verdicts. Confirm merge reachability, PR state, checks, worktree use, and unique patch value before classifying a branch.
5. Generated or sidecar areas can be intentional. Establish that a file is unreferenced, superseded, and recoverable before proposing deletion; preserve the project’s stated source-of-truth relationships.

## Daily / weekly audit

Run from the repository root. The commands are read-only apart from refreshing remote-tracking refs:

```bash
git status --short
git fetch --all
git worktree list --porcelain
git branch -avv
git log --left-right --cherry-pick --oneline origin/main...HEAD
git stash list
git fsck --no-reflogs --unreachable --no-progress
python3 .agents/skills/okhp3-repl-repo-janitor/scripts/audit-repo.py --root . --base origin/main
```

If GitHub access is available, query every non-main remote branch for its PR state, checks, and merge status. Do not infer a closed or merged PR from a missing local tracking branch.

Use the compact report in `references/maintenance-contract.md`. Report only changes and exceptions after the first clean baseline; an unchanged clean state should be one short confirmation.

## Variant review

For each local branch or linked worktree, record:

| Field | Required evidence |
|---|---|
| Branch relationship | Ahead/behind counts and `git merge-base` against `origin/main` |
| Tree and patch value | `git diff --stat` plus `git cherry -v origin/main <branch>` |
| Remote/PR state | Exact remote ref plus open, closed, merged, or no-PR result |
| Preservation status | Current branch, linked worktree, dirty state, stash, archive ref, or none |
| Disposition | `keep`, `review`, `merge`, `archive`, or `delete`, with one reason |

When local and remote `main` diverge, create a named recovery branch from local `main`, rebase that recovery branch onto refreshed `origin/main`, validate it, and merge it through a reviewed PR. Leave `main` untouched until the reviewed result is integrated.

## Approved gardening session

Only after the owner authorizes exact targets:

1. Refresh refs and recheck every target immediately before mutation.
2. For a merge, verify the PR head, destination, approvals, and completed checks; merge through the PR using the repository’s accepted method.
3. For a redundant branch, prove it is merged or patch-equivalent, has no open PR, and is not checked out in a linked worktree. Delete the verified remote branch first, then the local branch.
4. For local-only preservation, create `refs/archive/<YYYY-MM-DD>/<descriptive-name>` before any action that could make commits unreachable.
5. Use `git rm` and `git mv` for tracked file work. Move untracked OS detritus to a dated temporary recovery hold before permanent removal.
6. Re-run the audit, the project’s narrow validation commands, `git diff --check`, and `git status --short`. State exactly what remains intentionally retained.

## Repository-shape guardrail

Do not mistake a mixed workspace for accidental sprawl. Classify each non-primary area as one of: production source, documented build input, sidecar project, active external-work artifact, generated output, private material, or confirmed residue. A sidecar such as `artifacts/`, `lib/`, or a workspace lockfile needs an ownership decision before it is moved or deleted.

## Scheduling prompt

Use this as a daily or weekly task prompt after the initial cleanup:

```text
Run okhp3-repository-garden against the current repository in audit-only mode. Refresh remotes without pruning; compare HEAD and all local worktrees with origin/main; inspect every non-main remote branch and its PR state; report only new variants, preservation holds, stale-lock/ref errors, and exact proposed actions. Do not merge, delete, rename, commit, push, prune, or modify files. If nothing changed, return one concise clean-state report.
```

## References

- `references/maintenance-contract.md` -- report format, decision ledger, and exit criteria for recurring runs.
- `evals/evals.json` -- three evidence-anchored evaluation cases for this skill.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
