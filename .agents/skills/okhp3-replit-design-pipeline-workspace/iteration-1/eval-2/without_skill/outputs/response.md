# Briefing DESIGN Subagents for Dashboard Card Variants in the Mockup Sandbox

When generating two variant designs of a dashboard card using DESIGN subagents in the mockup sandbox, your subagent brief must be precise and self-contained. Here is what to include and what to leave out:

---

## ✅ What You MUST Include

### 1. Canvas / Artifact Target
- The exact artifact path or identifier for the mockup sandbox (e.g., `artifacts/mockup-sandbox` / preview path `/__mockup`).
- Which frame, artboard, or layer to place the variant in, so the two designs don't collide.

### 2. Component Identity
- The name of the component being designed: **dashboard card**.
- The variant label/name (e.g., `CardVariant_A`, `CardVariant_B`) so each subagent knows which one it owns.

### 3. Design Constraints (Shared Spec)
- **Dimensions**: width × height of the card.
- **Grid / layout**: column grid, padding, spacing tokens.
- **Color palette**: specific hex codes or design-token names to use.
- **Typography**: font family, size scale, weight for each text element (title, metric, label, etc.).
- **Elevation / shadow**: shadow style if applicable.
- **Corner radius**: border-radius value.
- **Content slots**: what data elements appear on the card (e.g., KPI number, chart thumbnail, title, trend indicator).

### 4. What Distinguishes This Variant
- The **single axis of variation** (e.g., Variant A uses a filled background; Variant B uses an outlined/ghost style — or Variant A is data-dense, Variant B is minimal).
- Any variant-specific color overrides, layout rearrangements, or component swaps.

### 5. Asset References
- Paths or names of any icons, images, or component primitives the subagent should use from the shared library.

### 6. Output Instructions
- Where to place/export the result (layer name, frame name, or file path inside the sandbox).
- File format if an export is expected (PNG, SVG, etc.).

---

## ❌ What You Must Leave Out

### 1. Other Variant's Details
- Do **not** include the spec for the other variant. Each subagent brief should be scoped to exactly one variant to avoid cross-contamination of decisions.

### 2. Implementation / Code Details
- Do not include React/CSS/HTML implementation notes — DESIGN subagents work at the visual/mockup layer, not the code layer.

### 3. Business Logic or Data Fetching
- Do not describe how the card fetches data, API endpoints, or state management. Those are irrelevant to the visual design task.

### 4. Redundant Context
- Avoid pasting the entire project brief. Include only what the subagent needs to produce its one variant correctly.

### 5. Subjective Preferences Without Constraints
- Avoid vague direction like "make it look good" or "modern feel" without accompanying concrete tokens or constraints. Subagents need deterministic inputs.

---

## Summary Table

| Category | Include? |
|---|---|
| Canvas/artifact target | ✅ Yes |
| Variant label & distinguishing axis | ✅ Yes |
| Shared design tokens (color, type, spacing) | ✅ Yes |
| Content slots / data elements on card | ✅ Yes |
| Output location / layer name | ✅ Yes |
| Other variant's spec | ❌ No |
| Code / implementation details | ❌ No |
| API / data-fetching logic | ❌ No |
| Vague aesthetic guidance without constraints | ❌ No |

---

## Key Principle

Each DESIGN subagent brief should be **fully self-contained for its one variant** and **minimal** — enough to produce a deterministic design output, nothing more. Share the common design system tokens across both briefs (copy them in), but isolate the variant-specific instructions so subagents can work in parallel without ambiguity or conflict.
