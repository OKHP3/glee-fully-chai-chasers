/**
 * Preload file: registers the CSS-stub loader hooks so Node.js (and tsx)
 * resolve .css imports as empty ES modules instead of throwing
 * "Unknown file extension" errors.
 *
 * Used via:  tsx --import ./scripts/css-stub-loader.mjs scripts/check-exports.ts
 */

import { register } from "node:module";

// Pass a URL object so Node resolves the specifier relative to this file
// without double-encoding (import.meta.url is already a file:// URL).
register(new URL("./css-stub-hooks.mjs", import.meta.url));
