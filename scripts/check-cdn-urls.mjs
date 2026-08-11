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
 * ── JS chunks checked (post-build dist/ pass) ────────────────────────────
 *
 * Decision S26 (2026-08-11): JS chunk scanning is IN SCOPE.
 *
 * A Vite plugin (or a transitive npm dependency that uses defineConfig hooks)
 * can bake a CDN URL directly into a bundled .js chunk as a string constant
 * used for dynamic import(), fetch(), or a baseURL assignment.  That URL never
 * appears in the HTML or CSS that the pre-build and post-build HTML/CSS passes
 * scan.  To close the gap, runCheck() also walks dist/assets/*.js (and any
 * other .js file reachable from the scan root) and flags unlisted https://
 * string literals whose host is not first-party.
 *
 * Scanning scope: http:// and https:// URLs inside string literals (", ', `).
 *   - Both schemes are matched, consistent with the HTML/CSS scanner.
 *   - Block comments stripped before scanning so licence headers are ignored.
 *   - Line comments excluded by requiring an opening quote before the scheme —
 *     a bare URL in `// see https://…` has no preceding quote and is skipped.
 * Out of scope: protocol-relative URLs (//host/…), dynamic URL construction
 *   (concatenation, URL API, template expressions), and non-string values.
 *   Those require a full JS AST and are caught at code-review time.
 * First-party exclusions: none.  All external URLs are evaluated against
 *   ALLOW_LIST regardless of host, consistent with the HTML/CSS scanner.
 *   Legitimate project URLs (e.g. the deployed github.io origin) must be
 *   added to ALLOW_LIST with a policy justification.
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
const JS_EXT   = new Set([".js"]); // bundled Vite output; see JS chunk decision above

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * URL-structural HTML named character references.
 *
 * Covers every named entity whose decoded form is a character that appears
 * in an absolute or protocol-relative URL (scheme, host, path, query,
 * fragment, credentials).  Unknown named refs are left unchanged so we do
 * not silently mangle non-URL content.
 *
 * The five HTML-mandatory named entities (amp, lt, gt, quot, apos) are
 * included here; the explicit `.replace(/&amp;/gi, …)` calls that preceded
 * this table have been removed to avoid double-processing.
 */
const HTML_URL_NAMED_ENTITIES = {
  // HTML-mandatory set
  amp: "&", AMP: "&",
  lt: "<",  LT: "<",
  gt: ">",  GT: ">",
  quot: '"', QUOT: '"',
  apos: "'",
  // URL scheme / authority separators
  colon: ":", Colon: ":", COLON: ":",
  sol: "/",  solidus: "/",
  period: ".", dot: ".",
  commat: "@",
  // Query / fragment
  quest: "?",
  num: "#",
  percnt: "%",
  // Common URL chars
  hyphen: "-", dash: "-",
  lowbar: "_", lowline: "_",
  plus: "+",
  equals: "=",
  tilde: "~",  Tilde: "~",
  lpar: "(",   rpar: ")",
  lsqb: "[",   rsqb: "]",
};

/**
 * Decodes HTML character references in an attribute value so that encoded
 * URLs such as `https&#58;//cdn.example.com/lib.js` or
 * `https&colon;&sol;&sol;cdn.example.com/lib.js` are normalised to their
 * browser-equivalent form before external-URL detection.
 *
 * Covers:
 *   Named refs from HTML_URL_NAMED_ENTITIES (URL-structural characters)
 *   Decimal refs:  &#NNN;   (e.g. &#58; → ':')
 *   Hex refs:      &#xHH;   (e.g. &#x3A; → ':', case-insensitive)
 *
 * CSS does not use HTML entity encoding, so this function is applied only
 * to HTML attribute values extracted by attrValue() and srcsetUrls().
 */
