#!/usr/bin/env node
/**
 * CI guard — third-party CDN / external-host runtime URL check.
 *
 * Scans every shipped HTML file and stylesheet for attributes and rules that
 * would cause the browser to fetch a resource from an external host at
 * runtime.  "External" means: an absolute https?:// URL or a
 * protocol-relative //hostname/… URL whose host is not first-party.
 *
 * ── HTML elements / attributes checked ────────────────────────────────────
 *
 *   src  on any element (script, img, iframe, audio, video, source, track,
 *            embed, input …) — browser fetches the resource at render/parse
 *   href on <link> — browser fetches unless rel is in NON_FETCH_LINK_RELS
 *   data on <object> — browser fetches the embedded resource
 *   poster on <video> — browser fetches the placeholder image
 *
 * <a href> and <area href> are NOT checked — they are user-navigation
 * hyperlinks, not automatic resource fetches.
 *
 * Both quoted and unquoted attribute values are recognised.
 * Protocol-relative URLs (//hostname/…) are treated as external.
 *
 * ── CSS rules checked ─────────────────────────────────────────────────────
 *
 *   @import "URL" / @import url("URL")
 *   url("URL") in any property (fonts, backgrounds, cursors, masks …)
 *
 * ── Allow-list ────────────────────────────────────────────────────────────
 *
 * Any external URL not in ALLOW_LIST causes the script to exit 1.
 * ALLOW_LIST entries must include a justification tied to a policy document.
 *
 * Run directly:  node scripts/check-cdn-urls.mjs
 * Self-test:     node scripts/check-cdn-urls.mjs --self-test
 * npm alias:     npm run validate:cdn
 *
 * Exit codes: 0 = clean, 1 = unlisted external URL(s) found.
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
// Each entry is an exact URL string (or a prefix ending with *).
// Each must include a policy justification so future reviewers can judge
// whether the entry is still appropriate.
//
// Policy reference: docs/ANALYTICS-PRIVACY.md — Decision S25 (2026-07-13)
// permits exactly one analytics tag (G-89W66VMGPB).  No additional tag,
// CDN library, icon set, font host, or image host may be added without
// (1) a docs/ANALYTICS-PRIVACY.md update and (2) a new ALLOW_LIST entry.
//
const ALLOW_LIST = new Map([
  [
    "https://www.googletagmanager.com/gtag/js?id=G-89W66VMGPB",
    // Approved under Decision S25 (docs/ANALYTICS-PRIVACY.md).  Tag is
    // configured with allow_google_signals:false and
    // allow_ad_personalization_signals:false in index.html.
    "Google Analytics (gtag.js) — privacy-limited config, Decision S25",
  ],
]);

// ─── Link rels that do NOT trigger automatic browser fetches ─────────────────
//
// These rels annotate the relationship between documents for crawlers,
// browsers' back/forward heuristics, or search engines.  The browser does
// NOT issue an HTTP request for the linked resource at page-load time.
// Everything else (icon, manifest, modulepreload, stylesheet, preconnect,
// preload, prefetch, dns-prefetch, apple-touch-icon, …) IS fetched and
// therefore must not point to an unlisted external host.
//
const NON_FETCH_LINK_RELS = new Set([
  "canonical",
  "alternate",
  "next",
  "prev",
  "help",
  "license",
  "author",
  "me",
  "search",
  "noopener",
  "noreferrer",
  "external",
  "nofollow",
  "ugc",
  "sponsored",
  "tag",
  "bookmark",
]);

// ─── Directories to skip entirely ────────────────────────────────────────────
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".local",     // agent skills — not shipped to browser
  "dist",
  "build",
  ".cache",
  "coverage",
  "scripts",    // tooling — not shipped
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

/**
 * Returns true when `url` is an external absolute URL that the browser would
 * fetch from a third-party host.
 *
 * Catches both explicit-scheme (https?://) and protocol-relative (//host/…).
 * Ignores data:, blob:, and relative paths.
 */
