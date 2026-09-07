# Publishing Your Designathon Project on Two Public URLs

You want your project live on **two** public URLs:

1. A **Replit-hosted** URL (great for anything with a backend/API, dynamic content, or a full-stack app).
2. A **GitHub Pages** URL (great for a static front-end — HTML/CSS/JS or a built SPA — free and versioned with your repo).

This is a common "build-in-public" setup: Replit runs the live/interactive app, and GitHub Pages hosts a static showcase (landing page, portfolio deck, or a static build of the front-end). Below is an end-to-end walkthrough plus a README template that ties both together.

---

## Part 1 — Deploy on Replit (public URL)

Replit gives you a public URL when you deploy. There are two ways to expose a project:

### A. Quick dev URL (not for sharing long-term)
When your app runs in the workspace, Replit exposes a temporary preview URL (the webview). This is fine for testing but should **not** be your "public" URL — it sleeps and can change.

### B. Deployments (the real public URL)
Use Replit **Deployments** for a stable public URL:

1. Make sure your app **binds to host `0.0.0.0`** and the port Replit expects (commonly `5000`, or read `process.env.PORT`). Binding to `localhost`/`127.0.0.1` will fail to be reachable.
2. Click **Deploy** (top-right of the workspace) and pick the deployment type:
   - **Autoscale** — best default for web apps and APIs; scales to zero when idle, scales up on traffic. Cost-efficient for a Designathon demo.
   - **Reserved VM** — always-on; use if you need websockets/persistent state or a long-running process.
   - **Static** — if your Replit project is *only* static files, Replit can serve them directly (but you're already using GitHub Pages for static, so use Autoscale for the dynamic app).
3. Set the **run/build commands**:
   - Build command (if you have a build step), e.g. `npm run build`.
   - Run command, e.g. `npm start` or `node server.js`.
4. Add any **secrets/environment variables** in the Deployments → Secrets pane (API keys, DB URLs). Never commit these to the repo.
5. Deploy. You'll get a URL like `https://your-app-name.replit.app` (or a custom domain if you add one).
6. (Optional) Attach a **custom domain** in the deployment's settings and follow the DNS instructions.

**Multi-artifact note:** Since your project has several artifacts (API server, web app, slides, video), deploy the piece that is your "live app" — typically the **web** artifact backed by the **API server**. The slides/video can live on GitHub Pages or be linked from the README.

---

## Part 2 — Deploy on GitHub Pages (public URL)

GitHub Pages serves **static files** for free from a GitHub repo.

### Step 1: Push your code to GitHub
```bash
git init
git add .
git commit -m "Initial Designathon project"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

### Step 2: Produce the static files GitHub Pages will serve
Pick the case that matches your front-end:

- **Plain HTML/CSS/JS:** the files can be served as-is. Put them in the repo root or a `/docs` folder.
- **Built SPA (React/Vite/etc.):** run your build (`npm run build`) to generate a `dist/` (Vite) or `build/` (CRA) folder. Those static assets are what Pages serves.

**Important base-path gotcha:** Project Pages are served from a subpath: `https://<you>.github.io/<repo>/`. Configure your bundler's base path so asset URLs resolve:
- Vite: set `base: '/<repo>/'` in `vite.config.js`.
- Create React App: set `"homepage": "https://<you>.github.io/<repo>"` in `package.json`.
Also add a `.nojekyll` file at the published root so folders/files beginning with `_` aren't stripped.

### Step 3: Turn on Pages
Two common approaches:

**Option A — Serve from a branch/folder (simplest for plain static):**
1. Repo → **Settings → Pages**.
2. Source: **Deploy from a branch**.
3. Branch: `main`, folder `/root` or `/docs` (put your static files there).
4. Save. Your site appears at `https://<you>.github.io/<repo>/`.

**Option B — GitHub Actions (best for built SPAs):**
1. Repo → **Settings → Pages** → Source: **GitHub Actions**.
2. Add a workflow at `.gitignore`-safe path `.github/workflows/deploy-pages.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist   # or build/
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

3. Push. The Action builds and publishes; your URL shows under **Settings → Pages** and in the Action's summary.

### Step 4: Point the static front-end at the live API
Your GitHub Pages front-end is static, so any dynamic data must come from your **Replit-deployed API**. Set the API base URL to your Replit deployment (e.g. `https://your-app-name.replit.app`) and enable **CORS** on the API for the Pages origin (`https://<you>.github.io`).

---

## Part 3 — What goes in the README

A build-in-public README should let a stranger understand, try, and run the project in under a minute. Suggested sections:

```markdown
# Glee-fully Chai Chasers ☕

> One-line pitch: what the project does and why it's cool. Built for <Designathon name> 2024.

## 🔗 Live Links
- **Live app (Replit):** https://your-app-name.replit.app
- **Showcase (GitHub Pages):** https://<you>.github.io/<repo>/
- **Portfolio deck:** <link to slides>
- **Demo video:** <link to video>

## ✨ Features
- Feature 1
- Feature 2
- Feature 3

## 🖼️ Screenshots / Demo
![screenshot](./docs/screenshot.png)

## 🏗️ Architecture
Brief description of how the pieces fit together:
- **Web front-end** — <framework>, hosted on GitHub Pages (static build).
- **API server** — <framework>, deployed on Replit (Autoscale).
- The GitHub Pages front-end calls the Replit API over HTTPS.

## 🛠️ Tech Stack
Languages, frameworks, libraries, and services used.

## 🚀 Getting Started (run locally)
​```bash
git clone https://github.com/<you>/<repo>.git
cd <repo>
npm install
npm run dev
​```
Then open http://localhost:5173 (or your dev port).

### Environment variables
Create a `.env` from `.env.example`:
​```
API_BASE_URL=...
# never commit real secrets
​```

## 📦 Deployment
- **Replit:** Deploy → Autoscale; run command `npm start`; set secrets in the Deployments pane.
- **GitHub Pages:** GitHub Actions workflow builds `dist/` and publishes on every push to `main`. Base path set to `/<repo>/`.

## 👥 Team
Name — role — link. (Great for build-in-public credit.)

## 📄 License
MIT (or your choice).
```

### README tips for build-in-public
- Put the **two live URLs at the very top** — that's what judges/visitors click first.
- Add badges (build status, license) if you like.
- Include a short **demo GIF or screenshot**; it dramatically increases engagement.
- Keep secrets in `.env`/Replit Secrets and commit only a `.env.example`.

---

## Quick recap / checklist
- [ ] App binds to `0.0.0.0` and `process.env.PORT`.
- [ ] Replit **Deploy → Autoscale** → get `https://<app>.replit.app`.
- [ ] Secrets set in Replit Deployments (not committed).
- [ ] Code pushed to GitHub.
- [ ] Static build configured with correct **base path** + `.nojekyll`.
- [ ] GitHub Pages enabled (branch or Actions) → get `https://<you>.github.io/<repo>/`.
- [ ] Front-end points at the Replit API; **CORS** allows the Pages origin.
- [ ] README lists both URLs at the top, with features, run steps, and deployment notes.

This gives you two stable public URLs — a live interactive app on Replit and a free static showcase on GitHub Pages — cross-linked through a clear README.
