# OKHP3 Community Skills for Replit

Portable [Agent Skills](https://docs.replit.com/agent-skills) collected and matured through the **Glee-fully Chai Chasers** Designathon project. The collection combines lessons extracted directly from the build with reusable skill-maintenance workflows.

**How to install:** copy any skill folder into `.agents/skills/` in your Repl. The skill is immediately available to the Replit AI agent.

```bash
# Example: add the canvas-board skill to your project
cp -r skills/okhp3-replit-canvas-board .agents/skills/
```

---

## Skills in this collection

| Skill | Description | Primary triggers |
|---|---|---|
| [okhp3-replit-repl-janitor](okhp3-replit-repl-janitor/SKILL.md) | Safely audit and tidy one Replit Git checkout — branch/PR classification, generated-branch safeguards, naming cleanup, nested detritus detection, and exact owner-approved execution. | "clean up this Repl", "purge stale subrepl branches", "decrapify this repo", "fix inconsistent filenames", "one-time repository cleanup" |
| [okhp3-replit-canvas-board](okhp3-replit-canvas-board/SKILL.md) | Plan and build a structured multi-frame Replit canvas presentation board — hero rows, labeled zones, iframe lifecycle, and focusCanvasShapes for audience navigation. | "organise the canvas", "arrange the frames", "set up the board", "label the zones", "focus the viewport", "designathon layout" |
| [okhp3-replit-design-pipeline](okhp3-replit-design-pipeline/SKILL.md) | The complete Replit design iteration loop as a single coherent workflow — extract → sandbox → variant → graduate. Covers the "extract first, never approximate" rule, DESIGN subagent brief anatomy, and the graduation decision gate. | "redesign", "improve this component", "show me options", "create variants", "put on canvas", "graduate", "mockup", "design alternatives" |
| [okhp3-replit-multi-artifact](okhp3-replit-multi-artifact/SKILL.md) | Navigate a Replit pnpm multi-artifact monorepo without silent failures. Covers BASE_URL prefix discipline, PORT env var reading, managed workflow naming, pnpm catalog drift, and shared library wiring. | "add an artifact", "preview path", "port conflict", "blank preview", "shared package", "workflow naming", "pnpm catalog", "cross-artifact" |
| [okhp3-replit-build-in-public](okhp3-replit-build-in-public/SKILL.md) | Full playbook for a Replit Designathon submission — canvas organisation for judges, artifact selection guide, dual deployment (Replit Publish + GitHub Pages), session handoff conventions, and commit discipline. | "designathon", "competition", "building in public", "judges", "showcase", "submission", "dual deploy", "GitHub Pages + Replit" |
| [okhp3-skill-promotion](okhp3-skill-promotion/SKILL.md) | Promote and synchronise a project-local Agent Skill into a portable, reviewable distribution package. Covers the three-surface model (runtime → mirror → canonical) and the sync workflow. | "promote this skill", "mirror the skill", "publication package", "OKHP3/skillz" |

---

## Where these came from

This collection currently contains six skills: five Replit-focused workflows
and the pre-existing `okhp3-skill-promotion` publication workflow.

Four Replit skills were extracted directly from debugging the
[Glee-fully Chai Chasers](https://glee-fully-chai-chasers.replit.app)
Designathon project: canvas-board came from layout correction cycles,
design-pipeline from discovering the extract→graduate loop piecemeal,
multi-artifact from blank-preview failures and catalog drift, and
build-in-public from learning what judges actually look at.

The Repl janitor was a separate repository-cleanup workflow matured in this
project through the Foundry process and live evaluation. Skill-promotion
already existed and is included here to support moving the other skills from
project-local runtime copies to public and canonical distribution packages.

---

## Brand and attribution

All skills by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)  
MIT License — free to use, fork, and adapt. A nod to the source is appreciated.
