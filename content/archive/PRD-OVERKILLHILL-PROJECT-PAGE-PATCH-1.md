# PRD — Patch 1: Accuracy Corrections to the Chai Chasers Project Page
**Target Repl:** OverKill-Hill (https://replit.com/t/overkill-hill/repls/OverKill-Hill)
**Target file:** `projects/glee-fully-chai-chasers/index.html` (live at https://overkillhill.com/projects/glee-fully-chai-chasers/)
**Author:** Claude (PM) · **Date:** 2026-07-16 · **Version:** Patch 1.0
**Type:** SURGICAL PATCH. Three find-and-replace edits plus one optional sentence. This is not a redesign, not a refresh, not an opportunity.

---

## 0. Mission statement (read twice)

The project page shipped correctly against the game as it existed when its PRD was written. The game's math and decision log have since evolved, and exactly three factual claims on the page are now stale. Your entire job is to correct those three claims with the replacement text below, verbatim, and change NOTHING else. The page as built is the approved, protected baseline: its structure, styling, copy, layout, embed, sidebar, links, and every sentence not named in §2 must remain byte-identical.

**Why so narrow:** this page was validated line-by-line against a canonical spec and a brand voice ruleset. Any edit outside the four changes below is a regression by definition, even if it looks like an improvement to you. If while working you believe you've found another problem, do not fix it: note it in the handoff (§5) and stop.

**Voice law (applies to every character you type):** OverKill Hill copy contains **no em dashes, ever**. The replacement strings below comply; type them exactly. Do not "improve," reflow, re-punctuate, or paraphrase them.

## 1. Scope fences

**You may modify:** `projects/glee-fully-chai-chasers/index.html` — only the strings named in §2.
**You may NOT touch:** any other file in the repl; the page's `<head>`, meta tags, OG tags, or structured data; the nav, projects index, sitemap; any CSS; the embed block; the Project Info sidebar; the Related list; the On This Page TOC; any image or asset. No dependency changes, no formatter runs, no whitespace cleanup, no "while I'm here" edits. If your tooling auto-formats HTML on save, disable it or hand-edit; a diff touching lines outside §2 fails acceptance.

## 2. The four changes

### Change 1 — Engine card, UniGlee rarity (REQUIRED)

The game's UniGlee event was redesigned into a rarer, much larger marathon bonus (decision S22/S30). The old rate is wrong by ~3x.

- **Section:** "What It Does" → card titled "A real cascade engine."
- **FIND (exact):** `a 1-in-400 legendary event`
- **REPLACE (exact):** `a roughly 1-in-1,300 legendary event`

### Change 2 — Oracle card, RTP claim (REQUIRED)

The spec was formally amended (decisions S27-S32) to a layered RTP model: the base game targets ~61% and the bonus layer adds ~35%, totaling ~96.5%. The oracle now asserts that layered model. The old flat "96% plus or minus 0.5" claim no longer describes what the test asserts.

- **Section:** "What It Does" → card titled "A simulation oracle as the definition of done."
- **FIND (exact):** `A 200,000-spin seeded test asserts RTP 96% plus or minus 0.5 and five event-frequency bands.`
- **REPLACE (exact):** `A 200,000-spin seeded test asserts the spec's layered RTP model (base game plus bonus layer, roughly 96.5% total) and five event-frequency bands.`

### Change 3 — Decision log artifact, count (REQUIRED)

The log grew from 26 settled decisions to 32.

- **Section:** "The Orchestration Pattern" → Artifact 2, "The decision log."
- **FIND (exact):** `Twenty-six settled decisions. Settled questions stay settled; no tool re-litigates a closed one.`
- **REPLACE (exact):** `Thirty-two settled decisions and counting. Settled questions stay settled; no tool re-litigates a closed one.`

### Change 4 — Origin section, one added sentence (OPTIONAL; include unless it causes any layout issue)

The origin story ends at ship week; one sentence closes the arc. Insert immediately BEFORE the existing sentence beginning `The full narrative lives in` (same paragraph, no new markup):

- **INSERT (exact):** `The final build passed 149 tests, and the last edit before the freeze was one sentence from Jamie to Glee.`

## 3. What "done" looks like

The rendered page is pixel-identical to the current live page except: the Engine card reads "a roughly 1-in-1,300 legendary event"; the Oracle card carries the layered-model sentence; Artifact 2 reads "Thirty-two settled decisions and counting"; and (if Change 4 applied) the Origin paragraph carries the new sentence in position. Nothing else moved.

## 4. Validation loop (both cycles required, even for a patch)

```
Cycle 1 — mechanical:
1. Apply the four changes. View the local diff. It must touch ONLY the lines
   containing the four target strings. Any other changed line: revert and redo.
2. Grep the full file for the em dash character. Zero hits in any text you
   added (pre-existing hits elsewhere in the file, if any, are out of scope:
   leave them and note them in the handoff).
3. Confirm the three FIND strings no longer appear anywhere in the file, and
   each REPLACE string appears exactly once.

Cycle 2 — rendered:
4. Load the page locally. Check desktop (1440 wide) and mobile (390 wide):
   the three edited cards and the Origin paragraph render cleanly, no text
   overflow, no wrapped-badge weirdness, embed still loads, all links still work.
5. Read the three edited sentences aloud against §2. Verbatim match or fix.
```

## 5. Deliverables & handoff

- The single-file change, committed as one conventional commit: `fix: correct UniGlee rarity, layered RTP claim, and decision count on Chai Chasers page`
- Deploy per the repl's normal publish flow (the page is already public; this patch is publishable immediately, no embargo applies to accuracy corrections).
- A short handoff note in the commit description or a `PATCH-1-HANDOFF.md`: confirmation of both validation cycles, the diff line count (should be tiny), and anything you noticed but correctly did not touch.

## 6. Acceptance criteria

A reader who fact-checks the page against the game repo's `docs/DECISION-LOG.md` and `src/engine/simulation.test.ts` finds zero stale claims. A reader who saw the page yesterday notices nothing changed except three numbers got truer. The diff is under a dozen lines. Nobody can tell you were there.
