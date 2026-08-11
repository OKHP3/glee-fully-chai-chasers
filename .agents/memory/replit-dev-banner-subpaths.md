---
name: Replit dev-banner artifact subpaths
description: How to keep Replit's official development banner working for Vite artifacts mounted below a base path.
---

For a Vite artifact mounted at a path such as `/artifact-name/`, preserve
Replit's official development banner but account for the plugin's root-relative
script URL. Rewrite the injected script URL under the artifact base path, then
normalize that prefixed request back to the plugin's expected route in early
Vite middleware.

**Why:** The plugin version used here injects and serves a hardcoded root path.
Through Replit's artifact proxy, the root request reaches the main app instead
of the artifact server, producing a 404. Merely rewriting the HTML URL is not
enough because the plugin middleware still matches only its unprefixed route.

**How to apply:** For subpath Vite artifacts that enable
`@replit/vite-plugin-dev-banner`, test the injected banner request through the
actual proxied preview. Require HTTP 200, JavaScript content type, and no browser
console error. Do not suppress, delete, or restyle the banner.