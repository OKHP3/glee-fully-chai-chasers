#!/usr/bin/env node

/**
 * Build release-friendly atlases and WebP derivatives from the checked-in
 * raster masters. This script only writes generated files below
 * public/assets/atlases/ and public/assets/optimized/; it never removes or
 * mutates a source master.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = path.join(ROOT, "public", "assets");
const SOURCE_ASSETS = path.join(ROOT, "asset-source");
const ATLAS_DIR = path.join(ASSETS, "atlases");
const OPTIMIZED_DIR = path.join(ASSETS, "optimized");

const MASTER_ATLAS_SIZE = 1254;
const MASTER_ATLAS_GRID = 4;
const OUTPUT_CELL_SIZE = 320;
const OUTPUT_GRID_WIDTH = OUTPUT_CELL_SIZE * MASTER_ATLAS_GRID;
const SAFE_INSET = 12;
const ART_SIZE = OUTPUT_CELL_SIZE - SAFE_INSET * 2;

/** These dimensions are the current checked-in masters, not resize targets. */
const MASTER_DIMENSIONS = {
  "glee-symbol-atlas.png": [1254, 1254],
  "askjamie-avatar.jpg": [1024, 1024],
  "chai-chase-splash.png": [853, 1844],
  "handbag-wild.png": [1254, 1254],
  "joey-phoebe-wheel.png": [1536, 1024],
  "joey-phoebe-wilds.png": [1774, 887],
  "keepsake-memory-card-back.png": [1254, 1254],
  "keepsake-memory-mismatch-overlay.png": [1254, 1254],
  "social-preview.jpg": [1280, 640],
};

const optimizedMasters = [
  "askjamie-avatar.jpg",
  "chai-chase-splash.png",
  "joey-phoebe-wheel.png",
  "joey-phoebe-wilds.png",
  "keepsake-memory-card-back.png",
  "keepsake-memory-mismatch-overlay.png",
  "social-preview.jpg",
];

function absoluteAsset(relativePath) {
  return path.join(ASSETS, relativePath);
}

function absoluteMaster(filename) {
  return ["glee-symbol-atlas.png", "handbag-wild.png"].includes(filename)
    ? path.join(SOURCE_ASSETS, filename)
    : absoluteAsset(filename);
}

async function validateMasterDimensions() {
  for (const [filename, [expectedWidth, expectedHeight]] of Object.entries(MASTER_DIMENSIONS)) {
    const sourcePath = absoluteMaster(filename);
    const metadata = await sharp(sourcePath).metadata();
    if (metadata.width !== expectedWidth || metadata.height !== expectedHeight) {
      throw new Error(
        `${filename} is ${metadata.width}x${metadata.height}; expected ${expectedWidth}x${expectedHeight}. ` +
          "Refusing to generate from an unexpected master.",
      );
    }
  }
}

function atlasCellRect(cellIndex, inset = SAFE_INSET) {
  const column = cellIndex % MASTER_ATLAS_GRID;
  const row = Math.floor(cellIndex / MASTER_ATLAS_GRID);
  const left = Math.floor((column * MASTER_ATLAS_SIZE) / MASTER_ATLAS_GRID);
  const top = Math.floor((row * MASTER_ATLAS_SIZE) / MASTER_ATLAS_GRID);
  const right = Math.floor(((column + 1) * MASTER_ATLAS_SIZE) / MASTER_ATLAS_GRID);
  const bottom = Math.floor(((row + 1) * MASTER_ATLAS_SIZE) / MASTER_ATLAS_GRID);
  return {
    left: left + inset,
    top: top + inset,
    width: right - left - inset * 2,
    height: bottom - top - inset * 2,
  };
}

function expandedAtlasCellRect(cellIndex, margin = 52) {
  const column = cellIndex % MASTER_ATLAS_GRID;
  const row = Math.floor(cellIndex / MASTER_ATLAS_GRID);
  const left = Math.floor((column * MASTER_ATLAS_SIZE) / MASTER_ATLAS_GRID);
  const top = Math.floor((row * MASTER_ATLAS_SIZE) / MASTER_ATLAS_GRID);
  const right = Math.floor(((column + 1) * MASTER_ATLAS_SIZE) / MASTER_ATLAS_GRID);
  const bottom = Math.floor(((row + 1) * MASTER_ATLAS_SIZE) / MASTER_ATLAS_GRID);
  const cropLeft = Math.max(0, left - margin);
  const cropTop = Math.max(0, top - margin);
  const cropRight = Math.min(MASTER_ATLAS_SIZE, right + margin);
  const cropBottom = Math.min(MASTER_ATLAS_SIZE, bottom + margin);
  return { left: cropLeft, top: cropTop, width: cropRight - cropLeft, height: cropBottom - cropTop };
}

