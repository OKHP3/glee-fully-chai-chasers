# Flipping Canvas iframes from "Building" to Live

## Understanding the "Building" Indicator

In Replit's Canvas (board/workspace), each iframe tile represents an artifact. The **"building"** state means the iframe is pointing to a deployment/preview that hasn't been marked as ready, or the tile is configured with a placeholder/building URL rather than a live preview URL.

## How to Flip an iframe to Live

### 1. Update the iframe `src` to the Live Preview URL

Each artifact in your Replit project has a **preview path**. The live URL format is:

```
https://<repl-slug>.<username>.repl.co<preview-path>
```

Or, in newer Replit deployments:

```
https://<deployment-id>.replit.app<preview-path>
```

### 2. URL Format per Artifact Kind

Based on standard Replit artifact conventions:

| Artifact Kind | Preview Path Example | Live URL Pattern |
|--------------|---------------------|-----------------|
| `web`        | `/`                 | `https://<slug>.repl.co/` |
| `api`        | `/api`              | `https://<slug>.repl.co/api` |
| `slides`     | `/chai-chasers-slides/` | `https://<slug>.repl.co/chai-chasers-slides/` |
| `video`      | `/chai-chasers-video/`  | `https://<slug>.repl.co/chai-chasers-video/` |
| `design`     | `/__mockup`         | `https://<slug>.repl.co/__mockup` |

### 3. In the Canvas Board — How to Flip

In Replit Canvas, each iframe tile typically has a **status field or `src` property** you can edit:

1. **Click the iframe tile** to select it.
2. Open its **settings/properties panel** (usually a gear icon or right-click → Edit).
3. Find the **URL / Source** field.
4. Change it from the building placeholder (e.g., `about:blank`, a loader URL, or a `?building=true` variant) to the **live preview URL**.
5. Toggle the status from `building` → `live` if there's an explicit status toggle.

### 4. Common Building → Live URL Swap

If tiles use a query-param convention:

```
# Building (placeholder)
https://<slug>.repl.co/?__state=building

# Live
https://<slug>.repl.co/
```

Simply remove any `?__state=building` or `?mode=building` query parameter, or replace the entire URL with the artifact's preview path.

### 5. Programmatic Approach (if editing canvas config directly)

If your canvas is defined in a config file (e.g., JSON or YAML), find each tile entry and update:

```json
{
  "kind": "iframe",
  "status": "live",
  "src": "https://<your-repl-slug>.repl.co<preview-path>"
}
```

Change `"status": "building"` → `"status": "live"` and ensure `src` points to the correct preview path.

## Quick Checklist Before the Demo

- [ ] Each iframe `src` uses the correct live preview URL
- [ ] No `?building=true` or placeholder URLs remain
- [ ] The artifact server is actually running (not just the URL being correct)
- [ ] Test each iframe loads without a 404 or redirect loop
- [ ] Verify the Canvas itself is in presentation/view mode, not edit mode

## Summary

The key action is: **replace the building placeholder URL with the artifact's actual live preview URL**, using the format `https://<repl-slug>.<username>.repl.co<preview-path>` (or your custom domain if configured). If Canvas has an explicit status toggle per tile, flip it to `live` in addition to updating the URL.
