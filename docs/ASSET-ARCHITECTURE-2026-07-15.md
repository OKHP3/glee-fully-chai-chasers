# Asset Architecture — 2026-07-15

Status: approved runtime and release policy.

## Runtime layout

- The board uses two generated sprite atlases:
  - `standard-symbol-atlas`: 1280×1280, a 4×4 grid of 320×320 integer cells.
  - `special-symbol-atlas`: 1280×640, a 4×2 grid of 320×320 integer cells.
- Each atlas has a generated PNG fallback and a generated WebP runtime derivative.
- `src/ui/asset-manifest.ts` is the canonical engine-ID-to-art mapping. Every
  `SymbolId` must appear exactly once; atlas coordinates are part of that mapping.

## Dedicated vector and animation assets

Symbols or interactions that need independent composition or frame changes stay
as dedicated SVG assets, including the doorbell and chai-pump art. Bold Chai
animation frames remain separate SVG files under `public/assets/bold-chai/`.
These SVGs are local, original source assets: no external references, embedded
`<image>` content, scripts, imports, or remote fonts are permitted.

## Masters and generated derivatives

Raster masters are split by role: atlas-only masters live in `asset-source/`,
while explicitly supported runtime PNG/JPG fallbacks remain under
`public/assets/`. They are the editable and provenance-traceable source of
truth, not files to be replaced by an optimization step. The asset generator
creates WebP runtime derivatives under `public/assets/optimized/` and the two
generated atlas pairs under `public/assets/atlases/`. Generated files must be
reproducible from the masters and must not be hand-edited.

The release validator checks that each required WebP is decodable, has WebP
format metadata, and preserves its master dimensions. It also checks the fixed
atlas dimensions and all manifest-backed SVG paths.

## Fixed integer gutters

Every 320×320 atlas cell reserves a fixed 12px gutter on all four sides, leaving
a 296×296 art area. The gutter is applied during generation and is shared by
both atlases. Runtime CSS must use the integer atlas grid and must not recreate
the former fractional 1254px cell math or compensate for it with visual scaling.

Run the gate directly with:

```text
node scripts/validate-assets.mjs
```
