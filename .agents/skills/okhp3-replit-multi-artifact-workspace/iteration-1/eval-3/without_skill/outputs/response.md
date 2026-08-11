# Restarting a Replit Artifact Service

## Short Answer

**No** — you should **not** call `configureWorkflow` to restart an existing service. Use **`restartWorkflow`** instead.

## Explanation

In Replit's multi-artifact workspace environment, workflows map to running services (like your `chai-chasers` web artifact). The relevant operations are:

| Action | Function to Use |
|---|---|
| Create a brand-new workflow | `configureWorkflow` |
| Start a workflow that isn't running | `startWorkflow` |
| **Restart a running workflow** | **`restartWorkflow`** |
| Stop a running workflow | `stopWorkflow` |

### Why not `configureWorkflow`?

`configureWorkflow` is used to **define or reconfigure** a workflow — setting its name, commands, ports, etc. Calling it on an already-configured artifact service would attempt to recreate or overwrite the workflow definition, which is unnecessary and potentially disruptive. It does not perform a restart.

### Correct Approach

To restart the service for the `chai-chasers` slug, call:

```javascript
await restartWorkflow({ workflow: "chai-chasers" });
```

This will stop the currently running process for that workflow and start it fresh — equivalent to a service restart — without touching the workflow's configuration.

### When Would You Use `configureWorkflow`?

Only if you need to:
- Change the startup command
- Change the exposed port
- Rename the workflow
- Create a workflow that doesn't yet exist

For a simple restart of the `chai-chasers` artifact service, `restartWorkflow` is the correct and minimal call.
