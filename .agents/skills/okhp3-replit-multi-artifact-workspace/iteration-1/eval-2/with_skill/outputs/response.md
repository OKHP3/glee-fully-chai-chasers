# Blank Preview After Adding a Second Artifact — Vite Config & Debug Checklist

## What must be correct in your Vite config

Two properties in `vite.config.ts` are **mandatory** for previews to work in a Replit multi-artifact monorepo. Either one being wrong produces a blank preview with no useful error message.

### 1. Read the port from `process.env.PORT` — never hard-code it

Replit's system assigns each artifact a unique port. If you hard-code a port number, it will either collide with another artifact or simply be the wrong port for the proxy router.

**Correct:**

```typescript
// artifacts/your-new-app/vite.config.ts
export default defineConfig({
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
```

**Incorrect (causes blank preview):**

```typescript
server: { port: 3000 }  // hard-coded — wrong port, or conflict
```

### 2. Set `allowedHosts: true`

The Replit preview pane loads your app in a proxied iframe. Requests arrive from a different origin than `localhost`. Without `allowedHosts: true`, Vite rejects those requests with a 403 and the preview is blank.

```typescript
server: {
  host: '0.0.0.0',         // required — bind to all interfaces
  allowedHosts: true,       // required — preview is a proxied iframe
  port: parseInt(process.env.PORT || '5000', 10),
}
```

---

## BASE_URL — the other silent failure to check

Every route and every `fetch()` call inside a Vite artifact must prepend `import.meta.env.BASE_URL`. Replit mounts each artifact at a path-based prefix (e.g. `/`). A root-relative URL like `/api/users` bypasses the prefix and hits the wrong artifact or a 404.

**Correct:**

```typescript
const BASE = import.meta.env.BASE_URL; // includes trailing slash
const res = await fetch(`${BASE}api/users`);
```

**Incorrect (silent failure — no error, wrong response):**

```typescript
const res = await fetch('/api/users');
```

---

## Blank-preview debug checklist — work through in order

| # | Check | How to verify |
|---|---|---|
| 1 | **Is the workflow running?** | Check the workflow panel — state must be `running`. The workflow name follows the pattern `artifacts/<slug>: <service-name>` (e.g. `artifacts/chai-chasers: web`). |
| 2 | **Did it open a port?** | Call `getWorkflowStatus({ name: "..." })` and look for `openPorts`. No open port means the server crashed on startup. |
| 3 | **Is `allowedHosts: true` in Vite config?** | Read `vite.config.ts`. Any host restriction causes a 403 from the proxy → blank preview. |
| 4 | **Is the server reading `PORT` from the environment?** | Read the server startup code. A hard-coded port number is almost always wrong. |
| 5 | **Is `BASE_URL` prepended to every route and API call?** | `grep -r "fetch('" artifacts/your-new-app/src/` — any URL beginning with `/` that is not prefixed with `import.meta.env.BASE_URL` is a bug. |
| 6 | **Was the workflow restarted after code changes?** | Hot-reload does not catch all changes (especially config changes). Restart using `restartWorkflow({ workflowName: "artifacts/<slug>: <service>" })`. |
| 7 | **pnpm catalog drift?** | Run `pnpm why vite` from the workspace root — you should see exactly one version. Two versions means an artifact has an off-catalog pin (e.g. `"vite": "5.4.19"` instead of `"vite": "catalog:"`). Fix: change the pin to `"catalog:"` and re-run `pnpm install`. |

If all seven are clean and the preview is still blank, consult the `debug-workflow-ports-issues` skill.

---

## Additional rules that cause blank previews when adding a second artifact

### Do NOT call `configureWorkflow` for an artifact service

Every registered artifact already has a managed workflow (e.g. `artifacts/chai-chasers: web`). Managed workflows inject `PORT`, `BASE_PATH`, and proxy routing automatically. If you call `configureWorkflow` to create a replacement, those injections are missing — blank preview, wrong port.

- **To restart an artifact:** use `restartWorkflow({ workflowName: "artifacts/chai-chasers: web" })`.
- **Only use `configureWorkflow`** for long-running processes that are NOT a registered artifact service.

### Cross-artifact shared code: use `workspace:*`, not relative paths

If your new artifact imports from a shared library:

1. The library must have its own `package.json` with `"name": "@workspace/<lib-name>"`.
2. The consuming artifact's `package.json` must declare: `"@workspace/<lib-name>": "workspace:*"`.
3. Run `pnpm install` from the workspace root to create the symlink.
4. After adding the dependency, **restart the artifact's workflow** so Vite picks up the symlink.

Relative cross-package paths (`../../lib/foo`) break TypeScript project references and Vite module resolution.

---

## Quick summary

| Problem | Fix |
|---|---|
| Blank preview, no crash | `allowedHosts: true` missing in Vite config |
| Blank preview, server starts then dies | Port is hard-coded — switch to `parseInt(process.env.PORT \|\| '5000', 10)` |
| API calls return 404 or wrong data | Root-relative URL — prepend `import.meta.env.BASE_URL` |
| TypeScript errors after adding dependency | pnpm catalog drift — change exact version pin to `"catalog:"` |
| Workflow shows running but preview wrong | Used `configureWorkflow` instead of the managed workflow |
