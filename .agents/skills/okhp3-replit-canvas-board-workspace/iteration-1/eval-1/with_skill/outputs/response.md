# What to Do First Before Issuing Any Move Commands

## The Answer: Call `getCanvasState` with a Wide Focus Area

Before touching a single frame, the **first thing you must do** is inventory every shape currently on the canvas. This is the action that prevents the multi-turn correction cycle you want to avoid.

---

## Why This Step Is Non-Negotiable

Canvas move commands target frames by **shape ID**. If you guess IDs, misremember positions, or miss a frame entirely, you'll issue moves that target the wrong shapes — then need a correction turn to read, re-compute, and re-move. With 12 frames scattered around, the risk of at least one ID mismatch is high.

The skill is explicit on this point (emphasis added):

> **"Abort and investigate if an expected shape ID is missing before issuing any move commands."**

---

## The Exact Call to Make

```javascript
const state = await getCanvasState({
  focusArea: { x: -5000, y: -5000, w: 20000, h: 20000 }
});
console.log(JSON.stringify(state.focusedShapes.map(s => ({
  id: s.shapeId, type: s.shapeType, x: s.x, y: s.y, w: s.w, h: s.h
})), null, 2));
```

Use a **wide `focusArea`** (the `-5000` to `+20000` range shown above) because scattered frames may have drifted far from the origin `(0, 0)`. A narrow focus area will silently omit frames that are out of bounds.

---

## What to Capture From the Output

For each of your 12 frames, record:

| Field | Why You Need It |
|---|---|
| `shapeId` | Target ID for every `move` action |
| `shapeType` | Determines constraints: artifact frames can only be moved (not resized/deleted); design iframes can be moved, resized, and deleted |
| `x`, `y` | Current position — confirms which frames are where |
| `w`, `h` | Dimensions needed for gutter arithmetic |

---

## What to Do Immediately After the Inventory

Once you have the full shape list, **plan your coordinate table before issuing a single `applyCanvasActions` call**. Specifically:

1. **Zone list** — Define named regions (e.g., Hero Row, Spec Zone, Gameplay, Mobile, Storyboard).
2. **Frame inventory** — Assign each `shapeId` to a zone.
3. **Gutter values** — Choose consistent gutters. Recommended defaults: **80 px sibling gutter** (between frames in the same zone), **160 px zone gutter** (between zones).
4. **Y baseline** — Compute where the first non-hero row begins: `hero_h + hero_top_margin + zone_gutter + label_h + label_gap`.
5. **Coordinate table** — Compute the final `x` and `y` for every frame and label **on paper or in a spreadsheet** before touching the canvas.

Then — and only then — batch all moves into a single `applyCanvasActions` call.

---

## The Core Principle

> **"Computing coordinates in flight forces a read → compute → move → check loop that takes multiple turns. A written coordinate table turns this into a single `applyCanvasActions` batch."**

The `getCanvasState` inventory is what makes the coordinate table accurate. Skip it, and you're guessing. Guess with 12 frames, and you'll need multiple correction rounds.
