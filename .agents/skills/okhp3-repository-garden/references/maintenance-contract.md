# Repository garden maintenance contract

## Audit-only report

```text
## Repository state
- HEAD: <branch> at <short SHA>
- origin/main: <short SHA>; relationship: <aligned | ahead N | behind N | diverged>
- working tree: <clean | exact paths>
- worktrees / preservation holds: <none | exact paths and branches>

## Variants since the previous run
- <none, or branch/ref/file> — <evidence and change>

## Branches and pull requests
- KEEP: <branch> — <open PR, worktree, or unique value>
- REVIEW: <branch> — <missing evidence>
- MERGE: <branch> — <PR, completed checks, target>
- DELETE: <branch> — <merged/patch-equivalent, no PR, no worktree>

## Hygiene
- ERROR: <malformed ref, lock, or check failure>
- PROPOSED: <exact file or folder> — <why it is residue and recovery path>

## Required owner decisions
- <none, or exact operation>
```

## Clean-state criteria

A repository may be reported as clean only when all are true:

1. `HEAD` and `origin/main` are aligned, or an explicit, documented PR/recovery branch explains the difference.
2. Every non-main branch is either active, linked to a worktree, tied to an open PR, protected under `refs/archive/`, or a verified deletion candidate.
3. There are no malformed Git refs, active lock files, or unclassified tracked temporary files.
4. A scheduled run has not made any mutation.

## Escalation criteria

Stop and request owner direction when a branch has unique unmerged commits, a sidecar folder has an uncertain owner, PR checks are failing, the checkout is dirty with unknown work, or the intended action would change `main`, delete a worktree, erase a stash/archive ref, or remove private material.