function insetRect(rect, inset = SAFE_INSET) {
  return {
    left: rect.left + inset,
    top: rect.top + inset,
    width: rect.width - inset * 2,
    height: rect.height - inset * 2,
  };
}

function rgbDistance(a, b) {
  const red = a[0] - b[0];
  const green = a[1] - b[1];
  const blue = a[2] - b[2];
  return Math.sqrt(red * red + green * green + blue * blue);
}

function luminance(pixel) {
  return pixel[0] * 0.2126 + pixel[1] * 0.7152 + pixel[2] * 0.0722;
}

/**
 * The atlas and cat sheet predate alpha channels. Remove only the connected,
 * dark midnight background reached from the crop edge. Flood-filling from the
 * edge protects similarly dark details inside the illustrated symbols and
 * leaves already-transparent masters (such as the handbag) unchanged.
 */
function makeDarkBackgroundTransparent(raw, width, height) {
  const channels = 4;
  const edgeSamples = [];
  const sampleStep = Math.max(1, Math.floor(Math.min(width, height) / 24));
  for (let x = 0; x < width; x += sampleStep) {
    edgeSamples.push(raw.slice(x * channels, x * channels + 3));
    const bottom = ((height - 1) * width + x) * channels;
    edgeSamples.push(raw.slice(bottom, bottom + 3));
  }
  for (let y = 0; y < height; y += sampleStep) {
    const left = (y * width) * channels;
    const right = (y * width + width - 1) * channels;
    edgeSamples.push(raw.slice(left, left + 3));
    edgeSamples.push(raw.slice(right, right + 3));
  }

  const background = [0, 1, 2].map((channel) => {
    const values = edgeSamples.map((sample) => sample[channel]).sort((a, b) => a - b);
    return values[Math.floor(values.length / 2)];
  });
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let queueStart = 0;
  let queueEnd = 0;
  const isBackgroundLike = (index) => {
    const offset = index * channels;
    const pixel = raw.subarray(offset, offset + 3);
    return luminance(pixel) < 78 && rgbDistance(pixel, background) < 38;
  };
  const enqueue = (index) => {
    if (!visited[index] && isBackgroundLike(index)) {
      visited[index] = 1;
      queue[queueEnd++] = index;
    }
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  while (queueStart < queueEnd) {
    const index = queue[queueStart++];
    const x = index % width;
    const y = Math.floor(index / width);
    if (x > 0) enqueue(index - 1);
    if (x + 1 < width) enqueue(index + 1);
    if (y > 0) enqueue(index - width);
    if (y + 1 < height) enqueue(index + width);
  }

  for (let index = 0; index < visited.length; index += 1) {
    if (visited[index]) raw[index * channels + 3] = 0;
  }
  return raw;
}

function isolatePrimaryComponent(raw, width, height, centerX, centerY) {
  const channels = 4;
  const labels = new Int32Array(width * height).fill(-1);
  const components = [];
  const neighbors = [-1, 0, 1];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const start = y * width + x;
      if (labels[start] >= 0 || raw[start * channels + 3] < 12) continue;
      const label = components.length;
      const queue = [start];
      labels[start] = label;
      let area = 0;
      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;
      while (queue.length > 0) {
        const index = queue.pop();
        const px = index % width;
        const py = Math.floor(index / width);
        area += 1;
        minX = Math.min(minX, px);
        maxX = Math.max(maxX, px);
        minY = Math.min(minY, py);
        maxY = Math.max(maxY, py);
        for (const dy of neighbors) {
          for (const dx of neighbors) {
            if (dx === 0 && dy === 0) continue;
            const nx = px + dx;
            const ny = py + dy;
            if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
            const next = ny * width + nx;
            if (labels[next] < 0 && raw[next * channels + 3] >= 12) {
              labels[next] = label;
              queue.push(next);
            }
          }
        }
      }
      components.push({
        area,
        minX,
        maxX,
        minY,
        maxY,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2,
      });
    }
  }

  const candidates = components.filter((component) => component.area >= 24);
  const primary = candidates.sort((a, b) => {
    const score = (component) => {
      const distance = Math.hypot(component.centerX - centerX, component.centerY - centerY);
      return component.area / (1 + distance * 0.015);
    };
    return score(b) - score(a);
  })[0];
  if (!primary) return raw;

  // Retain detached highlights and small illustrated details that sit inside
  // the chosen symbol's bounds, but reject neighboring-cell fragments that
  // merely happen to be close to the nominal cell center.
  const keep = new Set(
    candidates
      .filter((component) =>
        component.minX >= primary.minX && component.maxX <= primary.maxX &&
        component.minY >= primary.minY && component.maxY <= primary.maxY,
      )
      .map((component) => components.indexOf(component)),
  );
  keep.add(components.indexOf(primary));
  const isolated = Buffer.alloc(raw.length);
  for (let index = 0; index < labels.length; index += 1) {
    if (keep.has(labels[index])) {
      raw.copy(isolated, index * channels, index * channels, index * channels + channels);
    }
  }
  return isolated;
}

