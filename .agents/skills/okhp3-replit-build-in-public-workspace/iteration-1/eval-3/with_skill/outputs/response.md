# Session Handoff Documents for Multi-Day Designathon Builds

## Purpose

A Designathon build spanning multiple days with different AI agents each session risks losing narrative continuity — the next session starts from scratch instead of where the last one left off. Session handoff documents prevent this.

---

## Naming Convention

Name the file using one of two patterns:

- **Dated file per session:** `<DATE>-HANDOFF.md`  
  Example: `2025-07-15-HANDOFF.md`
- **Single cumulative file (append each session):** `HANDOFF.md`

Use the dated-file pattern when you want a clear audit trail of each session; use the single-file append pattern when you want one place to check the current state.

---

## Required Length

**One page maximum.** A handoff longer than one page will not be read. The full history of what was built lives in git — the handoff is a navigational bridge, not a log.

---

## Required Contents (Four Sections)

Every session handoff must cover exactly these four items:

### 1. What Was Accomplished
- Features shipped during this session
- Decisions made (link to `DECISION-LOG.md` rows if applicable)
- Measurements taken (e.g., RTP figures, test counts, simulation results)

### 2. Current State
- Which workflows are running (or stopped)
- Current `git status` (clean? uncommitted changes? branch?)
- What URL is live (Replit Publish URL and/or GitHub Pages URL)

### 3. Open Items
- Anything that wasn't finished
- Decisions that still need a ruling
- Known bugs or issues left unresolved

### 4. Next Action
- **The single most important thing the next session should do first**, stated as **one sentence**.

---

## Example Structure

```markdown
# 2025-07-15 — Session Handoff

## Accomplished
- Shipped act 5 (Phoebe's Lap Quest) with full sound sync
- Updated RTP to 98.1% in README; source: fleet-B run, 100 k spins, seed range 1–1000
- Committed 3 times; GitHub Actions deploy is green

## Current State
- All workflows running; git is clean on `main`
- Live at: https://chai-chasers.replit.app and https://okhp3.github.io/chai-chasers/

## Open Items
- Mobile viewport clipping on the mini-map (not blocking, but noted)
- Pitch deck slide 9 still says "TBD" for the simulation methodology

## Next Action
Fix pitch deck slide 9 to cite the fleet-B simulation script and spin count, then publish.
```

---

## Provenance Discipline (Connected Requirement)

Any measurement, figure, or claim referenced in the handoff — and later surfaced in `README.md`, the pitch deck, or a public project page — must be traceable to a source. Do not copy figures from a previous handoff; cite the original run directly:

| Claim type | What to cite |
|---|---|
| RTP figures | Which fleet produced them and what player model was assumed |
| Test counts | The exact command that produced the number |
| Simulation results | The script, the seed range, and the spin count |
| Decision counts | The exact `DECISION-LOG.md` row range |

This prevents drift: documentation that quotes a test run cannot drift; documentation that quotes a previous document drifts every time it is copied.

---

## Quick Reference

| Property | Value |
|---|---|
| **Naming** | `<DATE>-HANDOFF.md` or append to `HANDOFF.md` |
| **Length** | ≤ 1 page |
| **Sections** | Accomplished · Current State · Open Items · Next Action |
| **Next Action format** | One sentence only |
| **Full history** | Lives in git — do not duplicate it in the handoff |
