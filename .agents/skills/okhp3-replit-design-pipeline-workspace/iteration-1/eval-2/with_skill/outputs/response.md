# DESIGN Subagent Brief Anatomy for Dashboard Card Variants

When spawning two DESIGN subagents to generate variant designs of your dashboard card in the mockup sandbox, your brief must hit exactly five required fields — and must deliberately omit a defined set of over-specifications. Here is the complete breakdown.

---

## What Your Brief MUST Include (the five required elements)

The skill defines this as the **DESIGN subagent brief anatomy for mockup sandbox variants**:

### 1. Product / Brand Identity (1–2 vivid sentences)
Describe who the product is for and what it *feels like*. This grounds the subagent's creative decisions in authentic context rather than generic defaults.

> Example: "A data-dense ops dashboard for logistics managers who need instant situational awareness across 12 live freight lanes. It should feel like a Bloomberg terminal built by someone who cares about craft."

### 2. Goal
State clearly what component or page to build — in this case, the dashboard card.

> Example: "Build a dashboard card component that surfaces key shipment status metrics."

### 3. Vibe (one natural-language feeling — NOT a design style name)
Give the subagent a single emotional or sensory descriptor. This is the creative directive. **Do not use design style names** (see the "what to leave out" section below).

> Example (Variant A): "The feeling of glancing at a cockpit instrument — dense but instantly readable."
> Example (Variant B): "The calm clarity of a well-curated editorial pull-quote — spacious and confident."

Each subagent gets a **different** vibe. Giving both subagents the same vibe produces nearly identical variants — a documented mistake in the skill.

### 4. Target Location
The exact file path, canvas shape ID, and dev server URL where the component should be placed. This tells the DESIGN subagent precisely where to write the file and where to embed the iframe on the canvas.

> Example:
> - File path: `artifacts/mockup-sandbox/src/components/mockups/dashboard-card/VariantA.tsx`
> - Canvas shape ID: `<shape-id-from-getCanvasState>`
> - Preview URL: `https://${REPLIT_DOMAINS}/__mockup/preview/dashboard-card/VariantA`

### 5. Variant Hypothesis
What makes **this** variant distinct from the other. Each subagent gets a different hypothesis — this is what prevents the two designs from converging on the same answer.

> Example (Variant A): "Treat the card as a cockpit instrument — every pixel earns its place by encoding status information. Density over whitespace."
> Example (Variant B): "Treat the card as an editorial summary — one dominant metric, supporting context in a clear hierarchy. Whitespace is a design element."

Variant hypotheses should ideally differ along one of the **distinct variation axes** the skill defines:

| Axis | Examples |
|---|---|
| Structural | List vs. grid vs. timeline |
| Content/semantic | Feature-led vs. social-proof-led vs. price-led |
| Conceptual | Dashboard-as-cockpit vs. dashboard-as-feed |
| Behavioural | Validate on blur vs. on submit vs. inline |
| Aesthetic | Minimal vs. bold editorial vs. warm textured |

The skill's rule: **≥2 of 3 variants should be net-new big swings**, not incremental refinements. With two variants, both should represent genuinely different answers to "how should this card work?"

---

## What You Must Leave OUT

The skill is explicit: over-specification produces constrained, predictable output. Omit all of the following:

| Do NOT include | Why |
|---|---|
| Specific CSS values (colours, hex codes, px spacing, opacity) | The DESIGN subagent is the creative director — you're describing feeling, not implementing |
| Font names or typography specs | Same reason — vibe governs typeface choice |
| Layout prescriptions ("put the CTA on the right", "icon goes top-left") | This removes the subagent's structural creativity |
| Section names or content order | The subagent should determine information hierarchy from the vibe and hypothesis |
| Design style names ("minimalist", "material design", "flat", "neumorphic") | Style names are shorthand that flatten creative thinking into clichés |

**The principle:** your job is to describe the *feeling* and the *goal*. The DESIGN subagent is the creative director. The sweet spot is vivid product identity + a distinct vibe per variant.

---

## Putting It Together: Example Briefs for Two Variants

### Subagent Brief — Variant A

```
Product/brand identity: A logistics ops dashboard for freight managers who need
instant situational awareness. It should feel like a Bloomberg terminal built
by someone who genuinely cares about craft.

Goal: Build a dashboard card component (DashboardCardA.tsx) surfacing key
shipment status metrics.

Vibe: The feeling of glancing at a cockpit instrument — dense but instantly readable.

Target location:
  File: artifacts/mockup-sandbox/src/components/mockups/dashboard-card/DashboardCardA.tsx
  Canvas shape: <shape-id-A>
  Preview URL: https://${REPLIT_DOMAINS}/__mockup/preview/dashboard-card/DashboardCardA

Variant hypothesis: Treat the card as a data instrument. Every element encodes
status. Density is a feature, not a problem. This variant should feel
fundamentally different from a card that prioritises whitespace.
```

### Subagent Brief — Variant B

```
Product/brand identity: Same as above.

Goal: Build a dashboard card component (DashboardCardB.tsx) surfacing key
shipment status metrics.

Vibe: The calm clarity of a well-curated editorial pull-quote — spacious, confident,
one idea at a time.

Target location:
  File: artifacts/mockup-sandbox/src/components/mockups/dashboard-card/DashboardCardB.tsx
  Canvas shape: <shape-id-B>
  Preview URL: https://${REPLIT_DOMAINS}/__mockup/preview/dashboard-card/DashboardCardB

Variant hypothesis: Treat the card as an editorial summary. One dominant metric
commands attention; supporting data recedes. Whitespace is a deliberate design
element. This should feel like the antithesis of a dense cockpit instrument.
```

---

## Canvas Labelling (after the subagents complete)

Place a `text` shape label **above** each variant iframe (not below, not beside):
- Use label height: **60 canvas units**, gap: **40 canvas units**
- Label Variant A as `"A — Cockpit"` (or whatever the hypothesis name is)
- Label Variant B as `"B — Editorial"`

Never label variants by letter alone ("A", "B") — the design hypothesis name makes approval conversations precise. When the user says "I prefer B," they mean the editorial direction, not an anonymous slot.

---

## Summary

| Must Include | Must Omit |
|---|---|
| Product/brand identity (1–2 vivid sentences) | Specific CSS values or hex colours |
| Goal (what to build) | Font names or typography specs |
| Vibe (one feeling, per variant, unique per subagent) | Layout prescriptions |
| Target location (file path + shape ID + URL) | Section names or content order |
| Variant hypothesis (what makes this one distinct) | Design style names ("minimalist", "material") |
