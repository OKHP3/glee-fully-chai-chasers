/**
 * Integration tests for scripts/check-video-asset.mjs
 *
 * Each test case spins up a temporary fixture directory that mimics the
 * artifact's public/ + src/components/video/ layout, then spawns the script
 * as a child process (via spawnSync) with CHECK_VIDEO_ASSET_ROOT pointing at
 * that fixture.  This exercises the real script logic without touching the
 * production MP4.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const SCRIPT = resolve(dirname(SELF), '../../scripts/check-video-asset.mjs');

const FAKE_FILENAME = 'test-showcase.mp4';

/** Minimal VideoWithControls.tsx stub that the script can parse. */
const FAKE_CONTROLS_SRC = `
export const EXPORT_FILENAME = '${FAKE_FILENAME}';
`.trim();

/** Valid 8-byte MP4 header: 4-byte box size + "ftyp". */
const VALID_FTYP_HEADER = Buffer.concat([
  Buffer.from([0x00, 0x00, 0x00, 0x20]), // box size (32 bytes)
  Buffer.from('ftyp', 'ascii'),           // ftyp box type
  Buffer.from('isom', 'ascii'),           // major brand
]);

/** Invalid header: same size field but "XXXX" instead of "ftyp". */
const INVALID_MAGIC_HEADER = Buffer.concat([
  Buffer.from([0x00, 0x00, 0x00, 0x20]),
  Buffer.from('XXXX', 'ascii'),
  Buffer.from('isom', 'ascii'),
]);

/**
 * Builds a buffer of `size` bytes where the first 8 bytes are a valid ftyp
 * header and the rest is zero-filled padding.
 */
function makeRealMp4(size: number): Buffer {
  const buf = Buffer.alloc(size, 0);
  VALID_FTYP_HEADER.copy(buf, 0);
  return buf;
}

// ── Fixture helpers ───────────────────────────────────────────────────────────

let fixtureRoot: string;

function setupFixture() {
  fixtureRoot = mkdtempSync(resolve(tmpdir(), 'chai-video-guard-'));
  mkdirSync(resolve(fixtureRoot, 'public'), { recursive: true });
  mkdirSync(resolve(fixtureRoot, 'src/components/video'), { recursive: true });
  writeFileSync(
    resolve(fixtureRoot, 'src/components/video/VideoWithControls.tsx'),
    FAKE_CONTROLS_SRC,
  );
}

function teardownFixture() {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

function putMp4(contents: Buffer) {
  writeFileSync(resolve(fixtureRoot, 'public', FAKE_FILENAME), contents);
}

function run() {
  return spawnSync(process.execPath, [SCRIPT], {
    env: { ...process.env, CHECK_VIDEO_ASSET_ROOT: fixtureRoot },
    encoding: 'utf8',
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('check-video-asset guard', () => {
  beforeEach(setupFixture);
  afterEach(teardownFixture);

  it('exits 0 when the file is present, large enough, and has ftyp magic', () => {
    putMp4(makeRealMp4(200_000));
    const { status, stdout } = run();
    expect(status).toBe(0);
    expect(stdout).toMatch(/found.*ftyp ✓/);
  });

  it('exits 1 when the file is completely absent', () => {
    // No putMp4 call — file does not exist.
    const { status, stderr } = run();
    expect(status).toBe(1);
    expect(stderr).toMatch(/is missing/);
  });

  it('exits 1 when the file is zero bytes', () => {
    putMp4(Buffer.alloc(0));
    const { status, stderr } = run();
    expect(status).toBe(1);
    expect(stderr).toMatch(/too small/);
    expect(stderr).toMatch(/0 bytes/);
  });

  it('exits 1 when the file is below MIN_BYTES (99 999 bytes)', () => {
    // 99 999 bytes is one byte under the 100 000-byte threshold.
    putMp4(makeRealMp4(99_999));
    const { status, stderr } = run();
    expect(status).toBe(1);
    expect(stderr).toMatch(/too small/);
  });

  it('exits 0 when the file is exactly at MIN_BYTES (100 000 bytes)', () => {
    putMp4(makeRealMp4(100_000));
    const { status } = run();
    expect(status).toBe(0);
  });

  it('exits 1 when the file is large but has wrong magic bytes', () => {
    const buf = Buffer.alloc(200_000, 0);
    INVALID_MAGIC_HEADER.copy(buf, 0);
    putMp4(buf);
    const { status, stderr } = run();
    expect(status).toBe(1);
    expect(stderr).toMatch(/does not look like a valid MP4/);
    expect(stderr).toMatch(/ftyp/);
  });

  it('exits 1 when EXPORT_FILENAME is missing from the source file', () => {
    writeFileSync(
      resolve(fixtureRoot, 'src/components/video/VideoWithControls.tsx'),
      '// no EXPORT_FILENAME here',
    );
    const { status, stderr } = run();
    expect(status).toBe(1);
    expect(stderr).toMatch(/could not find EXPORT_FILENAME/);
  });
});
