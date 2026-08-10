/**
 * Build-time checks for the mockup sandbox.
 *
 * CHECK 1 — Export-format check
 *   Iterates every entry in mockup-components.ts, dynamically imports the
 *   module, and asserts that at least one exported value is a function
 *   (i.e. a React component).  Failures name the offending file so the
 *   author can fix the export before it reaches the preview sandbox.
 *
 * CHECK 2 — Coverage check
 *   Scans src/components/mockups/**\/*.tsx on disk (using the same glob
 *   pattern as mockupPreviewPlugin.ts) and cross-references the discovered
 *   files against the keys in mockup-components.ts.  Any .tsx file that
 *   exists on disk but is absent from the map is reported as a failure —
 *   it means the file was added in the wrong place or the Vite plugin
 *   didn't pick it up.
 *
 * Run from the mockup-sandbox package root:
 *   pnpm run check-exports
 *   # or directly:
 *   tsx scripts/check-exports.ts
 */

// tsx handles .tsx files natively via esbuild — no Vite transform needed.
// import.meta.env usage inside component bodies is fine; we never render.
import { modules } from "../src/.generated/mockup-components.ts";
import glob from "fast-glob";

// ── CHECK 1: Export-format ──────────────────────────────────────────────────

console.log("── Check 1: Export-format ─────────────────────────────────────");

const entries = Object.entries(modules);
const exportFailures: string[] = [];
let passed = 0;

for (const [modulePath, loader] of entries) {
  try {
    const mod = await loader();

    const hasFn = Object.values(mod).some((v) => typeof v === "function");

    if (!hasFn) {
      exportFailures.push(modulePath);
      console.error(
        `  ✗  ${modulePath}\n` +
          `     → no exported function found; file must export at least one React component\n` +
          `       (named export, "default", or "Preview").`,
      );
    } else {
      passed++;
    }
  } catch (err) {
    exportFailures.push(modulePath);
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `  ✗  ${modulePath}\n` + `     → failed to import: ${message}`,
    );
  }
}

console.log(); // blank line before summary

if (exportFailures.length > 0) {
  console.error(
    `❌  Export-format check FAILED — ${exportFailures.length} of ${entries.length} module(s) have no exported function component:\n`,
  );
  for (const f of exportFailures) {
    console.error(`     ${f}`);
  }
  console.error(
    `\nFix the export(s) above before pushing — the sandbox cannot resolve them.`,
  );
} else {
  console.log(
    `✅  Export-format check passed — all ${passed} component(s) export at least one function.`,
  );
}

// ── CHECK 2: Coverage (disk vs. map) ───────────────────────────────────────

console.log("\n── Check 2: Coverage (disk vs. map) ───────────────────────────");

// Same glob pattern and ignore rules as mockupPreviewPlugin.ts:
//   glob(`${MOCKUPS_DIR}/**/*.tsx`, { cwd: root, ignore: ["**/_*/**", "**/_*.tsx"] })
const diskFiles = await glob("src/components/mockups/**/*.tsx", {
  cwd: process.cwd(),
  ignore: ["**/_*/**", "**/_*.tsx"],
});

// Convert to the key format used in mockup-components.ts:
//   "src/components/mockups/scenes/Foo.tsx" → "./components/mockups/scenes/Foo.tsx"
const diskKeys = new Set(
  diskFiles.map((f) => "./" + f.slice("src/".length)),
);

const mapKeys = new Set(Object.keys(modules));

const coverageFailures: string[] = [];
for (const diskKey of diskKeys) {
  if (!mapKeys.has(diskKey)) {
    coverageFailures.push(diskKey);
    console.error(
      `  ✗  ${diskKey}\n` +
        `     → file exists on disk but is missing from mockup-components.ts\n` +
        `       (wrong subfolder, or the Vite plugin hasn't picked it up yet — try restarting the dev server)`,
    );
  }
}

console.log(); // blank line before summary

