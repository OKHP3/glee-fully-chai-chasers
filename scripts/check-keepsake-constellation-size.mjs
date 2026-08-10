#!/usr/bin/env node
/**
 * CI guard — Keepsake Constellation stale size claim.
 *
 * Task #154 corrected six absolute "2×2" claims in README.md, DESIGN-SPEC.md,
 * and scene files. This script prevents that regression from re-entering: it
 * fails when any searched file contains "2×2 … keepsake" or "keepsake … 2×2"
 * (case-insensitive, within one line).
 *
 * Corpus:
 *   - README.md
 *   - docs/**\/\*.md (recursive)
 *   - artifacts/mockup-sandbox/public/scenes/*.html  (compiled HTML)
 *   - artifacts/mockup-sandbox/src/components/mockups/scenes/*.tsx  (source)
 *
 * Allow-listed:
 *   - src/engine/keepsake-constellation.ts — engine code, not prose.
 *   - Any line containing "footprint shown" — these are correctly-qualified
 *     comments noting the scene depicts ONE example footprint while the engine
 *     rolls variable sizes (2–3 reels wide × 2–4 rows tall).
 *
 * Run directly:  node scripts/check-keepsake-constellation-size.mjs
 * Self-test:     node scripts/check-keepsake-constellation-size.mjs --self-test
 * npm alias:     npm run validate:keepsake-size
 *
 * Exit codes: 0 = no stale claims found, 1 = one or more found.
 */

import {
  readFileSync,
  readdirSync,
  statSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SELF = fileURLToPath(import.meta.url);
const DEFAULT_ROOT = resolve(dirname(SELF), "..");

/** Recursively collect files matching a suffix under a directory. */
function walkSuffix(dir, suffix, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkSuffix(p, suffix, out);
    else if (name.endsWith(suffix)) out.push(p);
  }
  return out;
}

/** Build the set of files to scan for a given root. */
function targetFiles(root) {
  const files = [];

  // README at repo root
  const readme = resolve(root, "README.md");
  if (existsSync(readme)) files.push(readme);

  // All markdown under docs/ — recursive
  walkSuffix(resolve(root, "docs"), ".md", files);

  // Compiled scene HTML (mockup-sandbox public)
  walkSuffix(resolve(root, "artifacts/mockup-sandbox/public/scenes"), ".html", files);

  // Scene TSX source files
  walkSuffix(resolve(root, "artifacts/mockup-sandbox/src/components/mockups/scenes"), ".tsx", files);

  return files;
}

/** Return true when a line is a stale absolute Keepsake 2×2 size claim. */
const TWO_BY_TWO = /2[×x]2/i;
const KEEPSAKE   = /keepsake/i;
const QUALIFIER  = /footprint\s+shown/i; // correctly-qualified form

function isStaleClaim(line) {
  if (!TWO_BY_TWO.test(line)) return false;
  if (!KEEPSAKE.test(line))   return false;
  if (QUALIFIER.test(line))   return false;
  return true;
}

function runCheck(root) {
  let failed = false;
  for (const file of targetFiles(root)) {
    const rel = file.replace(root + "/", "");
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (isStaleClaim(lines[i])) {
        console.error(
          `STALE CLAIM: ${rel}:${i + 1}: ${lines[i].trim()}\n` +
          `  Keepsake Constellation is NOT a fixed 2×2. The engine rolls variable sizes.\n` +
          `  Update the text, or qualify it with "footprint shown" like:\n` +
          `  "2×2 footprint shown in this scene; engine rolls 2–3 reels wide × 2–4 rows tall"`,
        );
        failed = true;
      }
    }
  }
  if (!failed) {
    console.log("No stale Keepsake Constellation 2×2 size claims found.");
  }
  return !failed;
}

// ── Self-test ──────────────────────────────────────────────────────────────────

function selfTest() {
  const cases = [
    {
      name: "clean README with no keepsake size claim passes",
      expectFail: false,
      files: { "README.md": "# Chai Chasers\n\nCollect keepsakes!\n" },
    },
    {
      name: "unqualified '2×2 keepsake' claim in README fails",
      expectFail: true,
      expectText: "STALE CLAIM: README.md:3",
      files: { "README.md": "# Chai Chasers\n\nThe Keepsake Constellation is a 2×2 giant symbol.\n" },
    },
    {
      name: "unqualified '2×2 keepsake' in a doc fails",
      expectFail: true,
      expectText: "STALE CLAIM: docs/DESIGN-SPEC.md:1",
      files: {
        "README.md": "# Clean\n",
        "docs/DESIGN-SPEC.md": "The 2×2 keepsake zone occupies reels 2–3.\n",
      },
    },
    {
      name: "qualified 'footprint shown' form in scene HTML passes",
      expectFail: false,
      files: {
        "README.md": "# Clean\n",
        "artifacts/mockup-sandbox/public/scenes/keepsake-constellation.html":
          "<!-- 2×2 footprint shown in this scene; engine rolls 2–3 reels wide × 2–4 rows tall -->\n",
      },
    },
    {
      name: "qualified 'footprint shown' form in scene TSX passes",
      expectFail: false,
      files: {
        "README.md": "# Clean\n",
        "artifacts/mockup-sandbox/src/components/mockups/scenes/KeepsakeConstellation.tsx":
          "/** Keepsake Constellation (footprint shown: 2×2; engine rolls variable sizes) */\nexport default function KC() { return null; }\n",
      },
    },
    {
      name: "unqualified '2×2 keepsake' claim in scene TSX jsdoc fails",
      expectFail: true,
      expectText: "STALE CLAIM: artifacts/mockup-sandbox/src/components/mockups/scenes/KC.tsx:1",
      files: {
        "README.md": "# Clean\n",
        "artifacts/mockup-sandbox/src/components/mockups/scenes/KC.tsx":
          "/** 2×2 keepsake constellation giant symbol */\nexport default function KC() { return null; }\n",
      },
    },
    {
      name: "nested doc in subdirectory is scanned",
      expectFail: true,
      expectText: "STALE CLAIM: docs/sub/NOTES.md:1",
      files: {
        "README.md": "# Clean\n",
        "docs/sub/NOTES.md": "Keepsake Constellation is 2×2 wide.\n",
      },
    },
  ];

  let ok = true;
  for (const c of cases) {
    const dir = mkdtempSync(join(tmpdir(), "keepsake-size-selftest-"));
    try {
      for (const [rel, content] of Object.entries(c.files)) {
        const p = resolve(dir, rel);
        mkdirSync(dirname(p), { recursive: true });
        writeFileSync(p, content);
      }
      const res = spawnSync(process.execPath, [SELF, "--check-root", dir], { encoding: "utf8" });
      const failedRun = res.status !== 0;
      const textOk = !c.expectText || (res.stderr + res.stdout).includes(c.expectText);
      if (failedRun === c.expectFail && textOk) {
        console.log(`SELF-TEST OK:   ${c.name}`);
      } else {
        console.error(`SELF-TEST FAIL: ${c.name} (exit=${res.status}, expected fail=${c.expectFail}, textOk=${textOk})`);
        console.error(res.stdout + res.stderr);
        ok = false;
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  if (!ok) process.exit(1);
  console.log("\nAll self-test cases behaved as expected.");
}

// ── Entry point ────────────────────────────────────────────────────────────────

if (process.argv.includes("--self-test")) {
  selfTest();
} else {
  const rootFlag = process.argv.indexOf("--check-root");
  const root = rootFlag !== -1 ? process.argv[rootFlag + 1] : DEFAULT_ROOT;
  if (!runCheck(root)) process.exit(1);
}
