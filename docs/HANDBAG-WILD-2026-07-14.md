# Handbag Wild — 2026-07-14

## Product contract

The Handbag Wild is a rare, non-cat wild inspired by Glee's everyday love of compact crossbody handbags. The shipped art is an original, generic satchel illustration: no person, logo, monogram, brand pattern, or product trade dress is used.

- Engine ID: `wild_handbag`
- Source master: `asset-source/handbag-wild.png`
- Runtime placement: `public/assets/atlases/special-symbol-atlas.{png,webp}`
- Placement: one candidate on reel 5 only; the candidate lands as the special wild 85% of the time, keeping it a rare late-reel surprise.
- Multiplier roll: ×3 (55%), ×5 (35%), or ×10 (10%).
- Payout: the multiplier scales the complete winning line payout, so a ×3 handbag contributes three times the line-bet-scaled value. It never creates a second currency or a cash-like award.
- Availability: the same reel strips and cascade refill path are used by primary and secondary bonus boards, so the symbol can appear in bonuses without a separate bonus-only injection.
- Line behavior: it substitutes for every paying symbol and pays as the matched symbol; a handbag-only line therefore pays as the Mermaid Tumbler.

## Simulation gate

With the existing 40-line paytable and `PAYOUT_SCALE`, the seeded 200,000-spin oracle moved from 93.54% RTP to 95.91%. The approved 95.5%–96.5% release band remains intact, while the existing win, free-spin, mega-cascade, UniGlee, and cat-visit gates remain green.

The tuning is intentionally bounded: the late-reel location, 85% landing gate, and multiplier distribution are the release contract. Any future change must be simulation-backed and must not weaken the RTP oracle.

## Provenance

Generated with the built-in image workflow on 2026-07-14 from an original game-symbol prompt, then processed locally with the project image-generation skill's chroma-key removal helper. The source master has an alpha background and is kept outside `public/`; the generated special atlas is the only handbag art shipped. The supplied reference photos are not copied into the repository or bundle.
