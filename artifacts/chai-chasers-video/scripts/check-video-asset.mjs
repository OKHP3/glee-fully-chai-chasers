#!/usr/bin/env node
/**
 * Build guard — verifies the exported MP4 file exists in public/ before the
 * Vite build runs.  Exits 1 with a clear message if the file is absent so the
 * build fails fast rather than shipping a broken download button.
 *
 * The expected filename is read from the EXPORT_FILENAME constant in
 * VideoWithControls.tsx — the single source of truth for the MP4 name.
 * Updating that constant automatically updates what this check looks for.
 *
 * Run directly:  node scripts/check-video-asset.mjs
 * npm alias:     npm run validate:video-asset
 * Build gate:    wired into the "build" script so it runs before vite build
 *
 * Exit codes: 0 = asset present, 1 = asset missing or filename not found.
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const SELF = fileURLToPath(import.meta.url);
const ARTIFACT_ROOT = resolve(dirname(SELF), '..');

const CONTROLS_SRC = resolve(
  ARTIFACT_ROOT,
  'src/components/video/VideoWithControls.tsx',
);
const PUBLIC_DIR = resolve(ARTIFACT_ROOT, 'public');

// ── Extract EXPORT_FILENAME from source ───────────────────────────────────────

let src;
try {
  src = readFileSync(CONTROLS_SRC, 'utf8');
} catch {
  console.error(
    `check-video-asset: cannot read ${CONTROLS_SRC}\n` +
    `  Make sure you are running this script from the artifact root.`,
  );
  process.exit(1);
}

// Matches:  export const EXPORT_FILENAME = 'chai-chasers-v3-showcase.mp4';
//       or: export const EXPORT_FILENAME = "chai-chasers-v3-showcase.mp4";
const match = src.match(
  /export\s+const\s+EXPORT_FILENAME\s*=\s*['"]([^'"]+)['"]/,
);
if (!match) {
  console.error(
    `check-video-asset: could not find EXPORT_FILENAME in VideoWithControls.tsx\n` +
    `  Expected a line like:\n` +
    `    export const EXPORT_FILENAME = 'chai-chasers-vN-showcase.mp4';\n` +
    `  Check that the constant is exported at module scope.`,
  );
  process.exit(1);
}

const filename = match[1];
const assetPath = resolve(PUBLIC_DIR, filename);

// ── Check the file exists ─────────────────────────────────────────────────────

if (!existsSync(assetPath)) {
  console.error(
    `check-video-asset: public/${filename} is missing.\n` +
    `\n` +
    `  The Download MP4 button in VideoWithControls.tsx links to this file.\n` +
    `  Serving a build without it leaves users with a broken download.\n` +
    `\n` +
    `  To fix:\n` +
    `    1. Export the animation as an MP4 and copy it to:\n` +
    `         artifacts/chai-chasers-video/public/${filename}\n` +
    `    2. Or update EXPORT_FILENAME in VideoWithControls.tsx to match the\n` +
    `       filename you have already exported.\n`,
  );
  process.exit(1);
}

console.log(`check-video-asset: public/${filename} found ✓`);
process.exit(0);
