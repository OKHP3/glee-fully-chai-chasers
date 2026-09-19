# Technology inventory and update policy

**Owner:** Jamie; implementation and verification: Codex. **Audit date:** 2026-09-18 America/Chicago (2026-09-19 UTC).
**Baseline:** GitHub `main`, `0bd19d278be72546ceff228245206965a7d04727`.
**Deliverable:** a source-backed inventory, repeatable release checker, and review-based dependency update pipeline. This work does not upgrade the game engine or change its mechanics.

## Read the complete inventory

- [Every direct dependency, workflow action, runtime declaration, and locked package](technology/latest.md).
- [Machine-readable inventory, per-source retrieval times, input checksums, overrides, and release metadata](technology/latest.json).

The report includes all tracked package manifests, the complete `pnpm-lock.yaml` graph (including native/optional packages), the secondary mockup npm lockfile, both Python requirement locations, and workflow actions. Local workspace links are listed separately in JSON because they are repository code, not independently released packages. Imported contributor skills have no external npm dependency declarations; their Python tools use the standard library, with PyYAML used by repository validation. Browser standards and host tools are covered below.

`current` is a lockfile resolution or an exact configuration pin. `catalog:` is resolved through `pnpm-workspace.yaml` before comparison. A range such as `>=10.0.0` is not an installed version. Moving Action tags such as `v7` and SHA references remain explicit; their latest release is shown without inventing the exact version a previous CI job downloaded. The JSON records any directly observable local installation separately.

### Main findings

| Technology | In-place contract / resolved version | Latest stable checked | Disposition |
|---|---|---|---|
| TypeScript | 7.0.2 | 7.0.2 | Current |
| Vite | 7.3.6 | 8.3.0 | Major migration; update shared catalog and validate all consumers |
| Tailwind CSS and its Vite plugin | 4.3.3 / 4.3.3 | 4.3.3 / 4.3.3 | Current; keep paired |
| Vitest | 4.1.10 | 5.0.1 | Major migration; preserve all oracle gates |
| jsdom / `@types/jsdom` | 29.1.1 / 28.0.3 | 30.1.0 / 30.0.0 | Coordinated test-environment migration |
| Prettier | 3.9.6 | 3.9.8 | Patch available |
| Sharp | 0.35.3 | 0.35.4 | Patch available; validate asset output without regenerating approved art unnecessarily |
| tsx | 4.23.1 | 4.23.13 | Patch available |
| `@types/node` | 25.9.5 | 26.6.2 | Types already differ from Node 24; choose types for supported runtime deliberately |
| pnpm | `packageManager`: 10.26.1 | 12.4.2 | Keep 10 until lockfile/platform and update-bot compatibility are verified |
| Node.js | CI/Replit major 24 | 26.9.0 Current; 24.21.0 LTS | Use supported LTS for builds; follow patch/minor releases within 24 |
| Python | main CI 3.12; landing workflow 3.12; Replit 3.13 | 3.14.7 | Patch tracking within configured lines; plan 3.14 migration separately |
| npm | Local optional CLI 11.6.2; secondary lock format 3 | 12.0.2 | pnpm remains the canonical installer |
| Pillow / pillow-heif | `>=10.0.0` / `>=0.18.0`, no lock | 12.3.0 / 1.7.0 | Exact installed versions unknown; validate and pin before claiming reproducibility |
| PyYAML | 6.0.3 | 6.0.3 | Current; explicit requirement now consumed by CI |
| Mermaid | No installed or locked renderer; contributor-document references only | 12.0.0 | Reference-only monitoring; do not add it to the game |

