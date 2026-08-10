# VALIDATION — Current Build vs. Original Vision and Initial Plan
**Validator:** Claude · **Date:** 2026-08-10 · **HEAD:** `bb8619a` · **Method:** independent — canonical docs, DECISION-LOG, git log/diff, live-site metadata fetch, cross-check against the two prior validation passes (`docs/FINAL-VALIDATION-2026-07-16.md`, `content/ORIGINAL-VISION-RETROSPECTIVE-2026-08-09.md`). `npm test` could not be re-run in this sandbox (missing platform binary for `@rolldown/binding-wasm32-wasi`, an environment gap, not a code defect) — last recorded green run is 170/24 files on commit `234ea74` (2026-08-09); six commits have landed since without a freshly recorded suite run. Re-run locally before citing "all green" anywhere public.

**Public-narrative rule in effect throughout:** per CANON.md and Decision S17, the only stated motivation anywhere in this document is "a personalized birthday gift built around a genre Glee loves." No other backstory is referenced or implied.

## Verdict

**Still meets and exceeds the original vision on every axis. Does not currently meet its own initial plan (DESIGN-SPEC.md v2) on RTP band, UniGlee award size, and UniGlee frequency claims — three open, unruled decisions (D6, D7, D8) sitting in `DECISION-LOG.md` since 2026-08-09.** That gap is now higher-stakes than it was three days ago: the game has a live Replit User Stories competition submission (`content/replit-user-story-submission-2026-08-09.md`) pointing at a public project page that, per D6, currently states a UniGlee mechanic the shipped engine does not have. Rule D6/D7/D8 before assuming judges won't click through.

## 1. Vs. the original vision (COLLABORATIVE-VISION.md §1/§2/§9, CANON.md)

This axis has not moved since the 07-16 validation and does not need re-litigating — it still holds.

| Non-negotiable | Status |
|---|---|
| Touch-first, mobile-browser, no real money/wagering/ads/cash-out | ✅ held |
| Original characters, art, copy, sound, rules | ✅ held |
| Browser-local saves, no accounts, no product backend | ✅ held; S25's one constrained GA tag is the only measurement, documented in `ANALYTICS-PRIVACY.md` |
| Joey/Phoebe as distinct emotional protagonists | ✅ EXCEEDS — distinct art, treats, sound, and five-plus bonus roles each |
| Glee-fully specificity ("OMG this is so Glee-coded") | ✅ EXCEEDS — symbol atlas, canon voice, treat naming all present |
| No infringement | ✅ held — IP-GUARDRAILS enforced, CI brand-string gate |

## 2. Vs. the initial plan (DESIGN-SPEC.md v2, ruled canonical 2026-07-10, S8–S13)

This is where the drift lives, and it's two different kinds of drift that shouldn't be conflated:

**A. The spec document itself is stale**, including places its own amendment notice says it's superseded. §3's screen-flow diagram still reads "Splash (Tap to open the Toolbox 🧰...)" and lists a Daily Bonus Wheel and Giant Toolbox Mode wheel wedge — all explicitly killed by S20-S23 in 2026-07-12, four weeks before this validation. §7's wheel table doesn't match what's shipped.

**B. The shipped code disagrees with settled decisions, not just with stale prose.** This is the part that needs Jamie, not an editor.

| Spec/decision claim | Shipped reality | Blocking decision |
|---|---|---|
| Sparkle Wheel wedges: We're Multiplying / Giant Toolbox Mode / Iced Chai Wild Rain (spec §7) | We're Multiplying / **Moonlit Keepsake Trail** / Iced Chai Wild Rain (README, code) | none — this is the spec being stale, not code being wrong; S32 settled Moonlit Keepsake Trail as the replacement |
| UniGlee award 300/400/500 spins (S30, 2026-07-15) | 40/60/80 spins (`src/engine/uniglee.ts:94`, `src/engine/laundry.ts:21`, typed at the type level) | **D7 — open** |
| UniGlee frequency ~1 in 850 "sighting/tease" + ~1 in 4,212 real capture (public overkillhill.com page, attributed to S33/S34) | No tease mechanic exists (`grep -rn "tease\|sighting" src/` → zero hits); single real capture at ~1 in 1,277 (measured 1 in 1,370) | **D6 — open** |
| Overall RTP target 95–98%, ~96.5% (spec §4) | Measured 98.70% over 2,000,000 spins, 95% CI 97.93–99.47%, only 10/40 seeds in band | **D8 — open** |
| Milestone scenes, collection shelf, daily bonus wheel (spec §10, §9) | Not shipped; README's "Still planned" list is accurate here | not blocking — correctly labeled unshipped everywhere I checked |

None of row B is a documentation typo. D7 alone is worth ~7.5 points of measured RTP by itself — the single largest bonus contributor — and D6 describes a public page making a factual claim about the shipped game that the shipped game does not do.

## 3. Progress since the 2026-08-09 retrospective (already closing gaps it flagged)

`content/ORIGINAL-VISION-RETROSPECTIVE-2026-08-09.md` listed Lap Quest non-termination as an open P1. Git log shows three follow-up commits since (`5aee2e8`, `14b5ffc`, `16589b4`, task #102) fixing the infinite-cascade guard scope and counters. Also landed since that retrospective: the How It Works guide was corrected against real mechanics (task #103), a modal focus trap was added to three overlays (task #105), the volume/firefly-meter display bug was fixed (task #104), the 98.70% RTP claim was qualified with its player model directly on the pitch deck's Slide 13 (task #109) — good, that's the same caveat this document and AGENTS.md carry — and a CI gate now fails the build if a scene file goes missing from the manifest (task #116). None of this closes D6/D7/D8; all of it is real forward motion the 08-09 doc didn't have visibility into.

## 4. Designathon / Replit User Stories submission

Already submitted 2026-08-09 per `content/replit-user-story-submission-2026-08-09.md`: story link, live app, workspace, and showcase video, using only four already-public repo images. No private material attached — clean against S5/S12/S17 at submission time.

**The exposure:** the submission's audience is exactly the audience most likely to read the linked overkillhill.com project page closely. If that page still carries the D6-described tease/1-in-4,212 language, a reader who fact-checks it against the repo (which is the page's own stated acceptance bar, per D6's note) finds a stale claim. That was a slow-burn documentation problem on 2026-08-09. With a live competition submission pointing at it, it's now a fact-check risk with a deadline nobody's set. I'd rule D6 before anything else on this list.

## 5. Recommendation

1. **Rule D6 and D7 together** — DECISION-LOG.md already says they should be. One word each settles both (D6: "ruled" or "withdrawn"; D7: "code" or "S30").
2. **Rule D8** alongside them — it shares an owner-decision with D7 by the log's own note, and it's the one most likely to matter if a judge asks "what's the payout rate."
3. **Re-run the full suite and sim fleet on current HEAD** (`bb8619a`) and update AGENTS.md's verified-commit stamp — six commits have landed since the last recorded run and the project's own house rule is "never quote a metric you didn't re-run."
4. **Check the live overkillhill.com project page against whatever D6 resolves to** before assuming the competition submission is safe as-is.

## 6. What I didn't do

No history rewrite, no engine changes, no doc edits beyond adding this file. No file in this validation reproduces the private founding conversation; every comparison point traces to a committed canonical doc (COLLABORATIVE-VISION.md, CANON.md, DESIGN-SPEC.md, DECISION-LOG.md) or to code/git evidence.
