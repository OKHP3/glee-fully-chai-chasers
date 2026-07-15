# Raster asset masters

This directory holds editable, provenance-traceable raster masters that are
used to generate the shipped symbol atlases. It is intentionally outside
`public/`, so Vite does not copy source-only files into the deployed game.

Run `npm run assets:generate` after changing a master. The generator writes
the fixed-gutter PNG/WebP atlases and runtime WebP derivatives below
`public/assets/`.
