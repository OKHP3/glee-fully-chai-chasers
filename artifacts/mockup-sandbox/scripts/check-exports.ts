/**
 * Build-time export-format check for the mockup sandbox.
 *
 * Iterates every entry in mockup-components.ts, dynamically imports the
 * module, and asserts that at least one exported value is a function
 * (i.e. a React component).  Failures name the offending file so the
 * author can fix the export before it reaches the preview sandbox.
 *
 * Run from the mockup-sandbox package root:
 *   pnpm run check-exports
 *   # or directly:
 *   tsx scripts/check-exports.ts
 */

// tsx handles .tsx files natively via esbuild — no Vite transform needed.
// import.meta.env usage inside component bodies is fine; we never render.
import { modules } from "../src/.generated/mockup-components.ts";

const entries = Object.entries(modules);
const failures: string[] = [];
let passed = 0;

for (const [modulePath, loader] of entries) {
  try {
    const mod = await loader();

    const hasFn = Object.values(mod).some((v) => typeof v === "function");

    if (!hasFn) {
      failures.push(modulePath);
      console.error(
        `  ✗  ${modulePath}\n` +
          `     → no exported function found; file must export at least one React component\n` +
          `       (named export, "default", or "Preview").`,
      );
    } else {
      passed++;
    }
  } catch (err) {
    failures.push(modulePath);
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `  ✗  ${modulePath}\n` + `     → failed to import: ${message}`,
    );
  }
}

console.log(); // blank line before summary

if (failures.length > 0) {
  console.error(
    `❌  Export-format check FAILED — ${failures.length} of ${entries.length} module(s) have no exported function component:\n`,
  );
  for (const f of failures) {
    console.error(`     ${f}`);
  }
  console.error(
    `\nFix the export(s) above before pushing — the sandbox cannot resolve them.`,
  );
  process.exit(1);
} else {
  console.log(
    `✅  Export-format check passed — all ${passed} component(s) export at least one function.`,
  );
}
