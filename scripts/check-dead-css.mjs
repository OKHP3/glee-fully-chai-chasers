#!/usr/bin/env node
/**
 * CI guard — dead CSS selector check for src/style.css.
 *
 * An earlier audit removed 9 orphaned rules from src/style.css. This script
 * keeps that class of rot from coming back: every bare class selector in the
 * stylesheet must be emitted somewhere in the TypeScript source under src/
 * (or in index.html, where the splash markup lives).
 *
 * How classes are matched:
 *   - Class names are extracted from selectors after stripping comments,
 *     @keyframes bodies, pseudo-classes/elements, and attribute selectors.
 *   - A class counts as used when its full name appears as a substring in
 *     any .ts/.tsx file under src/, in index.html, or in the shipped scene
 *     HTML under artifacts/mockup-sandbox/public/scenes/ (scenes link the
 *     compiled stylesheet as ../game-style.css). This covers template
 *     literals, class="..." strings in rendered HTML, and classList calls.
 *   - Classes built dynamically at runtime (e.g. `cls--${variant}`) can't be
 *     found by substring search — list them in ALLOWLIST with a reason.
 *
 * Run directly:  node scripts/check-dead-css.mjs
 * Self-test:     node scripts/check-dead-css.mjs --self-test
 * npm alias:     npm run validate:dead-css
 *
 * Exit codes: 0 = every class has an emitter, 1 = dead selector(s) found.
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

/**
 * Classes the game emits dynamically (via template literals or runtime
 * composition) that substring search cannot see. Each entry needs a reason.
 * Keep this list SHORT — if it grows, prefer emitting full class names in code.
 */
const ALLOWLIST = new Map([
  // Currently empty: every dynamically composed class (cat-pop-asset--*,
  // theme-swatch--*, win-tier-*, is-failure) also appears statically in the
  // shipped scene HTML, so substring search finds it. Add entries here only
  // when a class is composed at runtime AND absent from all static markup.
]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

/** Extract every bare class name used in selectors of a stylesheet. */
function cssClassNames(css) {
  // Strip comments.
  let s = css.replace(/\/\*[\s\S]*?\*\//g, "");
  // Strip @keyframes bodies (their "selectors" are percentages/from/to).
  s = s.replace(/@keyframes\s+[\w-]+\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
  // Strip declaration blocks so we only look at selector text. Repeatedly
  // remove innermost braces (handles @media nesting).
  let prev;
  const selectorText = [];
  // Collect selector text: everything before each '{' at any nesting level.
  // Simple tokenizer: walk the string, track depth; selector chunks are the
  // text between a '}' (or start / '{' of an at-rule) and the next '{'.
  let chunk = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "{") {
      selectorText.push(chunk);
      chunk = "";
    } else if (ch === "}") {
      chunk = "";
    } else {
      chunk += ch;
    }
  }
  const names = new Set();
  for (const sel of selectorText) {
    if (sel.trim().startsWith("@")) continue; // at-rule preludes
    // Remove attribute selectors and pseudo(-element/class) segments, then
    // pull class tokens.
    const cleaned = sel.replace(/\[[^\]]*\]/g, "").replace(/::?[\w-]+(\([^)]*\))?/g, (m) =>
      m.startsWith(".") ? m : "",
    );
    for (const m of cleaned.matchAll(/\.([A-Za-z_][\w-]*)/g)) names.add(m[1]);
  }
  return names;
}

/** Runs the check. Returns true when no dead selectors were found. */
function runCheck(root, allowlist) {
  const cssPath = resolve(root, "src/style.css");
  const css = readFileSync(cssPath, "utf8");
  const classes = cssClassNames(css);
  if (classes.size === 0) {
    console.error("ERROR: no class selectors extracted from src/style.css — parser out of date?");
    return false;
  }

  const sources = walk(resolve(root, "src")).filter((f) => !f.endsWith(".css"));
  const indexHtml = resolve(root, "index.html");
  if (existsSync(indexHtml)) sources.push(indexHtml);
  // Shipped scene HTML links the compiled stylesheet (../game-style.css), so
  // classes used only by scenes are live too. The mockup-sandbox copy is the
  // source of truth; the root public/scenes copy is build output.
  const scenesDir = resolve(root, "artifacts/mockup-sandbox/public/scenes");
  if (existsSync(scenesDir)) {
    for (const name of readdirSync(scenesDir)) {
      if (name.endsWith(".html")) sources.push(join(scenesDir, name));
    }
  }
  const corpus = sources.map((f) => readFileSync(f, "utf8")).join("\n");

  let failed = false;
  const dead = [];
  for (const cls of [...classes].sort()) {
    if (corpus.includes(cls)) continue;
    if (allowlist.has(cls)) {
      console.log(`ALLOWED: .${cls} (${allowlist.get(cls)})`);
      continue;
    }
    dead.push(cls);
    failed = true;
  }

  // Stale allowlist entries should not linger once the selector is gone or
  // the class becomes statically referenced.
  for (const [cls, reason] of allowlist) {
    if (!classes.has(cls)) {
      console.error(`STALE ALLOWLIST: .${cls} is allowlisted (${reason}) but no longer in style.css — remove the entry.`);
      failed = true;
    } else if (corpus.includes(cls)) {
      console.error(`STALE ALLOWLIST: .${cls} is allowlisted (${reason}) but now statically referenced — remove the entry.`);
      failed = true;
    }
  }

  for (const cls of dead) {
    console.error(
      `DEAD SELECTOR: .${cls} appears in src/style.css but nothing under src/ (or index.html / shipped scene HTML) emits it — remove the rule or add the class to the markup (allowlist it only if it is composed dynamically).`,
    );
  }

  if (!failed) {
    console.log(`All ${classes.size} class selectors in src/style.css have an emitter in src/, index.html, or shipped scene HTML.`);
  }
  return !failed;
}

