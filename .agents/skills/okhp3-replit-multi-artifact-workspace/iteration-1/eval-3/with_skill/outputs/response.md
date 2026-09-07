# Restarting the `chai-chasers` Artifact Service

## Short Answer

**Do NOT call `configureWorkflow`.** Use `restartWorkflow` (or the `WorkflowsRestart` tool) targeting the artifact's managed workflow name.

---

## Why `configureWorkflow` Is Wrong Here

Every registered artifact service already has a **managed workflow** that is automatically created when the artifact is registered. The naming convention is:

```
artifacts/<slug>: <service-name>
```

For the `chai-chasers` artifact (kind: `web`), the managed workflow name is:

```
artifacts/chai-chasers: web
```

Managed workflows are special: they **inject service configuration** that a manually-created workflow cannot replicate — specifically:
- The `PORT` environment variable (unique, assigned by Replit)
- `BASE_PATH` for proxy routing
- The correct preview path mapping (`/`)

If you call `configureWorkflow` to create a replacement workflow, the new workflow:
1. **Omits** the injected `PORT` and `BASE_PATH` configuration
2. **Creates a conflicting preview path** — your artifact's preview will break
3. Does **not** replace the managed workflow; it runs alongside it, causing conflicts

The skill is explicit on this point (Rule 3):
> **Never call `configureWorkflow` to create a replacement workflow for an artifact service.**

---

## The Correct Approach: Use `restartWorkflow`

To restart the `chai-chasers` service, call `restartWorkflow` with the exact managed workflow name:

```javascript
// In CodeExecution
await restartWorkflow({ workflowName: "artifacts/chai-chasers: web" });
```

Or use the **WorkflowsRestart** tool directly with:

```
name: "artifacts/chai-chasers: web"
```

---

## When Is `configureWorkflow` Appropriate?

Only use `configureWorkflow` for **long-running processes that are not represented by a registered artifact service** — for example, a standalone background worker or a script that doesn't correspond to any artifact slug.

---

## Quick Reference: Managed Workflow Names in This Project

Based on the registered artifacts, the managed workflow names follow this pattern:

| Artifact Slug        | Kind    | Managed Workflow Name                          |
|----------------------|---------|------------------------------------------------|
| `api-server`         | api     | `artifacts/api-server: API Server`             |
| `chai-chasers`       | web     | `artifacts/chai-chasers: web`                  |
| `chai-chasers-slides`| slides  | `artifacts/chai-chasers-slides: <service-name>`|
| `chai-chasers-video` | video   | `artifacts/chai-chasers-video: <service-name>` |
| `mockup-sandbox`     | design  | `artifacts/mockup-sandbox: Component Preview Server` |

---

## Summary

| Action | Correct? |
|--------|----------|
| `configureWorkflow` to restart `chai-chasers` | ❌ Never — breaks managed config |
| `restartWorkflow({ workflowName: "artifacts/chai-chasers: web" })` | ✅ Correct |
| WorkflowsRestart tool with `"artifacts/chai-chasers: web"` | ✅ Correct |
