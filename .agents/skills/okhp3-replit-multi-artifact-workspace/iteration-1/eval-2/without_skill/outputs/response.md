# Vite Config & Blank Preview Checklist for Replit Monorepo (Multiple Artifacts)

When you add a second artifact to a Replit monorepo and the preview pane goes blank (even though the workflow shows as running), the problem is almost always one of a few root causes. Here's what must be correct and a full checklist to work through.

---

## What Must Be Correct in Your Vite Config

### 1. `server.host` must be `"0.0.0.0"`
Replit's preview pane connects to a port exposed on all interfaces. If Vite listens only on `localhost` or `127.0.0.1`, the preview can't reach it.

```js
// vite.config.js / vite.config.ts
export default {
  server: {
    host: "0.0.0.0",
    port: 5173,          // or whatever port you assign this artifact
  }
}
```

### 2. Each artifact must use a **unique port**
Two Vite dev servers cannot share the same port. If your second artifact starts on the same port as the first, one silently fails or the wrong app is served.

```
Artifact 1 (web):    port 5173
Artifact 2 (web):    port 5174
API server:          port 3000
```

### 3. `server.strictPort: true` (recommended)
Prevents Vite from silently picking a random fallback port when there's a conflict — which would make the preview blank because the expected port is still unused.

```js
server: {
  host: "0.0.0.0",
  port: 5174,
  strictPort: true,
}
```

### 4. `base` must match the artifact's preview path
If your artifact is served under a sub-path (e.g., `/chai-chasers-slides/`), Vite must know about it:

```js
export default {
  base: "/chai-chasers-slides/",   // matches the artifact's preview path
  server: { host: "0.0.0.0", port: 5175, strictPort: true }
}
```

For root-path artifacts, `base: "/"` (the default) is fine.

### 5. `server.allowedHosts` / CORS
Replit proxies requests through its own domain. Vite 5+ added host-checking. Make sure you haven't accidentally blocked the Replit preview host:

```js
server: {
  host: "0.0.0.0",
  // If needed:
  allowedHosts: "all",
}
```

---

## Checklist to Work Through

### A. Port & Process
- [ ] Each artifact's Vite config specifies a **different, explicit port**.
- [ ] `strictPort: true` is set so a conflict causes a clear error rather than a silent remap.
- [ ] Run `ss -tlnp` or `lsof -i` inside the Replit shell — confirm each expected port has exactly one listener.
- [ ] No zombie processes from a previous run are holding a port (`pkill -f vite` if needed, then restart).

### B. Vite Config Correctness
- [ ] `server.host` is `"0.0.0.0"` in **every** artifact's Vite config.
- [ ] `base` matches the artifact's declared preview path.
- [ ] No `server.https` accidentally enabled (Replit handles TLS at the proxy layer).

### C. Replit Workflow / Run Commands
- [ ] The workflow's run command for the new artifact points to the **correct directory** (`cd artifacts/chai-chasers && npm run dev`).
- [ ] The workflow run command passes the right port if not in `vite.config`: `vite --port 5174 --host`.
- [ ] Both artifacts are listed as separate processes/steps in `.replit` or the workflow config — not just one overwriting the other.

### D. `.replit` / Replit Config
- [ ] The `[[ports]]` table (in `.replit`) maps each port to its preview path:

```toml
[[ports]]
localPort = 5173
externalPort = 80        # or the assigned external port

[[ports]]
localPort = 5174
externalPort = 3001      # different external port for the second artifact
```

- [ ] The correct port/path is selected in the preview pane dropdown (Replit lets you switch which port the preview shows).

### E. Build / Dependency Issues
- [ ] `node_modules` exist inside the new artifact directory (`cd artifacts/new-artifact && npm install`).
- [ ] There are no TypeScript/import errors preventing Vite from starting (check the workflow log/terminal for red errors).
- [ ] `index.html` exists at the root of the new artifact (Vite needs it as the entry point).

### F. Preview Pane Selection
- [ ] In the Replit preview pane, use the **port selector / URL bar** to navigate to the correct port or sub-path for the new artifact.
- [ ] Hard-refresh the preview pane (Ctrl+Shift+R inside it) after changing configs.

---

## Quick Diagnostic Command

Run this in the Replit shell to see all running Vite processes and their ports at a glance:

```bash
ps aux | grep vite
ss -tlnp | grep -E '517[0-9]|300[0-9]'
```

If a port is missing from the `ss` output, that artifact's dev server didn't start — check its terminal/log for the error.

---

## Summary

| Must-have | Setting |
|---|---|
| Bind to all interfaces | `server.host: "0.0.0.0"` |
| Unique port per artifact | `server.port: <unique>` |
| Fail loudly on conflict | `server.strictPort: true` |
| Sub-path routing | `base: "/your-preview-path/"` |
| Port mapped in `.replit` | `[[ports]]` entry for each dev server |
