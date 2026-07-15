/**
 * Original inline UI art — zero emoji, zero third-party clip art. The remaining
 * inline SVG art covers bonus/supporting presentation (characters, wheel,
 * saucers, meters, and avatars); board symbol glyphs resolve through the
 * canonical asset manifest. Canon/IP: docs/CANON.md,
 * docs/IP-GUARDRAILS.md (silhouette/vibe only, no brand marks).
 *
 * Design system (docs/prompts/DESIGN-AGENT-PROMPT.md): the remaining inline
 * art follows the retro-bright palette, dimensional lighting, consistent ink
 * outlines, and tinted presentation glows.
 */
import type { SymbolId } from "../engine/types";
import { SYMBOL_ASSETS, SYMBOL_ATLASES } from "./asset-manifest";

const INK = "#20163a";

/** Zero-emoji symbol markup for the board — see docs/DESIGN-SPEC.md §5/§11. */
export function symbolSvg(id: SymbolId): string {
  const asset = SYMBOL_ASSETS[id];
  const base = import.meta.env.BASE_URL;
  if (asset.kind === "svg") {
    return `<img class="symbol-asset symbol-asset--vector" src="${base}${asset.source}" alt="" aria-hidden="true" />`;
  }

  if (asset.kind === "image") {
    const optimized = asset.optimized ? `${base}${asset.optimized}` : "";
    const source = `${base}${asset.source}`;
    return optimized
      ? `<picture class="symbol-picture"><source type="image/webp" srcset="${optimized}" /><img class="symbol-asset" src="${source}" alt="" aria-hidden="true" /></picture>`
      : `<img class="symbol-asset" src="${source}" alt="" aria-hidden="true" />`;
  }

  const atlas = SYMBOL_ATLASES[asset.atlas];
  const x = atlas.columns === 1 ? 0 : (asset.column / (atlas.columns - 1)) * 100;
  const y = atlas.rows === 1 ? 0 : (asset.row / (atlas.rows - 1)) * 100;
  const webp = `${base}${atlas.webp}`;
  const png = `${base}${atlas.png}`;
  const extraClass = id === "wild_chai" ? " symbol-sprite--chai-wild" : "";
  return `<span class="symbol-sprite symbol-sprite--atlas${extraClass}" style="background-image:url('${png}');background-image:image-set(url('${webp}') type('image/webp'), url('${png}') type('image/png'));background-size:${atlas.columns * 100}% ${atlas.rows * 100}%;background-position:${x}% ${y}%" aria-hidden="true"></span>`;
}

/** Fixed character art for the bonus wheel; only its light-chase overlay spins. */
export function wheelHeroArt(): string {
  const base = import.meta.env.BASE_URL;
  return `<picture class="wheel-hero-picture"><source type="image/webp" srcset="${base}assets/optimized/joey-phoebe-wheel.webp" /><img class="wheel-hero-art" src="${base}assets/joey-phoebe-wheel.png" alt="Joey and Phoebe perched on the free-spin wheel" /></picture>`;
}

/**
 * Full-body cat sprites for pop-in moments — docs/DESIGN-SPEC.md §11, canon CANON.md.
 * pose: "strut" (entrance/idle), "eat" (fed a treat), "assist" (Joey boogie/help),
 * "unimpressed" (jar empty / wrong treat, exit tail-flick).
 */
export type CatPose = "strut" | "eat" | "assist" | "unimpressed";

export function catSprite(cat: "joey" | "phoebe", pose: CatPose = "strut"): string {
  const position = cat === "joey" ? "0% 50%" : "100% 50%";
  const base = import.meta.env.BASE_URL;
  return `<span class="cat-pop-asset cat-pop-asset--${cat} cat-pop-asset--${pose}" style="background-image:url('${base}assets/joey-phoebe-wilds.png');background-image:image-set(url('${base}assets/optimized/joey-phoebe-wilds.webp') type('image/webp'), url('${base}assets/joey-phoebe-wilds.png') type('image/png'));background-position:${position}" role="img" aria-label="${cat === "joey" ? "Joey" : "Phoebe"}"></span>`;

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