if (coverageFailures.length > 0) {
  console.error(
    `❌  Coverage check FAILED — ${coverageFailures.length} file(s) on disk are not in the generated map:\n`,
  );
  for (const f of coverageFailures) {
    console.error(`     ${f}`);
  }
  console.error(
    `\nEnsure these files are directly inside src/components/mockups/ (not in a _private subfolder)\n` +
    `and restart the dev server so mockupPreviewPlugin.ts can regenerate mockup-components.ts.`,
  );
} else {
  console.log(
    `✅  Coverage check passed — all ${diskKeys.size} file(s) on disk are present in the map.`,
  );
}

// ── CHECK 3: Ice-notes-card completeness ────────────────────────────────────

console.log("\n── Check 3: Ice-notes-card completeness ───────────────────────");

// Every scene HTML that carries the companion-row UI bar must also declare an
// ice-notes-card.  A companion-row without a card means the ingredient context
// strip is missing — this check prevents the omission from shipping silently.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const scenesDir = join(process.cwd(), "public", "scenes");
const sceneFiles = readdirSync(scenesDir)
  .filter((f) => f.endsWith(".html"))
  .map((f) => join(scenesDir, f));

const iceNotesFailures: string[] = [];
let iceNotesPassed = 0;
let iceNotesSkipped = 0;

for (const filePath of sceneFiles) {
  const src = readFileSync(filePath, "utf8");
  const hasCompanionRow = src.includes('class="companion-row"') || src.includes("companion-row");
  if (!hasCompanionRow) {
    iceNotesSkipped++;
    continue;
  }
  const hasIceNotesCard = src.includes('id="ice-notes-card"');
  if (!hasIceNotesCard) {
    const name = filePath.split("/").pop()!;
    iceNotesFailures.push(name);
    console.error(
      `  ✗  ${name}\n` +
        `     → has companion-row but is missing id="ice-notes-card"\n` +
        `       Add an <aside id="ice-notes-card" class="ice-notes-card"> block after the companion-row closing </div>.`,
    );
  } else {
    // Content check: ingredient name and description must both be non-empty.
    const name = filePath.split("/").pop()!;
    const nameText = src.match(/class="ice-notes-name">([^<]*)</)?.[1]?.trim() ?? "";
    const descText = src.match(/class="ice-notes-text">([^<]*)</)?.[1]?.trim() ?? "";
    let contentOk = true;
    if (!nameText) {
      contentOk = false;
      iceNotesFailures.push(name);
      console.error(
        `  ✗  ${name}\n` +
          `     → ice-notes-card has no ingredient name (class="ice-notes-name" is missing or empty)\n` +
          `       Fill in the ingredient name before pushing.`,
      );
    }
    if (!descText) {
      contentOk = false;
      if (nameText) {
        // Only push once per file (avoid double-counting if name was also blank)
        iceNotesFailures.push(name);
      }
      console.error(
        `  ✗  ${name}\n` +
          `     → ice-notes-card has no ingredient description (class="ice-notes-text" is missing or empty)\n` +
          `       Fill in the ingredient description before pushing.`,
      );
    }
    if (contentOk) {
      iceNotesPassed++;
    }
  }
}

console.log(); // blank line before summary

if (iceNotesFailures.length > 0) {
  console.error(
    `❌  Ice-notes-card check FAILED — ${iceNotesFailures.length} scene(s) have companion-row but no ice-notes-card:\n`,
  );
  for (const f of iceNotesFailures) {
    console.error(`     ${f}`);
  }
  console.error(
    `\nEvery scene with a companion-row must include an ice-notes-card so the\n` +
    `ingredient context strip is never blank. Add the card before pushing.`,
  );
} else {
  console.log(
    `✅  Ice-notes-card check passed — all ${iceNotesPassed} companion-row scene(s) have an ice-notes-card` +
      (iceNotesSkipped > 0 ? ` (${iceNotesSkipped} scene(s) without companion-row skipped).` : "."),
  );
}

// ── Final exit ──────────────────────────────────────────────────────────────

const totalFailures = exportFailures.length + coverageFailures.length + iceNotesFailures.length;
if (totalFailures > 0) {
  process.exit(1);
}
