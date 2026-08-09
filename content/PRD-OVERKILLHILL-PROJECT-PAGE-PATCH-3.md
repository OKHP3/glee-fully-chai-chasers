# PRD, Patch 3. Reconcile the Chai Chasers Project Page With the Shipped Engine

**Target Repl:** OverKill-Hill (https://replit.com/t/overkill-hill/repls/OverKill-Hill)
**Target file:** `projects/glee-fully-chai-chasers/index.html` (live at https://overkillhill.com/projects/glee-fully-chai-chasers/)
**Author:** Claude (PM) · **Date:** 2026-08-09 · **Version:** Patch 3.0
**Type:** SURGICAL PATCH plus ONE bounded additive section. Same discipline as Patches 1 and 2. Every sentence not named below is load-bearing and stays byte-identical.

---

## 0. Mission statement (read twice)

Patch 2 (2026-07-17) corrected this page against decisions **S33 and S34**. Those decisions do not exist in `docs/DECISION-LOG.md`, and the engine change they described never landed. The repository at commit `234ea74` has no "tease" mechanic, no 1-in-4,212 capture rate, and no configuration that produces 103% RTP. Patch 2's edits made three sentences on this page factually wrong.

Your job has two parts:

1. **Roll those three claims back to what the code actually does** (§2, required, surgical).
2. **Add one new section** that closes the month-long gap between ship week and today (§3, required, additive, self-contained).

Everything else on the page stays exactly as it is. The Origin section's "149 tests" sentence is a deliberate historical claim about the ship-week freeze build and is **out of scope**, same as in Patch 2. Do not touch it.

**Voice law (applies to every character you type):** OverKill Hill copy contains **no em dashes, ever**. The replacement strings below comply. Type them exactly. Do not improve, reflow, re-punctuate, or paraphrase them.

## 1. Scope fences

**You may modify:** `projects/glee-fully-chai-chasers/index.html` only, and only the strings named in §2 plus the single inserted block in §3.

**You may NOT touch:** any other file in the repl; the page `<head>`, meta tags, OG tags, or structured data; the nav, projects index, or sitemap; any existing CSS rule; the embed block; the Related list; the Origin section; the What This Is Not section; any image or asset. No dependency changes, no formatter runs, no whitespace cleanup, no "while I'm here" edits. A diff touching lines outside §2 and §3 fails acceptance.

**One exception:** §3 may add clearly-commented, Chai-Chasers-scoped CSS **only if** the existing card or section components cannot render the new block without it. Prefer reusing an existing component. If you add CSS, wrap it in `/* --- Chai Chasers: post-ship section (Patch 3) --- */`.

**Sidebar exception:** §2 Change 5 edits one Project Info row. That row and no other.

## 2. Accuracy corrections (required)

### Change 1. Engine card, UniGlee rarity

Reverts Patch 2 Change 1. The engine rolls three independent per-reel captures at 1-in-2,500, 1-in-4,000, and 1-in-7,500, combining to roughly 1 in 1,277. Measured 1 in 1,370 by the seeded oracle. There is no decorative sighting: `placeUniGleeTrigger` deliberately makes the trigger line-valid so the event cannot look like a non-paying scatter.

- **Section:** "What It Does" → card titled "A real cascade engine."
- **FIND (exact):** `a legendary event that shows itself often but is only truly caught about once every 4,200 spins`
- **REPLACE (exact):** `a legendary event captured roughly once every 1,300 spins, on three independently rolled reels that size the reward`

### Change 2. Oracle card, remove the 103% claim

Reverts Patch 2 Change 2b. The full-game figure is now measured end to end rather than assembled from design math, and it does not reach 103%.

- **Section:** "What It Does" → card titled "A simulation oracle as the definition of done."
- **FIND (exact):** ` The legendary event above is deliberately excluded from that figure: there's no real money in this game, so its rare, generous payout is allowed to push measured full-game RTP to roughly 103% on the runs where it lands.`
- **REPLACE (exact):** ` A second harness plays every bonus end to end through the same engine entry points the UI uses. Across 2,000,000 paid spins on forty seeds it measures full-game RTP at 98.70%, assuming a perfect player on the two interactive bonuses. Per-seed results run from 94.2% to 106.8%, because the rarest event is worth about 7.5 points of RTP by itself. A seven-seed sample of the same engine returned 95.66%, which is precisely why the figure now ships with its seed list attached.`

### Change 3. Oracle card, what the oracle actually asserts

The oracle asserts the layered model's base leg, not a total. Its base gate is 61.08% against a 59.9 to 61.9 band. Saying it asserts "roughly 96.5% total" overstates it.

- **Section:** same card as Change 2.
- **FIND (exact):** `(base game plus the common bonuses, roughly 96.5% total)`
- **REPLACE (exact):** `(the base game holds a 61% band while the bonus layer carries the rest)`

### Change 4. Decision log artifact, count

`docs/DECISION-LOG.md` holds 33 settled rows spanning S1 through S32. There is no S33 or S34.

- **Section:** "The Orchestration Pattern" → Artifact 2, "The decision log."
- **FIND (exact):** `Thirty-four settled decisions and counting.`
- **REPLACE (exact):** `Thirty-three settled decisions and counting.`

### Change 5. Project Info, version string

`package.json` reads `0.1.0`. The sidebar reads `v1.x`.

- **Section:** Project Info sidebar → Status row.
- **FIND (exact):** `Active / v1.x`
- **REPLACE (exact):** `Active / shipped, still maintained`

## 3. New section: "What Happened After the Gift" (required, additive)

**Placement:** immediately AFTER the "Principles" section and immediately BEFORE the "What This Is Not" section. Use the page's existing section wrapper, heading level, and body-copy component. No new heading level, no new grid, no new card variant unless §1's CSS exception applies.

**Why this section exists:** the page currently argues that governance produces durable results, then stops the story at ship week. A month of post-gift work is the strongest available evidence for that argument, and it is the only part of this page that a reader cannot get from the repo's README.

**Heading (exact):** `What Happened After the Gift`

**Body copy (verbatim, four paragraphs):**

> The gift shipped on July 17. The interesting part is what the governance layer was worth after the deadline stopped mattering.

> A hundred and fifty-two commits later, the game carries five bonus chapters that did not exist at ship: Joey's Laundry Helper, Phoebe's Lap Quest, the Moonlit Keepsake Trail memory game, Morning and Nighttime Treat Time, and a five-act UniGlee marathon that plays out across all of them. It also grew a progression economy, a wager ladder, an ingredient almanac, and a cabinet UI built around an illustrated marquee. None of that regressed the engine, because the oracle never moved.

> The maintenance record is the part the original build could not demonstrate. The test suite went from 149 to 170. A threat model landed. The package manager now enforces a one-day minimum release age on every dependency as a supply-chain defense, with two logged CVE overrides. Architecture decisions moved into ADRs. The repository README was rewritten against the code, not against the previous README, with every number in it re-measured on the commit it describes.

> That last sentence is the whole thesis. Documentation that quotes documentation drifts. Documentation that quotes a test run cannot.

**Optional stat row (include only if the page already has a stat or metric component to reuse; otherwise skip entirely and do not build one):**

| Label | Value |
|---|---|
| Commits since ship | 152 |
| Tests, ship week to today | 149 → 170 |
| Bonus chapters added | 5 |
| Full-game RTP, re-measured | 98.70% over 2,000,000 spins |

## 4. Validation loop (both cycles required)

```
Cycle 1, mechanical:
1. Apply Changes 1 through 5 and insert §3. View the local diff. Outside the
   §3 insertion, it must touch ONLY the five target lines. Any other changed
   line: revert and redo.
2. Grep everything you typed for the em dash character. Zero hits.
3. Confirm the five FIND strings no longer appear anywhere in the file, and
   each REPLACE string appears exactly once.
4. Confirm "The final build passed 149 tests" is present and UNCHANGED.
5. Confirm the strings "4,200 spins", "103%", "Thirty-four", and "v1.x" no
   longer appear anywhere in the file.

Cycle 2, rendered:
6. Load the page locally at 1440 wide and 390 wide. The two edited cards render
   cleanly with the longer sentences, no overflow. The new section sits between
   Principles and What This Is Not, matches surrounding spacing rhythm, and
   inherits the page's type scale with no bespoke styling visible.
7. Confirm the On This Page TOC either picks the new section up automatically
   or, if it is hand-maintained, add exactly one entry for it and nothing else.
8. Read every sentence you added aloud against §2 and §3. Verbatim match or fix.
9. Embed still loads. Every link still resolves.
```

## 5. Deliverables and handoff

- One conventional commit: `fix: reconcile UniGlee rarity and RTP claims with the shipped engine, add post-ship section (Patch 3)`
- Deploy per the repl's normal publish flow. The page is public and these are accuracy corrections. No embargo.
- `PATCH-3-HANDOFF.md`: both validation cycles confirmed, the diff line count, whether the optional stat row was included and why, whether any CSS was added under the §1 exception, and anything you noticed but correctly did not touch.

## 6. Acceptance criteria

A reader who fact-checks this page against `src/engine/uniglee.ts`, `src/engine/simulation.test.ts`, `scripts/sim-agent.ts`, and `docs/DECISION-LOG.md` at commit `234ea74` or later finds zero stale claims. The page no longer describes a mechanic that does not exist. A reader who saw the page in July finds the same argument, better evidenced, carried a month further forward.

## 7. Upstream dependency (do not block on it, but flag it)

`docs/DECISION-LOG.md` in the game repo has two rows both labeled S30 and no S33 or S34, while this page's Patch 2 cited S33 and S34 as its authority. That is a governance defect in the game repo, not on this page, and it is being tracked in `content/AUDIT-2026-08-09.md`. This patch makes the page match the code regardless of how the log is reconciled.
