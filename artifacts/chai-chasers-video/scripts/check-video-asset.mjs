#!/usr/bin/env node
/**
 * Build guard — verifies the exported MP4 file exists in public/, is large
 * enough to be a real video (not a zero-byte stub), and starts with the
 * ISO Base Media File Format "ftyp" box that all compliant MP4s carry.
 *
 * Exits 1 with a clear message if any check fails so the build fails fast
 * rather than shipping a broken or empty download button.
 *
 * The expected filename is read from the EXPORT_FILENAME constant in
 * VideoWithControls.tsx — the single source of truth for the MP4 name.
 * Updating that constant automatically updates what this check looks for.
 *
 * Run directly:  node scripts/check-video-asset.mjs
 * npm alias:     npm run validate:video-asset
 * Build gate:    wired into the "build" script so it runs before vite build
 *
 * Exit codes: 0 = asset present, valid, and large enough
 *             1 = asset missing, too small, or not a real MP4
 *
 * Testing: set CHECK_VIDEO_ASSET_ROOT to override the artifact root so tests
 * can point the script at a temporary directory without touching real files.
 */

import { readFileSync, existsSync, statSync, openSync, readSync, closeSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const SELF = fileURLToPath(import.meta.url);

// Allow tests to override the artifact root so they can provide fixture files
// without touching the real public/ directory.
const ARTIFACT_ROOT =
  process.env.CHECK_VIDEO_ASSET_ROOT ?? resolve(dirname(SELF), '..');

const CONTROLS_SRC = resolve(
  ARTIFACT_ROOT,
  'src/components/video/VideoWithControls.tsx',
);
const PUBLIC_DIR = resolve(ARTIFACT_ROOT, 'public');

// ── Thresholds ────────────────────────────────────────────────────────────────

/**
 * Minimum acceptable file size in bytes.
 *
 * A real 45-second 16:9 H.264/AAC export at our quality settings is ~19 MB.
 * 100 KB is deliberately conservative — it rejects zero-byte stubs, partial
 * writes, and clearly corrupted files while leaving plenty of room for future
 * lower-resolution exports.
 */
const MIN_BYTES = 100_000;

/**
 * The ISO Base Media File Format "ftyp" box signature.
 *
 * All spec-compliant MP4 files begin with a 4-byte box size, then the 4-byte
 * ASCII string "ftyp" at byte offset 4.  A file that passes the size check
 * but fails the magic-bytes check is truncated, re-encoded to the wrong
 * format, or otherwise corrupted.
 */
const FTYP_MAGIC = Buffer.from('ftyp', 'ascii'); // bytes 4-7
const MAGIC_OFFSET = 4;
const MAGIC_READ_LEN = 8; // read bytes 0-7; we only inspect 4-7

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

// ── Check the file is large enough to be a real video ────────────────────────

const { size } = statSync(assetPath);
if (size < MIN_BYTES) {
  console.error(
    `check-video-asset: public/${filename} is too small (${size} bytes, minimum ${MIN_BYTES}).\n` +
    `\n` +
    `  A zero-byte or near-zero file is a stub or an interrupted export.\n` +
    `  Replace it with the real exported MP4 before building.\n`,
  );
  process.exit(1);
}

// ── Check the MP4 magic bytes ("ftyp" at offset 4) ───────────────────────────

const header = Buffer.alloc(MAGIC_READ_LEN);
const fd = openSync(assetPath, 'r');
readSync(fd, header, 0, MAGIC_READ_LEN, 0);
closeSync(fd);

if (!header.subarray(MAGIC_OFFSET, MAGIC_OFFSET + 4).equals(FTYP_MAGIC)) {
  console.error(
    `check-video-asset: public/${filename} does not look like a valid MP4.\n` +
    `\n` +
    `  Expected the ISO Base Media "ftyp" box at byte offset 4, but got:\n` +
    `    ${header.subarray(MAGIC_OFFSET, MAGIC_OFFSET + 4).toString('hex')} (${JSON.stringify(header.subarray(MAGIC_OFFSET, MAGIC_OFFSET + 4).toString('ascii'))})\n` +
    `\n` +
    `  The file may be truncated, re-encoded to the wrong format, or corrupted.\n` +
    `  Re-export the animation as an MP4 and copy it to public/${filename}.\n`,
  );
  process.exit(1);
}

console.log(`check-video-asset: public/${filename} found, ${size} bytes, ftyp ✓`);
process.exit(0);
