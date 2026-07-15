/**
 * Original SVG symbol art — zero emoji, zero third-party clip art. Every glyph
 * is a hand-authored inline SVG in the game's retro-bright palette, built on a
 * shared lighting model (gradient fill + soft highlight + soft shadow + ink
 * outline + tinted outer glow) so the board reads as a dimensional illustrated
 * cabinet, not flat placeholder shapes. Canon/IP: docs/CANON.md,
 * docs/IP-GUARDRAILS.md (silhouette/vibe only, no brand marks).
 *
 * Design system (docs/prompts/DESIGN-AGENT-PROMPT.md):
 *  - base gradient fill (2-3 stop, light-to-deep) on every shape
 *  - a soft white radial "sheen" blob, upper-left, suggesting a light source
 *  - a soft dark radial "grounding" shadow, lower-right, suggesting form
 *  - one consistent ink outline (#2d1f4c family) across the whole family — COHESION
 *  - a tinted CSS drop-shadow glow per symbol so the tier's edges feel lit
 */
import type { SymbolId } from "../engine/types";

const INK = "#20163a";

/** Outer wrap: sizes the glyph and applies the tinted glow via cheap CSS filters. */
const wrap = (inner: string, opts: { vb?: number; glow?: string } = {}) => {
  const vb = opts.vb ?? 48;
  const glow = opts.glow ?? "255,244,224";
  return `<svg viewBox="0 0 ${vb} ${vb}" class="h-full w-full symbol-art" style="filter:drop-shadow(0 0 3px rgba(${glow},0.5)) drop-shadow(0 2px 1.5px rgba(10,6,24,0.45))" aria-hidden="true">${inner}</svg>`;
};

/** Soft upper-left sheen — same recipe every symbol, positioned per-shape. */
const sheen = (id: string, cx: number, cy: number, rx: number, ry: number) => `
  <radialGradient id="${id}" cx="35%" cy="30%" r="65%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.75"/>
    <stop offset="55%" stop-color="#ffffff" stop-opacity="0.22"/>
    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient>
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})"/>
`;

/** Soft lower-right grounding shadow — same recipe every symbol. */
const grounding = (id: string, cx: number, cy: number, rx: number, ry: number) => `
  <radialGradient id="${id}" cx="60%" cy="60%" r="60%">
    <stop offset="0%" stop-color="#0c0620" stop-opacity="0.4"/>
    <stop offset="100%" stop-color="#0c0620" stop-opacity="0"/>
  </radialGradient>
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})"/>
`;

