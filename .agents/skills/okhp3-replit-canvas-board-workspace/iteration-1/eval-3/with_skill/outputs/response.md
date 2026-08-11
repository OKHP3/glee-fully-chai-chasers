# Closing a Canvas Layout Session for a Designathon Submission

## The Correct Final Step: `focusCanvasShapes`

The **last action** of every canvas layout session — especially before a designathon submission — is always a call to `focusCanvasShapes`. This pans every judge's viewport to show the complete, organised layout the moment they open the canvas. Nothing else achieves this; without it, judges open the canvas at whatever random position it was last at, possibly staring at empty space or a half-built corner.

---

## Pre-Conditions Before You Can Close

The skill is explicit: **you must clear two gates** before calling `focusCanvasShapes` or the layout will look unfinished.

### Gate 1 — All iframes must be `"live"`

The iframe lifecycle has three states:

| State | What the audience sees |
|---|---|
| `"building"` | Animated "building" indicator — signals work in progress |
| `"modifying"` | Modifying indicator — used while you are actively editing |
| `"live"` | The actual rendered component |

A mix of `"building"` and `"live"` states signals an incomplete build to judges. Flip every remaining building placeholder to live before closing:

```javascript
await applyCanvasActions({ actions: [
  {
    type: "update",
    shapeId: "my-frame",
    updates: {
      shapeType: "iframe",
      state: "live",
      url: "https://<your-replit-domain>/__mockup/preview/folder/ComponentName"
    }
  }
  // repeat for every frame still in "building" state
] });
```

> **URL convention:** mockup-sandbox iframes use path-based routing — no port number. Pattern: `https://${REPLIT_DOMAINS}/__mockup/preview/{folder}/{ComponentName}`. Get `REPLIT_DOMAINS` by running `echo $REPLIT_DOMAINS` in your shell.

### Gate 2 — Verify positions

After moving frames and creating zone labels, run a final `getCanvasState` with a wide `focusArea` to confirm every shape ID is where your coordinate table says it should be:

```javascript
const state = await getCanvasState({
  focusArea: { x: -5000, y: -5000, w: 20000, h: 20000 }
});
console.log(JSON.stringify(state.focusedShapes.map(s => ({
  id: s.shapeId, x: s.x, y: s.y, w: s.w, h: s.h
})), null, 2));
```

Cross-reference against your coordinate table. If an expected shape ID is missing, abort and investigate before closing.

---

## The Closing Call: `focusCanvasShapes`

Once all iframes are `"live"` and positions are verified, issue the close:

```javascript
await focusCanvasShapes({
  shapeIds: [
    // Hero row — section label + all hero artifact frames
    "label-hero",
    "artifact:v3:artifacts/chai-chasers-video",
    "artifact:v3:artifacts/chai-chasers",
    "artifact:v3:artifacts/chai-chasers-slides",

    // Zone 1 — label + its frames
    "label-zone-1",
    "design-system",
    "progress-feedback",

    // Zone 2 — label + its frames
    "label-zone-2",
    "mobile-view",

    // ... include EVERY frame and label shape ID on the board
  ],
  animateMs: 500
});
```

### Why `animateMs: 500`?

The skill specifies **500 ms** as the canonical value. A short animated pan reads as polished and intentional. An instant jump (`animateMs: 0`) feels like a glitch. Values much longer than 500 ms feel sluggish. 500 ms is the sweet spot.

### What to include in `shapeIds`

Include **every** shape on the board — both section label text shapes and all artifact/iframe frames. The call computes a bounding box around all listed shapes and pans the viewport to fit them. If you omit any zone, judges may have to scroll to find it.

---

## The Complete 8-Step Workflow (Conventions in Full)

Here is the full layout workflow so you understand where the closing step fits:

| Step | Action | Convention |
|---|---|---|
| 1 | **Inventory frames** | `getCanvasState` with `focusArea: { x: -5000, y: -5000, w: 20000, h: 20000 }` — capture all shape IDs, positions, and sizes |
| 2 | **Plan the layout** | Write a coordinate table before touching the canvas. Zone list, gutter values (80 px sibling, 160 px zone), x/y for every frame and label |
| 3 | **Delete orphaned labels** | Remove old `text` shapes by ID that no longer label an active zone |
| 4 | **Create new zone labels** | One `"text"` shape per zone, placed directly above the zone's frames — `h: 60`, `color: "grey"`, gap to frame top: 40 px, text pattern: `"01 — ZONE NAME"` |
| 5 | **Move frames** | One `move` action per frame, batched in a single `applyCanvasActions` call |
| 6 | **Verify** | `getCanvasState` again to confirm positions |
| 7 | **Flip building iframes to live** | Update each to `state: "live"` with its resolved URL |
| 8 | **Focus the viewport** | `focusCanvasShapes` with all frame and label IDs, `animateMs: 500` ← **this is the final step** |

---

## Section Label Conventions (So Your Board Looks Organised)

Judges scan a canvas faster when every zone follows the same label style:

| Property | Value |
|---|---|
| `type` | `"text"` |
| `color` | `"grey"` |
| `fill` | `"none"` (default) |
| `h` | 60 canvas units |
| Gap from label bottom to frame top | 40 canvas units |
| `y` of label | `frames_y_baseline - 40 - 60` |
| `w` | Span of all frames in the zone (last frame's right edge minus first frame's x) |
| Text | `"01 — ZONE NAME"` (numbered in reading order) |

The hero row label sits at `y: 20`, above hero frames which sit at `y: 100`. Example:

```json
{
  "type": "create",
  "shapeId": "label-hero",
  "shape": {
    "type": "text",
    "x": 0, "y": 20, "w": 3400, "h": 60,
    "text": "SYSTEM ARTIFACTS — live game · portfolio deck · cinematic video",
    "color": "grey"
  }
}
```

---

## Common Pitfalls to Avoid at Submission Time

| Mistake | Why it hurts | Fix |
|---|---|---|
| Calling `focusCanvasShapes` before all iframes are `"live"` | Judges see "building" indicators — signals incomplete work | Flip every frame to `"live"` first (Step 7) |
| Calling `focusCanvasShapes` mid-build | Disrupts build flow; you'll need to call it again anyway | Call it only once, at the very end |
| Omitting frame IDs from the `shapeIds` list | Viewport crops the board, hiding zones | Include every label and frame shape ID |
| Using `animateMs: 0` (instant) | Feels like a glitch | Use `animateMs: 500` |
| Leaving stale `"building"` placeholders anywhere | Even one signals an unfinished build | Audit with `getCanvasState` before closing |

---

## Summary

> **The correct final step is `focusCanvasShapes` called with every frame and label shape ID on the board, with `animateMs: 500`.** Before calling it, ensure all iframes have been flipped from `"building"` to `"live"` with their resolved URLs, and confirm positions with a final `getCanvasState`. This single call pans every judge's viewport to the complete, organised layout the moment they open the canvas — communicating craft and completeness without them having to scroll or search.
