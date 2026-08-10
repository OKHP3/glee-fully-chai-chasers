#!/usr/bin/env node
/**
 * CI guard — third-party CDN / external-host runtime URL check.
 *
 * Scans every shipped HTML file and stylesheet for attributes and rules that
 * would cause the browser to fetch a resource from an external host at
 * runtime.  This covers more ground than a font-only check:
 *
 *   HTML: <script src="https://…">
 *         <link rel="stylesheet|preconnect|preload|prefetch|dns-prefetch"
 *               href="https://…">
 *   CSS:  @import "https://…" / @import url("https://…")
 *         url("https://…") in any property (fonts, backgrounds, cursors…)
 *
 * Meta/OG/JSON-LD attributes (content="…") are NOT runtime fetches and are
 * intentionally ignored.  <a href>, inline text, and code comments are also
 * skipped.
 *
 * Any external URL that is not in ALLOW_LIST causes the script to exit 1.
 *
 * Run directly:  node scripts/check-cdn-urls.mjs
 * Self-test:     node scripts/check-cdn-urls.mjs --self-test
 * npm alias:     npm run validate:cdn
 *
 * Exit codes: 0 = no unlisted external URLs found, 1 = violation(s) found.
 */

import {
  readFileSync,
  readdirSync,
  statSync,
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, relative } from "node:path";
import { tmpdir } from "node:os";

const SELF = fileURLToPath(import.meta.url);
const DEFAULT_ROOT = resolve(dirname(SELF), "..");

// ─── Allow-list ──────────────────────────────────────────────────────────────
//
// Keys are exact URL strings (or prefixes ending with *).
// Values are the justification kept in the codebase.
//
// Keep this list SHORT.  Every entry here is an acknowledged third-party
// runtime dependency.  New entries need a code review comment explaining why.
//
const ALLOW_LIST = new Map([
  [
    "https://www.googletagmanager.com/gtag/js?id=G-89W66VMGPB",
    "Google Analytics (gtag.js) — privacy-limited, no-ad-signals config in index.html",
  ],
]);

// ─── Directories to skip entirely ────────────────────────────────────────────
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".local",         // agent skills — not shipped code
  "dist",
  "build",
  ".cache",
  "coverage",
  "scripts",        // tooling — not shipped to browser
]);

// ─── File extensions to scan ─────────────────────────────────────────────────
const HTML_EXT = new Set([".html"]);
const CSS_EXT  = new Set([".css"]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isAllowed(url) {
  if (ALLOW_LIST.has(url)) return true;
  for (const [k] of ALLOW_LIST) {
    if (k.endsWith("*") && url.startsWith(k.slice(0, -1))) return true;
  }
  return false;
}

function walk(dir, exts, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, exts, out);
    else if (exts.has(name.slice(name.lastIndexOf(".")))) out.push(p);
  }
  return out;
}

// ─── HTML scanner ────────────────────────────────────────────────────────────
//
// We check four element/attribute combinations that cause runtime fetches:
//
//   <script src="URL">
//   <link rel="stylesheet|preconnect|preload|prefetch|dns-prefetch" href="URL">
//
// <meta content="…"> and similar metadata attributes are NOT runtime fetches
// and are intentionally skipped.

const SCRIPT_SRC_RE = /<script\b[^>]+>/gi;
const LINK_TAG_RE   = /<link\b[^>]+>/gi;

// Extract the value of a named attribute from a tag string.
function attr(tag, name) {
  const re = new RegExp(`\\b${name}=["']([^"']*)["']`, "i");
  const m = re.exec(tag);
  return m ? m[1].trim() : null;
}

const PRELOAD_RELS = new Set([
  "stylesheet", "preconnect", "preload", "prefetch", "dns-prefetch",
]);

