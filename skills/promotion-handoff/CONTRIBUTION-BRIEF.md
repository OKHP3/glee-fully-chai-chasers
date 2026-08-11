# OKHP3/skillz Contribution Brief — Replit Family (5 Skills)

**Prepared:** 2026-08-11  
**Updated:** 2026-08-11 — fifth skill (`okhp3-replit-repl-janitor`) added  
**Status:** Ready for owner review and authorized submission  
**No autonomous commits, pushes, or PRs have been made.**

---

## Summary

Five `developer-tooling` skills extracted from the Glee-fully Chai Chasers Designathon project are ready for promotion into the `replit/` family of `OKHP3/skillz`. All five passed public-safety review, structural validation, and mirror sync. Promotion manifests are stored alongside this brief.

---

## Proposed canonical family

```
OKHP3/skillz
└── replit/
    ├── FAMILY.md                              (new — see draft below)
    ├── okhp3-replit-canvas-board/
    │   ├── SKILL.md
    │   ├── evals/evals.json
    │   └── benchmarks/benchmark.json
    ├── okhp3-replit-build-in-public/
    │   ├── SKILL.md
    │   ├── evals/evals.json
    │   └── benchmarks/benchmark.json
    ├── okhp3-replit-design-pipeline/
    │   ├── SKILL.md
    │   ├── evals/evals.json
    │   └── benchmarks/benchmark.json
    ├── okhp3-replit-multi-artifact/
    │   ├── SKILL.md
    │   ├── evals/evals.json
    │   └── benchmarks/benchmark.json
    └── okhp3-replit-repl-janitor/
        ├── SKILL.md
        ├── evals/evals.json
        ├── evals/trigger-evals.json
        ├── benchmarks/benchmark.json
        ├── references/foundry-architecture.md
        ├── references/naming-conventions.md
        ├── scripts/audit-repo.py
        └── tests/test_audit_repo.py
```

**If `replit/` already exists in OKHP3/skillz:** check for name collisions before placing. None of these four names appear in the existing distribution based on the publication mirrors.

---

## Skills being contributed

### 1. `okhp3-replit-canvas-board` · v1.0.0

**What it does:** Teaches layout strategy for the Replit workspace canvas as a structured presentation board — hero rows, labeled zones, gutter conventions, iframe lifecycle (building→live), and `focusCanvasShapes` as a presentation close. Sits above the raw canvas skill API.

**Why it belongs in skillz:** Any Replit project that uses the canvas for a designathon, showcase, or multi-frame review benefits from this layout discipline. The rules are non-obvious (compute coordinates before touching the canvas, flip all iframes to live before calling focusCanvasShapes) and have saved multiple turns of debugging.

**Adapter note:** References `.local/skills/canvas/SKILL.md` for canvas callback mechanics — this path is Replit-specific and should be noted in the family README.

**Source SHA-256:** `b485edc826fc82a3373489fac8069828b01620baee9392fdecdb6f1f3dbc22c8`  
**Manifest:** `promotion-manifest-okhp3-replit-canvas-board.json`

---

### 2. `okhp3-replit-build-in-public` · v1.0.0

**What it does:** Full playbook for a Replit Designathon submission — canvas organisation for judges, artifact selection guide (interactive app + pitch deck + showcase video), dual deployment (Replit Publish + GitHub Pages), session handoff conventions, and building-in-public commit discipline.

**Why it belongs in skillz:** Designathon and showcase builds are a distinct use-case pattern on Replit. This skill ties the dual-deployment, canvas, and documentation disciplines into a single checklist-driven workflow.

**Open item:** Benchmark eval_id 4 (without_skill, dual-deployment scenario) shows 0.5 pass rate — this gap is under active investigation in a downstream task. The canonical submission should note this as a known evaluation gap.

**Adapter note:** References `okhp3-vite-github-pages` as a companion skill for the GitHub Pages half of dual deployment.

**Source SHA-256:** `0252d78d38928e985c4acf0314d65e960ce88b91186b9f93deee6e1361fc2f9d`  
**Manifest:** `promotion-manifest-okhp3-replit-build-in-public.json`

