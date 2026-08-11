# Designathon Dual Deployment: Replit Publish + GitHub Pages

This walkthrough uses the **okhp3-replit-build-in-public** skill's dual-deployment playbook. You will end up with two independent live URLs that judges (and anyone visiting your GitHub repo) can reach in one click.

---

## Why two URLs?

The skill is explicit: **dual deployment demonstrates continuous deployment practice** and gives judges two independent paths to the project. If Replit is down, GitHub Pages still works. If a judge browses the repo, they get the live URL right there without hunting.

---

## Part 1 — Replit Publish

### When to publish

Click **Publish** after every **significant milestone** — not after every file save. The skill calls it a production deploy, so treat it like one.

### Steps

1. **Test the main artifact locally first.** The published URL is permanent and public. Make sure the interactive app launches with no blank state and that every interaction a judge tries in the first 30 seconds works.

2. **Click Publish** in the Replit Publishing pane.

3. **Get your URL.** The format is:
   ```
   https://<project-name>.replit.app
   ```
   Get the exact value from the deployment skill or the Publishing pane — do not guess the slug.

4. **Keep both URLs in `README.md`** (covered in Part 3).

### What "production" means here

Every Replit Publish is immediately live to the world. There is no staging. Run through the pre-submission checklist before each publish:

- [ ] All canvas iframes are `"live"` (none in `"building"` or `"modifying"` states)
- [ ] Interactive app has no blank/empty states on load
- [ ] Showcase video runs end to end without error

---

## Part 2 — GitHub Pages

The skill's GitHub Pages runbook is specifically for **Vite-based web artifacts**. If your Designathon web artifact uses a different bundler, apply the same principles (set the correct base path, use a deploy GitHub Action).

### Steps

#### 2a. Set the Vite base path

In `vite.config.ts`, set `base` to the repo subdirectory that GitHub Pages will serve from:

```ts
// vite.config.ts
export default defineConfig({
  base: '/<repo-name>/',   // e.g. '/chai-chasers/'
  // ...rest of config
})
```

Without this, all asset paths break on Pages (assets load fine on `localhost` but 404 on the subdirectory URL).

#### 2b. Add a GitHub Actions deploy workflow

Create `.github/workflows/deploy.yml`. The workflow should:

- Trigger on every push to `main`
- Build the Vite artifact
- Deploy the `dist/` output to the `gh-pages` branch

The skill refers you to the **okhp3-vite-github-pages** skill for the exact workflow YAML — read that skill for the complete runbook. The pattern is standard: `actions/checkout` → `npm ci` → `npm run build` → a Pages deploy action.

#### 2c. Enable GitHub Pages in the repo settings

1. Go to **Settings → Pages** in your GitHub repo.
2. Set **Source** to the `gh-pages` branch (or whichever branch your workflow deploys to).
3. Save. GitHub will show you the Pages URL:
   ```
   https://<github-username>.github.io/<repo-name>/
   ```

#### 2d. Verify the deploy

After your first push to `main`, check the **Actions** tab. The deploy workflow must show a **green checkmark** on the commit before the URL is considered live. A yellow dot means it is still running; a red X means something broke (check the logs).

### Sync discipline (ongoing)

After every feature merge, the skill mandates this three-step check:

1. Verify the GitHub Actions deploy completed (green checkmark on the commit).
2. Click **Publish** in Replit if the change is significant enough to warrant a production deploy.
3. Update `README.md` if any measured figures (test count, RTP, decision count) changed.

Never let the two URLs fall out of sync. A judge who clicks the GitHub Pages URL and sees an older version of the app loses confidence in the submission.

---

## Part 3 — README.md

The skill is direct: **keep both URLs in `README.md`**. Judges who browse the GitHub repo must reach the live app in one click.

### Recommended README structure

```markdown
# <Project Name>

> One-sentence description of what it is and what makes it interesting.

## Live

| Surface | URL |
|---|---|
| Replit (primary) | https://<project-name>.replit.app |
| GitHub Pages | https://<github-username>.github.io/<repo-name>/ |

## What's in this repo

Brief description of the artifact layout — web app, pitch deck, video, design canvas.

## The build story

Summarise the key decisions made during the Designathon. Link to `DECISION-LOG.md` if you maintain one.

## Measurements

If you ran any quantitative analysis (simulations, test suites, performance benchmarks), state the figures here with a citation:
- e.g. "98.1% RTP — produced by `scripts/simulate.ts`, 1 000 000 spins, seed range 0–999"
- e.g. "142 passing tests — run `npm test` to reproduce"

**Provenance rule from the skill:** every figure in the README must trace to a source. Do not copy figures from a previous document — cite the command or script that produced them. Judges who fact-check will find discrepancies if you don't.

## Pitch deck & video

- [Portfolio deck](<deck-url>)
- [Showcase video](<video-url>)

## License

MIT
```

### What to keep current

The skill says to update the README whenever any measured figures change. Stale numbers are a credibility risk — documentation that quotes a test run cannot drift; documentation that quotes a previous document drifts every time it is copied.

---

## Part 4 — Commit messages while you build

Because your commit history is public on GitHub, the skill asks you to make it a readable story. Use the conventional-commit pattern:

```
feat: add hero row with three primary deliverables to canvas
fix: restore correct vite base path for GitHub Pages build
docs: add both live URLs to README
chore: enable GitHub Pages in repo settings, verify green Actions deploy
```

Pattern: `<type>: <present-tense description of what changed and why it matters>`

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`

Avoid: `"update"`, `"fix bug"`, `"WIP"`, or merge commits with only a task ID.

Aim for **2–5 commits per session**, each independently meaningful.

---

## Pre-submission checklist (dual deployment section)

From the skill's full checklist, the deployment-specific items to tick before any public review:

- [ ] Replit Published URL is live and tested
- [ ] GitHub Pages URL is live (green Actions checkmark on latest commit)
- [ ] Both URLs appear in `README.md`
- [ ] `README.md` figures match the latest measurements with citations

---

## Summary

| Step | Action | Result |
|---|---|---|
| 1 | Test artifact locally | Confident the deploy is clean |
| 2 | Click Publish in Replit | `https://<project-name>.replit.app` is live |
| 3 | Set `base` in `vite.config.ts` | Asset paths correct on Pages subdirectory |
| 4 | Add GitHub Actions deploy workflow | Auto-deploys on every push to `main` |
| 5 | Enable Pages in repo Settings | `https://<github-username>.github.io/<repo-name>/` is live |
| 6 | Add both URLs to `README.md` | Judges reach the app in one click from GitHub |
| 7 | Verify green Actions checkmark | Deploy is confirmed, not just triggered |
| 8 | Use conventional commit messages | Commit history is a readable public story |
