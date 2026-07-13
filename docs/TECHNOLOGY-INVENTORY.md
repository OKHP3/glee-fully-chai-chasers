# Technology Inventory and Maintenance Plan

**Checked:** 2026-07-12  
**Scope:** technologies declared in the repository, used by the shipped app, used by CI/deployment, or used by the repository-only image-conversion skill.

This inventory distinguishes declared versions from the versions actually resolved in `package-lock.json`. Transitive npm packages are intentionally not repeated one-by-one here; `package-lock.json` is their complete source of truth and Dependabot/npm will update them when their parent dependency allows it.

## Inventory

| Technology | Where it is used | Version in this repository | Most recent stable release checked | Maintenance note |
|---|---|---:|---:|---|
| TypeScript | Application source, type-checking, Vite config | `7.0.2` resolved and declared | `7.0.2` | Current. |
| JavaScript / ECMAScript | Browser runtime and emitted build output; package is ESM | TypeScript target `ES2020`; `package.json` uses `"type": "module"` | ECMAScript 2026, 17th edition | The app does not pin a JavaScript engine version; its practical runtime is the Node/browser versions below. |
| Node.js | Local tooling, Replit, and GitHub Actions | Local probe: `24.11.1`; CI: `lts/*`; Replit: `nodejs-24` | `v26` Current; `v24` LTS | CI tracks the latest LTS line with `lts/*`; Replit now uses the supported Node 24 line. |
| npm | Package installation and scripts | Local probe: `11.6.2`; lockfile format `3` | `12.0.0` | npm is bundled with Node and is not separately pinned. `npm ci` remains the reproducible install command. |
| Vite | Dev server, bundling, preview | `8.1.4` resolved and declared | `8.1.4` | Current. |
| Tailwind CSS | Utility CSS import in `src/style.css` | `4.3.2` resolved and declared | `4.3.2` | Current. |
| `@tailwindcss/vite` | Tailwind's Vite plugin | `4.3.2` resolved and declared | `4.3.2` | Current and aligned with Tailwind CSS. |
| Vitest | Engine unit tests and simulation oracle | `4.1.10` resolved and declared | `4.1.10` | Current. |
| `@types/node` | Node types for Vite config and test code | `26.1.1` resolved and declared | `26.1.1` | Current. |
| Python | Replit environment for repository tooling | `.replit`: `python-3.14`; no Python interpreter is installed in this workspace probe | `3.14.6` | Python is not part of the shipped game; it supports the local HEIC conversion skill. |
| Pillow | Repository-only image conversion skill | `>=10.0.0` in `.github/skills/heic-image-convert/requirements.txt`; no Python lockfile | `12.3.0` | Dependabot monitors the requirements file. |
| pillow-heif | Repository-only HEIC/HEIF image conversion skill | `>=0.18.0` in `.github/skills/heic-image-convert/requirements.txt`; no Python lockfile | `1.4.0` | Dependabot monitors the requirements file. |
| HTML | App shell in `index.html` | HTML doctype / living standard; no numeric project pin | HTML Living Standard | No separate package update mechanism applies. |
| CSS | Custom animation/layout styling in `src/style.css` | CSS plus Tailwind CSS 4.3.2; no numeric CSS version pin | CSS is a family of living module specifications | Browser compatibility is governed by the app's target browsers and CI/manual QA. |
| Web Audio API | Original synthesized sound in `src/audio/synth.ts` | Browser API; no npm version | W3C Web Audio API 1.0 Recommendation; Web Audio 1.1 is a draft | Browser-provided API; verify on iPhone after browser changes. |
| Web Storage / `localStorage` | Versioned local saves in `src/state.ts` | Browser API; app key namespace `ccv1.*` | HTML Storage / Web Storage living standard | Browser-provided API; no dependency update applies. |
| PWA Web App Manifest | Install metadata and icons in `public/manifest.webmanifest` | Web App Manifest; no service worker is currently present | Web App Manifest living standard | The manifest is present, but true offline caching still needs a service worker. |
| GitHub Actions | Build, test, privacy/brand gates, Pages deployment | `checkout@v6`, `setup-node@v6`, `upload-pages-artifact@v3`, `deploy-pages@v4` before this maintenance pass | `checkout@v7`, `setup-node@v6.4.0` (major `v6`), `upload-pages-artifact@v5`, `deploy-pages@v5` | Workflow references are updated to current major tags and Dependabot monitors them. |
| GitHub Pages | Static production hosting | Repository Pages deployment via `.github/workflows/deploy.yml` | Hosted service; no app version | Deployment remains push-to-`main`. |
| Replit | Preview/development configuration in `.replit` | Static deployment; `nodejs-24`, `python-3.14`, Nix `stable-25_05` | Hosted service; no project version | Replit is a preview/worker environment, not the production source of truth. |

## What is not in the shipped solution

- No React runtime; the app is vanilla TypeScript and DOM/CSS.
- No backend, database, account system, analytics, or tracking service.
- No Python runtime or Python package ships to GitHub Pages.
- No service worker is present yet, so the manifest alone should not be described as a fully offline PWA.
- `playwright-core` is present in the local `node_modules` directory as an extraneous package, but it is not declared in `package.json` and is not part of the solution's dependency contract.

## Maintenance plan now in place

1. `.github/dependabot.yml` watches npm, pip, and GitHub Actions dependencies on recurring schedules.
2. `.github/workflows/ci.yml` runs `npm ci`, the full test suite, and the production build on pushes and pull requests. Dependabot pull requests therefore receive the same build/test gate before review.
3. The Pages workflow uses `node-version: lts/*` with `check-latest: true`, so the build follows the latest supported Node LTS line without waiting for a hand-edited number.
4. Major upgrades remain reviewable pull requests. Merge them only after the engine simulation oracle, build, and a mobile browser smoke test are green.
5. Re-run this inventory quarterly, or immediately after a major dependency PR, and update the checked date and rows that changed.

## Sources checked

- [Node.js release lines and support status](https://nodejs.org/en/about/previous-releases)
- [TypeScript npm package](https://www.npmjs.com/package/typescript)
- [Vite npm package](https://www.npmjs.com/package/vite)
- [Vite release support policy](https://vite.dev/releases)
- [Tailwind CSS npm package](https://www.npmjs.com/package/tailwindcss)
- [`@tailwindcss/vite` npm package](https://www.npmjs.com/package/@tailwindcss/vite)
- [Vitest npm package](https://www.npmjs.com/package/vitest)
- [`@types/node` npm package](https://www.npmjs.com/package/@types/node)
- [npm package](https://www.npmjs.com/package/npm)
- [Python downloads and active releases](https://www.python.org/downloads/)
- [Pillow on PyPI](https://pypi.org/project/pillow/)
- [pillow-heif on PyPI](https://pypi.org/project/pillow-heif/)
- [actions/checkout releases](https://github.com/actions/checkout/releases)
- [actions/setup-node releases](https://github.com/actions/setup-node/releases)
- [actions/upload-pages-artifact releases](https://github.com/actions/upload-pages-artifact/releases)
- [actions/deploy-pages releases](https://github.com/actions/deploy-pages/releases)
- [Dependabot supported ecosystems](https://docs.github.com/en/code-security/reference/supply-chain-security/supported-ecosystems-and-repositories)
- [W3C Web Audio API](https://www.w3.org/TR/webaudio-1.0/)
- [ECMAScript 2026 specification](https://ecma-international.org/publications-and-standards/standards/ecma-262/)
