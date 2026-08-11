# Hosting Your Designathon Project on Replit + GitHub Pages

Here's a complete walkthrough for getting your project live on both platforms.

---

## Part 1: Replit Hosted URL

Replit automatically gives every project a public URL when you deploy or run it.

### Steps

1. **Open your Replit project** and make sure your web app is working locally in the preview pane.

2. **Configure the run command** in `.replit`:
   ```toml
   run = "npm start"   # or whatever starts your server
   ```

3. **Set the port** — Replit expects your server to listen on `0.0.0.0` and the port from the environment:
   ```js
   const PORT = process.env.PORT || 3000;
   app.listen(PORT, '0.0.0.0', () => console.log(`Listening on ${PORT}`));
   ```

4. **Deploy** using the **Deploy** button (top-right in Replit). Choose **Reserved VM** or **Autoscale** depending on your needs. For a static/designathon project, the free **Static** deployment option works well.

5. Your live URL will be:
   ```
   https://<your-repl-name>.<your-username>.repl.co
   ```
   or after deploying:
   ```
   https://<project-name>.replit.app
   ```

6. **Keep it always-on**: Free Repls sleep after inactivity. Use a deployment (not just "Run") to keep it live permanently.

---

## Part 2: GitHub Pages URL

GitHub Pages serves static files from a repo branch — perfect for HTML/CSS/JS designathon projects.

### Steps

1. **Push your project to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial designathon project"
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```

2. **Prepare your static files**. GitHub Pages needs a root `index.html`. If you have a build step:
   ```bash
   npm run build   # outputs to /dist or /build
   ```
   You can either:
   - Serve from the `main` branch root (if already static), or
   - Push your build output to a `gh-pages` branch.

3. **Enable GitHub Pages**:
   - Go to your repo → **Settings** → **Pages**
   - Under **Source**, select:
     - Branch: `main` (or `gh-pages`), Folder: `/ (root)` or `/docs`
   - Click **Save**

4. **Your live URL** will be:
   ```
   https://<username>.github.io/<repo-name>/
   ```
   It may take 1–2 minutes to go live after the first publish.

5. **Automate with GitHub Actions** (optional but recommended for build steps):
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
         - run: npm ci && npm run build
         - uses: peaceiris/actions-gh-pages@v4
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

---

## Part 3: What Goes in the README

A great README for a designathon project covers these sections:

```markdown
# 🍵 [Project Name]

> One-line pitch: what your project does and who it's for.

## 🔗 Live Links

| Platform       | URL |
|----------------|-----|
| Replit         | https://<project>.replit.app |
| GitHub Pages   | https://<username>.github.io/<repo>/ |

## 🎯 Project Overview

- **Problem**: What challenge does this solve?
- **Solution**: Your design/product approach
- **Target Users**: Who benefits?

## ✨ Features

- Feature 1
- Feature 2
- Feature 3

## 🛠️ Tech Stack

- HTML / CSS / JavaScript (or your framework)
- Any libraries or APIs used

## 🚀 Running Locally

```bash
git clone https://github.com/<username>/<repo>.git
cd <repo>
npm install
npm start
```

## 🎨 Design Decisions

Brief notes on your color palette, typography, layout choices — judges love this context.

## 👥 Team

| Name | Role |
|------|------|
| Alice | Design |
| Bob   | Dev   |

## 📄 License

MIT
```

---

## Quick Checklist

- [ ] Project runs on Replit and shows a live `.replit.app` URL
- [ ] Repo pushed to GitHub with an `index.html` at root (or build output configured)
- [ ] GitHub Pages enabled in repo Settings → Pages
- [ ] Both URLs tested in an incognito window (to confirm they're truly public)
- [ ] README has both URLs, project description, and local setup steps
- [ ] Any API keys are in environment variables — **not** committed to the repo

That's it — your Designathon project will be publicly reachable from two independent URLs!
