# Why `fetch('/api/users')` Returns 404 When App is Mounted at `/my-app`

## Root Cause

When your React Vite app is served at `/my-app`, the browser resolves relative URLs against that base path. So `fetch('/api/users')` makes an **absolute** request to `/api/users` — which is correct in terms of the URL path — but the issue is almost certainly one of the following:

### Most Likely Cause: Missing Vite Dev Server Proxy

In development, Vite serves your frontend on its own port (e.g., `localhost:5173`). When your code calls `fetch('/api/users')`, the request goes to Vite's dev server, **not** your backend server. Vite has no `/api/users` route, so it returns 404.

In production on Replit, if your static files and API server are served by different processes/ports without a reverse proxy configured, the same problem occurs.

---

## Fixes

### Fix 1: Configure the Vite Dev Server Proxy (Development)

In `vite.config.js` (or `vite.config.ts`), add a proxy so `/api` requests are forwarded to your backend:

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/my-app',          // matches your mount path
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // your backend port
        changeOrigin: true,
      }
    }
  }
})
```

This tells Vite: "forward any request starting with `/api` to my backend server."

---

### Fix 2: Set the Correct `base` in `vite.config.js`

If your app is mounted at `/my-app`, you **must** set `base: '/my-app'` in your Vite config. Without it, asset paths and routing can break, causing cascading 404s.

```js
export default defineConfig({
  base: '/my-app',
  // ...
})
```

---

### Fix 3: Use an Absolute URL or Environment Variable for the API

Instead of a relative path, use a full URL so there's no ambiguity:

```js
// In your component or api utility
const res = await fetch('http://localhost:3000/api/users'); // dev
// or
const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users`);
```

Set `VITE_API_BASE_URL` in your `.env` file:
```
VITE_API_BASE_URL=http://localhost:3000
```

---

### Fix 4: Serve Frontend and API from the Same Server (Production)

On Replit in production, the cleanest solution is to have your backend serve the Vite build output as static files **and** handle `/api` routes — all on the same port:

```js
// Express example
import express from 'express'
import path from 'path'

const app = express()

// API routes
app.get('/api/users', (req, res) => { /* ... */ })

// Serve React app under /my-app
app.use('/my-app', express.static(path.join(__dirname, 'dist')))

// Fallback for client-side routing under /my-app
app.get('/my-app/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(3000)
```

---

## Summary

| Scenario | Fix |
|---|---|
| Dev: Vite can't reach backend | Add `server.proxy` in `vite.config.js` |
| App assets broken at `/my-app` | Set `base: '/my-app'` in `vite.config.js` |
| Want environment-agnostic fetches | Use `VITE_API_BASE_URL` env variable |
| Production on Replit (single port) | Serve static files + API from same Express server |

The **most common fix** for Vite + separate backend is the **proxy configuration** (Fix 1) combined with setting the correct **`base`** path (Fix 2).