// ── Self-test ─────────────────────────────────────────────────────────────────

function selfTest() {
  const cases = [
    {
      name: "used classes pass (incl. template-literal and @media usage)",
      expectFail: false,
      files: {
        "src/style.css": `.cc-root { color: red; }\n.cc-btn:hover { color: blue; }\n@media (max-width: 700px) { .cc-btn { padding: 0; } }\n@keyframes spin { from { opacity: 0; } to { opacity: 1; } }\n`,
        "src/main.ts": "const html = `<div class=\"cc-root\"><button class=\"cc-btn\">go</button></div>`;\nconsole.log(html);\n",
      },
    },
    {
      name: "orphaned selector fails",
      expectFail: true,
      expectText: "DEAD SELECTOR: .cc-ghost",
      files: {
        "src/style.css": `.cc-root { color: red; }\n.cc-ghost { color: gray; }\n`,
        "src/main.ts": 'const html = `<div class="cc-root"></div>`;\nconsole.log(html);\n',
      },
    },
    {
      name: "index.html usage counts",
      expectFail: false,
      files: {
        "src/style.css": `.splash-hero { color: red; }\n`,
        "src/main.ts": "console.log(1);\n",
        "index.html": '<div class="splash-hero"></div>\n',
      },
    },
    {
      name: "pseudo-classes and attribute selectors do not create phantom classes",
      expectFail: false,
      files: {
        "src/style.css": `.cc-btn:focus-visible { outline: none; }\n.cc-btn[data-state="on"]::after { content: ""; }\n`,
        "src/main.ts": 'const c = "cc-btn";\nconsole.log(c);\n',
      },
    },
    {
      name: "class used only by shipped scene HTML counts as live",
      expectFail: false,
      files: {
        "src/style.css": `.aj-link { color: red; }\n`,
        "src/main.ts": "console.log(1);\n",
        "artifacts/mockup-sandbox/public/scenes/bubble.html": '<a class="aj-link">Ask Jamie</a>\n',
      },
    },
    {
      name: "allowlisted dynamically composed class passes",
      expectFail: false,
      extraArgs: ["--allow", "cc-pose--eat=composed dynamically"],
      files: {
        "src/style.css": `.cc-pose--eat { color: red; }\n`,
        "src/main.ts": "const cls = `cc-pose--${pose}`;\nconst pose = \"eat\";\nconsole.log(cls);\n",
      },
    },
    {
      name: "stale allowlist entry (class gone from stylesheet) fails",
      expectFail: true,
      expectText: "STALE ALLOWLIST: .cc-gone",
      extraArgs: ["--allow", "cc-gone=old dynamic class"],
      files: {
        "src/style.css": `.cc-root { color: red; }\n`,
        "src/main.ts": 'const html = `<div class="cc-root"></div>`;\nconsole.log(html);\n',
      },
    },
    {
      name: "stale allowlist entry (class now statically referenced) fails",
      expectFail: true,
      expectText: "STALE ALLOWLIST: .cc-static",
      extraArgs: ["--allow", "cc-static=was dynamic once"],
      files: {
        "src/style.css": `.cc-static { color: red; }\n`,
        "src/main.ts": 'const html = `<div class="cc-static"></div>`;\nconsole.log(html);\n',
      },
    },
  ];

  let ok = true;
  for (const c of cases) {
    const dir = mkdtempSync(join(tmpdir(), "dead-css-selftest-"));
    try {
      for (const [rel, content] of Object.entries(c.files)) {
        const p = resolve(dir, rel);
        mkdirSync(dirname(p), { recursive: true });
        writeFileSync(p, content);
      }
      const res = spawnSync(process.execPath, [SELF, "--check-root", dir, ...(c.extraArgs ?? [])], { encoding: "utf8" });
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

// ── Entry point ───────────────────────────────────────────────────────────────

if (process.argv.includes("--self-test")) {
  selfTest();
} else {
  const rootFlag = process.argv.indexOf("--check-root");
  const root = rootFlag !== -1 ? process.argv[rootFlag + 1] : DEFAULT_ROOT;
  // Fixture runs (--check-root) get an isolated allowlist supplied via
  // repeated `--allow cls=reason` flags; the real repo uses ALLOWLIST.
  let allowlist = ALLOWLIST;
  if (rootFlag !== -1) {
    allowlist = new Map();
    for (let i = 0; i < process.argv.length; i++) {
      if (process.argv[i] === "--allow") {
        const [cls, reason = "fixture"] = process.argv[i + 1].split("=");
        allowlist.set(cls, reason);
      }
    }
  }
  if (!runCheck(root, allowlist)) process.exit(1);
}
