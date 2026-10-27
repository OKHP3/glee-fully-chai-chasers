/** Keep the design-review frame faithful to the shipped Ice Notes deck. */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ICE_NOTES } from "../../../src/ui/ice-notes.ts";

const scenePath = resolve(dirname(fileURLToPath(import.meta.url)), "../public/scenes/ice-notes.html");
const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
})[character] ?? character);

const cards = ICE_NOTES.map((note, index) => `    <aside class="ice-notes-card" data-note-index="${index + 1}" aria-label="${escapeHtml(note.ingredient)} note ${index + 1}">
      <p class="ice-notes-eyebrow">ICE NOTES · ${index + 1} / ${ICE_NOTES.length}</p>
      <div class="ice-notes-body">
        <div class="ice-notes-header">
          <svg viewBox="0 0 20 20" class="ice-notes-icon" aria-hidden="true"><path d="M10 2.5 11.8 8.2 17.5 10l-5.7 1.8L10 17.5l-1.8-5.7L2.5 10l5.7-1.8Z" fill="currentColor"/></svg>
          <span class="ice-notes-name-group"><span class="ice-notes-name">${escapeHtml(note.ingredient)}</span> <span class="ice-notes-text">${escapeHtml(note.fact)}</span></span>
        </div>
        <dl class="ice-notes-profile">
          <div><dt>Flavor</dt><dd>${escapeHtml(note.flavor)}</dd></div>
          <div><dt>Chai role</dt><dd>${escapeHtml(note.chaiRole)}</dd></div>
          <div><dt>Source</dt><dd>${escapeHtml(note.source)}</dd></div>
          <div><dt>Gathering</dt><dd>${escapeHtml(note.harvest)}</dd></div>
        </dl>
      </div>
    </aside>`).join("\n");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=390">
<title>Ice Notes — Chai Chasers Design Review</title>
<link rel="stylesheet" href="../game-style.css">
<style>
html,body{margin:0;padding:0;width:390px;min-height:100%;overflow-x:hidden;overflow-y:auto;background:#06081a}
.cc-root{height:auto;min-height:100dvh;overflow:visible}
.ice-notes-review{
  position:relative;z-index:5;
  display:flex;flex-direction:column;
  align-items:stretch;
  gap:16px;
  padding:24px 12px 32px;
  min-height:100%;
  box-sizing:border-box;
}
.ice-notes-review-heading{
  font-family:sans-serif;color:#f5d576;font-size:11px;
  letter-spacing:.15em;text-transform:uppercase;margin:0 4px 4px;opacity:0.8;
}
.ice-notes-review .ice-notes-card{display:flex;height:auto;min-height:110px;overflow:visible}
.ice-notes-review .ice-notes-body{min-height:auto}
.ice-notes-review .ice-notes-name-group{display:block;overflow:visible}
.ice-notes-review .ice-notes-profile{margin-top:8px}
</style>
</head>
<body>
<div class="cc-root">
  <div id="bg-layer" class="night-garden aurora" aria-hidden="true"></div>
  <div class="ice-notes-review">
    <p class="ice-notes-review-heading">Ice Notes Design Review — ${ICE_NOTES.length} current in-game entries, in source order</p>
${cards}
  </div>
</div>
</body>
</html>
`;

if (process.argv.includes("--check")) {
  if (readFileSync(scenePath, "utf8") !== html) {
    throw new Error("Ice Notes design-review scene is out of sync with src/ui/ice-notes.ts; run pnpm --filter @workspace/mockup-sandbox sync-ice-notes-review");
  }
  console.log(`Ice Notes review scene matches all ${ICE_NOTES.length} in-game entries.`);
} else {
  writeFileSync(scenePath, html);
  console.log(`Wrote ${ICE_NOTES.length} in-game entries to ${scenePath}`);
}