async function prepareCrop(sourcePath, rect, { removeBackground = true } = {}) {
  const sourceMetadata = await sharp(sourcePath).metadata();
  const { data, info } = await sharp(sourcePath)
    .extract(rect)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rgba = Buffer.from(data);
  if (removeBackground && !sourceMetadata.hasAlpha) {
    makeDarkBackgroundTransparent(rgba, info.width, info.height);
  }

  return sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .resize({ width: ART_SIZE, height: ART_SIZE, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

async function prepareAtlasSymbol(sourcePath, cell) {
  const rect = expandedAtlasCellRect(cell);
  const base = atlasCellRect(cell, 0);
  const { data, info } = await sharp(sourcePath)
    .extract(rect)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rgba = Buffer.from(data);
  makeDarkBackgroundTransparent(rgba, info.width, info.height);
  const centerX = base.left + base.width / 2 - rect.left;
  const centerY = base.top + base.height / 2 - rect.top;
  const isolated = isolatePrimaryComponent(rgba, info.width, info.height, centerX, centerY);
  return sharp(isolated, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({ width: ART_SIZE, height: ART_SIZE, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

async function renderAtlas(items, rows) {
  const layers = items.map(({ image, cell }) => ({
    input: image,
    left: (cell % MASTER_ATLAS_GRID) * OUTPUT_CELL_SIZE + SAFE_INSET,
    top: Math.floor(cell / MASTER_ATLAS_GRID) * OUTPUT_CELL_SIZE + SAFE_INSET,
  }));
  return sharp({
    create: {
      width: OUTPUT_GRID_WIDTH,
      height: OUTPUT_CELL_SIZE * rows,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(layers)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function writeAtlas(name, items, rows) {
  const png = await renderAtlas(items, rows);
  await sharp(png).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(path.join(ATLAS_DIR, `${name}.png`));
  await sharp(png).webp({ quality: 92, effort: 6, alphaQuality: 95 }).toFile(path.join(ATLAS_DIR, `${name}.webp`));
}

async function buildAtlases() {
  const masterAtlas = absoluteMaster("glee-symbol-atlas.png");
  const wilds = absoluteAsset("joey-phoebe-wilds.png");
  const handbag = absoluteMaster("handbag-wild.png");

  // Cells 0–11 are the standard pay symbols; cells 12–14 are the three
  // treat symbols. UniGlee (cell 15) belongs in the special atlas only.
  const standardItems = await Promise.all(
    Array.from({ length: 15 }, async (_, cell) => ({
      cell,
      image: await prepareAtlasSymbol(masterAtlas, cell),
    })),
  );
  await writeAtlas("standard-symbol-atlas", standardItems, 4);

  // Fixed special-atlas order: UniGlee, Joey wild, Phoebe wild, handbag wild,
  // then the mermaid tumbler reused as Wild Chai. Cells 5–7 remain transparent.
  const wildHalf = Math.floor((await sharp(wilds).metadata()).width / 2);
  const specialItems = [
    { cell: 0, image: await prepareAtlasSymbol(masterAtlas, 15) },
    { cell: 1, image: await prepareCrop(wilds, insetRect({ left: 0, top: 0, width: wildHalf, height: wildHalf })) },
    { cell: 2, image: await prepareCrop(wilds, insetRect({ left: wildHalf, top: 0, width: wildHalf, height: wildHalf })) },
    { cell: 3, image: await prepareCrop(handbag, insetRect({ left: 0, top: 0, width: 1254, height: 1254 }), { removeBackground: false }) },
    { cell: 4, image: await prepareAtlasSymbol(masterAtlas, 0) },
  ];
  await writeAtlas("special-symbol-atlas", specialItems, 2);
}

async function buildOptimizedWebp() {
  await Promise.all(
    optimizedMasters.map(async (filename) => {
      await sharp(absoluteAsset(filename))
        .webp({ quality: 84, effort: 6, smartSubsample: true, alphaQuality: 95 })
        .toFile(path.join(OPTIMIZED_DIR, `${path.parse(filename).name}.webp`));
    }),
  );
}

async function main() {
  await validateMasterDimensions();
  await mkdir(ATLAS_DIR, { recursive: true });
  await mkdir(OPTIMIZED_DIR, { recursive: true });
  await buildAtlases();
  await buildOptimizedWebp();
  console.log("Generated standard/special atlases and optimized WebP derivatives from validated masters.");
}

const invokedScript = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === invokedScript) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
