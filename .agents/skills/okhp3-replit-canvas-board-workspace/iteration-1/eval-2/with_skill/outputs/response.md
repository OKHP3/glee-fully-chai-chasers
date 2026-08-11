# Flipping iframes from "building" to "live" before your demo

## Why this matters

The canvas board skill is explicit: **never leave iframes in `"building"` state when presenting.** A mix of building and live states signals an incomplete build to judges, even when the underlying work is finished. Every frame must be `"live"` before you call `focusCanvasShapes`.

---

## The three iframe states

| State | When to use | Audience sees |
|---|---|---|
| `"building"` | Placeholder created but component/server not ready | Animated building indicator |
| `"modifying"` | Frame is live but you are actively editing it | Modifying indicator |
| `"live"` | Component is rendered and URL resolves | The actual component |

You are currently in the `"building"` state and need to reach `"live"`.

---

## Step 1 — Inventory which frames are still "building"

Before issuing any updates, read the current canvas state so you have the exact `shapeId` values:

```javascript
const state = await getCanvasState({
  focusArea: { x: -5000, y: -5000, w: 20000, h: 20000 }
});
console.log(JSON.stringify(state.focusedShapes.map(s => ({
  id: s.shapeId, type: s.shapeType, x: s.x, y: s.y, w: s.w, h: s.h
})), null, 2));
```

Cross-reference the returned IDs against your component list. Note every frame where `state === "building"`.

---

## Step 2 — Get your domain

The mockup-sandbox URL uses `REPLIT_DOMAINS` (no port number). Retrieve it at runtime:

```bash
echo $REPLIT_DOMAINS
```

This gives you something like `your-repl-name.username.repl.co`.

---

## Step 3 — URL format for mockup/design iframes

For **design/mockup iframes** served by the mockup-sandbox, the URL pattern is path-based:

```
https://${REPLIT_DOMAINS}/__mockup/preview/{folder}/{ComponentName}
```

**Example:**
```
https://your-repl-name.username.repl.co/__mockup/preview/ui/HeroCard
```

> ⚠️ Common mistake: do NOT use the main app dev URL (e.g. `/` or the root domain). That shows the entire app, not the isolated component. Always use `/__mockup/preview/{folder}/{ComponentName}`.

For **artifact frames** (web app, slides, video, API), the URL is set automatically by Replit when you move them — you do not supply a URL manually. Artifact frames use the `artifact:v3:artifacts/<slug>` shape ID format and cannot be resized or deleted, only moved.

---

## Step 4 — Flip each building iframe to live

Use `applyCanvasActions` with an `"update"` action per frame. Batch all updates into a single call:

```javascript
await applyCanvasActions({ actions: [
  {
    type: "update",
    shapeId: "my-frame-1",
    updates: {
      shapeType: "iframe",
      state: "live",
      url: "https://your-repl-name.username.repl.co/__mockup/preview/ui/ComponentOne"
    }
  },
  {
    type: "update",
    shapeId: "my-frame-2",
    updates: {
      shapeType: "iframe",
      state: "live",
      url: "https://your-repl-name.username.repl.co/__mockup/preview/ui/ComponentTwo"
    }
  }
  // ... repeat for every remaining "building" frame
] });
```

Replace `my-frame-1`, `my-frame-2`, etc. with the actual `shapeId` values from your `getCanvasState` inventory, and substitute the correct `{folder}/{ComponentName}` segment for each component.

---

## Step 5 — Close with focusCanvasShapes

After flipping all frames to `"live"`, call `focusCanvasShapes` as the **final action** to pan the judges' viewport to your finished layout:

```javascript
await focusCanvasShapes({
  shapeIds: [
    "label-hero",
    "artifact:v3:artifacts/chai-chasers",
    "artifact:v3:artifacts/chai-chasers-slides",
    "artifact:v3:artifacts/chai-chasers-video",
    "artifact:v3:artifacts/api-server",
    // ... all label and frame IDs
  ],
  animateMs: 500
});
```

The 500 ms animated pan looks polished — instant jumps feel like a glitch.

---

## Complete pre-demo checklist

1. `getCanvasState` — identify all `"building"` frame IDs  
2. `echo $REPLIT_DOMAINS` — get your domain  
3. `applyCanvasActions` — batch-update every building frame to `state: "live"` with the correct `/__mockup/preview/{folder}/{ComponentName}` URL  
4. `focusCanvasShapes` — pan the viewport to show the full board with `animateMs: 500`  

Once those four steps are done, every frame will show its live component and the canvas will be in presentation mode, ready for judges to scan.