const SYMBOL_SVG: Record<SymbolId, string> = {
  // --- high tier ---------------------------------------------------------
  tumbler: wrap(
    `
    <defs>
      <linearGradient id="tumblerGrad" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stop-color="#a7f0dd"/>
        <stop offset="45%" stop-color="#4fa8d8"/>
        <stop offset="100%" stop-color="#8b4fc9"/>
      </linearGradient>
      <clipPath id="tumblerClip"><path d="M14 8h20l-2 32a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4L14 8z"/></clipPath>
    </defs>
    ${grounding("tumblerGr", 30, 38, 14, 8)}
    <path d="M14 8h20l-2 32a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4L14 8z" fill="url(#tumblerGrad)" stroke="${INK}" stroke-width="1.6"/>
    <g clip-path="url(#tumblerClip)">
      <path d="M14 26q5 3 10 0t10 0 10 0v4q-5 3-10 0t-10 0-10 0z" fill="#ffffff" opacity="0.16"/>
      <path d="M13 33q5 3 10 0t10 0 11 0v4q-5 3-10 0t-10 0-11 0z" fill="#2d1f4c" opacity="0.12"/>
      <path d="M17 10l3 34" stroke="#ffffff" stroke-width="4" opacity="0.25" stroke-linecap="round"/>
      <circle cx="19" cy="18" r="1.6" fill="#ffffff" opacity="0.7"/>
      <circle cx="28" cy="24" r="1.1" fill="#ffffff" opacity="0.6"/>
      <circle cx="23" cy="33" r="1.4" fill="#ffffff" opacity="0.55"/>
      <circle cx="30" cy="14" r="1" fill="#ffffff" opacity="0.6"/>
    </g>
    <rect x="16" y="13.5" width="16" height="2.6" fill="#fff4e0" opacity="0.85"/>
    <path d="M24 4v8" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M22.6 2c0 2-2.2 2-2.2 4.4" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M22.9 2.4c0 1.7-1.8 1.7-1.8 3.6" stroke="#fff4e0" stroke-width="0.8" fill="none" stroke-linecap="round" opacity="0.8"/>
    ${sheen("tumblerSheen", 19, 14, 8, 7)}
  `,
    { glow: "159,232,197" },
  ),
  butterfly: wrap(
    `
    <defs>
      <linearGradient id="bfPink" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffd0e6"/><stop offset="100%" stop-color="#e8618c"/></linearGradient>
      <linearGradient id="bfBlue" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#c9ecff"/><stop offset="100%" stop-color="#4fa8d8"/></linearGradient>
      <linearGradient id="bfYellow" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff0b8"/><stop offset="100%" stop-color="#e8a53a"/></linearGradient>
      <linearGradient id="bfPurple" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e6cbff"/><stop offset="100%" stop-color="#8b4fc9"/></linearGradient>
    </defs>
    ${grounding("bfGr", 26, 34, 14, 6)}
    <path d="M24 20c-3-9-14-12-16-4-2 8 8 10 16 6z" fill="url(#bfPink)" stroke="${INK}" stroke-width="1.3"/>
    <path d="M24 20c3-9 14-12 16-4 2 8-8 10-16 6z" fill="url(#bfBlue)" stroke="${INK}" stroke-width="1.3"/>
    <path d="M24 22c-2 7-10 10-13 5-3-5 4-9 13-5z" fill="url(#bfYellow)" stroke="${INK}" stroke-width="1.2"/>
    <path d="M24 22c2 7 10 10 13 5 3-5-4-9-13-5z" fill="url(#bfPurple)" stroke="${INK}" stroke-width="1.2"/>
    <circle cx="17" cy="16" r="2.6" fill="#ffffff" opacity="0.35"/>
    <circle cx="31" cy="16" r="2.2" fill="#ffffff" opacity="0.3"/>
    <rect x="23" y="10" width="2" height="26" rx="1" fill="${INK}"/>
    <path d="M22 11c-1.5-2-1-4 0.5-4.6M26 11c1.5-2 1-4-0.5-4.6" stroke="${INK}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    ${sheen("bfSheen", 17, 15, 9, 7)}
  `,
    { glow: "255, 158, 203" },
  ),
  mixtape: wrap(
    `
    <defs>
      <linearGradient id="mixGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff9ecb"/><stop offset="100%" stop-color="#c73e6c"/></linearGradient>
    </defs>
    ${grounding("mixGr", 28, 34, 16, 6)}
    <rect x="6" y="12" width="36" height="24" rx="3" fill="url(#mixGrad)" stroke="${INK}" stroke-width="1.5"/>
    <rect x="10" y="16" width="28" height="9" rx="1.5" fill="#fff4e0"/>
    <rect x="10" y="16" width="28" height="4" rx="1.5" fill="#ffffff" opacity="0.55"/>
    <text x="24" y="23" text-anchor="middle" font-size="5" font-family="Verdana, sans-serif" font-weight="700" fill="#c73e6c">GLEE</text>
    <circle cx="17" cy="29" r="5" fill="${INK}"/><circle cx="31" cy="29" r="5" fill="${INK}"/>
    <circle cx="17" cy="29" r="2" fill="#fff4e0"/><circle cx="31" cy="29" r="2" fill="#fff4e0"/>
    <path d="M20 29h8" stroke="#fff4e0" stroke-width="1" opacity="0.6"/>
    ${sheen("mixSheen", 15, 16, 10, 6)}
  `,
    { glow: "232, 97, 140" },
  ),
  crystal: wrap(
    `
    <defs>
      <linearGradient id="crysGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0e0ff"/><stop offset="55%" stop-color="#c99bff"/><stop offset="100%" stop-color="#6f3fb0"/></linearGradient>
    </defs>
    ${grounding("crysGr", 24, 40, 12, 5)}
    <polygon points="24,4 34,18 24,44 14,18" fill="url(#crysGrad)" stroke="${INK}" stroke-width="1.5"/>
    <polygon points="24,4 34,18 24,22 14,18" fill="#ffffff" opacity="0.4"/>
    <polygon points="14,18 24,22 24,44" fill="#4a2a80" opacity="0.35"/>
    <polygon points="24,4 29,18 24,22 19,18" fill="#ffffff" opacity="0.3"/>
    ${sheen("crysSheen", 20, 12, 6, 8)}
  `,
    { glow: "201, 155, 255" },
  ),
  // --- mid tier ------------------------------------------------------------
  chai: wrap(
    `
    <defs>
      <linearGradient id="chaiGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0c27e"/><stop offset="100%" stop-color="#b3702a"/></linearGradient>
    </defs>
    ${grounding("chaiGr", 24, 40, 12, 5)}
    <path d="M12 18h24l-2.5 20a4 4 0 0 1-4 3.5h-11a4 4 0 0 1-4-3.5L12 18z" fill="url(#chaiGrad)" stroke="${INK}" stroke-width="1.5"/>
    <path d="M13.5 20h21" stroke="#fff4e0" stroke-width="2"/>
    <path d="M36 20c6 0 6 8 0 9" fill="none" stroke="${INK}" stroke-width="2.4"/>
    <path d="M36 21.4c4 0 4 5.2 0 6" fill="none" stroke="#fff4e0" stroke-width="1" opacity="0.6"/>
    <circle cx="24" cy="10" r="2" fill="#fff4e0"/><circle cx="19" cy="8" r="1.6" fill="#fff4e0"/><circle cx="29" cy="8" r="1.6" fill="#fff4e0"/>
    ${sheen("chaiSheen", 18, 24, 8, 9)}
  `,
    { glow: "245, 213, 118" },
  ),
  candle: wrap(
    `
    <defs>
      <linearGradient id="candleGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffd6ee"/><stop offset="100%" stop-color="#d987b8"/></linearGradient>
    </defs>
    ${grounding("candleGr", 24, 40, 10, 4)}
    <rect x="19" y="18" width="10" height="24" rx="2" fill="url(#candleGrad)" stroke="${INK}" stroke-width="1.5"/>
    <rect x="19" y="18" width="10" height="4" fill="#fff4e0"/>
    <path d="M21 24h6M21 30h6M21 36h6" stroke="#ffffff" stroke-width="0.8" opacity="0.35"/>
    <path d="M24 15c-3-4 0-7 0-7s3 3 0 7z" fill="#ffd76b" stroke="${INK}" stroke-width="1"/>
    <path d="M24 13c-1.4-2-0.2-3.8-0.2-3.8" stroke="#fff4e0" stroke-width="0.8" opacity="0.7"/>
    ${sheen("candleSheen", 21, 22, 5, 8)}
  `,
    { glow: "255, 214, 238" },
  ),
  cassette: wrap(
    `
    <defs>
      <linearGradient id="cassGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a8f0e5"/><stop offset="100%" stop-color="#3ba296"/></linearGradient>
    </defs>
    ${grounding("cassGr", 24, 38, 15, 5)}
    <rect x="7" y="14" width="34" height="20" rx="2.5" fill="url(#cassGrad)" stroke="${INK}" stroke-width="1.5"/>
    <rect x="12" y="18" width="24" height="8" rx="1" fill="#fff4e0"/>
    <path d="M14 18h20v3H14z" fill="#ffffff" opacity="0.5"/>
    <circle cx="18" cy="22" r="3.4" fill="${INK}"/><circle cx="30" cy="22" r="3.4" fill="${INK}"/>
    <circle cx="18" cy="22" r="1.1" fill="#fff4e0"/><circle cx="30" cy="22" r="1.1" fill="#fff4e0"/>
    <path d="M9 30h30" stroke="${INK}" stroke-width="1" opacity="0.4"/>
    ${sheen("cassSheen", 15, 17, 10, 5)}
  `,
    { glow: "107, 214, 201" },
  ),
  gnome: wrap(
    `
    <defs>
      <linearGradient id="gnomeHat" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff9ecb"/><stop offset="100%" stop-color="#c73e6c"/></linearGradient>
      <linearGradient id="gnomeCoat" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8ec9ff"/><stop offset="100%" stop-color="#3d7cb0"/></linearGradient>
    </defs>
    ${grounding("gnomeGr", 24, 42, 13, 5)}
    <path d="M24 6c8 6 8 16 8 16H16s0-10 8-16z" fill="url(#gnomeHat)" stroke="${INK}" stroke-width="1.5"/>
    <circle cx="24" cy="20" r="2" fill="#fff4e0" opacity="0.5"/>
    <circle cx="24" cy="28" r="9" fill="#ffe0c2" stroke="${INK}" stroke-width="1.5"/>
    <path d="M15 34c0 6 4 8 9 8s9-2 9-8z" fill="url(#gnomeCoat)" stroke="${INK}" stroke-width="1.5"/>
    <circle cx="20" cy="27" r="1.6" fill="${INK}"/><circle cx="28" cy="27" r="1.6" fill="${INK}"/>
    <path d="M21 32c1.5 1.4 4.5 1.4 6 0" stroke="${INK}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="19" cy="30" rx="1.6" ry="1" fill="#ff9ecb" opacity="0.7"/><ellipse cx="29" cy="30" rx="1.6" ry="1" fill="#ff9ecb" opacity="0.7"/>
    ${sheen("gnomeSheen", 19, 12, 7, 6)}
  `,
    { glow: "232, 97, 140" },
  ),
  // --- low tier --------------------------------------------------------
  mailbox: wrap(
    `
    <defs>
      <linearGradient id="mbGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c9ecff"/><stop offset="100%" stop-color="#4a8fc7"/></linearGradient>
    </defs>
    ${grounding("mbGr", 24, 38, 15, 5)}
    <path d="M8 20a16 12 0 0 1 32 0z" fill="url(#mbGrad)" stroke="${INK}" stroke-width="1.5"/>
    <rect x="8" y="20" width="32" height="16" rx="2" fill="url(#mbGrad)" stroke="${INK}" stroke-width="1.5"/>
    <rect x="21" y="6" width="6" height="14" fill="#9aa0a6" stroke="${INK}" stroke-width="1"/>
    <rect x="12" y="26" width="10" height="6" fill="#fff4e0"/>
    <path d="M10 21a14 10 0 0 1 12-8" stroke="#ffffff" stroke-width="1.4" opacity="0.4" fill="none"/>
    ${sheen("mbSheen", 15, 20, 9, 6)}
  `,
    { glow: "142, 201, 255" },
  ),
  vhs: wrap(
    `
    <defs>
      <linearGradient id="vhsGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#dcc2ff"/><stop offset="100%" stop-color="#7a4fc9"/></linearGradient>
    </defs>
    ${grounding("vhsGr", 24, 38, 15, 5)}
    <rect x="6" y="12" width="36" height="24" rx="2" fill="url(#vhsGrad)" stroke="${INK}" stroke-width="1.5"/>
    <rect x="10" y="16" width="28" height="6" fill="#fff4e0"/>
    <rect x="10" y="16" width="28" height="2.4" fill="#ffffff" opacity="0.5"/>
    <rect x="10" y="26" width="12" height="6" rx="1" fill="${INK}"/>
    <rect x="26" y="26" width="12" height="6" rx="1" fill="${INK}"/>
    <circle cx="16" cy="29" r="1.8" fill="#dcc2ff"/><circle cx="32" cy="29" r="1.8" fill="#dcc2ff"/>
    ${sheen("vhsSheen", 15, 16, 9, 5)}
  `,
    { glow: "181, 140, 255" },
  ),
  teapot: wrap(
    `
    <defs>
      <linearGradient id="teaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff0b0"/><stop offset="100%" stop-color="#dba32c"/></linearGradient>
    </defs>
    ${grounding("teaGr", 22, 38, 14, 5)}
    <ellipse cx="22" cy="28" rx="14" ry="10" fill="url(#teaGrad)" stroke="${INK}" stroke-width="1.5"/>
    <path d="M35 22c8-2 10 8 2 9" fill="none" stroke="${INK}" stroke-width="2.4"/>
    <path d="M9 26c-5-2-5 4 0 5" fill="none" stroke="${INK}" stroke-width="2.4"/>
    <rect x="18" y="16" width="8" height="5" rx="2" fill="url(#teaGrad)" stroke="${INK}" stroke-width="1.5"/>
    <ellipse cx="17" cy="22" rx="4" ry="2.4" fill="#ffffff" opacity="0.35"/>
    ${sheen("teaSheen", 16, 23, 8, 6)}
  `,
    { glow: "255, 214, 108" },
  ),
  yarn: wrap(
    `
    <defs>
      <radialGradient id="yarnGrad" cx="40%" cy="35%" r="70%"><stop offset="0%" stop-color="#ffc2df"/><stop offset="100%" stop-color="#d9497e"/></radialGradient>
    </defs>
    ${grounding("yarnGr", 24, 38, 14, 5)}
    <circle cx="24" cy="24" r="16" fill="url(#yarnGrad)" stroke="${INK}" stroke-width="1.5"/>
    <path d="M10 20c10 4 18 4 28 0M9 27c10 5 20 5 30 0M13 14c8 6 14 6 22 0" fill="none" stroke="#c73e6c" stroke-width="1.4" opacity="0.8"/>
    <path d="M12 18c9 3 16 3 25 0" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.4"/>
    ${sheen("yarnSheen", 17, 15, 8, 7)}
  `,
    { glow: "255, 158, 203" },
  ),
  doorbell: wrap(
    `
    <defs>
      <linearGradient id="doorbellBody" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f6c977"/><stop offset="48%" stop-color="#bd5b4d"/><stop offset="100%" stop-color="#522b67"/>
      </linearGradient>
      <linearGradient id="doorbellEdge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffdf9a"/><stop offset="100%" stop-color="#e66f88"/>
      </linearGradient>
      <radialGradient id="doorbellLens" cx="35%" cy="28%" r="75%">
        <stop offset="0%" stop-color="#8b5fc4"/><stop offset="45%" stop-color="#30204e"/><stop offset="100%" stop-color="#120d29"/>
      </radialGradient>
    </defs>
    ${grounding("doorbellGr", 24, 43, 15, 3.5)}
    <rect x="9.5" y="3.5" width="29" height="40" rx="8" fill="url(#doorbellBody)" stroke="${INK}" stroke-width="1.7"/>
    <rect x="11.5" y="5.5" width="25" height="17" rx="6" fill="#17112f" stroke="url(#doorbellEdge)" stroke-width="1.15"/>
    <circle cx="24" cy="14" r="7.1" fill="url(#doorbellLens)" stroke="#e77e9d" stroke-width="1"/>
    <circle cx="24" cy="14" r="5" fill="none" stroke="#6d4c93" stroke-width=".9" opacity=".9"/>
    <circle cx="24" cy="14" r="2.4" fill="#120d29" stroke="#f6c977" stroke-width=".7"/>
    <circle cx="22.9" cy="12.8" r=".9" fill="#fff4e0" opacity=".85"/>
    <circle cx="32.2" cy="18.7" r="1.1" fill="#9fe8c5" stroke="${INK}" stroke-width=".55"/>
    <path d="M15 25.5h18" stroke="#f6c977" stroke-width="1.1" opacity=".6"/>
    <circle cx="24" cy="33" r="8.2" fill="#4a2866" stroke="${INK}" stroke-width="1.3"/>
    <circle cx="24" cy="33" r="6.7" fill="none" stroke="#9fe8c5" stroke-width="2.1"/>
    <circle cx="24" cy="33" r="5.2" fill="#e28a58" stroke="#f8d58c" stroke-width=".9"/>
    <path d="M20.6 33.8c2.3-2.8 5.4-2.8 7.1-.1-2.1-.5-4.2.4-5.5 2.1" fill="none" stroke="#fff4e0" stroke-width=".8" stroke-linecap="round" opacity=".75"/>
    <path d="M8 31c-2-1.8-2-4.6.3-6.2M40 31c2-1.8 2-4.6-.3-6.2" fill="none" stroke="#e77e9d" stroke-width="1.35" stroke-linecap="round"/>
    <path d="M13.3 39.5c2.6 1.4 5.2 2 7.7 2M34.7 39.5c-2.6 1.4-5.2 2-7.7 2" fill="none" stroke="#9fe8c5" stroke-width=".8" stroke-linecap="round" opacity=".8"/>
    <path d="M14.4 27.3c-1.5-2.2-.1-4.4 2.1-4.7 1.4-.2 2.5.5 3.2 1.5-1.3-.3-2.4.1-3.1 1.1-.7 1-.9 1.8-2.2 2.1zM16.4 25.3c1.1-1.4 2.8-1.8 4.3-.8" fill="#f28bab" stroke="${INK}" stroke-width=".55"/>
    <path d="M32 27.2l.7 1.4 1.4.7-1.4.7-.7 1.4-.7-1.4-1.4-.7 1.4-.7zM18 9.1l.5 1 .9.5-.9.5-.5 1-.5-1-.9-.5.9-.5z" fill="#fff4e0" opacity=".9"/>
    ${sheen("doorbellSheen", 16, 9, 8, 10)}
  `,
    { glow: "231, 126, 157" },
  ),
  chai_pump: wrap(
    `
    <defs>
      <linearGradient id="chaiPumpReservoir" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f5d576"/><stop offset="100%" stop-color="#b66b2c"/>
      </linearGradient>
      <linearGradient id="chaiPumpPlunger" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#d6fff0"/><stop offset="100%" stop-color="#3ba296"/>
      </linearGradient>
      <linearGradient id="chaiPumpCup" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff4e0" stop-opacity="0.55"/><stop offset="100%" stop-color="#8ec9ff" stop-opacity="0.24"/>
      </linearGradient>
    </defs>
    ${grounding("chaiPumpGr", 24, 44, 16, 3)}
    <rect x="10" y="17" width="28" height="25" rx="5" fill="url(#chaiPumpReservoir)" stroke="${INK}" stroke-width="1.5"/>
    <rect x="8" y="14" width="32" height="7" rx="3" fill="#d35b2d" stroke="${INK}" stroke-width="1.5"/>
    <rect x="15" y="11" width="18" height="5" rx="2.5" fill="#f5d576" stroke="${INK}" stroke-width="1.3"/>
    <circle cx="24" cy="8" r="6" fill="url(#chaiPumpPlunger)" stroke="${INK}" stroke-width="1.5"/>
    <ellipse cx="21" cy="6" rx="2.4" ry="1.4" fill="#ffffff" opacity="0.55"/>
    <path d="M24 14v12" stroke="#fff4e0" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M24 24v7" stroke="#d35b2d" stroke-width="3" stroke-linecap="round"/>
    <path d="M20 27h8" stroke="#fff4e0" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>
    <path d="M14 31h20l-2 11H16z" fill="url(#chaiPumpCup)" stroke="${INK}" stroke-width="1.3"/>
    <path d="M16 35h16v7H16z" fill="#b66b2c" opacity="0.72"/>
    <path d="M17 32l4 3 3-3 3 3 3-3" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.85"/>
    <circle cx="20" cy="34" r="1.8" fill="#d6f5ef" stroke="${INK}" stroke-width="0.7"/>
    <circle cx="28" cy="36" r="1.8" fill="#d6f5ef" stroke="${INK}" stroke-width="0.7"/>
    ${sheen("chaiPumpSheen", 17, 20, 7, 8)}
  `,
    { glow: "245, 213, 118" },
  ),
  // --- treats (feature symbols) ------------------------------------------
  treat_chicken: wrap(
    `
    <defs>
      <linearGradient id="tcGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff0b0"/><stop offset="100%" stop-color="#dba32c"/></linearGradient>
    </defs>
    ${grounding("tcGr", 22, 34, 13, 5)}
    <path d="M10 32c0-10 8-18 18-18h4c4 0 6 4 3 7l-3 3c8 1 10 10 3 14-8 5-25-1-25-6z" fill="url(#tcGrad)" stroke="${INK}" stroke-width="1.5"/>
    <path d="M14 18c6-4 12-5 16-3" stroke="#ffffff" stroke-width="1.2" opacity="0.4" fill="none"/>
    <circle cx="16" cy="22" r="2" fill="${INK}"/>
    <path d="M20 30c3 3 8 3 11 0" stroke="${INK}" stroke-width="1" fill="none" opacity="0.5"/>
    ${sheen("tcSheen", 17, 20, 8, 6)}
  `,
    { glow: "245, 213, 118" },
  ),
  treat_salmon: wrap(
    `
    <defs>
      <linearGradient id="tsGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#c9ecff"/><stop offset="100%" stop-color="#4a8fc7"/></linearGradient>
    </defs>
    ${grounding("tsGr", 22, 32, 14, 5)}
    <path d="M8 24c8-10 26-10 34 0-8 10-26 10-34 0z" fill="url(#tsGrad)" stroke="${INK}" stroke-width="1.5"/>
    <path d="M38 24l6-6v12z" fill="#3d7cb0" stroke="${INK}" stroke-width="1.5"/>
    <path d="M12 22c6-5 18-5 24 0" stroke="#ffffff" stroke-width="1" opacity="0.4" fill="none"/>
    <circle cx="16" cy="22" r="1.8" fill="${INK}"/>
    ${sheen("tsSheen", 16, 19, 8, 5)}
  `,
    { glow: "142, 201, 255" },
  ),
  treat_bougie: wrap(
    `
    <defs>
      <radialGradient id="tbGrad" cx="40%" cy="35%" r="70%"><stop offset="0%" stop-color="#e6cbff"/><stop offset="100%" stop-color="#7a4fc9"/></radialGradient>
    </defs>
    ${grounding("tbGr", 24, 38, 12, 4)}
    <path d="M14 8l4 8 8-3-5 7 8 4-9 1 2 9-8-6-8 6 2-9-9-1 8-4-5-7 8 3z" fill="url(#tbGrad)" stroke="${INK}" stroke-width="1.2"/>
    <circle cx="36" cy="34" r="4" fill="#ffd76b" stroke="${INK}" stroke-width="1"/>
    <circle cx="35" cy="33" r="1.2" fill="#ffffff" opacity="0.7"/>
    ${sheen("tbSheen", 17, 16, 7, 6)}
  `,
    { glow: "201, 155, 255" },
  ),
  // --- wilds & legend ------------------------------------------------------
  wild_joey: wrap(
    `
    <defs>
      <linearGradient id="joeyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#aab2be"/><stop offset="100%" stop-color="#454c58"/></linearGradient>
    </defs>
    ${grounding("joeyGr", 24, 40, 16, 5)}
    <ellipse cx="24" cy="30" rx="15" ry="12" fill="url(#joeyGrad)" stroke="${INK}" stroke-width="1.5"/>
    <path d="M11 22l4-9 6 7z" fill="url(#joeyGrad)" stroke="${INK}" stroke-width="1.5"/>
    <path d="M37 22l-4-9-6 7z" fill="url(#joeyGrad)" stroke="${INK}" stroke-width="1.5"/>
    <path d="M14 20l2-5 3 4z" fill="#ffb0cf" opacity="0.7"/><path d="M34 20l-2-5-3 4z" fill="#ffb0cf" opacity="0.7"/>
    <circle cx="18" cy="27" r="2.8" fill="#ffe27a"/><circle cx="30" cy="27" r="2.8" fill="#ffe27a"/>
    <circle cx="18" cy="27.4" r="1.2" fill="${INK}"/><circle cx="30" cy="27.4" r="1.2" fill="${INK}"/>
    <circle cx="17.3" cy="26.3" r="0.6" fill="#ffffff"/><circle cx="29.3" cy="26.3" r="0.6" fill="#ffffff"/>
    <path d="M22 32c1 1 3 1 4 0" stroke="${INK}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M15 30h-3M33 30h3" stroke="${INK}" stroke-width="1" opacity="0.6"/>
    ${sheen("joeySheen", 17, 22, 9, 7)}
    <text x="24" y="45" text-anchor="middle" font-size="5" font-weight="700" fill="#ffe27a" font-family="Verdana, sans-serif" opacity="0.9">WILD</text>
  `,
    { glow: "255, 214, 122" },
  ),
  wild_phoebe: wrap(
    `
    <defs>
      <linearGradient id="phoebeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4a3d70"/><stop offset="100%" stop-color="#1a1230"/></linearGradient>
    </defs>
    ${grounding("phoebeGr", 24, 40, 16, 5)}
    <ellipse cx="24" cy="30" rx="15" ry="12" fill="url(#phoebeGrad)" stroke="#120b22" stroke-width="1.5"/>
    <path d="M11 22l4-9 6 7z" fill="url(#phoebeGrad)" stroke="#120b22" stroke-width="1.5"/>
    <path d="M37 22l-4-9-6 7z" fill="url(#phoebeGrad)" stroke="#120b22" stroke-width="1.5"/>
    <path d="M15 32c3 6 15 6 18 0z" fill="#fff4e0"/>
    <path d="M15 32c3 4 15 4 18 0" fill="none" stroke="#ffffff" stroke-width="0.6" opacity="0.5"/>
    <circle cx="18" cy="27" r="2.8" fill="#8ec9ff"/><circle cx="30" cy="27" r="2.8" fill="#8ec9ff"/>
    <circle cx="18" cy="27.4" r="1.2" fill="#120b22"/><circle cx="30" cy="27.4" r="1.2" fill="#120b22"/>
    <circle cx="17.3" cy="26.3" r="0.6" fill="#ffffff"/><circle cx="29.3" cy="26.3" r="0.6" fill="#ffffff"/>
    ${sheen("phoebeSheen", 17, 22, 9, 7)}
    <text x="24" y="45" text-anchor="middle" font-size="5" font-weight="700" fill="#c9ecff" font-family="Verdana, sans-serif" opacity="0.9">WILD</text>
  `,
    { glow: "142, 201, 255" },
  ),
  uniglee: wrap(
    `
    <defs>
      <linearGradient id="uniglow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff9ecb"/><stop offset="25%" stop-color="#ffd76b"/><stop offset="50%" stop-color="#8ec9ff"/>
        <stop offset="75%" stop-color="#c99bff"/><stop offset="100%" stop-color="#6bd6c9"/>
      </linearGradient>
    </defs>
    ${grounding("uniGr", 24, 40, 17, 5)}
    <ellipse cx="24" cy="30" rx="17" ry="11" fill="url(#uniglow)" stroke="${INK}" stroke-width="1.5"/>
    <path d="M24 10l3 8h-6z" fill="#ffe0c2" stroke="${INK}" stroke-width="1.2"/>
    <path d="M24 11.5l1.6 5" stroke="#ffffff" stroke-width="0.7" opacity="0.7"/>
    <circle cx="17" cy="28" r="2.6" fill="${INK}"/><circle cx="31" cy="28" r="2.6" fill="${INK}"/>
    <circle cx="16.3" cy="27.2" r="0.7" fill="#ffffff"/><circle cx="30.3" cy="27.2" r="0.7" fill="#ffffff"/>
    <path d="M10 24c3-2 5-1 5 1M38 24c-3-2-5-1-5 1" stroke="#ffffff" stroke-width="1" opacity="0.6" fill="none"/>
    ${sheen("uniSheen", 18, 22, 10, 7)}
  `,
    { glow: "255, 158, 203" },
  ),
};

