# Threat Model

## Project Overview

"Glee-fully Chai Chasers" is a browser-based slot-machine arcade game deployed publicly on Replit autoscale (`https://glee-fully-chai-chasers.replit.app`). The stack is Node.js 24 / TypeScript 5.9 with an Express 5 API server, PostgreSQL + Drizzle ORM (configured but not yet used), and a static React/Vite frontend. The application is in early development; the API currently exposes only a `/api/healthz` endpoint.

## Assets

- **API server process** — Node.js process running as the application backend. Currently low-value (no user data, no auth), but will become higher-value as features are added.
- **Database connection** — `DATABASE_URL` environment variable grants access to the Postgres database. Not yet actively used in production endpoints.
- **Game state (client-side)** — Spin results, credits, and level progression are computed entirely in the browser. No server-side persistence of game state currently exists.

## Trust Boundaries

- **Browser ↔ API server** — The only active boundary. Currently carries no sensitive data; health check only. Must be hardened before user data or game state are persisted server-side.
- **API server ↔ PostgreSQL** — Configured but not yet exercised by production routes. Standard ORM-layer boundary.
- **Public / Authenticated** — No authentication exists yet. All routes are public. This must be revisited before adding user accounts or persistent state.

## Scan Anchors

- Production entry points: `artifacts/api-server/src/routes/` (Express routes), `artifacts/api-server/src/app.ts` (middleware chain)
- Highest-risk area when expanded: any future route that reads `userId`/session and queries the DB
- Public surface: all `/api/*` routes are unauthenticated; the frontend is a static SPA
- Dev-only: `artifacts/mockup-sandbox/` (Canvas/design sandbox — not reachable in production)

## Threat Categories

### Information Disclosure

The API uses `cors()` with no configuration, which applies the `Access-Control-Allow-Origin: *` wildcard to every response. This is currently low-impact because the only endpoint returns `{status: "ok"}`, but it becomes a meaningful risk the moment any authenticated or user-scoped endpoint is added. CORS must be restricted to the application's own origin before user data is served.

**Required guarantee:** CORS origin allowlist MUST be explicitly configured to the application's production URL before any authenticated or user-specific endpoint goes live.

### Elevation of Privilege

No authentication or authorization layer exists. This is acceptable while the API is limited to a public health check, but any future addition of user accounts, scores, or billing MUST be gated behind a server-verified session or token.

### Tampering

All game logic (spin outcomes, credits, level advancement) executes client-side with no server-side verification. For a casual arcade game this may be acceptable, but any feature with real-world value (e.g., leaderboard, prizes) MUST validate outcomes server-side.

### Denial of Service

No rate limiting is configured on any endpoint. The `/api/healthz` route is low-value, but future endpoints (especially any that hit the database) MUST be rate-limited before public launch.
