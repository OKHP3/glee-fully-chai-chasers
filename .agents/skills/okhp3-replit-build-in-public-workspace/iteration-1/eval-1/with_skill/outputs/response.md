# Preparing Your Canvas for Designathon Judge Review

The canvas must be switched from **building mode** to **judging mode** before submission. In building mode iframes are scattered and labels are missing — that's fine during development. In judging mode every iframe is live, every zone is labeled and numbered, and a `focusCanvasShapes` call navigates judges to the layout automatically. The canvas is the *first* thing a judge sees in the Replit workspace, so this step is non-negotiable.

Here is the full setup, in order.

---

## Step 1 — Confirm all iframes are in a "live" state

Every frame on the canvas must be in the `"live"` state before you call anything else. No `"building"` or `"modifying"` states are acceptable for judging. Check each iframe and promote it to live if it isn't already.

---

## Step 2 — Build the hero row

The hero row sits at the **top strip of the board** (`y = 100`). It holds exactly **three primary deliverables**:

1. **The live interactive artifact** — your game, app, or tool (kind: `web` or `mobile`)
2. **The portfolio / pitch deck** (kind: `slides`)
3. **The showcase video** (kind: `video`)

These are the artifacts judges interact with directly, so they go first and at the top.

Place them left to right with **80 px gutters** between frames:

```
y = 100
x[0] = 0
x[1] = width_of_frame_0 + 80
x[2] = width_of_frame_0 + 80 + width_of_frame_1 + 80
```

Add a **section label** above the hero row:

```
y     = 20
h     = 60
color = "grey"
text  = "SYSTEM ARTIFACTS — live app · portfolio deck · cinematic video"
```

For your specific project (Glee-fully Chai Chasers) the three hero frames map to the existing artifacts:

| Slot | Artifact | Kind |
|------|----------|------|
| 1 | Glee-fully Chai Chasers (web app) | `web` |
| 2 | Glee-fully Chai Chasers — Portfolio Deck | `slides` |
| 3 | Glee-fully Chai Chasers — Video | `video` |

The Canvas artifact (kind: `design`) and the API Server (kind: `api`) are **not** hero row items — they belong in labeled zone rows below.

---

## Step 3 — Build the labeled zone rows

Below the hero row, add numbered zone rows for your supporting design artifacts — mockups, system specs, the API, component previews, etc.

**Spacing rules:**
- **80 px** between sibling frames within a zone
- **160 px** between zones

**Zone label convention** — place a `text` shape above each zone's frame baseline:

```
color = "grey"
h     = 60
y     = (zone baseline y) - 40
text  = "01 — ZONE NAME"   ← increment the number in reading order
```

Example zone structure for your project:

```
01 — DESIGN CANVAS          (the mockup-sandbox / Canvas artifact)
02 — API SURFACE            (the API Server artifact)
```

Add more zones if you have additional design assets (mobile previews, storybook components, gameplay exploration frames).

---

## Step 4 — Call focusCanvasShapes

This is the final and critical step. After all frames and labels are positioned, call `focusCanvasShapes` with:

- **Every frame ID** in your layout
- **Every label shape ID** (the numbered text labels and the hero section label)
- `animateMs: 800` (or `500` minimum) — the animated pan signals a polished, intentional board to judges

```js
focusCanvasShapes({
  shapeIds: [
    // hero label
    "hero-label-id",
    // hero frames
    "web-app-frame-id",
    "slides-frame-id",
    "video-frame-id",
    // zone labels
    "zone-01-label-id",
    "zone-02-label-id",
    // zone frames
    "canvas-frame-id",
    "api-frame-id",
  ],
  animateMs: 500,
});
```

This is what judges see the moment they toggle on the canvas preview — the automated pan signals that the board was prepared for them, not abandoned after building.

---

## Step 5 — Run the full pre-submission checklist

**Canvas:**
- [ ] All iframes are `"live"` (no `"building"` or `"modifying"` states)
- [ ] Hero row has the three primary deliverables (web app, slides, video)
- [ ] Each zone has a numbered text label (`"01 — ZONE NAME"` format, `color: "grey"`, `h: 60`) placed 40 units above the zone baseline
- [ ] `focusCanvasShapes` called on all frames and labels with `animateMs: 500` or higher

**Artifacts (while you're at it):**
- [ ] Interactive app launches with no blank states — real or seeded data, no lorem ipsum
- [ ] Pitch deck tells the *process* story (what was hard, what decisions were made, what was measured) — target 10–14 slides
- [ ] Showcase video runs end to end, 60–120 seconds, ends with a clear call to action

**Deployment:**
- [ ] Replit Published URL is live (`<project-name>.replit.app`)
- [ ] GitHub Pages URL is live (`https://<github-username>.github.io/<repo-name>/`)
- [ ] Both URLs are in `README.md`
- [ ] GitHub Actions deploy shows a green checkmark on the latest commit

**Documentation:**
- [ ] `README.md` figures (test count, RTP if applicable, decision count) match the latest measurements
- [ ] Session handoff written so tomorrow's session can pick up where you left off
- [ ] `DECISION-LOG.md` has no open items that should be settled before judging

---

## Why this order matters

The hero row is scanned first because judges evaluate the interactive app, pitch deck, and video in that order — they want to *experience* it, then understand the *story*, then see it *in motion*. Zone rows provide supporting evidence without competing for attention. `focusCanvasShapes` removes the burden of navigation entirely: judges land on the board and the camera does the work for them.

Good luck with the submission tomorrow.