function extractHtmlUrls(src) {
  const hits = [];

  // <script src="…">
  let m;
  SCRIPT_SRC_RE.lastIndex = 0;
  while ((m = SCRIPT_SRC_RE.exec(src)) !== null) {
    const tag = m[0];
    const srcVal = attr(tag, "src");
    if (srcVal && /^https?:\/\//i.test(srcVal)) hits.push(srcVal);
  }

  // <link rel="…" href="…">
  LINK_TAG_RE.lastIndex = 0;
  while ((m = LINK_TAG_RE.exec(src)) !== null) {
    const tag = m[0];
    const rel  = attr(tag, "rel") ?? "";
    const href = attr(tag, "href");
    if (!href || !/^https?:\/\//i.test(href)) continue;
    // Only flag rels that trigger runtime fetches / connections.
    for (const part of rel.split(/\s+/)) {
      if (PRELOAD_RELS.has(part.toLowerCase())) {
        hits.push(href);
        break;
      }
    }
  }

  return hits;
}

// ─── CSS scanner ─────────────────────────────────────────────────────────────
//
// Strip block comments first, then look for:
//   @import "https://…" / @import url("https://…")
//   url("https://…") anywhere (fonts, backgrounds, etc.)

const IMPORT_RE = /@import\s+(?:url\(["']?|["'])(\s*https?:\/\/[^"')\s]+)/gi;
const URL_RE    = /url\(\s*["']?(https?:\/\/[^"')\s]+)["']?\s*\)/gi;

function extractCssUrls(src) {
  // Strip /* … */ block comments
  const stripped = src.replace(/\/\*[\s\S]*?\*\//g, "");
  const hits = [];
  let m;
  IMPORT_RE.lastIndex = 0;
  while ((m = IMPORT_RE.exec(stripped)) !== null) hits.push(m[1].trim());
  URL_RE.lastIndex = 0;
  while ((m = URL_RE.exec(stripped)) !== null) hits.push(m[1].trim());
  return [...new Set(hits)];
}

// ─── Main check ──────────────────────────────────────────────────────────────

function runCheck(root) {
  const violations = [];

  const htmlFiles = walk(root, HTML_EXT);
  for (const file of htmlFiles) {
    const src = readFileSync(file, "utf8");
    for (const url of extractHtmlUrls(src)) {
      if (!isAllowed(url)) {
        violations.push({ file: relative(root, file), url });
      }
    }
  }

  const cssFiles = walk(root, CSS_EXT);
  for (const file of cssFiles) {
    const src = readFileSync(file, "utf8");
    for (const url of extractCssUrls(src)) {
      if (!isAllowed(url)) {
        violations.push({ file: relative(root, file), url });
      }
    }
  }

  return violations;
}

// ─── Self-test ───────────────────────────────────────────────────────────────

function runSelfTest() {
  let passed = 0;
  let failed = 0;

  function check(label, fn) {
    try {
      fn();
      console.log(`  ✓ ${label}`);
      passed++;
    } catch (e) {
      console.error(`  ✗ ${label}: ${e.message}`);
      failed++;
    }
  }

  function assert(cond, msg) {
    if (!cond) throw new Error(msg);
  }

  const tmp = mkdtempSync(join(tmpdir(), "cdn-check-"));
  try {
    // Helper: write a synthetic file, run the check, return violations.
    function scan(subdir, filename, content) {
      const dir = join(tmp, subdir);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, filename), content, "utf8");
      return runCheck(dir);
    }

    // ── HTML tests ──

    check("clean HTML — no external URLs", () => {
      const v = scan("h1", "index.html", `
        <script src="/local.js"></script>
        <link rel="stylesheet" href="/style.css">
        <link rel="canonical" href="https://example.com/page">
        <meta content="https://social.example.com/img.jpg">
      `);
      assert(v.length === 0, `expected 0 violations, got ${v.length}: ${JSON.stringify(v)}`);
    });

    check("meta content= URLs are not flagged", () => {
      const v = scan("h2", "index.html", `
        <meta property="og:image" content="https://cdn.example.com/img.jpg">
        <meta name="twitter:image" content="https://cdn.example.com/img.jpg">
      `);
      assert(v.length === 0, `meta content should not be flagged; got ${v.length} violations`);
    });

    check("allowed GTM script is not flagged", () => {
      const v = scan("h3", "index.html",
        `<script async src="https://www.googletagmanager.com/gtag/js?id=G-89W66VMGPB"></script>`
      );
      assert(v.length === 0, `GTM should be in allow-list; got ${v.length} violations`);
    });

    check("unlisted external <script src> is flagged", () => {
      const v = scan("h4", "index.html",
        `<script src="https://unpkg.com/some-lib@1.0/dist/lib.js"></script>`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
      assert(v[0].url.includes("unpkg.com"), `expected unpkg URL, got ${v[0].url}`);
    });

    check("external Google Fonts stylesheet is flagged", () => {
      const v = scan("h5", "index.html",
        `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("external <link rel='preconnect'> is flagged", () => {
      const v = scan("h6", "index.html",
        `<link rel="preconnect" href="https://fonts.gstatic.com">`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("rel='canonical' with external URL is not flagged", () => {
      const v = scan("h7", "index.html",
        `<link rel="canonical" href="https://example.com/">`
      );
      assert(v.length === 0, `canonical should not be flagged; got ${v.length}`);
    });

    check("rel='icon' with external URL is not flagged (icons are listed, not CDN)", () => {
      // icon links point to first-party assets in practice; if external they'd
      // be caught by a different mechanism.  This test verifies the script
      // stays narrow — it only flags load-triggering rels.
      const v = scan("h8", "index.html",
        `<link rel="icon" href="https://other.com/favicon.ico">`
      );
      assert(v.length === 0, `icon rel not in PRELOAD_RELS, should not be flagged`);
    });

    // ── CSS tests ──

    check("clean CSS — no external URLs", () => {
      const v = scan("c1", "style.css", `
        body { background: url('/images/bg.png'); }
        @font-face { src: url('/fonts/inter.woff2'); }
      `);
      assert(v.length === 0, `expected 0 violations, got ${v.length}`);
    });

    check("CSS @import with external URL is flagged", () => {
      const v = scan("c2", "style.css",
        `@import "https://fonts.googleapis.com/css2?family=Inter";`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("CSS @import url() with external URL is flagged", () => {
      const v = scan("c3", "style.css",
        `@import url("https://fonts.googleapis.com/css2?family=Inter");`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("CSS url() with external font is flagged", () => {
      const v = scan("c4", "style.css",
        `@font-face { src: url("https://fonts.gstatic.com/s/inter/v13/UcC.woff2") format("woff2"); }`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("CSS url() with data URI is not flagged", () => {
      const v = scan("c5", "style.css",
        `background: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A");`
      );
      assert(v.length === 0, `data: URIs should not be flagged; got ${v.length}`);
    });

    check("CSS comment with external URL is not flagged", () => {
      const v = scan("c6", "style.css",
        `/* See: https://fonts.googleapis.com/css2?family=Inter for reference */`
      );
      assert(v.length === 0, `comments should not be flagged; got ${v.length}`);
    });

  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  console.log(`\nSelf-test: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// ─── Entry point ─────────────────────────────────────────────────────────────

const selfTest = process.argv.includes("--self-test");
const rootArg  = process.argv.find((a) => a.startsWith("--root="));
const root     = rootArg ? resolve(rootArg.slice("--root=".length)) : DEFAULT_ROOT;

if (selfTest) {
  console.log("Running self-tests for check-cdn-urls.mjs …\n");
  const ok = runSelfTest();
  process.exit(ok ? 0 : 1);
} else {
  const violations = runCheck(root);
  if (violations.length === 0) {
    console.log("check-cdn-urls: no unlisted third-party CDN URLs found ✓");
    process.exit(0);
  } else {
    console.error(
      `check-cdn-urls: ${violations.length} unlisted external runtime URL(s) found:\n`
    );
    for (const { file, url } of violations) {
      console.error(`  ${file}\n    ${url}`);
    }
    console.error(
      "\nIf this URL is intentional, add it to ALLOW_LIST in scripts/check-cdn-urls.mjs" +
      " with a justification comment."
    );
    process.exit(1);
  }
}
