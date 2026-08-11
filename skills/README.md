# OKHP3 Community Skills for Replit

Portable [Agent Skills](https://docs.replit.com/agent-skills) built retrospectively from the **Glee-fully Chai Chasers** Designathon project. Each skill encodes a non-obvious rule — something that caused a real multi-turn debugging session — so you don't have to discover it the hard way.

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

All five Replit skills were extracted or matured through the [Glee-fully Chai Chasers](https://glee-fully-chai-chasers.replit.app) Designathon project — a full-stack slot game with a pitch deck, showcase video, canvas presentation board, and reusable repository operations.

Each skill encodes a real operational lesson from the build. The Repl janitor
skill protects branch, naming, and detritus cleanup with live Foundry evidence.
The canvas-board skill came from layout correction cycles. The design-pipeline
skill came from discovering the extract→graduate loop piecemeal. The
multi-artifact skill came from blank-preview failures and catalog drift. The
build-in-public skill came from learning what judges actually look at.

---

## Brand and attribution

All skills by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)  
MIT License — free to use, fork, and adapt. A nod to the source is appreciated.
