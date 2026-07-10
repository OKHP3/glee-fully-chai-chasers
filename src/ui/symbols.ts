/**
 * Original SVG symbol art — zero emoji, zero third-party clip art. Every glyph
 * is a hand-authored inline SVG in the game's retro-bright palette so the
 * board reads as a real slot, not a placeholder. Canon/IP: docs/CANON.md,
 * docs/IP-GUARDRAILS.md (silhouette/vibe only, no brand marks).
 */
import type { SymbolId } from "../engine/types";

const wrap = (inner: string, vb = 48) =>
  `<svg viewBox="0 0 ${vb} ${vb}" class="h-full w-full" aria-hidden="true">${inner}</svg>`;

const SYMBOL_SVG: Record<SymbolId, string> = {
  // --- high tier -----------------------------------------------------
  tumbler: wrap(`
    <defs><linearGradient id="tumblerGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7fd6c2"/><stop offset="55%" stop-color="#4fa8d8"/><stop offset="100%" stop-color="#c76bd6"/>
    </linearGradient></defs>
    <path d="M14 8h20l-2 32a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4L14 8z" fill="url(#tumblerGrad)" stroke="#2d1f4c" stroke-width="1.5"/>
    <rect x="16" y="14" width="16" height="3" fill="#ffffff55"/>
    <path d="M24 4v8" stroke="#2d1f4c" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M23 2c0 2-2 2-2 4" stroke="#2d1f4c" stroke-width="2" fill="none" stroke-linecap="round"/>
  `),
  butterfly: wrap(`
    <path d="M24 20c-3-9-14-12-16-4-2 8 8 10 16 6z" fill="#ff9ecb" stroke="#2d1f4c" stroke-width="1.2"/>
    <path d="M24 20c3-9 14-12 16-4 2 8-8 10-16 6z" fill="#8ec9ff" stroke="#2d1f4c" stroke-width="1.2"/>
    <path d="M24 22c-2 7-10 10-13 5-3-5 4-9 13-5z" fill="#ffd76b" stroke="#2d1f4c" stroke-width="1.2"/>
    <path d="M24 22c2 7 10 10 13 5 3-5-4-9-13-5z" fill="#b58cff" stroke="#2d1f4c" stroke-width="1.2"/>
    <rect x="23" y="10" width="2" height="26" rx="1" fill="#2d1f4c"/>
  `),
  mixtape: wrap(`
    <rect x="6" y="12" width="36" height="24" rx="3" fill="#e8618c" stroke="#2d1f4c" stroke-width="1.5"/>
    <rect x="10" y="16" width="28" height="9" rx="1.5" fill="#fff4e0"/>
    <circle cx="17" cy="27" r="5" fill="#2d1f4c"/><circle cx="31" cy="27" r="5" fill="#2d1f4c"/>
    <circle cx="17" cy="27" r="2" fill="#fff4e0"/><circle cx="31" cy="27" r="2" fill="#fff4e0"/>
  `),
  crystal: wrap(`
    <polygon points="24,4 34,18 24,44 14,18" fill="#c99bff" stroke="#2d1f4c" stroke-width="1.5"/>
    <polygon points="24,4 34,18 24,22 14,18" fill="#e6cbff"/>
    <polygon points="14,18 24,22 24,44" fill="#a672e8"/>
  `),
  // --- mid tier --------------------------------------------------------
  chai: wrap(`
    <path d="M12 18h24l-2.5 20a4 4 0 0 1-4 3.5h-11a4 4 0 0 1-4-3.5L12 18z" fill="#d99a4e" stroke="#2d1f4c" stroke-width="1.5"/>
    <path d="M13.5 20h21" stroke="#fff4e0" stroke-width="2"/>
    <path d="M36 20c6 0 6 8 0 9" fill="none" stroke="#2d1f4c" stroke-width="2.5"/>
    <circle cx="24" cy="10" r="2" fill="#fff4e0"/><circle cx="19" cy="8" r="1.6" fill="#fff4e0"/><circle cx="29" cy="8" r="1.6" fill="#fff4e0"/>
  `),
  candle: wrap(`
    <rect x="19" y="18" width="10" height="24" rx="2" fill="#ffb9de" stroke="#2d1f4c" stroke-width="1.5"/>
    <rect x="19" y="18" width="10" height="4" fill="#fff4e0"/>
    <path d="M24 15c-3-4 0-7 0-7s3 3 0 7z" fill="#ffd76b" stroke="#2d1f4c" stroke-width="1"/>
  `),
  cassette: wrap(`
    <rect x="7" y="14" width="34" height="20" rx="2.5" fill="#6bd6c9" stroke="#2d1f4c" stroke-width="1.5"/>
    <rect x="12" y="18" width="24" height="8" rx="1" fill="#fff4e0"/>
    <circle cx="18" cy="22" r="3.4" fill="#2d1f4c"/><circle cx="30" cy="22" r="3.4" fill="#2d1f4c"/>
  `),
  gnome: wrap(`
    <path d="M24 6c8 6 8 16 8 16H16s0-10 8-16z" fill="#e8618c" stroke="#2d1f4c" stroke-width="1.5"/>
    <circle cx="24" cy="28" r="9" fill="#ffe0c2" stroke="#2d1f4c" stroke-width="1.5"/>
    <path d="M15 34c0 6 4 8 9 8s9-2 9-8z" fill="#4fa8d8" stroke="#2d1f4c" stroke-width="1.5"/>
    <circle cx="20" cy="27" r="1.6" fill="#2d1f4c"/><circle cx="28" cy="27" r="1.6" fill="#2d1f4c"/>
  `),
  // --- low tier --------------------------------------------------------
  mailbox: wrap(`
    <rect x="8" y="20" width="32" height="16" rx="2" fill="#8ec9ff" stroke="#2d1f4c" stroke-width="1.5"/>
    <path d="M8 20a16 12 0 0 1 32 0z" fill="#8ec9ff" stroke="#2d1f4c" stroke-width="1.5"/>
    <rect x="21" y="6" width="6" height="14" fill="#8a8a8a" stroke="#2d1f4c" stroke-width="1"/>
    <rect x="12" y="26" width="10" height="6" fill="#fff4e0"/>
  `),
  vhs: wrap(`
    <rect x="6" y="12" width="36" height="24" rx="2" fill="#b58cff" stroke="#2d1f4c" stroke-width="1.5"/>
    <rect x="10" y="16" width="28" height="6" fill="#fff4e0"/>
    <rect x="10" y="26" width="12" height="6" rx="1" fill="#2d1f4c"/>
    <rect x="26" y="26" width="12" height="6" rx="1" fill="#2d1f4c"/>
  `),
  teapot: wrap(`
    <ellipse cx="22" cy="28" rx="14" ry="10" fill="#ffd76b" stroke="#2d1f4c" stroke-width="1.5"/>
    <path d="M35 22c8-2 10 8 2 9" fill="none" stroke="#2d1f4c" stroke-width="2.5"/>
    <path d="M9 26c-5-2-5 4 0 5" fill="none" stroke="#2d1f4c" stroke-width="2.5"/>
    <rect x="18" y="16" width="8" height="5" rx="2" fill="#ffd76b" stroke="#2d1f4c" stroke-width="1.5"/>
  `),
  yarn: wrap(`
    <circle cx="24" cy="24" r="16" fill="#ff9ecb" stroke="#2d1f4c" stroke-width="1.5"/>
    <path d="M10 20c10 4 18 4 28 0M9 27c10 5 20 5 30 0M13 14c8 6 14 6 22 0" fill="none" stroke="#e8618c" stroke-width="1.6"/>
  `),
  // --- treats (feature symbols) ----------------------------------------
  treat_chicken: wrap(`
    <path d="M10 32c0-10 8-18 18-18h4c4 0 6 4 3 7l-3 3c8 1 10 10 3 14-8 5-25-1-25-6z" fill="#ffd76b" stroke="#2d1f4c" stroke-width="1.5"/>
    <circle cx="16" cy="22" r="2" fill="#2d1f4c"/>
  `),
  treat_salmon: wrap(`
    <path d="M8 24c8-10 26-10 34 0-8 10-26 10-34 0z" fill="#ff9ecb" stroke="#2d1f4c" stroke-width="1.5"/>
    <path d="M38 24l6-6v12z" fill="#e8618c" stroke="#2d1f4c" stroke-width="1.5"/>
    <circle cx="16" cy="22" r="1.8" fill="#2d1f4c"/>
  `),
  treat_boogie: wrap(`
    <path d="M14 8l4 8 8-3-5 7 8 4-9 1 2 9-8-6-8 6 2-9-9-1 8-4-5-7 8 3z" fill="#c99bff" stroke="#2d1f4c" stroke-width="1.2"/>
    <circle cx="36" cy="34" r="4" fill="#ffd76b" stroke="#2d1f4c" stroke-width="1"/>
  `),
  // --- wilds & legend ----------------------------------------------------
  wild_joey: wrap(`
    <ellipse cx="24" cy="30" rx="15" ry="12" fill="#5c6470" stroke="#2d1f4c" stroke-width="1.5"/>
    <path d="M11 22l4-9 6 7z" fill="#5c6470" stroke="#2d1f4c" stroke-width="1.5"/>
    <path d="M37 22l-4-9-6 7z" fill="#5c6470" stroke="#2d1f4c" stroke-width="1.5"/>
    <circle cx="18" cy="27" r="2.6" fill="#ffd76b"/><circle cx="30" cy="27" r="2.6" fill="#ffd76b"/>
    <circle cx="18" cy="27" r="1.1" fill="#2d1f4c"/><circle cx="30" cy="27" r="1.1" fill="#2d1f4c"/>
    <path d="M22 32c1 1 3 1 4 0" stroke="#2d1f4c" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  `),
  wild_phoebe: wrap(`
    <ellipse cx="24" cy="30" rx="15" ry="12" fill="#2d1f4c" stroke="#1a1230" stroke-width="1.5"/>
    <path d="M11 22l4-9 6 7z" fill="#2d1f4c" stroke="#1a1230" stroke-width="1.5"/>
    <path d="M37 22l-4-9-6 7z" fill="#2d1f4c" stroke="#1a1230" stroke-width="1.5"/>
    <path d="M15 32c3 6 15 6 18 0z" fill="#fff4e0"/>
    <circle cx="18" cy="27" r="2.6" fill="#8ec9ff"/><circle cx="30" cy="27" r="2.6" fill="#8ec9ff"/>
    <circle cx="18" cy="27" r="1.1" fill="#1a1230"/><circle cx="30" cy="27" r="1.1" fill="#1a1230"/>
  `),
  uniglee: wrap(`
    <defs><linearGradient id="uniglow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff9ecb"/><stop offset="25%" stop-color="#ffd76b"/><stop offset="50%" stop-color="#8ec9ff"/>
      <stop offset="75%" stop-color="#c99bff"/><stop offset="100%" stop-color="#6bd6c9"/>
    </linearGradient></defs>
    <ellipse cx="24" cy="30" rx="17" ry="11" fill="url(#uniglow)" stroke="#2d1f4c" stroke-width="1.5"/>
    <path d="M24 10l3 8h-6z" fill="#ffe0c2" stroke="#2d1f4c" stroke-width="1.2"/>
    <circle cx="17" cy="28" r="2.4" fill="#2d1f4c"/><circle cx="31" cy="28" r="2.4" fill="#2d1f4c"/>
  `),
};