function isExternalUrl(url) {
  const u = url.trim();
  // https:// or http://
  if (/^https?:\/\//i.test(u)) return true;
  // Protocol-relative: //hostname/… where hostname is not empty or bare slash
  if (/^\/\/[^/\s]/i.test(u)) return true;
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
// Extracts the value of a named attribute from a raw tag string.
// Handles double-quoted, single-quoted, and unquoted attribute values.

function attrValue(tag, attrName) {
  // Quoted: attr="value" or attr='value'
  const quoted = new RegExp(
    `\\b${attrName}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`,
    "i",
  );
  const mq = quoted.exec(tag);
  if (mq) return (mq[1] ?? mq[2]).trim();

  // Unquoted: attr=value (stops at whitespace, >, or />) 
  const unquoted = new RegExp(
    `\\b${attrName}\\s*=\\s*([^"'\\s>]+)`,
    "i",
  );
  const mu = unquoted.exec(tag);
  return mu ? mu[1].trim() : null;
}

// Returns the space-separated rel token set for a <link> tag (lower-cased).
function linkRels(tag) {
  const raw = attrValue(tag, "rel") ?? "";
  return new Set(raw.toLowerCase().split(/\s+/).filter(Boolean));
}

// Returns true when a <link>'s rel set contains at least one fetch-triggering
// token (i.e. any token NOT in NON_FETCH_LINK_RELS).
function linkIsFetchable(tag) {
  const rels = linkRels(tag);
  if (rels.size === 0) return true; // bare <link href> with no rel → fetch
  for (const r of rels) {
    if (!NON_FETCH_LINK_RELS.has(r)) return true;
  }
  return false;
}

// ── Tag-level scanner ────────────────────────────────────────────────────────
//
// Matches any opening or void HTML tag; strips comments first.
const COMMENT_RE = /<!--[\s\S]*?-->/g;
const TAG_RE     = /<([a-z][a-z0-9-]*)(\s[^>]*)?\s*\/?>/gi;

function extractHtmlUrls(src) {
  // Strip HTML comments — a URL inside <!-- … --> is not fetched.
  const stripped = src.replace(COMMENT_RE, "");
  const hits = [];

  let m;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(stripped)) !== null) {
    const tag      = m[0];
    const tagName  = m[1].toLowerCase();

    // <a href> and <area href> are user-navigation hyperlinks — not fetched.
    if (tagName === "a" || tagName === "area") continue;

    // ── src attribute ── (script, img, iframe, audio, video, source,
    //                      track, embed, input, …)
    const srcVal = attrValue(tag, "src");
    if (srcVal && isExternalUrl(srcVal)) hits.push(srcVal);

    // ── href attribute on <link> ─────────────────────────────────────────
    if (tagName === "link") {
      const hrefVal = attrValue(tag, "href");
      if (hrefVal && isExternalUrl(hrefVal) && linkIsFetchable(tag)) {
        hits.push(hrefVal);
      }
      continue; // href on <link> handled; skip generic href check below
    }

    // ── data attribute on <object> ───────────────────────────────────────
    if (tagName === "object") {
      const dataVal = attrValue(tag, "data");
      if (dataVal && isExternalUrl(dataVal)) hits.push(dataVal);
    }

    // ── poster attribute on <video> ──────────────────────────────────────
    if (tagName === "video") {
      const posterVal = attrValue(tag, "poster");
      if (posterVal && isExternalUrl(posterVal)) hits.push(posterVal);
    }
  }

  return hits;
}

// ─── CSS scanner ─────────────────────────────────────────────────────────────
//
// Strips block comments, then finds:
//   @import "https://…" / @import url("https://…")
//   url("https://…") anywhere (fonts, backgrounds, cursors, …)
// Also catches protocol-relative //hostname/… in the same patterns.

const IMPORT_RE = /@import\s+(?:url\(["']?|["'])(\s*(?:https?:\/\/|\/\/[^/\s])[^"')\s]+)/gi;
const URL_RE    = /url\(\s*["']?((?:https?:\/\/|\/\/[^/\s])[^"')\s]+)["']?\s*\)/gi;

