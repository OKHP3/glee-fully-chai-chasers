# Redesigning an Existing Header Component: Extract First, Never Approximate

## Short Answer

**Do NOT rebuild from scratch.** Because `src/components/Header.tsx` already exists in your codebase, the pipeline mandates a **Extract → Sandbox → Variant → Graduate** flow, starting with the **mockup-extract** phase. Rebuilding from memory is explicitly listed as the #1 common mistake in the design pipeline skill.

---

## Why "Extract First" Is the Rule

The pipeline's decision tree is unambiguous:

```
Does the component already exist in the main app codebase?
        │
   YES ─┤
        ↓
  EXTRACT first (mockup-extract)
  then iterate
```

> **The golden rule: if the component exists in the codebase, extract it.**  
> Never rebuild from memory. You will get dimensions, colours, spacing, opacity values, and font sizes wrong. The real source code has the correct values.

Your `Header.tsx` exists → you extract it. Full stop.

---

## The Full Pipeline for Your Situation

### Phase 1 — Extract (you are here)

Read `.local/skills/mockup-extract/SKILL.md` for the detailed process. The high-level steps:

1. **Locate** `src/components/Header.tsx` in the main app.
2. **Trace the full import chain** — every import Header.tsx brings in (hooks, contexts, UI primitives, utilities). Classify each as:
   - **Inline** — paste the dependency directly into the mockup
   - **Copy** — copy the file as-is into the sandbox
   - **Stub** — replace with a minimal no-op (e.g. a data-fetching hook that returns hardcoded values)
3. **Create `_group.css`** at `artifacts/mockup-sandbox/src/components/mockups/{group}/_group.css`. Populate it with your app's `:root` CSS custom properties and `@font-face` / `@import` font declarations. This is what makes the sandbox component look *identical* to the live app — not approximated.
4. **Create `Current.tsx`** in the same group folder, with `import './_group.css'` at the top (forgetting this import is a listed common mistake — it causes silent wrong rendering with no error).
5. **Embed `Current.tsx` on the canvas** labelled `"Current"` — this is your visual baseline before any redesign begins.

> Before placing the baseline, call `getCanvasState` to find empty space. Never place it blind.

---

### Phase 2 — Variant Exploration

Once the `"Current"` baseline is live on the canvas, generate redesign variants. For 2+ variants, use **DESIGN subagents** — they run in parallel and each produces genuinely distinct output.

**DESIGN subagent brief anatomy** (what to include):

| Field | What to write |
|---|---|
| **Product/brand identity** | 1–2 vivid sentences — who it's for, what it feels like |
| **Goal** | Redesign the Header component |
| **Vibe** | One natural-language feeling (NOT a design-style name like "minimalist") |
| **Target location** | File path, canvas shape ID, and dev server URL |
| **Variant hypothesis** | What makes THIS variant distinct from the others |

**What NOT to include in the brief:**
- Specific CSS values, colours, font names, pixel spacing
- Layout prescriptions ("put the logo on the left")
- Design style names ("material design", "glassmorphism")

Each subagent gets a *different* brief with a different vibe and hypothesis.

**Canvas labelling convention** — place a `text` shape label *above* each iframe (not below, not beside):
- `"Current"` — your extracted baseline
- `"A — Sticky Minimal"` / `"B — Editorial Bold"` / `"C — Contextual Nav"` — named by design hypothesis, not letter alone

This matters because when the user says "I prefer B," they mean the hypothesis, not the letter.

**Variant axes to consider for a Header:**

| Axis | Header examples |
|---|---|
| **Structural** | Top bar vs. sidebar vs. mega-menu drawer |
| **Behavioural** | Static vs. scroll-aware sticky vs. hide-on-scroll |
| **Content/semantic** | Brand-led vs. navigation-led vs. CTA-led |
| **Aesthetic** | Minimal transparent vs. bold editorial vs. warm textured |

Default to ≥2 of your 3 variants being net-new big swings — not incremental refinements of the current layout.

---

### Phase 3 — Graduate (when the user approves a variant)

Trigger words: "use this one", "ship B", "I like A — integrate it", "graduate this".

Before graduating:
1. **Confirm which variant exactly** if multiple are live.
2. **Check the component library** — if your main app doesn't use `shadcn/ui`, every `@/components/ui/*` import from the mockup needs translation.
3. **Replace mock data** — any hardcoded values in the mockup become real API calls.

**Use a GENERAL subagent for graduation, never a DESIGN subagent.** Graduation is engineering: import graph, routing, state wiring, API integration. DESIGN subagents don't understand routing or wire APIs.

**Preserve exactly:** colours, gradients, shadows, border radius, spacing, typography (family/weight/size/line-height), layout structure, animations, hover states, icons.

**Transform:** mock data → real API calls; no-op navigation → real router links; local constants → app state; stubbed auth → real auth context.

> Do not improve the design during graduation. Graduate exactly what was approved.

---

## Quick-Reference: Common Mistakes to Avoid

| Mistake | Fix |
|---|---|
| Rebuilding Header.tsx from scratch in the sandbox | Extract it — real source has correct values |
| Editing `index.css` instead of `_group.css` | CSS tokens will leak into every other mockup |
| Forgetting `import './_group.css'` in Current.tsx | Silent wrong rendering — always import it |
| Giving all DESIGN subagents the same vibe | You get three nearly identical variants |
| Naming variants A/B/C with no hypothesis | User can't meaningfully approve one |
| Using a DESIGN subagent for graduation | They don't wire APIs — use a GENERAL subagent |
| Improving the design during graduation | Ships something the user didn't approve |

---

## Skill Reading Order for Your Task

Read only what you need for the current phase:

1. **This pipeline skill** — done ✓
2. **`.local/skills/mockup-extract/SKILL.md`** — read now, for extracting Header.tsx
3. **`.local/skills/design/SKILL.md`** — when launching DESIGN subagents for variants
4. **`.local/skills/canvas/SKILL.md`** — for canvas callback mechanics (placing iframes, labels)
5. **`.local/skills/mockup-graduate/SKILL.md`** — when the user approves a variant

---

## Summary

Since `src/components/Header.tsx` already exists: **extract it, don't rebuild it.** The extract phase gives you a pixel-accurate `"Current"` baseline on the canvas. Then generate 2–3 named variants via DESIGN subagents (each with a distinct vibe and hypothesis). When the user approves one, graduate it with a GENERAL subagent. This loop — extract → sandbox → variant → graduate — is the correct and complete workflow.
