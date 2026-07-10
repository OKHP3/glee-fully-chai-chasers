import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// base: repo name for GitHub Pages project site.
// If a custom domain (e.g. chai.glee-fully.tools) is added later, change base to "/".
export default defineConfig({
  base: "/glee-fully-chai-chasers/",
  plugins: [tailwindcss()],
  build: { target: "es2020" },
});
