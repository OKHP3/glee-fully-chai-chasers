import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// base: repo name for GitHub Pages project site.
// If a custom domain (e.g. chai.glee-fully.tools) is added later, change base to "/".
export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/glee-fully-chai-chasers/" : "/",
  plugins: [tailwindcss()],
  build: { target: "es2020" },
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    allowedHosts: true,
  },
});
