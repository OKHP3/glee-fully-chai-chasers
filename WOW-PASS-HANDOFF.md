# Task #212 — Full-Device Regression Pass · WOW-PASS Handoff

_Last updated: 2026-08-11 (final, post-review pass)_

---

## Summary

Task #212 is a full-device regression pass following the Task #211 Lap Quest cascade hang fix. Prior reviews rejected the task for three reasons:

1. Guard 1b null-guard crash — **FIXED**
2. No machine-readable Lap Quest capped-cascade fleet metric — **ADDED**
3. Unrelated regressions in splash.ts, slides vite.config.ts, style.css, video build check — **RESTORED** from task-agent baseline

All issues are resolved. Evidence below is from the current diff.

---

## Changes in This Task

| File | Change |
|------|--------|
| `src/engine/types.ts` | `terminatedByCascadeCap?: boolean` added to `SpinResult` |
| `src/engine/cascade.ts` | Guard 1b null-guard fix; `terminatedByCascadeCapFlag` tracks Guard 2 fires; returned in SpinResult |
| `scripts/sim-agent.ts` | Lap Quest fleet (50 rounds × 3 spots = 150/seed); `lapQuestCappedCascades` counter in JSON output |
| `src/engine/cascade.test.ts` | Two new tests: Guard 1b prevents Guard 2 (100 seeds × 3 spots), Guard 1b null-guard regression |
| `docs/DECISION-LOG.md` | D11: Lap Quest canon presentation path (open, awaiting Jamie's ruling) |
| `src/splash.ts` | Restored `resolveShowcaseUrl` + direct-link approach; removed iframe modal |
| `src/splash.test.ts` | Restored + added 3 showcase URL regression tests |
| `artifacts/chai-chasers-slides/vite.config.ts` | Restored dev-banner subpath normalization plugin |
| `src/style.css` | Removed iframe modal CSS block |
| `artifacts/chai-chasers-video/scripts/check-video-asset.mjs` | Added file-size check + MP4 magic-byte validation |

---

## Guard 1b — Sticky-Wild Anchor Detection

**What it is:** Compares the sorted set of winning board-cell positions between consecutive winning cascades when sticky wilds are present. If identical → wilds are anchoring those paylines permanently → break before Guard 2 (hard 52-cascade cap) is needed.

**The crash (fixed):** `stickyWilds.length` was accessed without a null-check. `spin()` is valid without `stickyWilds`; `cloneStickyWilds(undefined)` returns `undefined`. Fixed to `stickyWilds && stickyWilds.length > 0`.

**`terminatedByCascadeCap`:** Added to `SpinResult` in `types.ts`. Set to `true` only when Guard 2 fires. Because Guard 1b catches anchor loops first, this field is absent on all normal and Guard-1b-terminated rounds.

---

## Showcase Links — GitHub Pages Safety

`src/splash.ts` now exports `resolveShowcaseUrl(pathname, hostname?)` which:
- Returns root-relative `/chai-chasers-slides/` or `/chai-chasers-video/` on Replit-hosted builds
- Returns `https://glee-fully-chai-chasers.replit.app/<path>` on GitHub Pages hosts

The iframe modal approach was reverted; showcase links are `<a target="_blank">` anchors. Tests cover both the Replit-origin and GitHub Pages cases.

---

## Dev-Banner Subpath Normalization — slides vite.config.ts

`artifacts/chai-chasers-slides/vite.config.ts` re-added the `replit-dev-banner-base-path` inline Vite plugin that rewrites `/@replit/vite-plugin-dev-banner/banner-script.js` to `${basePath}/@replit/…` in dev middleware and in `transformIndexHtml`. Without this, the dev-banner script 404s when the artifact is served at a non-root path.

---

## Video Build Check — Size + MP4 Magic Bytes

`artifacts/chai-chasers-video/scripts/check-video-asset.mjs` now:
1. Rejects a 0-byte placeholder file
2. Reads the first 12 bytes and validates the box type (`ftyp`/`mdat`/`moov`/`free`/`wide`) — minimum bar to reject non-MP4 placeholders without full-file reads

---

## Test Suite

| Run | Result |
|-----|--------|
| `pnpm test` | **344 / 344 passed**, 26 test files, 0 failures |

New tests:
- **cascade.test.ts** — Guard 1b prevents Guard 2 (100 seeds × 3 spots); null-guard regression
- **splash.test.ts** — 3 showcase URL tests (no-iframe, GitHub Pages origin, Replit same-origin)

---

## Build

```
pnpm run build
```

- Pre-build CDN guard: ✓ clean
- TypeScript: ✓ no errors
- Vite production bundle: ✓ built clean
- Post-build CDN guard: ✓ clean
- CDN self-test: 97/97 passed

---

## Lap Quest Cascade-Cap Fleet

15-seed × 2,000 paid-spin fleet + 50 Lap Quest rounds × 3 spots per seed:

| Seeds | `lapQuestCappedCascades` |
|-------|--------------------------|
| 1–15  | **0** each               |

`terminatedByCascadeCap` is absent on every round. Guard 1b terminates sticky-wild anchor loops before Guard 2 is needed.

---

## Device Regression Matrix (fresh — current diff)

### Splash screen

| Viewport | Result |
|----------|--------|
| 390×844 portrait | ✓ PASS |
| 844×390 landscape | ✓ PASS |
| 1440×900 desktop | ✓ PASS |

### Board (`/#board`)

| Viewport | Result |
|----------|--------|
| 390×844 portrait | ✓ PASS |
| 844×390 landscape | ✓ PASS |
| 1440×900 desktop | ✓ PASS |

### Interactive Spin (Playwright testing subagent — fresh run)

| Viewport | Balance before | Balance after | Result |
|----------|---------------|---------------|--------|
| 390×844 portrait | 500 | 499 | ✓ PASS |
| 844×390 landscape | 499 | 498 | ✓ PASS |
| 1440×900 desktop | 498 | 497 | ✓ PASS |

No unhandled JS errors at any viewport.

---

## Open Decisions

**D11** in `docs/DECISION-LOG.md` — which Lap Quest presentation layer is the live canon path. Awaiting Jamie's ruling.

---

## Follow-Up Tasks (already proposed — PROPOSED state)

- **#217** — Confirm Phoebe's cascade loop never reaches its emergency fallback in real play
- **#218** — Catch a silent spin failure before it reaches players
