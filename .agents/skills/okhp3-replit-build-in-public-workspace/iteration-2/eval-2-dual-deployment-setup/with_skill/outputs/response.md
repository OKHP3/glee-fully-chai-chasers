# Dual Deployment: Replit Publish + GitHub Pages

You want your Designathon project reachable on two public URLs — one Replit-hosted, one on GitHub Pages. This gives judges two independent ways to reach the project and demonstrates continuous-deployment practice. Here's the full walk-through, ending with exactly what to put in the README.

Your project already has a `web` artifact — **Glee-fully Chai Chasers** (`artifacts/chai-chasers`, preview at `/`) — which is the interactive app judges will want to reach. That's the one to point both public URLs at.

---

## Why two URLs

Maintaining both a Replit URL and a GitHub Pages URL:

- Gives judges two independent ways to reach the live project (if one is down or slow, the other works).
- Demonstrates a real continuous-deployment workflow, not a one-off upload.
- Lets someone browsing your GitHub repo reach the live app in one click without ever touching Replit.

---

## 1. Replit Publish

The Replit deploy is the fastest to stand up because the app already runs here.

1. **Test the main artifact locally first.** Every Publish is a production deploy — launch Glee-fully Chai Chasers at `/` and confirm it opens with no blank state before you click anything.
2. Click **Publish** in the Replit Publishing pane. Do this after any significant milestone.
3. Your published URL will be at `<project-name>.replit.app`. Grab the *exact* URL from the deployment skill / Publishing pane — don't guess the subdomain.

> Mechanics of the Replit deployment itself (build command, run command, deployment type) are out of scope for this skill — read the **deployment skill** for those details.

---

## 2. GitHub Pages

GitHub Pages serves the static build of your Vite web artifact.

1. **Read the `okhp3-vite-github-pages` skill for the full runbook** — it has the complete, mechanics-level steps. What follows is the summary.
2. Set `base` in `vite.config.ts` to `/<repo-name>/` so assets resolve from the Pages subdirectory:
   ```ts
   // vite.config.ts
   export default defineConfig({
     base: "/<repo-name>/",
     // ...
   });
   ```
3. Rely on the **GitHub Actions deploy workflow**, which triggers on every push to `main`. Each push to `main` rebuilds and redeploys automatically.
4. Your Pages URL will be:
   ```
   https://<github-username>.github.io/<repo-name>/
   ```

> Full GitHub Pages / Actions mechanics are out of scope for this skill — the `okhp3-vite-github-pages` skill is the source of truth.

---

## 3. Sync discipline (keep both live after every change)

After any feature is merged:

1. **Verify the GitHub Actions deploy completed** — look for the green checkmark on the commit.
2. **Click Publish in Replit** if the change is significant enough to warrant a production deploy.
3. **Update `README.md`** if any measured figures (RTP, test count, decision count) changed.

---

## 4. What goes in the README

**Both URLs must live in `README.md`.** A judge browsing the GitHub repo should reach the live app in one click without going to Replit. Put them near the top, above the fold. A good structure:

```markdown
# Glee-fully Chai Chasers

> One-line description of the project and the mechanic.

## 🎮 Play it live
- **Replit (hosted):** https://<project-name>.replit.app
- **GitHub Pages:** https://<github-username>.github.io/<repo-name>/

## What it is
Short paragraph — the design story in two or three sentences.

## The build
- Interactive app — `artifacts/chai-chasers`
- Portfolio deck — `artifacts/chai-chasers-slides`
- Showcase video — `artifacts/chai-chasers-video`

## Measurements
- Test count: NN  (cite the exact command that produced it)
- RTP: NN.N%      (cite which fleet + player model produced it)
- Decisions logged: NN  (cite the DECISION-LOG.md row range)

## Status
GitHub Actions deploy: ✅ green on latest commit
```

**Provenance discipline for the Measurements block:** every figure must trace to a source — cite the script/seed/spin count for simulations, the exact command for test counts, the fleet + player model for RTP, and the DECISION-LOG.md row range for decision counts. Quote the *measurement*, never a previous document — copied numbers drift, and judges who fact-check will find the discrepancy.

---

## Pre-submission deployment checklist

Before any public review, confirm:

- [ ] Replit Published URL is live
- [ ] GitHub Pages URL is live
- [ ] Both URLs are in `README.md`
- [ ] GitHub Actions deploy is green on the latest commit
- [ ] `README.md` figures (test count, RTP, decision count) match the latest measurements

---

### Related skills to pull in
- **`okhp3-vite-github-pages`** — full GitHub Pages / Actions mechanics
- **deployment skill** — Replit deployment mechanics and the exact `.replit.app` URL
- **canvas skill** — if you also need to switch the canvas into judging mode before review

*Source: okhp3-replit-build-in-public (OverKill Hill P³) — Dual deployment, Sync discipline, Provenance discipline, and the pre-submission checklist.*