/** Zero-emoji symbol markup for the board — see docs/DESIGN-SPEC.md §5/§11. */
export function symbolSvg(id: SymbolId): string {
  const atlasPosition: Partial<Record<SymbolId, string>> = {
    tumbler: "0% 0%",
    butterfly: "33.333% 0%",
    mixtape: "66.667% 0%",
    crystal: "100% 0%",
    chai: "0% 33.333%",
    candle: "33.333% 33.333%",
    // Engine IDs stay stable so the tested math is untouched; the shipped art
    // now follows Glee's canon instead of the prototype object names.
    cassette: "66.667% 33.333%", // cozy cardigan
    gnome: "100% 33.333%", // moonlit book stack
    mailbox: "0% 66.667%", // butterfly hair clip
    vhs: "33.333% 66.667%",
    teapot: "66.667% 66.667%", // Alaska/PNW aurora keepsake
    yarn: "100% 66.667%", // shared-life keepsake locket
    treat_chicken: "0% 100%",
    treat_salmon: "33.333% 100%",
    treat_bougie: "66.667% 100%",
    uniglee: "100% 100%",
  };

  if (id === "wild_joey" || id === "wild_phoebe") {
    const position = id === "wild_joey" ? "0% 50%" : "100% 50%";
    return `<span class="symbol-sprite symbol-sprite--wild" style="background-image:url('${import.meta.env.BASE_URL}assets/joey-phoebe-wilds.png');background-position:${position}" aria-hidden="true"></span>`;
  }

  const position = atlasPosition[id];
  if (!position) return SYMBOL_SVG[id];
  return `<span class="symbol-sprite" style="background-image:url('${import.meta.env.BASE_URL}assets/glee-symbol-atlas.png');background-position:${position}" aria-hidden="true"></span>`;
}