Package release claims above come from the official npm and PyPI endpoints recorded beside every package in the generated report. Runtime sources are [Node's release index](https://nodejs.org/dist/index.json) and [Python's release list](https://www.python.org/downloads/), retrieved on the audit date. Node recommends supported LTS for production: [release policy](https://nodejs.org/en/about/previous-releases).

The workspace inventory also includes React/React DOM, Radix UI, React Hook Form, TanStack Query, Recharts, Wouter, Framer Motion, GSAP, Three.js, React Three Fiber/Drei, React Spring, Lottie, Lucide, Zod, TypeBox, Express, Pino, PostgreSQL's `pg` client, Drizzle, Orval, Replit Vite plugins, Rollup, esbuild, Lightning CSS, native bindings, and their complete locked dependencies. Their exact versions and current stable comparisons are in the linked report; a declaration does not prove that an otherwise unused library reaches a browser bundle.

## Architecture and technology boundaries

The game entry point remains vanilla TypeScript, DOM, CSS, browser-local storage, and Web Audio. React belongs to the separate mockup, slides, and video applications. Express/PostgreSQL/Drizzle declarations belong to workspace scaffolding; they do not establish a product backend or a deployed database version.

There is a concrete documentation discrepancy: `AGENTS.md` says nothing in `artifacts/` reaches `dist/`, but `vite.config.ts` has a `copy-scenes` plugin that copies `artifacts/mockup-sandbox/public/scenes/*.html` into `public/scenes`, and the production build ships those scene documents. The React runtime is still separate; the scene source is a real build input. The dated guide correction added with this deliverable records this distinction without changing product scope.

| Technology / standard / service | In-place use | Latest stable / update model | Source checked on audit date |
|---|---|---|---|
| JavaScript / ECMAScript | ESM; Vite output target ES2020; shared TypeScript target and lib ES2022 | ECMAScript 2026, 17th edition; keep target based on supported browsers, not the publication year | [Ecma ECMA-262](https://ecma-international.org/publications-and-standards/standards/ecma-262/) |
| HTML, DOM, Web Storage / localStorage | HTML documents, DOM UI, versioned local saves | Living web standards; no installable version | [WHATWG HTML](https://html.spec.whatwg.org/) |
| CSS, SVG, media queries, CSS animations | Custom styles, inline vectors, safe areas, reduced motion | Browser-provided specifications; no single CSS package version | [W3C CSS](https://www.w3.org/Style/CSS/), [SVG](https://www.w3.org/TR/SVG2/) |
| Web Audio API | Original synthesized score and sound effects | Web Audio 1.0 Recommendation; implementation supplied by browser | [W3C Web Audio 1.0](https://www.w3.org/TR/webaudio-1.0/) |
| Web App Manifest / PWA packaging | Manifest and icons | Evolving specification; service-worker/offline certification remains deferred | [W3C manifest](https://www.w3.org/TR/appmanifest/), `docs/RELEASE-SCOPE.md` |
| JSON / JSON-LD, YAML, TOML, Markdown | Config, metadata, manifests, documentation | Formats, not dependencies to blindly increment; parsers are inventoried separately | `package.json`, `pnpm-workspace.yaml`, `.replit`, `index.html` |
| OpenAPI | `lib/api-spec/openapi.yaml`: 3.1.0; scaffold API | 3.2.1; migrate only with compatible Orval/Zod generation and schema review | [OpenAPI 3.2.1](https://spec.openapis.org/oas/v3.2.1.html) |
| PNG, WebP, JPEG, SVG, WOFF2, MP3, MP4 | Art, fonts, and showcase media | File formats; retain provenance and review converter upgrades | `public/`, `asset-source/`, showcase artifacts; Sharp/Pillow versions in inventory |
| Google Analytics 4 / gtag.js | One constrained hosted tag under S25 | Service-managed; no pinned semantic version | `docs/ANALYTICS-PRIVACY.md`; [Google tag documentation](https://developers.google.com/tag-platform/gtagjs) |
| GitHub Actions / hosted Ubuntu | `ubuntu-latest`, reusable actions listed in inventory | Runner image maintained by GitHub; action releases tracked by Dependabot | [Runner images](https://github.com/actions/runner-images), workflows |
| GitHub Pages | Static production host | Service-managed; no application-controlled platform version | `.github/workflows/deploy.yml` |
| Replit / Nix modules | `nodejs-24`, `python-base-3.13`; workspace autoscale configuration | Host-managed module availability; installed patches must be probed on Replit | `.replit`; [Replit system dependencies](https://docs.replit.com/replit-workspace/system-dependencies) |
| Git for Windows | Local 2.55.0.windows.5; CI/Replit versions host-provided | 2.55.0.windows.5 | [Official release](https://github.com/git-for-windows/git/releases/tag/v2.55.0.windows.5) |
| Bash / POSIX shell utilities | CI steps and repository shell scripts; local Git Bash 5.3.15 | Bash 5.3 stable family; distro patch availability is host-managed | [GNU Bash](https://www.gnu.org/software/bash/), `bash --version` |
| curl / libcurl | Landing-status HTTP transport; local curl 8.21.0 | 8.22.0 | [curl changelog](https://curl.se/changes.html) |
| GitHub CLI | Optional maintainer utility; local 2.96.0 | 2.101.0 | [Official release](https://github.com/cli/cli/releases/tag/v2.101.0) |

Chrome, Edge, Safari/iOS, VS Code, Explorer and AI assistants are host tools or target platforms, not repository-pinned product dependencies. Their updates use the host/vendor update mechanism. Test the supported browser behavior after browser or rendering-tool changes; do not add editor/browser packages merely because they were mentioned in this audit request. FFmpeg, Playwright, Puppeteer and Remotion are not declared direct dependencies here; incidental names in scaffold externalization lists or historical notes do not establish installations.

## Host observations

Read-only probes during this audit:

- Windows: `node --version` → 24.11.1; `pnpm --version` → 11.19.0; `npm --version` → 11.6.2; `py -3 --version` → 3.14.0rc1; `py -3.12 --version` → 3.12.10. The default Python is a prerelease and the local pnpm differs from the repository pin. These are observations, not new supported-runtime decisions.
- Replit browser Shell: Node 24.13.0, pnpm 10.26.1, Python 3.13.11, HEAD `0bd19d2`; installed TypeScript 7.0.2, Vite 7.3.6, Tailwind 4.3.3, Vitest 4.1.10. `git status --short` printed no changes, while the Git panel still displayed one changed generated mockup file. That UI/shell discrepancy was not reconciled by this audit.
- Replit connector: reauthentication required. Browser Shell access was independently available. No Replit synchronization or deployment was performed.
- Windows root packages do not resolve from the current `node_modules`; its existing partial install is not a reproducible test environment. The checked-in platform overrides exclude Windows/macOS native binaries. Preserve those files and validate Linux CI; portable-install cleanup is a separate bounded change.

Replit probe command: `node --version; pnpm --version; python3 --version; git rev-parse --short HEAD; git status --short`, followed by reading each named package's `package.json` version with Node. Local package resolution was probed the same way. A lockfile match for these four tools does not establish all-host parity.

## Update mechanism

1. **npm workspace:** Dependabot checks every weekday, opens upgrade PRs, and updates manifests/catalogs and the pnpm lock together. Tailwind packages are grouped. Other compatible minor/patch updates are grouped; major changes stay visible. A three-day cooldown preserves the existing one-day minimum release-age floor. No blanket major-version ignore is added.
2. **Python:** Dependabot checks both HEIC tooling and `scripts/requirements.txt` weekly. PyYAML's former inline CI install now reads the monitored requirements file. The HEIC lower bounds are explicitly unresolved; the next image-tooling upgrade should first test synthetic image round-trips and convert them to reviewed exact pins. No private photos are needed for that validation.
3. **GitHub Actions:** Dependabot checks workflow references weekly, including pinned SHA references and version comments. Existing landing-verification actions are included even though they use older major tags.
4. **Runtimes:** `.node-version` is the single main build/CI Node line; `.python-version` is the main Python CI line. Setup actions request the newest available patch/minor within those lines. `package.json#packageManager` is the single pnpm pin consumed by setup actions; duplicated hardcoded copies have been removed. The landing-only Python workflow and Replit module remain explicit separate host contracts.
5. **Every package, including transitive packages:** the `Technology inventory` workflow runs weekly and manually. It reads official npm, PyPI, GitHub and Node/Python release metadata, publishes a Markdown/JSON artifact, and lists available updates in the run summary. A lookup failure fails the job and retains the partial report. Prerelease-only packages are explicitly marked as having no stable release; no fabricated replacement is proposed.
6. **Review and integration:** upgrade PRs require Jamie's review under the existing contributor guide. The previous auto-merge workflow is removed: current GitHub settings show auto-merge disabled, no branch rulesets, and no branch protection, so enabling that workflow would not establish a reliable CI gate. Repository protection settings are unchanged. Enable required checks before any future unattended-merge policy; that is a separate owner decision.

Dependabot's [documented support](https://docs.github.com/en/code-security/reference/supply-chain-security/supported-ecosystems-and-repositories) currently lists pnpm through v10, while the npm registry reports a newer pnpm major. That discrepancy is why a package-manager major migration is reviewed instead of silently switching to `latest`. Its [configuration reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference) defines schedules, groups and cooldowns. The audit supplements update-bot coverage; it does not claim Dependabot can independently upgrade every transitive pin or host runtime.

The [pnpm setup implementation](https://github.com/pnpm/action-setup/blob/v6.1.0/src/install-pnpm/run.ts) reads `packageManager` when the explicit workflow version is omitted. CI must still prove the resolved executable is the intended version; a configuration file by itself is not activation evidence.

### Exceptions and follow-through

| Detected change | Next action | Acceptance before merge |
|---|---|---|
| Node gains a new LTS major | Jamie/maintainer updates `.node-version` in a dedicated PR; select corresponding Node types and available Replit module | Full CI, frozen install, all game/showcase builds, browser smoke, Replit probe |
| pnpm gains a compatible release | Update `packageManager` deliberately, regenerate the lock with that executable, check bot support; keep security overrides and release-age policy | Clean frozen install under Linux, no surprise lock churn, full CI |
| Python gains a new minor series | Review the audit, then change `.python-version`, the landing workflow and available Replit module in one migration | Audit/landing tests and synthetic HEIC conversion tests on that Python |
| React / React DOM update | Existing exact 19.1.0 Expo compatibility comments remain binding; audit continues to show newer releases | Owner confirms constraint removal or compatible replacement; validate all React showcase consumers together |
| Vite / Vitest / CSS / animation major | Keep root and shared catalog aligned; inspect breaking changes | Full test/oracle suite, build, all affected showcase checks, mobile rendering, reduced motion, audio controls, console |
| Transitive dependency or security override is stale | Upgrade its direct parent or make a bounded, justified override update; do not globally force all transitive versions to latest | Resolver compatibility, frozen lockfile, security review and full CI |
| Secondary mockup `package-lock.json` differs from pnpm | Determine whether any supported independent npm install still consumes it; then reconcile or retire through a separate reviewed PR | Preserve bytes until that consumer decision; pnpm lock remains canonical |
| Browser standards, OpenAPI, hosted services, system tools | Review official release/compatibility guidance monthly and after a related major update | Relevant schema/browser/deployment checks; service/API changes never expand S25 data collection |

No automated workflow installs new versions on Jamie's computer, rewrites Replit modules, retunes the engine, or merges directly to `main`. The automated outcome is a proposed dependency update plus evidence; successful integration and deployment are separate states.

## Run and verify

Use Python 3.12 or newer, and install the audit-only parser with `python -m pip install -r scripts/requirements.txt`.

```sh
python -B -m unittest discover -s scripts/tests -v
python scripts/technology_audit.py --online --output docs/technology/latest
```

On Windows use `py -3.12` (or another explicitly selected stable interpreter) instead of `python`. `GH_TOKEN`, when supplied, authenticates only GitHub release requests; do not put its value into a command log or report. Without it, GitHub's unauthenticated rate limit can leave an explicitly incomplete report. An interrupted/rate-limited run can reuse successful lookups for at most 24 hours with `--reuse-releases docs/technology/latest.json`; individual retrieval timestamps remain unchanged. Normal scheduled runs do not reuse cached releases.

For an offline structural inventory, omit `--online`; latest versions remain unknown by design. The checked-in report is a dated snapshot. Scheduled runs retain fresh reports as Actions artifacts instead of making noisy documentation commits.

Repository acceptance is the existing full `pnpm test` and `pnpm run build`, artifact validations and showcase typechecks in `ci.yml`, plus the inventory contract tests. Any future engine change also needs the full simulation fleet required by `AGENTS.md`; this maintenance change does not change engine code and does not claim a new RTP measurement.

## Evidence and activation

| Claim | Tier | Evidence | Consequence if wrong / next check |
|---|---|---|---|
| Resolved package versions | Confirmed for audited input bytes | Generated JSON input hashes and pnpm/npm lock entries | Re-run after manifest/lock changes; do not equate this with deployed bytes |
| Latest stable versions | Confirmed where a release result exists | Official endpoints and individual retrieval times | Registry failure is unknown, not current; retry missing sources |
| Installed Replit versions | Confirmed for the explicitly probed tools only | Browser Shell observation on audit date | Re-probe after synchronization; remaining packages are not host-verified |
| Compatible upgrade | Proposal until tested | Upgrade PR and CI | Check changelogs, engine constraints and browser behavior |
| Scheduled automation active | Pending default-branch integration | Workflow/configuration in this change | Merge reviewed PR, manually run `Technology inventory`, confirm its artifact and the next Dependabot job |
| Production updated | Not claimed | No game dependency upgrade or deployment in this change | Verify approved merge SHA, Pages run and live site after a future upgrade |

Recommended next action: review and merge this maintenance PR, then run the inventory workflow once from `main` and verify Dependabot's first update job before treating the pipeline as active.
