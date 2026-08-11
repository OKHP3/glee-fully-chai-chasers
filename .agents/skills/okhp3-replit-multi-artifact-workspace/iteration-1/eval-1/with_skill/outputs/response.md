# Why `fetch('/api/users')` Returns 404 on Replit and How to Fix It

## Root Cause: Violation of the BASE_URL Prefix Rule

This is **Rule 1** from the `okhp3-replit-multi-artifact` skill — the most common silent failure in Replit multi-artifact projects.

Replit uses **path-based routing**. Your React Vite app is mounted at the preview path `/my-app`. When your code calls:

```typescript
fetch('/api/users')
```

the `/api/users` URL is **root-relative** — it escapes your artifact's `/my-app` mount prefix entirely and resolves to the root of the Replit proxy. That path doesn't correspond to your server's route under `/my-app`, so the proxy returns a 404. The failure is "silent" in the sense that the code looks completely correct and the app loads normally; only the API call breaks.

The server-side endpoint *does* exist — but it's being registered under the artifact's base path, while your `fetch` call is targeting the root.

---

## The Fix: Prepend `import.meta.env.BASE_URL`

Every route and API call in a Vite artifact must prepend `import.meta.env.BASE_URL` to stay within the artifact's mounted path prefix.

**Correct implementation:**

```typescript
// artifacts/my-app/src/api/client.ts
const BASE = import.meta.env.BASE_URL; // includes trailing slash, e.g. "/my-app/"
const res = await fetch(`${BASE}api/users`);
```

**What you must stop doing:**

```typescript
// ❌ Incorrect — root-relative URL escapes the /my-app mount prefix
const res = await fetch('/api/users');
```

### Key details about `import.meta.env.BASE_URL`:
- It is provided by Vite automatically and reflects the artifact's mount path.
- It **includes a trailing slash** (e.g. `"/my-app/"`), so omit the leading slash from the path segment: use `` `${BASE}api/users` ``, not `` `${BASE}/api/users` ``.
- It is available in all `.ts`/`.tsx` files in a Vite project — no extra imports needed.

---

## Recommended Refactor: Centralize Your API Base

Rather than sprinkling `import.meta.env.BASE_URL` across every `fetch` call, create a single API client module:

```typescript
// artifacts/my-app/src/api/client.ts
const BASE = import.meta.env.BASE_URL; // e.g. "/my-app/"

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  // path should NOT start with '/', e.g. "api/users"
  return fetch(`${BASE}${path}`, init);
}
```

Then use it everywhere:

```typescript
import { apiFetch } from '@/api/client';

const res = await apiFetch('api/users');
const data = await res.json();
```

This ensures every call is prefix-correct and makes future base-path changes a one-line fix.

---

## Quick Diagnostic: Find All Broken Calls

Run this from your artifact directory to find every root-relative `fetch` that needs fixing:

```bash
rg "fetch\(['\"]/" artifacts/my-app/src/
```

Any result starting with `fetch('/'` or `fetch("/` is a candidate for the `BASE_URL` fix.

---

## Summary

| Problem | Root-relative `fetch('/api/users')` escapes the `/my-app` mount prefix |
|---|---|
| **Cause** | Replit uses path-based routing; each artifact is scoped to its preview path |
| **Fix** | Use `` fetch(`${import.meta.env.BASE_URL}api/users`) `` |
| **Rule** | BASE_URL prefix rule (Rule 1, `okhp3-replit-multi-artifact` skill) |
| **Grep to audit** | `rg "fetch\(['\"]/" artifacts/my-app/src/` |
