# Before Issuing Move Commands on a Replit Canvas

## The #1 Thing to Do First: Fetch/List All Current Frame Positions

Before issuing any move commands, **query the current state of all frames** to get their exact IDs, names, and coordinates (x, y, width, height).

### Why This Matters

If you start issuing move commands without knowing the current layout, you risk:
- Moving frames to wrong positions because you assumed incorrect starting coordinates
- Collisions/overlaps because you didn't know where other frames already sit
- Needing a multi-turn correction cycle to fix positioning errors

### Concretely: What to Do

Call the canvas API (or use the Replit Canvas tool) to **list all frames** and capture:

```json
[
  {
    "id": "frame_abc123",
    "name": "Hero Section",
    "x": 120,
    "y": 340,
    "width": 800,
    "height": 600
  },
  {
    "id": "frame_def456",
    "name": "Nav Bar",
    "x": -200,
    "y": 0,
    "width": 1440,
    "height": 80
  }
  // ...10 more frames
]
```

### Then Plan Your Layout Offline

With all 12 frames' current positions in hand:
1. **Map out your target layout** (e.g., a grid or flow) using the actual IDs.
2. **Calculate the delta** or absolute target coordinates for each frame.
3. **Issue all move commands in one pass**, referencing the correct frame IDs.

### Summary

> **List all frames and record their IDs + current coordinates first.**  
> Only then should you calculate and apply move commands.  
> This single step eliminates the most common cause of multi-turn correction cycles on canvas reorganization tasks.
