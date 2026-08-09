import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// base: repo name for GitHub Pages project site.
// If a custom domain (e.g. chai.glee-fully.tools) is added later, change base to "/".
export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/glee-fully-chai-chasers/" : "/",
  plugins: [tailwindcss()],
  plugins: [
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
