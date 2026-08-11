# Session Handoff Document Guide for Multi-Day Designathon Builds

When your Designathon project spans multiple sessions—each potentially run by a different AI agent—a well-structured handoff document is essential for continuity, avoiding duplicated work, and preserving context.

---

## What a Session Handoff Document Should Contain

### 1. Project Identity (2–3 lines)
- Project name, Designathon theme/track, and the repo or workspace path.
- Target audience and core value proposition in one sentence.

### 2. Current State Summary (the most critical section)
- **What exists right now**: list files, components, or features that are complete and working.
- **What is in-progress**: anything partially done, with exact filenames and the stopping point.
- **What is broken or known-buggy**: explicit list—don't hide problems.

### 3. Decisions Made (rationale matters)
- Tech stack choices (e.g., "Using Tailwind over custom CSS because of time constraints").
- Design decisions (color palette, typography, layout approach).
- Scope cuts: features explicitly dropped and why.

### 4. Next Session's Immediate Task List (prioritized, ≤5 items)
- Numbered, concrete, actionable steps—not vague goals.
- Example: "1. Wire the `/api/submit` POST endpoint to the Supabase `entries` table."

### 5. File Map / Structure Snapshot
- A brief tree of key files and their purpose (only the non-obvious ones).
- Note any unusual naming or folder conventions.

### 6. Environment & Secrets Notes
- Which env vars are needed (names only, never values).
- Any external services connected (e.g., "Supabase project `abc123` is linked").

### 7. Open Questions / Blockers
- Decisions that need to be made but weren't resolved.
- Any external dependencies (API keys, assets, approvals) still pending.

### 8. Session Timestamp & Agent/Author Tag
- ISO date and time of handoff (e.g., `2025-07-14T22:30Z`).
- Identifier for who wrote it (human alias or agent session ID).

---

## How Long Should It Be?

**Target: 300–600 words / 1–2 pages.**

- Long enough to fully orient a fresh agent with zero prior context.
- Short enough to write in under 10 minutes and read in under 2 minutes.
- Bullet points over prose. No filler. Every sentence must carry information.

If the document is growing beyond 600 words, move detailed notes to a separate `NOTES.md` and keep the handoff lean.

---

## How Should It Be Named?

Use a consistent, sortable naming convention so documents form a chronological log:

```
HANDOFF_2025-07-14_session-2.md
```

**Pattern:** `HANDOFF_YYYY-MM-DD_session-N.md`

- Place all handoff files in a `/handoffs/` directory at the project root.
- Use ISO date format so files sort correctly by name.
- Increment the session number even if multiple sessions happen in one day.
- The *latest* handoff is always the active one—no need to delete old ones; they serve as a project log.

**Example directory:**
```
/handoffs/
  HANDOFF_2025-07-13_session-1.md
  HANDOFF_2025-07-14_session-2.md   ← active
```

---

## Quick Template

```markdown
# Handoff — [Project Name] — Session N
**Date:** YYYY-MM-DDThh:mmZ | **Author:** [alias/agent-id]

## Current State
- Done: ...
- In Progress: ...
- Broken: ...

## Decisions Made
- ...

## Next Session Tasks (in order)
1. ...
2. ...
3. ...

## Key Files
- `path/to/file.ext` — what it does

## Env / Services
- Needs: VAR_NAME_1, VAR_NAME_2
- Connected: [service name]

## Open Questions
- ...
```

---

## Key Principle

Write the handoff as if the next agent has **seen nothing**—because it hasn't. Assume zero shared memory. The document is the entire continuity of the project between sessions.