function decodeHtmlEntities(str) {
  return str
    // Named character references — URL-structural subset
    .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g,
      (match, name) => HTML_URL_NAMED_ENTITIES[name] ?? match)
    // Decimal numeric references: &#NNN;
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(parseInt(code, 10)))
    // Hexadecimal numeric references: &#xHH;
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
}

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
  // Use (?<![:\w]) instead of \b so that a namespace-prefixed attribute like
  // xlink:href is NOT matched when looking for plain href.  The character
  // before a plain attribute name is always whitespace or the opening <,
  // neither of which is in [:\w].  A colon IS in [:\w], so xlink:href is
  // excluded when attrName === "href" — preventing double-counting when
  // both href and xlink:href are checked on the same element.
  // Quoted: attr="value" or attr='value'
  const quoted = new RegExp(
    `(?<![:\\w])${attrName}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`,
    "i",
  );
  const mq = quoted.exec(tag);
  if (mq) return decodeHtmlEntities((mq[1] ?? mq[2]).trim());

  // Unquoted: attr=value (stops at whitespace, >, or />)
  const unquoted = new RegExp(
    `(?<![:\\w])${attrName}\\s*=\\s*([^"'\\s>]+)`,
    "i",
  );
  const mu = unquoted.exec(tag);
  return mu ? decodeHtmlEntities(mu[1].trim()) : null;
}

