# PRD, Arcade Page Refresh. Bring the Cabinet Description Up To Date

**Target Repl:** Glee-fullyTools (https://replit.com/t/glee-fullytools/repls/Glee-fullyTools)
**Target file:** `arcade/index.html` (live at https://glee-fully.tools/arcade/)
**Author:** Claude (PM) · **Date:** 2026-08-09 · **Version:** Refresh 1.0
**Type:** ONE correction plus a bounded content expansion. Not a redesign. Not a restyle. Not an opportunity.

---

## 0. Mission statement (read twice)

The Arcade page shipped on 2026-07-17 and it shipped correctly. Since then the game grew five bonus chapters, a progression economy, and a wager ladder, and one of the six feature cards now describes a wheel wedge that was replaced. Nothing on this page is unsafe or misleading. It is simply describing a smaller game than the one that exists.

Your job: correct one card, add three, and add one short line about progression. That is all. The hero, the embed, the fine print, the AI-collaborator paragraph, the install steps, the dedication, the nav, and the footer are the approved baseline and stay byte-identical.

**Public narrative rule (hard, unchanged):** the game is a personalized birthday gift built around a genre Glee loves. That is the complete public motivation. Do not write, imply, or invent any other motivation. Do not name any real casino game, game studio, beverage brand, or pet-food brand.

**Voice:** this page is warm, playful, and second-person. Match the existing card voice exactly. The new cards below are written in it. Use them verbatim.

## 1. Scope fences

**You may modify:** `arcade/index.html` only. Within it: the one card body named in §2, the "What's inside" card grid (to add three cards), and the one sentence addition in §4.

**You may NOT touch:** any other file or page; the `<head>`, meta tags, OG tags, canonical, or structured data; the nav, sitemap, or search index; the hero section; the embed block and its note; the fine-print callout; the "Made with love" paragraph; the "Add it to your phone" steps; the closing dedication; the footer; any global CSS; any image. No new frameworks, build steps, trackers, or CDN fonts. No new images: the three new cards are text and existing icons only.

If the card grid is a fixed 2×3 or 3×2 layout that breaks at nine cards, adjust only the grid's column or wrap rule inside the existing Arcade-scoped CSS comment block. Do not restyle the cards themselves.

## 2. Correction (required)

Card 3 describes the Sparkle Wheel's three wedges. The middle wedge is no longer "giant keepsakes." It is the Moonlit Keepsake Trail, a memory game. "Giant keepsakes" is Keepsake Constellation, a separate mechanic that is not a wheel wedge.

- **Card:** `The Sparkle Wheel 🎡`
- **FIND (exact):** `The cats personally host the free-spin wheel: multiplying wilds, giant keepsakes, or a rain of iced chai. Spin it and see what the household decides.`
- **REPLACE (exact):** `The cats personally host the free-spin wheel. It lands on multiplying wilds, a moonlit memory trail, or a rain of iced chai. Spin it and see what the household decides.`

## 3. Three new cards (required)

Append these to the "What's inside" grid, in this order, after the existing UniGlee card. Use the site's existing card component with no modifications.

**Card 7**

- Title (exact): `The Moonlit Keepsake Trail 🌙`
- Body (exact): `Twelve cards face down, six pairs to find, and exactly two mistakes allowed. Match them all and the free spins begin. Miss twice and Phoebe will pretend she wasn't watching.`

**Card 8**

- Title (exact): `Treat Time 🍤`
- Body (exact): `Morning and Nighttime sessions where the cats scatter wilds across the board before a single reel drops. Morning is a Phoebe operation. Nighttime is a household effort.`

**Card 9**

- Title (exact): `The full marathon 🧺🐈`
- Body (exact): `Catch the UniGlee and it doesn't just pay, it unfolds. Joey's Laundry Helper opens, three chapters shuffle through the middle, and Phoebe's Lap Quest always closes it out. Pick her cozy spot correctly and she brings extra.`

## 4. One added line about progression (required)

The page never mentions that there is a wager ladder or that you level up. Add exactly one sentence to the end of the existing intro paragraph in the hero, immediately after the sentence ending `You're invited anyway.` Same paragraph, no new markup.

- **INSERT (exact):** ` Every spin earns Chai Sparks, every level opens the game up a little more, and the coins refill themselves forever, because nobody is running out of anything here.`

## 5. What stays exactly as-is

Listed explicitly so there is no ambiguity: the H1, subhead, both hero buttons, the phone-frame embed and its note, cards 1, 2, 4, 5 and 6, the fine-print callout, the "Made with love (and a small army of AIs)" paragraph including both outbound links, the three install steps, the closing dedication line, the breadcrumb, and the footer. If you believe one of them is wrong, do not fix it. Note it in the handoff and stop.

## 6. Accessibility and performance (unchanged requirements)

One `<h1>`. Logical heading order preserved with three more cards at the same level as the existing six. All interactive elements keyboard reachable. Body-text contrast at or above 4.5:1. No new webfonts. Page weight excluding the iframe stays at or under 600KB, which three text cards will not threaten.

## 7. Validation loop (both cycles required)

```
Cycle 1, mechanical:
1. Apply §2, §3, and §4. View the local diff. It must touch only the Sparkle
   Wheel card body, the card-grid insertion point, the hero intro paragraph,
   and at most one grid wrap rule. Any other changed line: revert and redo.
2. Confirm the old Sparkle Wheel sentence appears nowhere in the file and the
   new one appears exactly once.
3. Grep for `casino`, `Moolah`, `Starbucks`, `Tazo`, `Swig`, `Orijen`,
   `Jackpot`. Zero hits outside the fine print's "not affiliated with any
   casino" phrase.
4. Run the repo's existing CI or link-check gate. Zero failures.

Cycle 2, rendered:
5. Load at 390x844 and 1440x900. Screenshot both. Nine cards lay out cleanly
   with no orphan card stranded on its own row at desktop width, no clipped
   text at mobile width. Spacing rhythm matches the rest of the site.
6. The hero paragraph reads naturally with the added sentence and does not
   push the primary button below the fold on a 390-wide viewport.
7. Every link still resolves: nav, both hero buttons, GitHub, OverKill Hill,
   full-screen. The embed still loads and is playable in frame.
8. Read the four new or edited passages aloud against §2, §3, and §4.
   Verbatim match or fix.
```

## 8. Deliverables and handoff

- One conventional commit on a branch or checkpoint named `arcade-refresh`: `feat: correct Sparkle Wheel copy and add three feature cards to the Arcade page`
- `ARCADE-REFRESH-HANDOFF.md`: both validation cycles confirmed, screenshots at both widths, the diff line count, whether a grid rule was adjusted and why, and anything noticed but correctly left alone.
- No embargo. This page is live and these are accuracy and completeness improvements. Publish per the repl's normal flow once the handoff is reviewed.

## 9. Acceptance criteria

A first-time visitor still understands what Chai Chasers is in fifteen seconds, still plays it in frame, and still never wonders whether it costs money. A returning player who has actually caught a UniGlee reads the page and recognizes the game they played. Every mechanic named on the page exists in the shipped build at commit `234ea74` or later. The page still reads like the rest of glee-fully.tools wrote it.
