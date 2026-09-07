# Graduating an Approved Mockup Variant — Decision Gate & Subagent Type

## The Graduation Decision Gate

Before you graduate variant B of your checkout form to the main app, the pipeline requires you to answer **three specific questions**:

### 1. Which variant exactly?
Even though the user said "variant B," if multiple variants are still live on the canvas, confirm with the user unambiguously which one is being approved. The canvas may have a "Current," an "A — [hypothesis]," a "B — [hypothesis]," and a "C — [hypothesis]" — make sure the record is clear.

### 2. Is the main app's component library different from shadcn/ui?
If the mockup was built using `@/components/ui/*` imports (shadcn/ui), and the main app uses a different component library, **every one of those imports must be translated** to their equivalent in the main app's library before or during graduation. Skipping this leaves broken imports in production code.

### 3. Does the mockup have real data or mock data?
Mockups almost always use local constants, hardcoded values, or stub functions. During graduation, **all mock data must become real API calls**, all no-op navigation handlers must become real router links, local constants must wire to app state, and stubbed auth must connect to the real auth context.

---

## Which Subagent Handles Graduation?

**A GENERAL subagent** handles graduation — not a DESIGN subagent.

The skill is explicit on this distinction:

> **GENERAL subagent** — for graduation. Graduation is engineering: import graph, routing, state wiring, API integration. GENERAL subagents navigate codebases.  
> **DESIGN subagent** — never for graduation. They don't wire APIs or understand routing.

Graduation is a pure engineering task. The GENERAL subagent will:
- Traverse the import graph of the approved mockup
- Wire real API calls in place of mock data
- Connect real router links in place of no-op handlers
- Integrate app state and real auth context
- Preserve **exactly** what was approved: colours, gradients, shadows, border radius, spacing, typography (family/weight/size/line-height), layout structure, animations, hover states, and icons

---

## The Critical Rule for Graduation

**Graduate exactly what was approved.** Do not improve the design during graduation. The user approved variant B — ship variant B. Any visual tweaks the agent thinks would improve it are out of scope and represent a change the user did not approve.

---

## Next Step After Answering the Gate Questions

Read `.local/skills/mockup-graduate/SKILL.md` for the full production-wiring process, then dispatch a **GENERAL subagent** with a brief that specifies the approved variant's file path, the target component location in the main app, the data sources for each mock → real transformation, and the routing context.
