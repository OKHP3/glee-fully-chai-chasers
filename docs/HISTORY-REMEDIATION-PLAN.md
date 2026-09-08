# Public History Remediation Plan

**Status:** prepared for owner review; not executed
**Purpose:** provide a safe, reversible plan for removing private source material from public Git history while preserving the approved birthday narrative and the current release tree.

This is a coordination and review artifact, not an instruction to rewrite history. No force-push, deletion, ref rewrite, or collaborator resynchronization has been performed as part of the current release close-out.

## Current state and affected-history inventory

The current checkout and deployed bundle are separate from repository history. The known private directories are absent from the current tree, but the local ref set shows historical material in these category-level classes:

| History class | What the inventory must identify | Public-plan handling |
|---|---|---|
| Private reference-photo material | All historical reference-photo paths, derivatives, and generated conversions | Record exact objects in an owner-only manifest; do not reproduce filenames, images, or contents here |
| Private working material | Any historical private-work notes, triage material, or intermediate source files | Record exact objects and whether an approved public derivative exists; keep source details out of public docs |
| Raw attachments and pasted source material | Historical attachment dumps, pasted prompts, personal source notes, and generated files that are not product artifacts | Classify each object as retain, redact, or remove; do not treat a current filename or a clean tree as proof of safe history |
| Public project documentation | Canonical specs, decisions, audits, and handoffs that are intended to remain public | Review only for accidental private excerpts; do not bulk-delete documentation as part of a media purge |

The exact commit IDs, blob IDs, filenames, image contents, and source text belong in the private owner review packet, not this repository-facing plan. The inventory is complete only when that packet covers every reachable ref, tag, pull request ref, and backup copy that will be affected.

## Preservation backups

Before any rewrite is approved:

1. Create two independent, read-only preservation copies from the agreed source refs: an offline bare clone and a `git bundle --all` (or equivalent complete ref/object export).
2. Store both outside the working checkout and outside the rewritten remote; protect access because the backups may contain the material being removed.
3. Record SHA-256 checksums, source ref names, cutoff commit, creation time, and the person who verified each copy in the private owner packet.
4. Preserve the current public tree separately as a normal reviewed commit so a clean-tree release can be rebuilt without relying on rewritten history.
5. Do not assume an existing mirror, local reflog, or Replit checkpoint is a sufficient backup until it has been independently verified against the agreed refs.

Backups are recovery material, not a permission to republish the private source.

## Collaborators and coordination

The stop-and-resync list is:

- **Jamie:** owner of the privacy, canon, release-boundary, and final rewrite approval.
- **GitHub maintainers/reviewers:** protect the canonical `main` ref, pause merges, and review the dry run and post-rewrite checks.
- **Claude/spec and engine work:** stop pushes and preserve the current canonical documents and simulation evidence.
- **Codex/ChatGPT presentation and art work:** stop pushes and preserve approved public assets and provenance records.
- **Replit workers, agents, and sub-repository checkouts:** stop workflows and pushes; do not continue from stale refs.
- **Any open branch, pull request, automation, or scheduled deployment:** record its owner and disposition before the cutoff; no automated writer may recreate removed history during the window.

The coordinator must publish a single cutoff ref and maintenance window. “Everyone stop” means no commits, pushes, merges, rebases, branch creation, or automated syncs against the affected refs until the owner reopens the repository.

## Required stop, rewrite, and resync sequence

1. **Freeze:** Jamie approves the exact category inventory, source refs, cleanup tool, and maintenance window. All collaborators acknowledge the cutoff.
2. **Snapshot:** create and verify both preservation backups; export the ref manifest and current release commit.
3. **Dry run:** perform the rewrite only in an isolated clone. Apply an explicit path/content allowlist and review the resulting tree and reachable object scan. Never use a broad “delete anything that looks private” rule.
4. **Review:** Jamie and the GitHub maintainers inspect the dry-run report, public tree diff, CI/privacy scan, and recovery procedure. Reject the run if any private source remains or public canon changes.
5. **Apply:** only after written approval, update the canonical remote through the agreed protected maintenance process. No force-push is authorized by this document.
6. **Validate:** run the repository tests/build, private-path and bundle checks, history reachability scan, ref/branch review, and a public-narrative review. Confirm that the deployment source remains the reviewed release tree.
7. **Resync:** collaborators discard stale rewritten clones only after preserving any unmerged work, then make fresh clones or follow the owner-issued reset/re-clone instructions. Reapply only reviewed patches on top of the new `main`; never merge old history back.
8. **Close:** retain the preservation backups through an owner-approved retention period, record the final scan and deployment result, then mark the remediation complete in the release boundary.

## Approval gates and recovery

The rewrite is blocked until all gates are green:

- owner-approved category inventory and public/private classification;
- two checksum-verified preservation backups;
- all collaborators and automations stopped at the same cutoff;
- dry-run report reviewed with no change to public canon, product code, or approved assets;
- explicit approval for the remote ref update;
- post-update history scan, tree scan, build/test, and deployment-source check;
- collaborator resync acknowledgments.

If validation fails, stop. Restore the pre-rewrite refs from the preserved source rather than improvising a second rewrite. Keep the failed dry-run isolated, document the reason, and obtain a new approval before trying again. This plan does not authorize deletion of files, rewriting Git history, or force-pushing.
