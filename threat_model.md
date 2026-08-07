# Threat Model

## Project Overview

Glee-fully Chai Chasers is a public, static browser game built as a Vite + TypeScript single-page app. It runs entirely in the browser, stores game progress in `localStorage`, loads static assets from the same origin, and includes a single Google Analytics tag for aggregate reach measurement. There is no production backend, database, account system, payment flow, webhook surface, or admin console in this repository.

Production code is concentrated in `index.html`, `src/main.ts`, `src/ui/`, `src/state.ts`, `src/audio/`, `src/engine/`, and `public/`. Test files, `scripts/`, and development handoff materials are usually out of scope unless a future scan shows they are reachable from the shipped app.

## Assets

- **Browser-local game state** — balance, settings, Treat Jar progress, and other saved progress stored under the `ccv1.*` localStorage namespace. This matters for player experience and privacy expectations, but it does not grant server-side privileges because there is no backend trust in this state.
- **Site integrity and player safety** — the delivered HTML, JavaScript, CSS, and static media loaded by the browser. Compromise would allow defacement, malicious script execution, or deceptive content.
- **Analytics boundary** — limited aggregate page-reach data sent to Google Analytics. This matters because the project explicitly forbids gameplay telemetry, ad personalization, or attempts to identify users.
- **Project-controlled media and copy** — shipped assets and metadata in `public/` and `index.html`. Tampering could expose users to malicious content or violate the project’s privacy/IP posture.

## Trust Boundaries

- **Browser runtime to application code** — all input from the browser environment is untrusted, including URL fragments, storage contents, DOM state, and client-controlled timing. The app must not treat local state as proof of identity or authorization.
- **Application code to localStorage** — persisted state crosses from an attacker-controlled client storage boundary back into rendered UI and game logic. Any values rehydrated from storage must not create script injection or cross-user impact.
- **Application code to Google Analytics** — page metadata and browser context cross to a third-party service. Only constrained aggregate reach measurement should cross this boundary; gameplay state, identifiers, and personal data must not.
- **Application code to static assets** — the app loads first-party assets and one third-party analytics script. Production safety depends on loading only intended resources and not letting user-controlled input redirect asset loads.

## Scan Anchors

- Production entry points: `index.html`, `src/main.ts`, `src/ui/board.ts`, `src/state.ts`.
- Highest-risk production areas: DOM rendering via `innerHTML`, URL hash handling in `src/main.ts`, `localStorage` hydration in `src/state.ts`, and Google Analytics initialization in `index.html`.
- Public surface: the whole shipped SPA is public; no authenticated or admin-only production routes are present.
- Usually dev-only: `scripts/**`, `**/*.test.ts`, task files, and design/handoff docs unless future production wiring proves otherwise.

## Threat Categories

### Tampering

Because the application is entirely client-side, attackers can freely tamper with their own browser state, URL fragments, and localStorage contents. The key guarantee is that this tampering must remain local to the player’s own browser session and must not be trusted as input to any privileged backend action, billing event, or cross-user state change. Browser-stored game progress may affect fairness or UX, but in this project it must not create a broader integrity break.

### Information Disclosure

The main disclosure risk is unnecessary leakage from the public app to third parties or to other origins. The application must avoid sending gameplay telemetry, localStorage contents, or personal data to Google Analytics or any other remote endpoint. Error handling and rendered metadata should not expose secrets, internal tokens, or hidden admin/debug capabilities.

### Spoofing

There is no user-authentication surface in the shipped app, so classic account impersonation is not currently in scope. The relevant guarantee is instead origin integrity: the shipped application must only execute intended first-party code plus the explicitly allowed analytics tag, and it must not expose browser-driven flows that let attackers masquerade as trusted application content.

### Denial of Service

A public browser game can still be degraded by expensive rendering loops, abusive asset loading, or browser-state corruption. The required guarantee is that browser-controlled inputs such as URL fragments or persisted state must not trigger runaway work, repeated crashes, or destructive reset loops in normal production use.

### Elevation of Privilege

Traditional privilege escalation is limited because there are no roles or backend operations. The relevant guarantee is that untrusted client-controlled data must not become executable script or grant access to any more-trusted execution context, such as arbitrary DOM/script execution through rendering sinks or abusive control over third-party requests.