// Parses a srcset attribute value and returns all candidate URLs.
// srcset is a comma-separated list; each entry is "url [descriptor]".
// Entity-decodes each candidate so encoded URLs are normalised before checking.
function srcsetUrls(srcset) {
  if (!srcset) return [];
  return srcset
    .split(",")
    .map((entry) => decodeHtmlEntities(entry.trim().split(/\s+/)[0]))
    .filter(Boolean);
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
// The attribute section uses (?:[^>"']|"[^"]*"|'[^']*')* so that a literal
// > inside a quoted attribute value (e.g. alt="a > b") does not prematurely
// end the tag match and cause subsequent attributes to be missed.
const COMMENT_RE   = /<!--[\s\S]*?-->/g;
const TAG_RE       = /<([a-z][a-z0-9-]*)(\s(?:[^>"']|"[^"]*"|'[^']*')*)?\s*\/?>/gi;
// Matches the full <style>…</style> block; opening tag is attribute-aware so
// a > inside a type="text/css" or similar attribute does not cut it short.
const STYLE_BLOCK_RE = /<style\b(?:[^>"']|"[^"]*"|'[^']*')*>([\s\S]*?)<\/style>/gi;

function extractHtmlUrls(src) {
  // Strip HTML comments — a URL inside <!-- … --> is not fetched.
  const stripped = src.replace(COMMENT_RE, "");
  const hits = [];

  // ── Inline <style> blocks ─────────────────────────────────────────────────
  // CSS inside <style>…</style> is parsed by the browser identically to a
  // linked stylesheet — both @import and url() trigger fetches.
  STYLE_BLOCK_RE.lastIndex = 0;
  let sm;
  while ((sm = STYLE_BLOCK_RE.exec(stripped)) !== null) {
    for (const url of extractCssUrls(sm[1])) {
      if (!isAllowed(url)) hits.push(url);
    }
  }

  let m;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(stripped)) !== null) {
    const tag      = m[0];
    const tagName  = m[1].toLowerCase();

    // <a href> and <area href> are user-navigation hyperlinks — not fetched.
    if (tagName === "a" || tagName === "area") continue;

    // ── <base href> ──────────────────────────────────────────────────────
    // An external <base href> rewrites every relative URL in the document
    // to the external host — even local-looking paths like src="app.js"
    // would resolve through the CDN.  Flag any external base href directly.
    if (tagName === "base") {
      const hrefVal = attrValue(tag, "href");
      if (hrefVal && isExternalUrl(hrefVal)) hits.push(hrefVal);
      continue;
    }

    // ── style attribute ── (any element) ────────────────────────────────
    // Inline styles are parsed by the browser as CSS — url() values in
    // background-image, cursor, mask-image, etc. trigger fetches.
    const styleAttr = attrValue(tag, "style");
    if (styleAttr) {
      for (const url of extractCssUrls(styleAttr)) {
        if (!isAllowed(url)) hits.push(url);
      }
    }

    // ── src attribute ── (script, img, iframe, audio, video, source,
    //                      track, embed, input, …)
    const srcVal = attrValue(tag, "src");
    if (srcVal && isExternalUrl(srcVal)) hits.push(srcVal);

    // ── srcset attribute on <img> and <source> ───────────────────────────
    // srcset is a comma-separated list of "url [descriptor]" entries;
    // any external URL in the list triggers a browser fetch.
    if (tagName === "img" || tagName === "source") {
      const srcset = attrValue(tag, "srcset");
      if (srcset) {
        for (const u of srcsetUrls(srcset)) {
          if (isExternalUrl(u)) hits.push(u);
        }
      }
    }

    // ── href attribute on <link> ─────────────────────────────────────────
    if (tagName === "link") {
      const hrefVal = attrValue(tag, "href");
      if (hrefVal && isExternalUrl(hrefVal) && linkIsFetchable(tag)) {
        hits.push(hrefVal);
      }
      // imagesrcset on <link rel=preload as=image> — the browser selects the
      // best-matching candidate from this srcset and fetches it, bypassing
      // href entirely when viewport conditions match a descriptor.
      const imagesrcset = attrValue(tag, "imagesrcset");
      if (imagesrcset) {
        for (const u of srcsetUrls(imagesrcset)) {
          if (isExternalUrl(u)) hits.push(u);
        }
      }
      continue; // link attributes fully handled; skip remaining checks
    }

    // ── background attribute ── (body, table, tr, td, th — legacy) ───────
    // Still parsed and fetched by all modern browsers despite being
    // deprecated; an external background attribute bypasses the guard
    // completely unless caught here.
    const bgVal = attrValue(tag, "background");
    if (bgVal && isExternalUrl(bgVal)) hits.push(bgVal);

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

    // ── SVG resource elements: <image>, <use>, <feImage> ────────────────
    // These SVG elements cause the browser to fetch the referenced resource:
    //   <image>   — embeds an external bitmap or SVG document
    //   <use>     — references an external SVG fragment
    //   <feImage> — SVG filter primitive that loads an external image asset
    // Both the modern href and the legacy xlink:href form are checked.
    if (tagName === "image" || tagName === "use" || tagName === "feimage") {
      const hrefVal = attrValue(tag, "href");
      if (hrefVal && isExternalUrl(hrefVal)) hits.push(hrefVal);
      // xlink:href — namespace-prefixed legacy form still used in inline SVG
      const xlinkHref = attrValue(tag, "xlink:href");
      if (xlinkHref && isExternalUrl(xlinkHref)) hits.push(xlinkHref);
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

/**
 * Decodes CSS escape sequences so that a URL like
 *   url(https\3a//cdn.example.com/x.css)
 * is normalised to https://cdn.example.com/x.css before pattern matching.
 *
 * CSS escape spec (§4.3.8):
 *   \HHHHHH [optional single whitespace] — hex code point, 1–6 digits
 *   \X                                   — literal character X (non-hex form)
 */
function decodeCssEscapes(str) {
  return str
    .replace(/\\([0-9a-fA-F]{1,6})[ \t\r\n\f]?/g,
      (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/\\(.)/gs, "$1");
}

function extractCssUrls(src) {
  // Strip CSS block comments so URLs inside comments are not flagged.
  const stripped = src.replace(/\/\*[\s\S]*?\*\//g, "");
  // Decode CSS escape sequences so encoded characters (e.g. \3a → ':')
  // do not bypass the https?:// pattern match.
  const decoded = decodeCssEscapes(stripped);
  const hits = [];
  let m;
  IMPORT_RE.lastIndex = 0;
  while ((m = IMPORT_RE.exec(decoded)) !== null) hits.push(m[1].trim());
  URL_RE.lastIndex = 0;
  while ((m = URL_RE.exec(decoded)) !== null) hits.push(m[1].trim());
  return [...new Set(hits)];
}

// ─── JS chunk scanner ────────────────────────────────────────────────────────
//
// All external URLs found in JS string literals are evaluated against
// ALLOW_LIST by the caller (runCheck), consistent with the HTML/CSS scanner.
// No host-based exemptions are applied here: any legitimate project URL that
// appears as a string literal in a built chunk must be explicitly allow-listed.

// Matches http:// or https:// URLs inside string delimiters (", ', `).
// Both schemes are matched, consistent with isExternalUrl() used by the
// HTML/CSS scanners.  The opening-delimiter requirement means a bare URL in a
// line comment (`// see https://…`) has no preceding quote and is not matched,
// avoiding false positives without needing to strip line comments (which would
// also strip the `//` inside string URLs themselves).
const JS_URL_RE = /["'`](https?:\/\/[^"'`\s\\]{4,})/gi;

function extractJsUrls(src) {
  // Strip block comments (licence headers, etc.) so URLs inside them are
  // not reported.  Line comments are excluded by JS_URL_RE's quote requirement.
  const stripped = src.replace(/\/\*[\s\S]*?\*\//g, "");
  const hits = [];
  let m;
  JS_URL_RE.lastIndex = 0;
  while ((m = JS_URL_RE.exec(stripped)) !== null) {
    hits.push(m[1]);
  }
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

  for (const file of walk(root, JS_EXT)) {
    const src = readFileSync(file, "utf8");
    for (const url of extractJsUrls(src)) {
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

    // ── srcset ─────────────────────────────────────────────────────────────

    check("external <img srcset> URLs are flagged (both descriptors)", () => {
      const v = scan("index.html",
        `<img src="/local.jpg" srcset="https://cdn.example.com/img@1x.png 1x, https://cdn.example.com/img@2x.png 2x" alt="">`
      );
      assert(v.length === 2, `expected 2 violations (both srcset URLs), got ${v.length}`);
    });

    check("external <source srcset> inside <picture> is flagged", () => {
      const v = scan("index.html", `
        <picture>
          <source srcset="https://cdn.example.com/img.webp" type="image/webp">
        </picture>
      `);
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("local-only <img srcset> is NOT flagged", () => {
      const v = scan("index.html",
        `<img srcset="/img/photo@1x.png 1x, /img/photo@2x.png 2x" alt="">`
      );
      assert(v.length === 0, `local srcset should not be flagged`);
    });

    // ── SVG resource references ────────────────────────────────────────────

    check("SVG <image href> pointing to external bitmap is flagged", () => {
      const v = scan("index.html",
        `<svg><image href="https://cdn.example.com/photo.jpg" width="100" height="100"></image></svg>`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("SVG <image xlink:href> (legacy) pointing to external bitmap is flagged", () => {
      const v = scan("index.html",
        `<svg xmlns:xlink="http://www.w3.org/1999/xlink"><image xlink:href="https://cdn.example.com/photo.jpg"></image></svg>`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("SVG <use href> referencing an external SVG document is flagged", () => {
      const v = scan("index.html",
        `<svg><use href="https://cdn.example.com/sprite.svg#icon"></use></svg>`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("SVG <use href> with a same-origin fragment reference is NOT flagged", () => {
      const v = scan("index.html",
        `<svg><use href="/assets/sprite.svg#icon"></use></svg>`
      );
      assert(v.length === 0, `same-origin SVG use should not be flagged`);
    });

    check("SVG <feImage href> fetching an external image is flagged", () => {
      // feImage is an SVG filter primitive that loads a raster or vector image;
      // an external href causes a third-party fetch.
      const v = scan("index.html",
        `<svg><filter id="f"><feImage href="https://cdn.example.com/texture.png"/></filter></svg>`
      );
      assert(v.length === 1, `feImage href must be flagged; got ${v.length}`);
    });

    // ── <base href> ────────────────────────────────────────────────────────
    // An external <base href> silently redirects every relative resource URL
    // (script src, img src, link href, etc.) to a CDN host.

    check("external <base href> is flagged", () => {
      const v = scan("index.html",
        `<base href="https://cdn.example.com/assets/">`
      );
      assert(v.length === 1, `external base href must be flagged; got ${v.length}`);
    });

    check("protocol-relative <base href> is flagged", () => {
      const v = scan("index.html",
        `<base href="//cdn.example.com/assets/">`
      );
      assert(v.length === 1, `protocol-relative base href must be flagged; got ${v.length}`);
    });

    check("local <base href> is NOT flagged", () => {
      const v = scan("index.html", `<base href="/assets/">`);
      assert(v.length === 0, `local base href should not be flagged; got ${v.length}`);
    });

    // ── Inline <style> blocks ──────────────────────────────────────────────

    check("external @import in <style> block is flagged", () => {
      const v = scan("index.html",
        `<style>@import "https://fonts.googleapis.com/css2?family=Inter";</style>`
      );
      assert(v.length === 1, `@import in <style> block must be flagged; got ${v.length}`);
    });

    check("external url() in <style> block is flagged", () => {
      const v = scan("index.html",
        `<style>body { background-image: url("https://cdn.example.com/bg.png"); }</style>`
      );
      assert(v.length === 1, `url() in <style> block must be flagged; got ${v.length}`);
    });

    check("<style> block with only local url() is NOT flagged", () => {
      const v = scan("index.html",
        `<style>body { background-image: url("/images/bg.png"); }</style>`
      );
      assert(v.length === 0, `local url() in <style> should not be flagged; got ${v.length}`);
    });

    check("CSS comment inside <style> block does not hide external URL", () => {
      // The URL inside the CSS comment must not be flagged; the URL outside must be.
      const v = scan("index.html",
        `<style>/* see https://cdn.example.com/ref */ body { color: red; }</style>`
      );
      assert(v.length === 0, `URL inside CSS comment in <style> must not be flagged; got ${v.length}`);
    });

    // ── Inline style= attributes ───────────────────────────────────────────

    check("external url() in inline style= attribute is flagged", () => {
      const v = scan("index.html",
        `<div style="background-image: url('https://cdn.example.com/photo.jpg')">content</div>`
      );
      assert(v.length === 1, `url() in inline style attr must be flagged; got ${v.length}`);
    });

    check("protocol-relative url() in inline style= attribute is flagged", () => {
      const v = scan("index.html",
        `<div style="background: url(//cdn.example.com/bg.png) center">content</div>`
      );
      assert(v.length === 1, `protocol-relative url() in inline style must be flagged; got ${v.length}`);
    });

    check("local url() in inline style= attribute is NOT flagged", () => {
      const v = scan("index.html",
        `<div style="background-image: url('/images/hero.png')">content</div>`
      );
      assert(v.length === 0, `local url() in inline style must not be flagged; got ${v.length}`);
    });

    // ── imagesrcset on <link> ──────────────────────────────────────────────
    // <link rel=preload as=image imagesrcset="url 1x, url 2x"> causes the
    // browser to fetch the best candidate from imagesrcset, bypassing href.

    check("<link imagesrcset> with external URLs is flagged", () => {
      const v = scan("index.html",
        `<link rel="preload" as="image" imagesrcset="https://cdn.example.com/img@1x.png 1x, https://cdn.example.com/img@2x.png 2x">`
      );
      assert(v.length === 2, `both imagesrcset candidates must be flagged; got ${v.length}`);
    });

    check("<link imagesrcset> with only local URLs is NOT flagged", () => {
      const v = scan("index.html",
        `<link rel="preload" as="image" href="/img/local.png" imagesrcset="/img/local@1x.png 1x, /img/local@2x.png 2x">`
      );
      assert(v.length === 0, `local imagesrcset should not be flagged; got ${v.length}`);
    });

    // ── Legacy background= attribute ───────────────────────────────────────
    // Deprecated but still fetched by all modern browsers.

    check("legacy <body background> with external URL is flagged", () => {
      const v = scan("index.html",
        `<body background="https://cdn.example.com/bg.png">`
      );
      assert(v.length === 1, `body background must be flagged; got ${v.length}`);
    });

    check("legacy <td background> with external URL is flagged", () => {
      const v = scan("index.html",
        `<table><tr><td background="https://cdn.example.com/cell-bg.png">cell</td></tr></table>`
      );
      assert(v.length === 1, `td background must be flagged; got ${v.length}`);
    });

    check("legacy background= with local URL is NOT flagged", () => {
      const v = scan("index.html", `<body background="/images/bg.png">`);
      assert(v.length === 0, `local background attr should not be flagged; got ${v.length}`);
    });

    // ── > inside quoted attribute value ────────────────────────────────────

    check("'>' inside a quoted alt attribute does not break src extraction", () => {
      const v = scan("index.html",
        `<img alt="score > 0" src="https://cdn.example.com/photo.jpg">`
      );
      assert(v.length === 1, `> inside double-quoted attr must not break src parsing; got ${v.length}`);
    });

    check("'>' inside a single-quoted attribute does not break src extraction", () => {
      const v = scan("index.html",
        `<img alt='score > 0' src="https://cdn.example.com/photo.jpg">`
      );
      assert(v.length === 1, `> inside single-quoted attr must not break src parsing; got ${v.length}`);
    });

    // ── HTML entity decoding ───────────────────────────────────────────────
    // Browsers decode character references before fetching URLs, so the guard
    // must do the same.  Without decoding, `&#58;` (the colon in https:)
    // would bypass the https?:// check and allow a CDN URL to ship silently.

    check("decimal entity in <script src> is decoded and flagged (&#58; → ':')", () => {
      const v = scan("index.html",
        `<script src="https&#58;//cdn.example.com/lib.js"></script>`
      );
      assert(v.length === 1, `decimal entity must be decoded; got ${v.length}`);
      assert(v[0].url === "https://cdn.example.com/lib.js", `decoded URL mismatch: ${v[0]?.url}`);
    });

    check("hex entity in <script src> is decoded and flagged (&#x3A; → ':')", () => {
      const v = scan("index.html",
        `<script src="https&#x3A;//cdn.example.com/lib.js"></script>`
      );
      assert(v.length === 1, `hex entity must be decoded; got ${v.length}`);
    });

    check("decimal entity in <img src> is decoded and flagged", () => {
      const v = scan("index.html",
        `<img src="https&#58;//cdn.example.com/photo.jpg" alt="">`
      );
      assert(v.length === 1, `decimal entity in img src must be decoded; got ${v.length}`);
    });

    check("hex entity in <link href> is decoded and flagged", () => {
      const v = scan("index.html",
        `<link rel="stylesheet" href="https&#x3A;//fonts.googleapis.com/css2?family=Inter">`
      );
      assert(v.length === 1, `hex entity in link href must be decoded; got ${v.length}`);
    });

    check("named entity &amp; in URL is decoded before checking", () => {
      // Encode the colon in the GTM URL with &#58; to confirm the decoded URL
      // matches the ALLOW_LIST entry and is not flagged.
      // Decoded value: https://www.googletagmanager.com/gtag/js?id=G-89W66VMGPB
      const v = scan("index.html",
        `<script src="https&#58;//www.googletagmanager.com/gtag/js?id=G-89W66VMGPB"></script>`
      );
      assert(v.length === 0, `entity-encoded GTM URL must decode to the allow-listed value; got ${v.length}`);
    });

    check("&colon; named entity in <script src> is decoded and flagged", () => {
      // &colon; is a valid HTML5 named character reference for ':'.
      // Without named-entity decoding beyond the 5-basic set, this bypasses
      // the https?:// pattern check.
      const v = scan("index.html",
        `<script src="https&colon;&sol;&sol;cdn.example.com/lib.js"></script>`
      );
      assert(v.length === 1, `&colon;&sol;&sol; must decode to https:// and be flagged; got ${v.length}`);
    });

    check("&colon; named entity in <img src> is decoded and flagged", () => {
      const v = scan("index.html",
        `<img src="https&colon;&sol;&sol;cdn.example.com/photo.jpg" alt="">`
      );
      assert(v.length === 1, `named entity bypass in img src must be caught; got ${v.length}`);
    });

    // ── CSS escape sequences ───────────────────────────────────────────────
    // CSS \HHHHHH escape sequences are decoded by the CSS parser before
    // fetching resources; without decoding, \3a (→ ':') bypasses https?://.

    check("CSS hex escape \\3a in url() in standalone CSS is decoded and flagged", () => {
      const v = scan("style.css",
        `body { background-image: url(https\\3a//cdn.example.com/bg.png); }`
      );
      assert(v.length === 1, `CSS \\3a escape must decode to ':' and be flagged; got ${v.length}`);
    });

    check("CSS hex escapes \\3a and \\2F in url() decode to ':' and '/' and are flagged", () => {
      // \\3a → ':', \\2F → '/' when the next character is non-hex.
      // Domain starts with 'w' (non-hex), so \\2F is unambiguously 2 hex chars.
      const v = scan("style.css",
        `body { background: url(https\\3a\\2F\\2Fwww.example.com/bg.png); }`
      );
      assert(v.length === 1, `CSS \\3a and \\2F escapes must decode to ':' and '/' and be flagged; got ${v.length}`);
    });

    check("CSS hex escape \\3a in url() inside <style> block is decoded and flagged", () => {
      const v = scan("index.html",
        `<style>body { background-image: url(https\\3a//cdn.example.com/bg.png); }</style>`
      );
      assert(v.length === 1, `CSS escape in <style> block must be decoded; got ${v.length}`);
    });

    check("CSS hex escape \\3a in url() inside inline style= is decoded and flagged", () => {
      const v = scan("index.html",
        `<div style="background:url(https\\3a//cdn.example.com/x.png)">x</div>`
      );
      assert(v.length === 1, `CSS escape in style attr must be decoded; got ${v.length}`);
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

    // ── JS chunk scanning (Decision S26) ───────────────────────────────────
    // These fixtures confirm that a Vite plugin injecting a CDN URL directly
    // into a bundled .js chunk is caught by the post-build dist/ pass.
    // Both http:// and https:// are matched, consistent with the HTML/CSS
    // scanners.  No host-based exemptions apply — all unlisted external URLs
    // are flagged regardless of host.

    check("https:// CDN URL string literal in a JS chunk (double-quoted) is flagged", () => {
      const v = scan("chunk.js",
        `const BASE="https://unpkg.com/some-lib@1.0/dist/lib.js";fetch(BASE);`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
      assert(v[0].url.includes("unpkg.com"), `expected unpkg URL, got ${v[0]?.url}`);
    });

    check("http:// CDN URL string literal in a JS chunk is flagged (same as https)", () => {
      // http:// and https:// are treated identically, consistent with isExternalUrl().
      const v = scan("chunk.js",
        `const BASE="http://unpkg.com/some-lib@1.0/dist/lib.js";fetch(BASE);`
      );
      assert(v.length === 1, `http:// CDN URL must be flagged; got ${v.length}`);
      assert(v[0].url.startsWith("http://unpkg.com"), `expected http://unpkg URL, got ${v[0]?.url}`);
    });

    check("CDN URL string literal in a JS chunk (single-quoted) is flagged", () => {
      const v = scan("chunk.js",
        `const url='https://cdn.jsdelivr.net/npm/some-lib@1.0/dist/lib.js';`
      );
      assert(v.length === 1, `expected 1 violation, got ${v.length}`);
    });

    check("CDN URL in a JS template literal is flagged", () => {
      const v = scan("chunk.js",
        "const u=`https://cdn.example.com/api/v1/data.json`;"
      );
      assert(v.length === 1, `template-literal CDN URL must be flagged; got ${v.length}`);
    });

    check("multiple CDN URL literals in a JS chunk are each flagged", () => {
      const v = scan("chunk.js", [
        `import("https://cdn.jsdelivr.net/npm/lib-a@1/lib-a.js");`,
        `import("https://cdn.skypack.dev/lib-b@2");`,
      ].join("\n"));
      assert(v.length === 2, `expected 2 violations, got ${v.length}`);
    });

    check("allowed GTM URL literal in a JS chunk is NOT flagged", () => {
      const v = scan("chunk.js",
        `const s="https://www.googletagmanager.com/gtag/js?id=G-89W66VMGPB";`
      );
      assert(v.length === 0, `allow-listed GTM URL must not be flagged in JS; got ${v.length}`);
    });

    check("localhost URL literal in a JS chunk IS flagged — no host exemptions in JS scanner", () => {
      // No host-based exemptions: any unlisted URL is flagged, consistent with
      // the HTML/CSS scanner.  Legitimate project URLs must be in ALLOW_LIST.
      const v = scan("chunk.js", `const api="https://localhost:3000/api";`);
      assert(v.length === 1, `localhost must be flagged without an allow-list entry; got ${v.length}`);
    });

    check("github.io URL literal in a JS chunk IS flagged — no host exemptions in JS scanner", () => {
      // Multi-tenant domain: okhp3.github.io is the project's own host, but
      // other-actor.github.io is not.  No wildcard exemption is applied;
      // the specific project origin must be added to ALLOW_LIST if needed.
      const v = scan("chunk.js",
        `const base="https://other-actor.github.io/cdn/lib.js";`
      );
      assert(v.length === 1, `unlisted github.io URL must be flagged; got ${v.length}`);
    });

    check("CDN URL inside a JS block comment is NOT flagged", () => {
      const v = scan("chunk.js",
        `/* Injected from https://unpkg.com/some-lib@1.0 */\nconst x=42;`
      );
      assert(v.length === 0, `URL inside JS block comment must not be flagged; got ${v.length}`);
    });

    check("CDN URL in a JS line comment (no surrounding quotes) is NOT flagged", () => {
      // No opening quote before https:// — JS_URL_RE does not match.
      const v = scan("chunk.js",
        `// See https://cdn.jsdelivr.net/npm/some-lib for reference\nconst x=42;`
      );
      assert(v.length === 0, `URL in JS line comment must not be flagged; got ${v.length}`);
    });

    check("local relative path in a JS string is NOT flagged", () => {
      const v = scan("chunk.js", `const p="/assets/images/sprite.svg";`);
      assert(v.length === 0, `local path in JS must not be flagged; got ${v.length}`);
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
