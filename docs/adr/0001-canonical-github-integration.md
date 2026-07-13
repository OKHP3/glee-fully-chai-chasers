# ADR-0001: Reconcile Concurrent Tool Work Through Feature Branches and PRs

## Status

Accepted

**Date:** 2026-07-12
**Decision owner:** Jamie Hill

## Context

GitHub `main` is the production source for the game, while Claude, Codex, Replit, and local tools may produce bounded work concurrently. During the Chai Chase realignment, local `main` contained approved but uncommitted presentation work and remote `main` had advanced three commits to `58970e7`. A direct pull correctly stopped because it would overwrite `src/main.ts`; a direct push correctly stopped because it was not a fast-forward.

The repository also contained unrelated local CI and technology-inventory work. That work needed to survive the game deployment without being silently included in it.

## Decision Drivers

- Preserve every approved local change and every newer remote commit.
- Keep GitHub `main` deployable and reviewable.
- Never use force push, whole-tree replacement, or an older Replit checkpoint to resolve divergence.
- Keep one owner and one bounded scope per deliverable.
- Preserve unrelated working-tree changes without publishing them accidentally.
- Retain the pure-TypeScript engine/UI boundary and the protected presentation baseline.

## Considered Options

### Pull directly into dirty `main`

Rejected. Git already demonstrated that this would overwrite the locally modified splash entry point.

### Force-push local `main`

Rejected. This would discard remote history and violate GitHub's role as the canonical production source.

### Copy files between Replit and GitHub manually

Rejected. Whole-file copying hides ancestry, makes conflicts harder to review, and risks restoring superseded presentation or documentation.

### Feature branch, intentional commits, rebase, validation, and PR

Accepted. It preserves ancestry, confines conflict resolution to the actual overlapping files, provides a human-readable diff, and lets GitHub Actions gate deployment.

## Decision

When approved local work and remote `main` diverge:

1. Identify and temporarily stash unrelated changes by explicit path.
2. Create an `agent/*` feature branch without discarding the approved work.
3. Commit only the approved deliverable in small conventional commits.
4. Rebase the feature branch onto current `origin/main`.
5. Resolve only genuine conflicts, preserving both newer remote fixes and the approved local result.
6. Run the full test suite, production build, diff checks, and relevant rendered-flow QA.
7. Push the feature branch and merge through a reviewed PR.
8. Let the existing GitHub Pages workflow deploy from `main`.
9. Restore the unrelated local changes after the deployment branch is integrated.

Replit and other tools must pull the resulting `main` descendant before accepting another bounded assignment.

## Consequences

### Positive

- No force push or silent rollback is needed.
- Remote fixes and approved local work remain visible in history.
- Unrelated changes are neither lost nor accidentally shipped.
- Claude and Replit receive one unambiguous canonical baseline.
- GitHub Actions and the PR diff become the deployment gate.

### Negative

- Reconciliation requires an extra branch and possible conflict resolution.
- Binary art changes are reviewable by provenance and rendered QA rather than line diff.
- The local default branch must be fast-forwarded after the PR merges.

### Risks and Mitigations

- **Risk:** a conflict resolution could remove Replit's launch-button fix.
  - **Mitigation:** retain a separate non-interactive art layer with `pointer-events: none`, then exercise the CTA in an iPhone-size browser run.
- **Risk:** another tool's local work could be included accidentally.
  - **Mitigation:** stage explicit paths and inspect the staged diff before every commit.
- **Risk:** a long-running bonus design could change engine math without validation.
  - **Mitigation:** keep that work Claude-owned and require simulation-backed tests before implementation merges.

## Related Decisions

- `docs/DECISION-LOG.md` S17-S23
- `docs/IMPLEMENTATION-BASELINE.md`
- `docs/GAME-REALIGNMENT-2026-07-12.md`
- `docs/REPLIT-HANDOFF.md` v3
