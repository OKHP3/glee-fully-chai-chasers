---
name: heic-image-convert
description: Convert HEIC/HEIF photos into optimized PNG and WebP assets for this project. Use when an image cannot be inspected or used in a browser because it is HEIC, when preparing reference photos for image generation, or when creating privacy-conscious web assets. Also use to make a PNG-backed SVG wrapper when an SVG container is required; do not claim that raster photos become true vector art.
---

# HEIC Image Converter

Use this project-local skill to prepare photos for inspection and web use. Keep source HEIC files unchanged. Write derivatives outside `reference-photos/`, normally under `private-work/converted/`, unless the user explicitly approves public assets.

## Setup

Use the repository's Python environment and install the locked conversion requirements when `pillow_heif` is unavailable:

```powershell
python -m pip install -r .github/skills/heic-image-convert/requirements.txt
```

## Convert

Run the converter against one file or a directory. It preserves aspect ratio, corrects EXIF orientation, strips metadata by default, and never overwrites an existing output unless `--overwrite` is supplied.

```powershell
python .github/skills/heic-image-convert/scripts/convert_images.py reference-photos --output private-work/converted --formats png webp --max-edge 2048
```

Use PNG for image-generation references or images with transparency. Use WebP at quality 82 for browser delivery. Inspect converted images before using them as references or publishing them.

## SVG boundary

Photos do not meaningfully convert into editable SVG artwork. `--formats svg` creates a valid SVG container that embeds the rendered PNG; it remains raster content and is useful only where an SVG file is technically required. For true vector art, first create an original simple illustration or icon, then trace/rebuild that illustration deliberately. Do not vector-trace personal photos for the game without explicit approval.

## Privacy

Treat source photos and private conversions as non-public. Do not add them to `src/`, `public/`, or deployment output unless the user explicitly approves that exact asset for publication.