/** Zero-emoji symbol markup for the board — see docs/DESIGN-SPEC.md §5/§11. */
export function symbolSvg(id: SymbolId): string {
  return SYMBOL_SVG[id];
}

/** Full-body cat sprites for pop-in moments — docs/DESIGN-SPEC.md §11, canon CANON.md. */
export function catSprite(cat: "joey" | "phoebe"): string {
  if (cat === "joey") {
    return wrap(`
      <ellipse cx="24" cy="34" rx="18" ry="9" fill="#00000022"/>
      <path d="M8 34c0-12 6-20 16-20s16 8 16 20c0 4-4 6-16 6S8 38 8 34z" fill="#8b93a1" stroke="#2d1f4c" stroke-width="1.5"/>
      <path d="M11 18l4-9 6 8z" fill="#8b93a1" stroke="#2d1f4c" stroke-width="1.5"/>
      <path d="M37 18l-4-9-6 8z" fill="#8b93a1" stroke="#2d1f4c" stroke-width="1.5"/>
      <circle cx="18" cy="26" r="3" fill="#ffd76b"/><circle cx="30" cy="26" r="3" fill="#ffd76b"/>
      <circle cx="18" cy="26" r="1.3" fill="#111"/><circle cx="30" cy="26" r="1.3" fill="#111"/>
      <path d="M20 31c1.5 1.5 6.5 1.5 8 0" stroke="#2d1f4c" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <path d="M40 30c6-2 8 4 3 6" fill="none" stroke="#5c6470" stroke-width="3" stroke-linecap="round"/>
    `, 48);
  }
  return wrap(`
    <ellipse cx="24" cy="34" rx="18" ry="9" fill="#00000022"/>
    <path d="M8 34c0-12 6-20 16-20s16 8 16 20c0 4-4 6-16 6S8 38 8 34z" fill="#2d1f4c" stroke="#1a1230" stroke-width="1.5"/>
    <path d="M11 18l4-9 6 8z" fill="#2d1f4c" stroke="#1a1230" stroke-width="1.5"/>
    <path d="M37 18l-4-9-6 8z" fill="#2d1f4c" stroke="#1a1230" stroke-width="1.5"/>
    <path d="M13 30c4 8 18 8 22 0" fill="#fff4e0"/>
    <circle cx="18" cy="26" r="3" fill="#8ec9ff"/><circle cx="30" cy="26" r="3" fill="#8ec9ff"/>
    <circle cx="18" cy="26" r="1.3" fill="#111"/><circle cx="30" cy="26" r="1.3" fill="#111"/>
    <path d="M40 30c6 1 7 6 2 7" fill="none" stroke="#2d1f4c" stroke-width="3" stroke-linecap="round"/>
  `, 48);
}

/** The AskJamie Wheel face — three wedges, hand-drawn conic art (docs §7). */
export function wheelSvg(): string {
  return `<svg viewBox="0 0 200 200" class="h-full w-full">
    <circle cx="100" cy="100" r="96" fill="#2d1f4c" stroke="#fff4e0" stroke-width="4"/>
    <path d="M100 100 L100 4 A96 96 0 0 1 183 148 Z" fill="#6bd6c9"/>
    <path d="M100 100 L183 148 A96 96 0 0 1 17 148 Z" fill="#e8618c"/>
    <path d="M100 100 L17 148 A96 96 0 0 1 100 4 Z" fill="#ffd76b"/>
    <circle cx="100" cy="100" r="22" fill="#fff4e0" stroke="#2d1f4c" stroke-width="3"/>
    <text x="100" y="106" font-size="13" text-anchor="middle" fill="#2d1f4c" font-family="sans-serif" font-weight="700">GO</text>
  </svg>`;
}