/** Fixed character art for the bonus wheel; only its light-chase overlay spins. */
export function wheelHeroArt(): string {
  return `<img class="wheel-hero-art" src="${import.meta.env.BASE_URL}assets/joey-phoebe-wheel.png" alt="Joey and Phoebe perched on the free-spin wheel" />`;
}

/**
 * Full-body cat sprites for pop-in moments — docs/DESIGN-SPEC.md §11, canon CANON.md.
 * pose: "strut" (entrance/idle), "eat" (fed a treat), "assist" (Joey boogie/help),
 * "unimpressed" (jar empty / wrong treat, exit tail-flick).
 */
export type CatPose = "strut" | "eat" | "assist" | "unimpressed";

export function catSprite(cat: "joey" | "phoebe", pose: CatPose = "strut"): string {
  const position = cat === "joey" ? "0% 50%" : "100% 50%";
  return `<span class="cat-pop-asset cat-pop-asset--${cat} cat-pop-asset--${pose}" style="background-image:url('${import.meta.env.BASE_URL}assets/joey-phoebe-wilds.png');background-position:${position}" role="img" aria-label="${cat === "joey" ? "Joey" : "Phoebe"}"></span>`;

  /* Legacy vector construction remains below temporarily as a documented
     fallback while the generated production sheet is release-tested. */
  const isJoey = cat === "joey";
  const bodyGrad = isJoey ? "catBodyJoey" : "catBodyPhoebe";
  const bodyStops = isJoey
    ? `<stop offset="0%" stop-color="#aab2be"/><stop offset="100%" stop-color="#454c58"/>`
    : `<stop offset="0%" stop-color="#3d3260"/><stop offset="100%" stop-color="#1a1230"/>`;
  const eyeColor = isJoey ? "#ffe27a" : "#8ec9ff";
  const chestPatch = isJoey ? "" : `<path d="M13 30c4 8 18 8 22 0z" fill="#fff4e0"/>`;
  const outline = isJoey ? INK : "#120b22";

  const tail =
    pose === "assist" && isJoey
      ? `<path d="M40 30c7-4 10 3 4 7-3 2-6 0-4-3" fill="none" stroke="${bodyGrad === "catBodyJoey" ? "#5c6470" : "#2d1f4c"}" stroke-width="3" stroke-linecap="round"/>`
      : pose === "unimpressed"
        ? `<path d="M40 28c8 0 9 8 1 8" fill="none" stroke="${isJoey ? "#5c6470" : "#2d1f4c"}" stroke-width="3" stroke-linecap="round"/>`
        : `<path d="M40 30c6-2 8 4 3 6" fill="none" stroke="${isJoey ? "#5c6470" : "#2d1f4c"}" stroke-width="3" stroke-linecap="round"/>`;

  const face =
    pose === "eat"
      ? `<ellipse cx="24" cy="32" rx="4" ry="2.6" fill="${outline}"/><ellipse cx="24" cy="30.5" rx="5" ry="1.4" fill="#ffe0c2" opacity="0.7"/>`
      : pose === "unimpressed"
        ? `<path d="M19 32h-2M31 32h2" stroke="${outline}" stroke-width="1.4" stroke-linecap="round"/>`
        : `<path d="M20 31c1.5 1.5 6.5 1.5 8 0" stroke="${outline}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;

  const prop =
    pose === "eat"
      ? `<ellipse cx="24" cy="41" rx="9" ry="3" fill="#7a4fc9" stroke="${outline}" stroke-width="1.2"/><ellipse cx="24" cy="40" rx="7" ry="1.8" fill="#c9a3ff"/>`
      : pose === "assist" && isJoey
        ? `<circle cx="34" cy="40" r="3" fill="#20163a" stroke="${outline}" stroke-width="1"/><circle cx="33" cy="39" r="0.8" fill="#ffd76b"/>`
        : "";

  const bodyLean = pose === "assist" ? "rotate(-6 24 30)" : pose === "unimpressed" ? "rotate(4 24 30)" : "";

  return wrap(
    `
    <defs>
      <linearGradient id="${bodyGrad}" x1="0" y1="0" x2="0" y2="1">${bodyStops}</linearGradient>
    </defs>
    ${grounding("catGr", 24, 42, 18, 5)}
    <g transform="${bodyLean}">
      <path d="M8 34c0-12 6-20 16-20s16 8 16 20c0 4-4 6-16 6S8 38 8 34z" fill="url(#${bodyGrad})" stroke="${outline}" stroke-width="1.5"/>
      <path d="M11 18l4-9 6 8z" fill="url(#${bodyGrad})" stroke="${outline}" stroke-width="1.5"/>
      <path d="M37 18l-4-9-6 8z" fill="url(#${bodyGrad})" stroke="${outline}" stroke-width="1.5"/>
      <path d="M14 16l2-5 3 4z" fill="#ffb0cf" opacity="0.65"/><path d="M34 16l-2-5-3 4z" fill="#ffb0cf" opacity="0.65"/>
      ${chestPatch}
      <circle cx="18" cy="26" r="3" fill="${eyeColor}"/><circle cx="30" cy="26" r="3" fill="${eyeColor}"/>
      <circle cx="18" cy="26.4" r="1.3" fill="#111"/><circle cx="30" cy="26.4" r="1.3" fill="#111"/>
      <circle cx="17.2" cy="25.1" r="0.7" fill="#ffffff"/><circle cx="29.2" cy="25.1" r="0.7" fill="#ffffff"/>
      ${face}
      ${tail}
    </g>
    ${prop}
    ${sheen("catSheen", 16, 18, 9, 8)}
  `,
    { vb: 48, glow: isJoey ? "255, 214, 122" : "142, 201, 255" },
  );
}

/** The AskJamie Wheel face — three wedges, hand-drawn dimensional prize wheel (docs §7). */
export function wheelSvg(): string {
  return `<svg viewBox="0 0 200 200" class="h-full w-full" style="filter:drop-shadow(0 0 14px rgba(107,214,201,0.5)) drop-shadow(0 6px 10px rgba(0,0,0,0.5))">
    <defs>
      <radialGradient id="wheelRim" cx="50%" cy="35%" r="70%">
        <stop offset="0%" stop-color="#4a3d70"/><stop offset="100%" stop-color="#1a1230"/>
      </radialGradient>
      <linearGradient id="wedgeTeal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#a8f0e5"/><stop offset="100%" stop-color="#3ba296"/></linearGradient>
      <linearGradient id="wedgePink" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff9ecb"/><stop offset="100%" stop-color="#c73e6c"/></linearGradient>
      <linearGradient id="wedgeGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff0b0"/><stop offset="100%" stop-color="#dba32c"/></linearGradient>
      <radialGradient id="hubGrad" cx="40%" cy="35%" r="70%"><stop offset="0%" stop-color="#fffdf5"/><stop offset="100%" stop-color="#f5d576"/></radialGradient>
    </defs>
    <circle cx="100" cy="100" r="98" fill="url(#wheelRim)"/>
    <circle cx="100" cy="100" r="96" fill="#241a42" stroke="#fff4e0" stroke-width="3"/>
    <g stroke="#1a1230" stroke-width="2">
      <path d="M100 100 L100 4 A96 96 0 0 1 183 148 Z" fill="url(#wedgeTeal)"/>
      <path d="M100 100 L183 148 A96 96 0 0 1 17 148 Z" fill="url(#wedgePink)"/>
      <path d="M100 100 L17 148 A96 96 0 0 1 100 4 Z" fill="url(#wedgeGold)"/>
    </g>
    <circle cx="100" cy="100" r="96" fill="none" stroke="#fff4e0" stroke-width="1" opacity="0.25"/>
    ${Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const x = 100 + Math.cos(a) * 90;
      const y = 100 + Math.sin(a) * 90;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="#fff4e0" opacity="0.85"/>`;
    }).join("")}
    <circle cx="100" cy="100" r="24" fill="url(#hubGrad)" stroke="${INK}" stroke-width="3"/>
    <circle cx="92" cy="90" r="7" fill="#ffffff" opacity="0.5"/>
    <text x="100" y="106" font-size="13" text-anchor="middle" fill="${INK}" font-family="Verdana, sans-serif" font-weight="700">GO</text>
  </svg>`;
}

/** One of the five-saucer fleet — dimensional cockpit dome + running lights + beam cone. */
export function saucerSvg(variant: 1 | 2 | 3 | 4 | 5 = 1): string {
  const domes: Record<number, [string, string]> = {
    1: ["#ffe0c2", "#c99bff"],
    2: ["#c9ecff", "#4fa8d8"],
    3: ["#ffd0e6", "#e8618c"],
    4: ["#d6ffe8", "#3ba296"],
    5: ["#fff0b8", "#dba32c"],
  };
  const [hi, lo] = domes[variant];
  const gid = `saucerDome${variant}`;
  const gid2 = `saucerHull${variant}`;
  return `<svg viewBox="0 0 64 40" class="h-full w-full" style="filter:drop-shadow(0 0 6px rgba(201,155,255,0.55)) drop-shadow(0 3px 3px rgba(0,0,0,0.4))" aria-hidden="true">
    <defs>
      <radialGradient id="${gid}" cx="35%" cy="25%" r="75%"><stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="${hi}"/><stop offset="100%" stop-color="${lo}"/></radialGradient>
      <linearGradient id="${gid2}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e6def7"/><stop offset="55%" stop-color="#8f86b8"/><stop offset="100%" stop-color="#4a4270"/></linearGradient>
    </defs>
    <ellipse cx="32" cy="27" rx="30" ry="7" fill="url(#${gid2})" stroke="${INK}" stroke-width="1.3"/>
    <ellipse cx="32" cy="24" rx="30" ry="6" fill="#ffffff" opacity="0.18"/>
    <ellipse cx="32" cy="17" rx="15" ry="13" fill="url(#${gid})" stroke="${INK}" stroke-width="1.3"/>
    <ellipse cx="27" cy="11" rx="5" ry="3.4" fill="#ffffff" opacity="0.55"/>
    <circle cx="10" cy="27" r="1.8" class="saucer-light-a" fill="#ffe27a"/>
    <circle cx="22" cy="29.5" r="1.8" class="saucer-light-b" fill="#ff9ecb"/>
    <circle cx="42" cy="29.5" r="1.8" class="saucer-light-a" fill="#8ec9ff"/>
    <circle cx="54" cy="27" r="1.8" class="saucer-light-b" fill="#ffe27a"/>
  </svg>`;
}

/**
 * Illustrated night-garden foreground silhouette — fence, plants, mailbox,
 * and a small moonlit book stack. Flat silhouette
 * so it reads as background, not a competing focal layer.
 */
export function gardenForegroundSvg(): string {
  return `<svg viewBox="0 0 390 90" preserveAspectRatio="none" class="h-full w-full" aria-hidden="true">
    <defs>
      <linearGradient id="fgFade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0f0a22" stop-opacity="0"/>
        <stop offset="100%" stop-color="#0f0a22" stop-opacity="0.9"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="390" height="90" fill="url(#fgFade)"/>
    <rect x="0" y="70" width="390" height="20" fill="#120b28"/>
    <g fill="none" stroke="#1c1440" stroke-width="3">
      ${Array.from({ length: 14 }, (_, i) => `<path d="M${20 + i * 27} 78v-22"/>`).join("")}
      <path d="M0 66h390" stroke-width="2"/>
    </g>
    <path d="M30 78c-2-14 4-26 12-26s10 10 9 26z" fill="#17103a"/>
    <path d="M46 78c-2-18 5-30 13-30s10 14 8 30z" fill="#1c1440"/>
    <g transform="translate(150 46)">
      <rect x="-3" y="18" width="6" height="14" fill="#1c1440"/>
      <path d="M-16 18a16 12 0 0 1 32 0z" fill="#17103a"/>
      <rect x="-16" y="18" width="32" height="16" rx="2" fill="#17103a"/>
    </g>
    <g transform="translate(230 58) rotate(-3)">
      <rect x="-17" y="12" width="34" height="8" rx="2" fill="#1c1440"/>
      <rect x="-14" y="4" width="31" height="8" rx="2" fill="#17103a"/>
      <rect x="-18" y="-4" width="33" height="8" rx="2" fill="#1c1440"/>
      <path d="M-12 0h20" fill="none" stroke="#2a2051" stroke-width="1.5"/>
    </g>
    <path d="M300 78c-2-16 5-28 13-28s11 12 9 28z" fill="#17103a"/>
    <path d="M318 78c-1-10 4-18 9-18s9 8 8 18z" fill="#1c1440"/>
  </svg>`;
}

/** Illustrated firefly jar — the cascade meter housing. fillLevel 0-8+. */
export function fireflyJarSvg(fillLevel: number): string {
  const clamped = Math.max(0, Math.min(8, fillLevel));
  const glowT = clamped / 8;
  const fireflies = Array.from({ length: clamped }, (_, i) => {
    const x = 18 + ((i * 13) % 28);
    const y = 34 - ((i * 7) % 20);
    return `<circle cx="${x}" cy="${y}" r="1.8" fill="#ffe27a" class="jar-firefly" style="animation-delay:${(i % 5) * 0.3}s"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.6s" repeatCount="indefinite" begin="${i * 0.2}s"/></circle>`;
  }).join("");
  return `<svg viewBox="0 0 64 56" class="h-full w-full" aria-hidden="true" style="filter:drop-shadow(0 0 ${4 + glowT * 10}px rgba(255,214,122,${0.25 + glowT * 0.5}))">
    <defs>
      <linearGradient id="jarGlass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff4e0" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#8ec9ff" stop-opacity="0.18"/>
      </linearGradient>
      <radialGradient id="jarGlow" cx="50%" cy="60%" r="60%">
        <stop offset="0%" stop-color="#ffe27a" stop-opacity="${0.15 + glowT * 0.55}"/>
        <stop offset="100%" stop-color="#ffe27a" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect x="20" y="4" width="24" height="8" rx="3" fill="#8f86b8" stroke="${INK}" stroke-width="1.3"/>
    <path d="M14 16a18 4 0 0 1 36 0v26a8 8 0 0 1-8 8H22a8 8 0 0 1-8-8z" fill="url(#jarGlass)" stroke="#fff4e0" stroke-width="2" opacity="0.95"/>
    <path d="M14 16a18 4 0 0 1 36 0v26a8 8 0 0 1-8 8H22a8 8 0 0 1-8-8z" fill="none" stroke="${INK}" stroke-width="1" opacity="0.5"/>
    <ellipse cx="32" cy="16" rx="18" ry="4" fill="#fff4e0" opacity="0.5"/>
    <path d="M20 14a14 3 0 0 1 8-1.6" stroke="#ffffff" stroke-width="1.4" opacity="0.55" fill="none"/>
    <circle cx="32" cy="34" r="20" fill="url(#jarGlow)"/>
    ${fireflies}
    <path d="M18 18v24" stroke="#ffffff" stroke-width="1.5" opacity="0.25"/>
  </svg>`;
}

/** Glee celebration avatar — retro-bright cartoon, no likeness (CANON S15). High bun, cardigan, butterfly clip, iced chai in hand. */
export function gleeAvatarSvg(): string {
  return `<svg viewBox="0 0 96 96" class="h-full w-full" aria-hidden="true" style="filter:drop-shadow(0 0 10px rgba(255,158,203,0.55)) drop-shadow(0 4px 4px rgba(0,0,0,0.4))">
    <defs>
      <linearGradient id="gleeCardigan" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8a5b8"/><stop offset="100%" stop-color="#b3597a"/></linearGradient>
      <radialGradient id="gleeSkin" cx="40%" cy="30%" r="70%"><stop offset="0%" stop-color="#ffe0c2"/><stop offset="100%" stop-color="#e8b98c"/></radialGradient>
      <linearGradient id="gleeHair" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7a5230"/><stop offset="100%" stop-color="#4a3018"/></linearGradient>
    </defs>
    <ellipse cx="48" cy="88" rx="28" ry="6" fill="#0c0620" opacity="0.35"/>
    <path d="M20 88c0-22 8-34 28-34s28 12 28 34z" fill="url(#gleeCardigan)" stroke="${INK}" stroke-width="1.8"/>
    <path d="M32 60c4 6 28 6 32 0" fill="none" stroke="#fff4e0" stroke-width="1" opacity="0.4"/>
    <circle cx="48" cy="40" r="20" fill="url(#gleeSkin)" stroke="${INK}" stroke-width="1.6"/>
    <path d="M28 34c0-14 10-22 20-22s20 8 20 22c-6-6-34-6-40 0z" fill="url(#gleeHair)" stroke="${INK}" stroke-width="1.6"/>
    <circle cx="48" cy="16" r="9" fill="url(#gleeHair)" stroke="${INK}" stroke-width="1.4"/>
    <circle cx="39" cy="40" r="3" fill="${INK}"/><circle cx="57" cy="40" r="3" fill="${INK}"/>
    <circle cx="38" cy="38.6" r="1" fill="#fff"/><circle cx="56" cy="38.6" r="1" fill="#fff"/>
    <path d="M40 48c3 3 13 3 16 0" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M63 26c4-2 8 0 8 4s-5 5-9 2" fill="#ff9ecb" stroke="${INK}" stroke-width="1.1"/>
    <path d="M63 26c4-2 8 0 8 4s-5 5-9 2" fill="#8ec9ff" stroke="${INK}" stroke-width="1.1" opacity="0.7" transform="rotate(35 67 30)"/>
    <g transform="translate(64 58)">
      <path d="M-6 -4h12l-1 18a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2z" fill="#4fa8d8" stroke="${INK}" stroke-width="1.2"/>
      <rect x="-5" y="-2" width="10" height="1.6" fill="#fff4e0" opacity="0.7"/>
      <path d="M2 -4v-5" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>
    </g>
  </svg>`;
}

/** AskJamie perch avatar — friendly round robot-adjacent cartoon, consistent vibe with his existing site avatar. */
export function askJamieSvg(): string {
  return `<svg viewBox="0 0 64 64" class="h-full w-full" aria-hidden="true" style="filter:drop-shadow(0 0 6px rgba(107,214,201,0.5))">
    <defs>
      <radialGradient id="ajBody" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#d6f5ef"/><stop offset="100%" stop-color="#3ba296"/></radialGradient>
    </defs>
    <ellipse cx="32" cy="58" rx="16" ry="4" fill="#0c0620" opacity="0.3"/>
    <rect x="28" y="8" width="8" height="10" rx="2" fill="#8f86b8" stroke="${INK}" stroke-width="1.2"/>
    <circle cx="32" cy="6" r="3" fill="#ffe27a"/>
    <rect x="12" y="18" width="40" height="32" rx="14" fill="url(#ajBody)" stroke="${INK}" stroke-width="1.6"/>
    <rect x="18" y="26" width="28" height="14" rx="7" fill="#0f2f3a"/>
    <circle cx="26" cy="33" r="3.6" fill="#8ec9ff"/><circle cx="38" cy="33" r="3.6" fill="#8ec9ff"/>
    <circle cx="25" cy="31.6" r="1" fill="#ffffff"/><circle cx="37" cy="31.6" r="1" fill="#ffffff"/>
    <path d="M22 44c4 3 16 3 20 0" stroke="${INK}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <rect x="4" y="30" width="8" height="4" rx="2" fill="#8f86b8" stroke="${INK}" stroke-width="1"/>
    <rect x="52" y="30" width="8" height="4" rx="2" fill="#8f86b8" stroke="${INK}" stroke-width="1"/>
  </svg>`;
}
