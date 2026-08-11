# Graduating an Approved Mockup Variant to the Main App

## Questions You Must Answer Before Graduation

When variant B of your redesigned checkout form has been approved, you need to answer these questions before graduating it to the main app:

### 1. Scope & Completeness
- Does variant B cover **all states** of the checkout form (empty, validation errors, loading, success, failure)?
- Are all **edge cases** accounted for (long text, internationalization, accessibility requirements)?
- Are there any **placeholder elements** (dummy copy, lorem ipsum, placeholder images) that need to be replaced with real content?

### 2. Design Fidelity & Tokens
- Have all **design tokens** (colors, spacing, typography, border-radius, shadows) been mapped to the existing design system or are new tokens needed?
- Are the **component variants** in the mockup consistent with existing shared components, or do new components need to be created?
- Does the layout handle **responsive breakpoints** (mobile, tablet, desktop) correctly?

### 3. Interaction & Behavior
- Are all **interactive states** defined (hover, focus, active, disabled) for every input, button, and link?
- Are **form validation rules** and error message copy finalized and approved?
- Are **animations/transitions** (if any) specified with duration and easing?

### 4. Assets & Dependencies
- Are all **icons, images, and fonts** finalized and available in the correct formats/sizes?
- Do any third-party assets require **licensing clearance**?

### 5. Handoff Readiness
- Has the mockup been **reviewed by engineering** for technical feasibility?
- Are there **accessibility (a11y) annotations** (ARIA roles, tab order, color contrast ratios ≥ 4.5:1 for normal text)?
- Is there a **spec/redline document** or annotated export for developers?

### 6. Approval & Sign-off
- Has the **product owner / stakeholder** formally signed off on variant B (not just informal approval)?
- Are there **open comments or unresolved feedback** in the design tool that need to be addressed?
- Has a **QA acceptance criteria** checklist been written based on the mockup?

### 7. Integration Impact
- Does the new checkout form affect **existing API contracts** or data models?
- Are there **analytics events or tracking** that need to be updated or added?
- Does this change require a **feature flag** for a gradual rollout?

---

## Which Type of Subagent Handles Graduation?

**A "graduation" or "promotion" subagent** — sometimes called a **code/implementation subagent** or **builder subagent** — handles this step. Its responsibilities include:

- Taking the finalized, approved design artifact (mockup/spec) and **translating it into production code** within the main app codebase.
- Updating or creating the relevant **UI components**, ensuring they match the approved design tokens and layout.
- Wiring up **form logic, validation, and API integration**.
- Running or triggering **tests** (unit, integration, visual regression) to verify the implementation matches the approved variant.
- Opening a **pull/merge request** (or equivalent) against the main app branch for final engineering review before merge.

In pipelines that separate concerns, this is distinct from:
- A **design subagent** (which generates/iterates mockups),
- An **evaluation/review subagent** (which scores or compares variants), and
- A **promotion/deploy subagent** (which may handle CI/CD after code is merged).

The graduation subagent bridges the gap between the approved design artifact and live production code.
