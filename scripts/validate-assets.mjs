#!/usr/bin/env node

/**
 * Release gate for the public asset pipeline.
 *
 * This intentionally reads the TypeScript manifest as text: the validator is
 * a Node ESM script and does not need a TypeScript runtime or a browser build.
 * It validates generated files without writing or repairing them.
 */
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const ASSETS = path.join(PUBLIC, "assets");
const SOURCE_ASSETS = path.join(ROOT, "asset-source");
const MANIFEST = path.join(ROOT, "src", "ui", "asset-manifest.ts");

const EXPECTED_SYMBOL_IDS = [
  "tumbler",
  "butterfly",
  "mixtape",
  "crystal",
  "chai",
  "candle",
  "cassette",
  "gnome",
  "mailbox",
  "vhs",
  "teapot",
  "yarn",
  "doorbell",
  "chai_pump",
  "treat_chicken",
  "treat_salmon",
  "treat_bougie",
  "wild_joey",
  "wild_phoebe",
  "wild_handbag",
  "wild_chai",
  "uniglee",
];

const ATLAS_EXPECTATIONS = [
  {
    name: "standard",
    png: "assets/atlases/standard-symbol-atlas.png",
    webp: "assets/atlases/standard-symbol-atlas.webp",
    width: 1280,
    height: 1280,
  },
  {
    name: "special",
    png: "assets/atlases/special-symbol-atlas.png",
    webp: "assets/atlases/special-symbol-atlas.webp",
    width: 1280,
    height: 640,
  },
];

// Keep this list synchronized with scripts/generate-assets.mjs. These are
// generated runtime derivatives; the checked-in files remain the masters.
const WEBP_DERIVATIVES = [
  ["assets/askjamie-avatar.jpg", "assets/optimized/askjamie-avatar.webp"],
  ["assets/chai-chase-splash.png", "assets/optimized/chai-chase-splash.webp"],
  ["assets/joey-phoebe-wheel.png", "assets/optimized/joey-phoebe-wheel.webp"],
  ["assets/joey-phoebe-wilds.png", "assets/optimized/joey-phoebe-wilds.webp"],
  [
    "assets/keepsake-memory-card-back.png",
    "assets/optimized/keepsake-memory-card-back.webp",
  ],
  [
    "assets/keepsake-memory-mismatch-overlay.png",
    "assets/optimized/keepsake-memory-mismatch-overlay.webp",
  ],
  ["assets/social-preview.jpg", "assets/optimized/social-preview.webp"],
];

const failures = [];

function fail(message) {
  failures.push(message);
}

function absolutePublicPath(relativePath) {
  return path.join(PUBLIC, relativePath);
}

function absoluteSourcePath(relativePath) {
  return path.join(SOURCE_ASSETS, relativePath);
}

async function fileExists(relativePath) {
  try {
    return (await stat(absolutePublicPath(relativePath))).isFile();
  } catch {
    return false;
  }
}

async function readManifest() {
  let source;
  try {
    source = await readFile(MANIFEST, "utf8");
  } catch (error) {
    fail(`Cannot read src/ui/asset-manifest.ts: ${error.message}`);
    return { symbolIds: [], svgSources: [] };
  }

  const declarationStart = source.indexOf("export const SYMBOL_ASSETS");
  const objectStart = source.indexOf("{", declarationStart);
  const objectEnd = source.indexOf("\n};", objectStart);
  if (declarationStart < 0 || objectStart < 0 || objectEnd < 0) {
    fail("Could not parse SYMBOL_ASSETS from src/ui/asset-manifest.ts");
    return { symbolIds: [], svgSources: [] };
  }

  const symbolBlock = source.slice(objectStart + 1, objectEnd);
  const symbolIds = [...symbolBlock.matchAll(/^[ \t]{2}([a-z][a-z0-9_]*)\s*:/gm)].map(
    ([, id]) => id,
  );
  const svgSources = [...symbolBlock.matchAll(/source:\s*["']([^"']+\.svg)["']/gim)].map(
    ([, sourcePath]) => sourcePath,
  );

  return { symbolIds, svgSources };
}

function validateManifest(symbolIds) {
  const expected = new Set(EXPECTED_SYMBOL_IDS);
  const actual = new Set(symbolIds);

  for (const id of EXPECTED_SYMBOL_IDS) {
    if (!actual.has(id)) fail(`Manifest is missing canonical symbol ID: ${id}`);
  }
  for (const id of actual) {
    if (!expected.has(id)) fail(`Manifest contains unknown symbol ID: ${id}`);
  }
  if (symbolIds.length !== actual.size) {
    fail("Manifest contains duplicate canonical symbol IDs");
  }
  if (symbolIds.length !== EXPECTED_SYMBOL_IDS.length) {
    fail(
      `Manifest has ${symbolIds.length} symbol IDs; expected ${EXPECTED_SYMBOL_IDS.length}`,
    );
  }
}