---

### 3. `okhp3-replit-design-pipeline` · v1.0.0

**What it does:** The complete Replit design iteration loop — extract → sandbox → variant → graduate — as a decision tree. Covers when to extract vs. build from scratch, DESIGN subagent brief anatomy, variant labelling conventions on canvas, and the GENERAL vs. DESIGN subagent distinction for graduation.

**Why it belongs in skillz:** Replit exposes five interlocking design skills (mockup-sandbox, mockup-extract, mockup-graduate, design-exploration, design) but none explains the full loop as a decision tree. This skill is the missing orchestration layer.

**Adapter note:** References multiple `.local/skills/` paths (mockup-sandbox, mockup-extract, mockup-graduate, design-exploration, design, canvas). All are Replit-provided skills — canonical consumers must have them installed.

**Source SHA-256:** `4addd5f0bdebd27ae14fe05cedea20c30fb73fbd743ee42d42d8767deaac27d5`  
**Manifest:** `promotion-manifest-okhp3-replit-design-pipeline.json`

---

### 4. `okhp3-replit-multi-artifact` · v1.0.0

**What it does:** Five rules that prevent silent failures in a Replit pnpm multi-artifact monorepo: BASE_URL prefix discipline, PORT env var reading, managed workflow naming, pnpm catalog drift, and cross-artifact shared libraries via `workspace:*`. Includes a blank-preview debug checklist.

**Why it belongs in skillz:** Each of these rules has caused a multi-turn debugging session in a real project. The failure modes are non-obvious and not documented in the artifact creation walkthrough. This skill saves developers from discovering them experimentally.

**Adapter note:** Rules 1–3 are Replit-specific (BASE_URL path routing, managed workflow naming, artifact registration). Rules 4–5 (pnpm catalog drift, workspace:*) apply to any pnpm monorepo.

**Source SHA-256:** `41048bd5e2ed07363613454872ce74435614dbf3a8c2bce3c31e27817ddfd69b`  
**Manifest:** `promotion-manifest-okhp3-replit-multi-artifact.json`

---

### 5. `okhp3-replit-repl-janitor` · v1.0.1

**What it does:** Safe, evidence-led cleanup of one Replit workspace's Git checkout. Classifies every branch into exactly four buckets (keep, merge, delete, review) using verified Git facts and resolved PR state — never infers abandonment from branch name patterns alone. Includes a bundled read-only audit script (`audit-repo.py`), kebab-case naming conventions with documented structural exceptions, and a detritus triage policy. Destructive operations execute only after owner approval of exact line items.

**Why it belongs in skillz:** Replit generates branches with names like `subrepl-*`, `replit-agent`, and `agent/*` that look like obvious deletion candidates but may contain the only copy of important work. The four-bucket model, the remote-first deletion order, the no-early-pruning rule, and the PR-lookup requirement are all non-obvious and each has caused real data loss or lost work in practice. The bundled audit script makes the workflow deterministic and reproducible.

**Benchmark gap note:** Eval 3 (safe-execution-verification) with_skill pass rate is 0.75 — one expectation (stating the `git rm`/`git mv` file-action rule with its untracked-file carve-out) was not fully restated in the benchmark run. This is a benchmark verbosity gap, not a skill correctness gap; v1.0.1 addresses it with a NON-NEGOTIABLE callout in the SKILL.md. Overall with_skill mean is 0.9167, delta +0.75.

**Adapter note:** `audit-repo.py` requires Python 3 and Git. Branch naming patterns (`subrepl-*`, `replit-agent`, `agent/*`) are Replit-generated conventions documented as hints — this framing is universal. Workflow restart verification in Step 7 references Replit-managed workflows; canonical consumers on other platforms should substitute their equivalent service restart step.

**Source aggregate SHA-256:** `960898a5c5c32cb6fd80e815007201123e0430f64416eec4bc2b36d007c14e85`  
**Manifest:** `promotion-manifest-okhp3-replit-repl-janitor.json`

---

## Draft `replit/FAMILY.md`

