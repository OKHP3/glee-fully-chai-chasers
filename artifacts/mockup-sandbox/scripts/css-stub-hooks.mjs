/**
 * Node.js ESM loader hooks — stubs .css imports as empty modules.
 * Loaded in the hooks worker thread via css-stub-loader.mjs → module.register().
 */

export async function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith(".css")) {
    // Return a data-URL that yields an empty ES module — no disk I/O needed.
    return { shortCircuit: true, url: "data:text/javascript," };
  }
  return nextResolve(specifier, context);
}
