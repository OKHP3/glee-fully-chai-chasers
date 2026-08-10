# PRD — Patch 2: UniGlee Rarity, RTP Exemption, and Decision Count

**Target Repl:** OverKill-Hill (https://replit.com/t/overkill-hill/repls/OverKill-Hill)
**Target file:** `projects/glee-fully-chai-chasers/index.html` (live at https://overkillhill.com/projects/glee-fully-chai-chasers/)
**Author:** Claude (PM) · **Date:** 2026-07-17 · **Version:** Patch 2.0
**Type:** SURGICAL PATCH. Three find-and-replace edits plus one anchored insertion. This is not a redesign, not a refresh, not an opportunity. Same discipline as Patch 1 — this page has already been corrected once; treat every untouched sentence as load-bearing.

---

## 0. Mission statement (read twice)

Patch 1 (2026-07-16) corrected the page against the game as it existed that week. Since then, two more settled decisions (S33, S34) changed UniGlee's math again: the award reverted to its original 300/400/500 spins, the real capture rate got rarer, a brand-new decorative "tease" sighting was added, and UniGlee was formally declared exempt from the site's stated RTP band. Three sentences on the live page are now stale as a direct result. Your entire job is to correct those three sentences with the replacement text below, verbatim, and change NOTHING else. The page as it stands post-Patch-1 is the protected baseline: structure, styling, copy, layout, embed, sidebar, links, and every sentence not named in §2 must remain byte-identical.

**Why so narrow:** every sentence on this page was already validated once, patched once, and re-verified live. Any edit outside the changes below is a regression by definition, even if it looks like an improvement to you. If you find another problem while working, do not fix it: note it in the handoff (§5) and stop.

**Voice law (applies to every character you type):** OverKill Hill copy contains **no em dashes, ever**. The replacement strings below comply; type them exactly. Do not "improve," reflow, re-punctuate, or paraphrase them.

**One deliberate omission:** the Origin section still reads "The final build passed 149 tests." That is correct and must NOT be touched — it is a historical claim about the ship-week freeze build specifically, not a live counter. The test suite has grown since (155 tests as of this patch) because of post-ship engine work, but the Origin paragraph is telling the story of that one frozen week, not today. Changing "149" would misrepresent history, not fix it. If you are tempted to "fix" this number: don't. It is intentionally out of scope.

## 1. Scope fences

**You may modify:** `projects/glee-fully-chai-chasers/index.html` — only the strings named in §2.
**You may NOT touch:** any other file in the repl; the page's `<head>`, meta tags, OG tags, or structured data; the nav, projects index, sitemap; any CSS; the embed block; the Project Info sidebar; the Related list; the On This Page TOC; any image or asset; the Origin section's "149 tests" sentence (see §0). No dependency changes, no formatter runs, no whitespace cleanup, no "while I'm here" edits. If your tooling auto-formats HTML on save, disable it or hand-edit; a diff touching lines outside §2 fails acceptance.

**Encoding note:** the FIND strings below were chosen to avoid apostrophes and other characters that might be encoded as smart quotes or HTML entities in the source. If any FIND string still fails to match exactly, open the raw source, locate the sentence by context, and confirm the surrounding text before editing — do not guess-and-replace a similar-looking sentence.

## 2. The four changes

### Change 1 — Engine card, UniGlee rarity and the new tease mechanic (REQUIRED)

The real, marathon-granting UniGlee capture got rarer (S34: ~1-in-1,300 → ~1-in-4,212), and a brand-new, purely decorative, non-paying "tease" sighting was added at ~1-in-850 — the butterfly is now glimpsed often but only truly caught rarely, on purpose (modeled on Invaders from the Planet Moolah's UniCow).

- **Section:** "What It Does" → card titled "A real cascade engine."
- **FIND (exact):** `a roughly 1-in-1,300 legendary event`
- **REPLACE (exact):** `a legendary event that shows itself often but is only truly caught about once every 4,200 spins`

### Change 2a — Oracle card, RTP model wording (REQUIRED)

"Bonus layer" is now ambiguous since UniGlee is a bonus but is explicitly excluded from this figure (S33). Tightened to "the common bonuses" to match the game's own internal terminology (`src/engine/paylines.ts`, `AGENTS.md`).

- **Section:** "What It Does" → card titled "A simulation oracle as the definition of done."
- **FIND (exact):** `(base game plus bonus layer, roughly 96.5% total)`
- **REPLACE (exact):** `(base game plus the common bonuses, roughly 96.5% total)`

### Change 2b — Oracle card, UniGlee's RTP exemption (REQUIRED)

The 96.5% figure only ever described base plus the common bonuses. UniGlee's real full-game RTP contribution was never covered by that number and is now measured at scale — the page currently implies UniGlee is inside the 96.5% figure, which it never truly was and is now explicitly not (S33/S34). Insert a new sentence immediately after the existing one, same paragraph, no new markup.

- **Section:** same card as Change 2a.
- **FIND (exact):** `and five event-frequency bands.`
- **INSERT (exact), immediately after, same paragraph:** ` The legendary event above is deliberately excluded from that figure: there's no real money in this game, so its rare, generous payout is allowed to push measured full-game RTP to roughly 103% on the runs where it lands.`

### Change 3 — Decision log artifact, count (REQUIRED)

The log grew from 32 settled decisions to 34 (S33 and S34, both 2026-07-17).

- **Section:** "The Orchestration Pattern" → Artifact 2, "The decision log."
- **FIND (exact):** `Thirty-two settled decisions and counting.`
- **REPLACE (exact):** `Thirty-four settled decisions and counting.`

## 3. What "done" looks like

The rendered page is pixel-identical to the current live page except: the Engine card describes the legendary event as shown often but truly caught around 1-in-4,200; the Oracle card's parenthetical says "the common bonuses" and carries one new sentence about UniGlee's RTP exemption; Artifact 2 reads "Thirty-four settled decisions and counting." The Origin section's "149 tests" sentence is untouched. Nothing else moved.

## 4. Validation loop (both cycles required, even for a patch)

```
Cycle 1 — mechanical:
1. Apply the three changes (four edits, since Change 2 has two parts). View the
   local diff. It must touch ONLY the lines containing the target strings and
   the one inserted sentence. Any other changed line: revert and redo.
2. Grep the full file for the em dash character. Zero hits in any text you
   added (pre-existing hits elsewhere in the file, if any, are out of scope:
   leave them and note them in the handoff).
3. Confirm the old strings ("1-in-1,300," "bonus layer, roughly 96.5%,"
   "Thirty-two settled decisions") no longer appear anywhere in the file, and
   each replacement/inserted string appears exactly once.
4. Confirm "The final build passed 149 tests" is present and UNCHANGED.

Cycle 2 — rendered:
5. Load the page locally. Check desktop (1440 wide) and mobile (390 wide):
   the Engine card and Oracle card render cleanly with the longer sentences,
   no text overflow, no wrapped-badge weirdness, embed still loads, all links
   still work.
6. Read the four edited/inserted sentences aloud against §2. Verbatim match
   or fix.
```

## 5. Deliverables & handoff

- The single-file change, committed as one conventional commit: `fix: update UniGlee rarity, RTP exemption wording, and decision count on Chai Chasers page (S33/S34)`
- Deploy per the repl's normal publish flow (the page is already public; this patch is publishable immediately, no embargo applies to accuracy corrections).
- A short handoff note in the commit description or a `PATCH-2-HANDOFF.md`: confirmation of both validation cycles, the diff line count (should be small), and anything you noticed but correctly did not touch (including confirming the "149 tests" sentence was left alone on purpose).

## 6. Acceptance criteria

A reader who fact-checks the page against the game repo's `docs/DECISION-LOG.md` (S33, S34) and `src/engine/uniglee.ts` / `src/engine/reels.ts` finds zero stale claims about UniGlee's rarity, the RTP model, or the decision count. A reader who saw the page yesterday notices the UniGlee description got more interesting, not that anything else changed. The diff is small. Nobody can tell you were there except that the copy got truer.
