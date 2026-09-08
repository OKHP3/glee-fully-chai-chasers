# Release Scope and Completion Boundary

**Status:** owner disposition recorded 2026-09-08
**Applies to:** the current GitHub Pages release and the repository documentation that describes it
**Authority:** this dated boundary reconciles `DESIGN-SPEC.md`, `IMPLEMENTATION-BASELINE.md`, `README.md`, the retrospective, the accuracy audit, and `DECISION-LOG.md`. Older planned-feature lists remain useful history, but they are not evidence that a feature shipped.

## How to read this document

- **Shipped** means the capability is in the current product and has implementation or validation evidence in this repository.
- **Deferred** means the capability is intentionally outside the current release. It has a named next phase, reason, owner, and acceptance boundary; it must not be implied by public copy.
- **Retired** means the item is removed from the canonical release scope. Its historical mention may remain in dated documents, but it is not a promised future feature.
- **Open gate** means a release or governance question still blocks an unconditional “fully closed” claim. An open gate is not permission to silently change code or canon.

The shipped product is the birthday game that exists today: an original, free, mobile-first Chai Chase with the cascade board, fictional Glee-coins, persistence, audio controls, Treat Jar and cat assists, wheel bonuses, Bold Chai, Moonlit Keepsake Trail, Wild Chai Storm, Doorbell Panic, Treat Time, the five-act UniGlee marathon, Ice Notes, accessibility settings, PWA packaging, and the current public deployment. The birthday **message and 10,000-coin window grant** are shipped; only the animated Birthday Reveal scene is not.

## Shipped-versus-planned matrix

| Planned item or capability | Current disposition | Named next phase or reason | Accountable owner | Acceptance boundary |
|---|---|---|---|---|
| Birthday message and annual 10,000-coin grant | **Shipped** | Current splash behavior; do not describe the whole birthday feature as missing | Jamie | July 17–31 gating, once per device per year, with the owner-authored message unchanged |
| Animated Birthday Reveal scene | **Defer** | Phase 2 — celebration polish; the splash already delivers the birthday acknowledgment without blocking play | Jamie, with Claude for canon-checked copy | A distinct, optional scene must preserve the approved birthday narrative, remain skippable, and be separately tested from the splash grant |
| Daily Bonus Wheel | **Defer** | Phase 2 — progression comfort; not needed for the current birthday gift and must remain fictional/local | Jamie, with Claude for engine work | Once-per-calendar-day local claim, no purchase or ad language, reset/persistence tests, and no effect on the no-stranding guarantee |
| Milestone scenes: Iced Chai Break, Butterfly Burst, Cat Constellation, Glee Mode | **Defer** | Phase 2 — progression presentation; the current level and event mechanics remain usable without interludes | Jamie, with Claude for canon and bounded UI delivery | Each scene has its stated unlock, reduced-motion/skip behavior, original assets/audio, and a collection checkmark without hidden rewards |
| Collection shelf and re-view flow | **Defer** | Phase 2 — companion to milestone scenes; no shelf should imply scenes exist before they do | Jamie, with Claude for persistence/UI delivery | Re-view only unlocked scenes, versioned local persistence, reset behavior, accessible controls, and no fabricated completion state |
| UniGlee pause/resume | **Defer** | Phase 2 — marathon comfort; protect the current five-act contract first | Jamie, with Claude for session-state work | Pausing cannot consume a spin or alter awards; resume survives the supported lifecycle and keeps act accounting exact |
| UniGlee fast mode | **Defer** | Phase 2 — marathon comfort; reduced motion is not a substitute for a speed control | Jamie, with Claude for UI/session work | A clearly labeled speed mode changes presentation timing only, preserves input and payout order, and respects reduced motion |
| UniGlee skip-to-summary | **Defer** | Phase 2 — marathon comfort; players must be able to leave a long session without corrupting its result | Jamie, with Claude for session/UI work | Explicit confirmation, deterministic summary totals, no skipped award, and a clear distinction between skipping presentation and abandoning a session |
| In-flight UniGlee reload persistence | **Defer** | Phase 2 — marathon resilience; current browser-local persistence covers ordinary game state, not an active marathon | Jamie, with Claude for persistence work | A supported reload/reopen resumes or safely resolves the active act with no duplicated or lost awards; migration and reset cases are tested |
| Additional chapter-specific bonus presentation | **Defer** | Phase 2 — narrative polish; current acts are playable and the product must not claim richer scenes | Jamie, with Claude for canon-checked copy/UI | Each presentation layer is original, optional/skippable, accessible, and does not move math out of the engine |
| Final music stems and mix | **Defer** | Phase 3 — audio polish; the current synthesized score and SFX are the release baseline | Jamie, with Claude/audio owner | Original stems, distinct chapter and character motifs, separate music/SFX controls, mute/reduced-motion behavior, and a reviewed final mix |
| Service-worker and offline verification | **Defer** | Phase 3 — release hardening; PWA packaging exists, but offline behavior is not certified here | Jamie (QA) | A documented install, first-load, offline reopen, cache-refresh, and recovery rehearsal on the supported device/browser matrix |
| Asset-size optimization | **Defer** | Phase 3 — release hardening; provenance and visual correctness take priority over an unmeasured optimization pass | Jamie, with the art owner | Measured bundle reduction without visual regression, broken atlas references, provenance loss, or private material entering the bundle |
| Saved device-regression gallery | **Defer** | Phase 3 — QA evidence; dated screenshots and notes are more useful after the scope is stable | Jamie (QA) | A retained gallery covering iPhone portrait, short landscape, desktop, reduced motion, audio mute, accessibility labels, and browser-console status |
| Chai Tea Bonus pick shelf / pick-game concept | **Retire** | Bold Chai is the current iced-chai bonus; the shelf concept is not part of the canonical release roadmap | Jamie | Remove future-facing claims when the canonical spec is next revised; retain historical references only as explicitly retired context |
| Legacy system-wide “twelve” mechanics cleanup | **Defer** | Phase 4 — engine migration, only after a separate owner ruling and simulation pass; twelve remains a contained Moonlit Keepsake Trail exception | Jamie, with Claude as engine owner | A written ruling, updated tests/oracle, and a fresh full-game simulation prove no unintended economy or canon change |

## Open gates that are not silent omissions

1. **Full-game payout band:** the 2026-09-08 fleet is above the documented 95–98% design band under its stated mixed player model. Jamie must decide the release treatment before any retune; no math change is authorized by this document.
2. **Lap Quest termination:** the documented reachable non-terminating path remains a separate correctness gate. The current feature must not be called unconditionally complete until the bounded repair and full-game harness coverage are accepted.
3. **Public history:** the current tree and deployed bundle are distinct from Git history. The remediation plan in `HISTORY-REMEDIATION-PLAN.md` is prepared but not executed.
4. **External public-page targets:** the target repositories for the bounded page refreshes are not present in this checkout, so no external publication claim is made here.

## Completion statement

The current product is **shipped to the approved release boundary**, not an accidental partial implementation: the listed core game and bonus systems are the product; the deferred rows are an intentional roadmap; the retired shelf is not canonical; the open gates still block an unconditional repository-and-history closure claim. A later release may change this boundary only through a dated owner decision and an updated matrix.
