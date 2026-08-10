import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";

// base: repo name for GitHub Pages project site.
// If a custom domain (e.g. chai.glee-fully.tools) is added later, change base to "/".
export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/glee-fully-chai-chasers/" : "/",
  plugins: [
    tailwindcss(),

    // Copy all scene HTML files from the mockup-sandbox into public/scenes/ at
    // build time so the game ships its own copies on GitHub Pages.  The source
    // of truth stays in artifacts/mockup-sandbox/public/scenes/ — this plugin
    // keeps the two in sync automatically.  Adding a new scene reference in
    // src/ui/how-it-works.ts is the only step needed; no manual file copy.
    {
      name: "copy-scenes",
      buildStart() {
        const src = path.resolve(__dirname, "artifacts/mockup-sandbox/public/scenes");
        const dest = path.resolve(__dirname, "public/scenes");
        if (!fs.existsSync(src)) {
          this.warn(`copy-scenes: source directory not found: ${src}`);
          return;
        }
        fs.mkdirSync(dest, { recursive: true });
        const files = fs.readdirSync(src).filter(f => f.endsWith(".html"));
        for (const file of files) {
          fs.copyFileSync(path.join(src, file), path.join(dest, file));
        }
        console.log(`[copy-scenes] copied ${files.length} scene(s) → public/scenes/`);
      },
    },

    // Emit a stable copy of the compiled Tailwind CSS at dist/game-style.css
    // so that public/scenes/*.html (shipped verbatim into dist/scenes/) can
    // reference ../game-style.css and find it on GitHub Pages.
    // The main index.html keeps its hashed reference for cache-busting.
    {
      name: "emit-game-style-css",
      apply: "build" as const,
      generateBundle(_opts, bundle) {
        const cssAsset = Object.values(bundle).find(
          (c): c is import("rollup").OutputAsset =>
            c.type === "asset" && (c.fileName as string).endsWith(".css"),
        );
        if (cssAsset) {
          this.emitFile({
            type: "asset",
            fileName: "game-style.css",
            source: cssAsset.source,
          });
        }
      },
    },
  ],
  build: { target: "es2020" },
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 5000,
    strictPort: true,
    allowedHosts: true,
    watch: {
      ignored: ["**/.local/**", "**/node_modules/.pnpm/**"],
    },
  },
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 5000,
    strictPort: true,
    allowedHosts: true,
  },
});