```markdown
<!-- FAMILY_SUMMARY_START -->
Agent Skills for building, presenting, deploying, and maintaining projects on the Replit
platform. Covers the Replit workspace canvas, multi-artifact pnpm monorepo rules, the
design iteration pipeline, building-in-public discipline for designathons and showcases,
and safe one-time cleanup of a Replit workspace Git checkout. These skills document the
non-obvious rules and workflows that save multiple debugging turns on any serious Replit
project.
<!-- FAMILY_SUMMARY_END -->

<!-- FAMILY_INVENTORY_START -->
| Skill | Version | Description |
|---|---|---|
| okhp3-replit-canvas-board | 1.0.0 | Structured canvas presentation board layout for judges and reviewers |
| okhp3-replit-build-in-public | 1.0.0 | Full designathon submission playbook — canvas, artifacts, dual deployment |
| okhp3-replit-design-pipeline | 1.0.0 | Extract → sandbox → variant → graduate design iteration loop |
| okhp3-replit-multi-artifact | 1.0.0 | Five rules that prevent silent failures in a pnpm multi-artifact monorepo |
| okhp3-replit-repl-janitor | 1.0.1 | Safe, evidence-led one-time cleanup of a Replit workspace Git checkout |
<!-- FAMILY_INVENTORY_END -->
```

---

## Public-safety summary

All five skills passed:
- ✅ No credentials, API keys, tokens, or passwords
- ✅ No private URLs (all URLs are public: overkillhill.com, github.com/OKHP3, replit.com)
- ✅ No internal ticket IDs or employer data
- ✅ No external writes declared
- ✅ MIT license declared on all five
- ✅ Illustrative examples use fictional project names (chai-chasers, Phoebe's Lap Quest, UniGlee, SiteTokens.css) — not private identifiers
- ✅ `okhp3-replit-repl-janitor`: grep matches for "token" are illustrative naming examples only (site-tokens.css in naming-conventions.md and evals) and benchmark metadata field names — not credentials

---

## Catalog impact in OKHP3/skillz

- New family: `replit/` (if not already present)
- New skills: 5
- Catalog mode (`--full`): run `python3 ${SCRIPT} --full` after placing the files to regenerate `README.md` and create `replit/FAMILY.md`
- No name collisions identified

---

## Required actions before submission (owner authorization needed)

1. **Review this brief and the 5 manifests** — confirm the `replit/` family path and any name collision check in the live `OKHP3/skillz` repo.
2. **Decide on PR strategy for the fifth skill** — `okhp3-replit-repl-janitor` was not included in PR #43 (which covers the other four skills). Owner must choose: amend PR #43 before merge to add the fifth skill, or submit a follow-up PR to the same `replit/` family after PR #43 merges.
3. **Authorize the PR(s)** — this brief is a local diff only. No commit, push, or PR has been made.
4. **Run `--full` catalog** after placing files in `OKHP3/skillz` to regenerate `README.md` and `replit/FAMILY.md`.
5. **Record accepted commit hash** in each manifest's `canonical_target.accepted_commit_or_hash` field after merge.

---

## Files in this handoff package

```
skills/promotion-handoff/
├── CONTRIBUTION-BRIEF.md                                  (this file)
├── promotion-manifest-okhp3-replit-canvas-board.json
├── promotion-manifest-okhp3-replit-build-in-public.json
├── promotion-manifest-okhp3-replit-design-pipeline.json
├── promotion-manifest-okhp3-replit-multi-artifact.json
└── promotion-manifest-okhp3-replit-repl-janitor.json
```

Source files (publication mirrors, complete and byte-equal with runtime sources):

```
skills/
├── okhp3-replit-canvas-board/     SKILL.md + evals/ + benchmarks/
├── okhp3-replit-build-in-public/  SKILL.md + evals/ + benchmarks/
├── okhp3-replit-design-pipeline/  SKILL.md + evals/ + benchmarks/
├── okhp3-replit-multi-artifact/   SKILL.md + evals/ + benchmarks/
└── okhp3-replit-repl-janitor/     SKILL.md + evals/ + benchmarks/ + references/ + scripts/ + tests/
```