async function inspectRaster(relativePath, { format, width, height, label }) {
  const filePath = relativePath.startsWith("source/")
    ? absoluteSourcePath(relativePath.slice("source/".length))
    : absolutePublicPath(relativePath);
  if (!(await fileExists(relativePath))) {
    fail(`${label}: missing ${relativePath}`);
    return null;
  }

  try {
    const metadata = await sharp(filePath).metadata();
    if (metadata.format !== format) {
      fail(`${label}: ${relativePath} is ${metadata.format ?? "unknown"}; expected ${format}`);
    }
    if (width !== undefined && metadata.width !== width) {
      fail(`${label}: ${relativePath} is ${metadata.width}px wide; expected ${width}px`);
    }
    if (height !== undefined && metadata.height !== height) {
      fail(`${label}: ${relativePath} is ${metadata.height}px high; expected ${height}px`);
    }
    if (!metadata.width || !metadata.height) {
      fail(`${label}: ${relativePath} has no usable dimensions`);
    }
    return metadata;
  } catch (error) {
    fail(`${label}: ${relativePath} is not a readable image (${error.message})`);
    return null;
  }
}

async function validateAtlases() {
  for (const atlas of ATLAS_EXPECTATIONS) {
    await inspectRaster(atlas.png, {
      format: "png",
      width: atlas.width,
      height: atlas.height,
      label: `${atlas.name} atlas PNG`,
    });
    await inspectRaster(atlas.webp, {
      format: "webp",
      width: atlas.width,
      height: atlas.height,
      label: `${atlas.name} atlas WebP`,
    });
  }
}

async function validateWebpDerivatives() {
  for (const [sourcePath, derivativePath] of WEBP_DERIVATIVES) {
    const sourceMetadata = await inspectRaster(sourcePath, {
      format: path.extname(sourcePath).slice(1).toLowerCase() === "jpg" ? "jpeg" : "png",
      label: "Raster master",
    });
    const derivativeMetadata = await inspectRaster(derivativePath, {
      format: "webp",
      label: "WebP derivative",
    });

    if (
      sourceMetadata &&
      derivativeMetadata &&
      (sourceMetadata.width !== derivativeMetadata.width ||
        sourceMetadata.height !== derivativeMetadata.height)
    ) {
      fail(
        `WebP derivative ${derivativePath} is ${derivativeMetadata.width}x${derivativeMetadata.height}; ` +
          `expected the master dimensions ${sourceMetadata.width}x${sourceMetadata.height}`,
      );
    }
  }
}

async function collectSvgFiles(directory, relativeDirectory = "") {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    fail(`Cannot inspect SVG directory ${relativeDirectory || "public/assets"}: ${error.message}`);
    return [];
  }

  const files = [];
  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name);
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSvgFiles(absolutePath, relativePath)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".svg")) {
      files.push(path.join("assets", relativePath).replaceAll(path.sep, "/"));
    }
  }
  return files;
}

function svgHasForbiddenContent(source) {
  return [
    [/<\s*image\b/i, "<image> elements"],
    [/<\s*script\b/i, "<script> elements"],
    [/<\s*foreignObject\b/i, "<foreignObject> elements"],
    [/<!(?:DOCTYPE|ENTITY)\b[^>]*(?:SYSTEM|PUBLIC)?/i, "DOCTYPE/ENTITY declarations"],
    [/(?:xlink:)?href\s*=\s*["']\s*(?:https?:|\/\/|data:|javascript:|[a-z][a-z0-9+.-]*:)/i, "external href references"],
    [/url\(\s*["']?(?:https?:|\/\/|data:|[a-z][a-z0-9+.-]*:)/i, "external CSS/url references"],
    [/@import\b/i, "CSS @import rules"],
  ].find(([pattern]) => pattern.test(source))?.[1];
}

async function validateSvgs(svgSources) {
  const discovered = await collectSvgFiles(ASSETS);
  const required = new Set(svgSources);
  for (const sourcePath of required) {
    if (!(await fileExists(sourcePath))) {
      fail(`Manifest SVG source is missing: ${sourcePath}`);
    }
  }

  for (const relativePath of discovered) {
    let source;
    try {
      source = await readFile(absolutePublicPath(relativePath), "utf8");
    } catch (error) {
      fail(`Cannot read SVG ${relativePath}: ${error.message}`);
      continue;
    }
    if (!/<\s*svg\b/i.test(source)) fail(`SVG has no root <svg> element: ${relativePath}`);
    const violation = svgHasForbiddenContent(source);
    if (violation) fail(`SVG contains ${violation}: ${relativePath}`);
  }
}

async function main() {
  const { symbolIds, svgSources } = await readManifest();
  validateManifest(symbolIds);
  await validateAtlases();
  await validateWebpDerivatives();
  await validateSvgs(svgSources);

  if (failures.length > 0) {
    console.error(`Asset validation failed with ${failures.length} issue(s):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `Asset validation passed: ${EXPECTED_SYMBOL_IDS.length} manifest IDs, ` +
      `${ATLAS_EXPECTATIONS.length} atlases, ${WEBP_DERIVATIVES.length} WebP derivatives, ` +
      `${svgSources.length} manifest SVG sources.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