function extractCssUrls(src) {
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

  for (const file of walk(root, HTML_EXT)) {
    const src = readFileSync(file, "utf8");
    for (const url of extractHtmlUrls(src)) {
      if (!isAllowed(url)) {
        violations.push({ file: relative(root, file), url });
      }
    }
  }

  for (const file of walk(root, CSS_EXT)) {
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
    let counter = 0;
    function scan(filename, content, isCSS = false) {
      const dir = join(tmp, String(counter++));
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, filename), content, "utf8");
      return runCheck(dir);
    }

    // ── Basic allow / deny ─────────────────────────────────────────────────

    check("clean HTML with only local resources — no violations", () => {
      const v = scan("index.html", `
        <script src="/local.js"></script>
        <link rel="stylesheet" href="/style.css">
        <link rel="canonical" href="https://example.com/page">
        <img src="/images/photo.png">
        <meta content="https://cdn.example.com/img.jpg">
      `);
      assert(v.length === 0, `expected 0 violations, got ${v.length}`);
    });

    check("meta content= URLs are never flagged — no runtime fetch", () => {
      const v = scan("index.html", `
        <meta property="og:image" content="https://cdn.example.com/img.jpg">
        <meta name="twitter:image" content="https://cdn.example.com/img.jpg">
      `);
      assert(v.length === 0, `meta content should not be flagged; got ${v.length}`);
    });

    check("allowed GTM script is not flagged", () => {
      const v = scan("index.html",
        `<script async src="https://www.googletagmanager.com/gtag/js?id=G-89W66VMGPB"></script>`
      );
      assert(v.length === 0, `GTM must be in allow-list; got ${v.length}`);
    });

    // ── <script src> ───────────────────────────────────────────────────────

    check("external <script src> (double-quoted) is flagged", () => {
      const v = scan("index.html",
        `<script src="https://unpkg.com/some-lib@1.0/dist/lib.js"></script>`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
      assert(v[0].url.includes("unpkg.com"), `expected unpkg URL`);
    });

    check("external <script src> (single-quoted) is flagged", () => {
      const v = scan("index.html",
        `<script src='https://unpkg.com/some-lib@1.0/dist/lib.js'></script>`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("external <script src> (unquoted) is flagged", () => {
      const v = scan("index.html",
        `<script src=https://unpkg.com/some-lib@1.0/dist/lib.js></script>`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    // ── <img src> ──────────────────────────────────────────────────────────

    check("external <img src> is flagged", () => {
      const v = scan("index.html",
        `<img src="https://cdn.example.com/photo.jpg" alt="photo">`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("local <img src> is not flagged", () => {
      const v = scan("index.html", `<img src="/images/local.jpg" alt="photo">`);
      assert(v.length === 0, `local img should not be flagged`);
    });

    // ── <iframe src> ───────────────────────────────────────────────────────

    check("external <iframe src> is flagged", () => {
      const v = scan("index.html",
        `<iframe src="https://embed.example.com/widget"></iframe>`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    // ── <audio> / <video> / <source> ──────────────────────────────────────

    check("external <audio src> is flagged", () => {
      const v = scan("index.html",
        `<audio src="https://cdn.example.com/track.mp3"></audio>`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("external <video src> is flagged", () => {
      const v = scan("index.html",
        `<video src="https://cdn.example.com/clip.mp4"></video>`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("external <source src> inside <video> is flagged", () => {
      const v = scan("index.html", `
        <video><source src="https://cdn.example.com/clip.mp4" type="video/mp4"></video>
      `);
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("external <video poster> is flagged", () => {
      const v = scan("index.html",
        `<video poster="https://cdn.example.com/thumb.jpg" src="/local.mp4"></video>`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    // ── <object data> ─────────────────────────────────────────────────────

    check("external <object data> is flagged", () => {
      const v = scan("index.html",
        `<object data="https://cdn.example.com/widget.swf"></object>`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    // ── <link href> ────────────────────────────────────────────────────────

    check("external <link rel=stylesheet href> is flagged", () => {
      const v = scan("index.html",
        `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("external <link rel=preconnect href> is flagged", () => {
      const v = scan("index.html",
        `<link rel="preconnect" href="https://fonts.gstatic.com">`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("external <link rel=preload href> is flagged", () => {
      const v = scan("index.html",
        `<link rel="preload" href="https://cdn.example.com/font.woff2" as="font">`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("external <link rel=modulepreload href> is flagged", () => {
      const v = scan("index.html",
        `<link rel="modulepreload" href="https://cdn.jsdelivr.net/es/module.js">`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("external <link rel=icon href> is flagged", () => {
      // Browsers fetch favicons — an external icon is a third-party request.
      const v = scan("index.html",
        `<link rel="icon" href="https://cdn.example.com/favicon.ico">`
      );
      assert(v.length === 1, `external icon must be flagged; got ${v.length}`);
    });

    check("external <link rel=apple-touch-icon href> is flagged", () => {
      const v = scan("index.html",
        `<link rel="apple-touch-icon" sizes="180x180" href="https://cdn.example.com/icon.png">`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("external <link rel=manifest href> is flagged", () => {
      // Browsers fetch the web app manifest.
      const v = scan("index.html",
        `<link rel="manifest" href="https://cdn.example.com/manifest.json">`
      );
      assert(v.length === 1, `external manifest must be flagged; got ${v.length}`);
    });

    check("external <link rel=dns-prefetch href> is flagged", () => {
      const v = scan("index.html",
        `<link rel="dns-prefetch" href="https://cdn.example.com">`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("external <link rel=prefetch href> is flagged", () => {
      const v = scan("index.html",
        `<link rel="prefetch" href="https://cdn.example.com/chunk.js">`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("<link rel=canonical href> is NOT flagged — not a runtime fetch", () => {
      const v = scan("index.html",
        `<link rel="canonical" href="https://example.com/">`
      );
      assert(v.length === 0, `canonical should not be flagged; got ${v.length}`);
    });

    check("<link rel=alternate href> is NOT flagged", () => {
      const v = scan("index.html",
        `<link rel="alternate" type="application/rss+xml" href="https://example.com/feed">`
      );
      assert(v.length === 0, `alternate should not be flagged; got ${v.length}`);
    });

    check("<link> with multiple rels including a fetch rel is flagged", () => {
      const v = scan("index.html",
        `<link rel="stylesheet preload" href="https://cdn.example.com/chunk.css">`
      );
      assert(v.length === 1, `mixed rels with fetch rel should be flagged`);
    });

    check("<link> with only non-fetch rels is NOT flagged", () => {
      const v = scan("index.html",
        `<link rel="canonical nofollow" href="https://example.com/">`
      );
      assert(v.length === 0, `only non-fetch rels should not be flagged`);
    });

    // ── <a href> — hyperlinks, never flagged ──────────────────────────────

    check("<a href> external URL is NOT flagged — user navigation only", () => {
      const v = scan("index.html",
        `<a href="https://cdn.example.com/page">link</a>`
      );
      assert(v.length === 0, `hyperlinks should not be flagged`);
    });

    check("<area href> external URL is NOT flagged", () => {
      const v = scan("index.html",
        `<map name="m"><area href="https://cdn.example.com/page"></map>`
      );
      assert(v.length === 0, `area hyperlinks should not be flagged`);
    });

    // ── Protocol-relative URLs (//hostname/…) ─────────────────────────────

    check("protocol-relative <script src=//host/…> is flagged", () => {
      const v = scan("index.html",
        `<script src="//cdn.example.com/lib.js"></script>`
      );
      assert(v.length === 1, `protocol-relative script src should be flagged`);
    });

    check("protocol-relative <img src=//host/…> is flagged", () => {
      const v = scan("index.html",
        `<img src="//cdn.example.com/photo.jpg">`
      );
      assert(v.length === 1, `protocol-relative img src should be flagged`);
    });

    check("protocol-relative <link href=//host/…> with fetch rel is flagged", () => {
      const v = scan("index.html",
        `<link rel="stylesheet" href="//fonts.googleapis.com/css2?family=Inter">`
      );
      assert(v.length === 1, `protocol-relative link href should be flagged`);
    });

    check("root-relative URL (/path) is NOT flagged — same-origin", () => {
      const v = scan("index.html", `<script src="/js/app.js"></script>`);
      assert(v.length === 0, `root-relative should not be flagged`);
    });

    // ── HTML comments ─────────────────────────────────────────────────────

    check("external URL in an HTML comment is NOT flagged", () => {
      const v = scan("index.html",
        `<!-- See https://fonts.googleapis.com/css2?family=Inter for reference -->`
      );
      assert(v.length === 0, `HTML comments should not be flagged`);
    });

    // ── CSS ───────────────────────────────────────────────────────────────

    check("clean CSS with only local resources — no violations", () => {
      const v = scan("style.css", `
        body { background: url('/images/bg.png'); }
        @font-face { src: url('/fonts/inter.woff2'); }
      `);
      assert(v.length === 0, `expected 0 violations, got ${v.length}`);
    });

    check("CSS @import with external URL is flagged", () => {
      const v = scan("style.css",
        `@import "https://fonts.googleapis.com/css2?family=Inter";`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("CSS @import url() with external URL is flagged", () => {
      const v = scan("style.css",
        `@import url("https://fonts.googleapis.com/css2?family=Inter");`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("CSS url() with external font is flagged", () => {
      const v = scan("style.css",
        `@font-face { src: url("https://fonts.gstatic.com/s/inter/v13/UcC.woff2") format("woff2"); }`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("CSS url() with protocol-relative external URL is flagged", () => {
      const v = scan("style.css",
        `background: url("//cdn.example.com/bg.png");`
      );
      assert(v.length === 1, `protocol-relative CSS url should be flagged`);
    });

    check("CSS url() with data URI is NOT flagged", () => {
      const v = scan("style.css",
        `background: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A");`
      );
      assert(v.length === 0, `data: URIs should not be flagged`);
    });

    check("CSS block comment with external URL is NOT flagged", () => {
      const v = scan("style.css",
        `/* See: https://fonts.googleapis.com/css2?family=Inter */`
      );
      assert(v.length === 0, `CSS comments should not be flagged`);
    });

  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  const total = passed + failed;
  console.log(`\nSelf-test: ${passed}/${total} passed${failed > 0 ? `, ${failed} failed` : ""}`);
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
      `check-cdn-urls: ${violations.length} unlisted external runtime URL(s) found:\n`,
    );
    for (const { file, url } of violations) {
      console.error(`  ${file}\n    ${url}`);
    }
    console.error(
      "\nIf this URL is intentional, add it to ALLOW_LIST in scripts/check-cdn-urls.mjs" +
      " with a justification comment referencing docs/ANALYTICS-PRIVACY.md.",
    );
    process.exit(1);
  }
}
