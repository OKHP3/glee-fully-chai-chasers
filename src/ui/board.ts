/**
 * Main-board rendering & animation. Consumes engine `SpinResult`/`CascadeStep`
 * objects and animates them; owns zero game math (per src/ui/README.md contract).
 * Spec: docs/DESIGN-SPEC.md §3 (layout), §7 (free spins/wheel), §11 (animation).
 * Visual system: docs/prompts/DESIGN-AGENT-PROMPT.md / docs/DESIGN-HANDOFF.md.
 *
 * Zero emoji on the shipped board — all symbols/cats/saucers/jar/wheel are
 * original inline SVG (src/ui/symbols.ts). The board is housed in an
 * illustrated "cabinet": marquee header, ornate reel-window frame, an
 * illustrated firefly-jar meter, a console-style bet bar, and a layered
 * night-garden scene behind it all (CSS + SVG, no canvas/WebGL).
 */
import type {
  CascadeStep,
  ChaiRainWild,
  KeepsakeMemoryActionResult,
  KeepsakeMemoryCard,
  KeepsakeMemoryState,
  SpinResult,
  SymbolId,
  TreatKind,
  TreatTimeMode,
  TreatTimeWild,
  UniGleeTrigger,
} from "../engine/types";
import type { LapQuestSpot } from "../engine/types";
import { REELS, ROWS } from "../engine/reels";
import { BET_LEVELS, LINES, availableBetLevels, betPerLine, sparksForSpin, xpIntoLevel, applyBustProofRefill } from "../engine/economy";
import { spin } from "../engine/cascade";
import {
  BOLD_CHAI_DURATION_MS,
  BOLD_CHAI_PUMPS_PER_CUP,
  completeBoldChaiPump,
  createBoldChaiPumpState,
  pumpBoldChai,
  settleBoldChaiPump,
} from "../engine/bold-chai-pump";
import { PAYLINES, PAYOUT_SCALE, PAYTABLE } from "../engine/paylines";
import { collectTreat, consumeForVisit, settleTreatJar, TREAT_JAR_FREE_SPINS } from "../engine/features";
import { mulberry32, productionSeed } from "../engine/rng";
import {
  runFreeSpinSession,
  spinWheel,
  wheelWedgeLabel,
  type FreeSpinRoundResult,
  type FreeSpinSessionResult,
  type JoeyLaundrySessionResult,
  type WheelWedge,
} from "../engine/freespins";
import { runUniGleeBaseMarathon, type UniGleeBaseMarathonResult } from "../engine/uniglee-marathon";
import {
  createLapQuestChallenge,
  LAP_QUEST_SPOT_LABELS,
  spinLapQuestRound,
  type LapQuestChallenge,
  type LapQuestRoundResult,
} from "../engine/lap-quest";
import { mountLapQuestLedge } from "./lap-quest-ledge";
import { beginKeepsakeMemory, createKeepsakeMemory, pickKeepsakeMemoryCard, resolveKeepsakeMemoryMismatchResult } from "../engine/keepsake-memory";
import type { GameState, ThemeMode } from "../state";
import { resetAll, saveGameState } from "../state";
import {
  symbolSvg,
  catSprite,
  wheelHeroArt,
  saucerSvg,
  gardenForegroundSvg,
  fireflyJarSvg,
  gleeAvatarSvg,
  type CatPose,
} from "./symbols";
import {
  isUnlocked,
  playBonusFanfare,
  playChaiStorm,
  playCascadeArpeggio,
  playCascadeTick,
  playDoorbellRing,
  playBoldChaiCupSwap,
  playBoldChaiPumpPress,
  playBoldChaiTimerBuzzer,
  playKeepsakeCardFlip,
  playKeepsakeFailure,
  playKeepsakeMatch,
  playKeepsakeMismatch,
  playKeepsakeSuccess,
  playJoeyCue,
  playLaundryPawStrike,
  playLaundrySockDrop,
  playPhoebeCue,
  playLapQuestReveal,
  playLapQuestWildLand,
  playTreatLand,
  playTreatTimeCue,
  playUniGleeSting,
  playWinPluck,
  playWheelTick,
  playStrangerDangerPanic,
  SFX_VOLUME_MAX,
  setMusicEnabled,
  setSfxEnabled,
  setSfxVolume,
  unlock,
} from "../audio/synth";
import { MUSIC_VOLUME_MAX, setBoldChaiUrgency, setMusicVolume, startBaseMusic, startUniGleeMusic, stopBaseMusic, stopUniGleeMusic } from "../audio/music";

let statusTimeout: number | undefined;

function publicAsset(fileName: string): string {
  return `${import.meta.env.BASE_URL}assets/${fileName}`;
}

function optimizedAsset(fileName: string): string {
  return publicAsset(`optimized/${fileName.replace(/\.(png|jpe?g)$/i, ".webp")}`);
}

function publicPicture(fileName: string, className: string, alt = ""): string {
  return `<picture class="${className}"><source type="image/webp" srcset="${optimizedAsset(fileName)}" /><img src="${publicAsset(fileName)}" alt="${alt}" /></picture>`;
}

function boldChaiAsset(fileName: string): string {
  return publicAsset(`bold-chai/${fileName}`);
}

const PAYTABLE_SYMBOLS: ReadonlyArray<{ id: SymbolId; name: string }> = [
  { id: "tumbler", name: "Mermaid Tumbler" },
  { id: "butterfly", name: "Midnight Butterfly" },
  { id: "mixtape", name: "Glee Mix Tape" },
  { id: "crystal", name: "Crystal Cluster" },
  { id: "chai", name: "Iced Chai To-Go" },
  { id: "candle", name: "Cinnamon Candle" },
  { id: "cassette", name: "Glee Cardigan" },
  { id: "gnome", name: "Moonlit Book Stack" },
  { id: "mailbox", name: "Butterfly Hair Clip" },
  { id: "vhs", name: "VHS Tape" },
  { id: "teapot", name: "Aurora Keepsake" },
  { id: "yarn", name: "Shared-Life Locket" },
];

/**
 * Presentation boundary for the engine-owned Moonlit Keepsake Trail state.
 * The controller is intentionally supplied by the engine workstream: this
 * file renders typed state and forwards card indexes, but never compares
 * symbols, counts strikes, or awards spins.
 */
export type KeepsakeMemoryViewCard = KeepsakeMemoryCard;
export type KeepsakeMemoryViewState = KeepsakeMemoryState;
export type KeepsakeMemoryViewActionResult = KeepsakeMemoryActionResult;

export interface KeepsakeMemoryController {
  state: KeepsakeMemoryViewState;
  begin(): KeepsakeMemoryViewState;
  pick(index: number): KeepsakeMemoryViewActionResult;
  resolveMismatch(): KeepsakeMemoryViewActionResult;
}

/** Adapts the pure engine state machine to the UI's typed presentation port. */
export function createKeepsakeMemoryController(initialState: KeepsakeMemoryState): KeepsakeMemoryController {
  let state = initialState;
  return {
    get state() { return state; },
    begin() {
      state = beginKeepsakeMemory(state);
      return state;
    },
    pick(index) {
      const action = pickKeepsakeMemoryCard(state, index);
      state = action.state;
      return action;
    },
    resolveMismatch() {
      const action = resolveKeepsakeMemoryMismatchResult(state);
      state = action.state;
      return action;
    },
  };
}

export function renderBoard(
  root: HTMLElement,
  state: GameState,
  visibleGrid?: CascadeStep["grid"],
): void {
  const resolvedTheme = resolveTheme(state.theme);
  document.documentElement.dataset.theme = resolvedTheme;
  const level = xpIntoLevel(state.xp);
  const bets = availableBetLevels(level.level);
  const settledGrid = visibleGrid ?? spin({
    rng: mulberry32(20260717),
    betPerLine: 1,
    treatJar: state.treatJar,
    spinsSincePopIn: 0,
  }).steps[0].grid;

  root.innerHTML = `
    <div class="relative h-full w-full flex flex-col text-amber-100 overflow-hidden cc-root" data-theme="${resolvedTheme}" data-reduced-motion="${state.reducedMotion}">
      <div class="night-garden" id="bg-layer">${gardenDecor()}</div>
      <div class="relative z-10 h-full w-full flex flex-col cc-shell">
        <header class="marquee">
          <div class="marquee-bulbs" aria-hidden="true">${bulbRow()}</div>
          <div class="marquee-row">
            <span class="level-chip" aria-label="Player level">Lvl ${level.level}<em>${level.into}/${level.span} Sparks</em></span>
            <h1 class="marquee-title">Glee-fully <span>Chai Chasers</span></h1>
            <button id="paytable-btn" class="chrome-btn" aria-label="Open symbol guide and game rules" title="Symbol guide">
              <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="#f5d576" stroke-width="1.8" aria-hidden="true">
                <path d="M5 4.5h10.5A3.5 3.5 0 0 1 19 8v11.5H8.5A3.5 3.5 0 0 0 5 23z"/>
                <path d="M5 4.5v15M9 8h6M9 12h6"/>
              </svg>
            </button>
            <button id="settings-btn" class="chrome-btn" aria-label="Settings">
              <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="#f5d576" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="3.2"/>
                <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2L10 21h4l.6-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.07-.4.1-.8.1-1.2z"/>
              </svg>
            </button>
          </div>
        </header>

        <div class="jar-meter" aria-live="polite" aria-label="Firefly cascade meter">
          <div class="jar-meter-icon" id="jar-icon">${fireflyJarSvg(state.fireflyMeter)}</div>
          <div class="jar-meter-copy">
            <span class="jar-meter-kicker">Firefly Cascade</span>
            <strong id="meter-count" class="jar-meter-count">${state.fireflyMeter} / 4</strong>
            <small>Reach 4 to unlock 7 free spins</small>
          </div>
        </div>

        <main class="cabinet-frame">
          <span class="ornament ornament-tl">${miniStar()}</span>
          <span class="ornament ornament-tr">${miniStar()}</span>
          <span class="ornament ornament-bl">${miniStar()}</span>
          <span class="ornament ornament-br">${miniStar()}</span>
          <div id="reel-grid" class="reel-grid" role="img" aria-label="Reel board">
            ${renderGridHtml(settledGrid, undefined, state.paylineGuideOn)}
          </div>
        </main>

        <div class="companion-row">
          <div id="treat-jar" aria-label="Treat Jar" class="treat-jar-housing">
            <span class="treat-jar-title">Treat Jar</span>
            ${treatJarHtml(state)}
          </div>
          <div id="askjamie-perch" aria-label="AskJamie" class="askjamie-housing">
            <div class="askjamie-icon">${publicPicture("askjamie-avatar.jpg", "askjamie-picture")}</div>
            <span>AskJamie</span>
          </div>
        </div>

        <div id="status-line" class="status-line" aria-live="polite"></div>

        <footer class="bet-console">
          <div class="coin-chip" aria-label="Glee-coin balance">${state.balance.toLocaleString()}<em>coins</em></div>
          <div class="flex-1"></div>
          <button id="bet-down" class="chrome-btn" aria-label="Decrease bet">−</button>
          <span class="bet-display" id="bet-display">${state.bet}</span>
          <button id="bet-up" class="chrome-btn" aria-label="Increase bet">+</button>
          <button id="sparkle-btn" class="sparkle-btn">
            <span>SPARKLE!</span>
          </button>
        </footer>

      </div>
    </div>
  `;

  wireControls(root, state, bets);
}

function bulbRow(): string {
  return Array.from({ length: 16 }, (_, i) => `<span class="bulb" style="animation-delay:${(i % 4) * 0.18}s"></span>`).join("");
}

function miniStar(): string {
  return `<svg viewBox="0 0 24 24" class="h-full w-full" aria-hidden="true">
    <path d="M12 1l3 7 7 1-5.2 5 1.5 7.5L12 18l-6.3 3.5L7.2 14 2 9l7-1z" fill="#f5d576" stroke="#2d1f4c" stroke-width="1"/>
  </svg>`;
}

function gardenDecor(): string {
  const saucers = [
    { top: "4%", left: "8%", delay: "0s", v: 1 as const },
    { top: "2%", left: "32%", delay: "0.8s", v: 2 as const },
    { top: "5%", left: "50%", delay: "1.6s", v: 3 as const },
    { top: "2%", left: "68%", delay: "2.4s", v: 4 as const },
    { top: "4%", left: "86%", delay: "1.2s", v: 5 as const },
  ];
  const stars = Array.from({ length: 26 }, (_, i) => ({
    top: `${4 + ((i * 17) % 55)}%`,
    left: `${3 + ((i * 41) % 94)}%`,
    delay: `${(i % 6) * 0.5}s`,
    fast: i % 3 === 0,
  }));
  const fireflies = Array.from({ length: 6 }, (_, i) => ({
    top: `${45 + ((i * 37) % 30)}%`,
    left: `${8 + ((i * 53) % 84)}%`,
    delay: `${(i % 5) * 0.7}s`,
  }));

  const saucerHtml = saucers
    .map(
      (s, i) => `
      <div class="saucer-unit" data-saucer="${i}" style="top:${s.top};left:${s.left};animation-delay:${s.delay}">
        <div class="saucer-beam"></div>
        <div class="saucer-art">${saucerSvg(s.v)}</div>
      </div>`,
    )
    .join("");
  const starHtml = stars
    .map((s) => `<div class="star ${s.fast ? "star-fast" : "star-slow"}" style="top:${s.top};left:${s.left};animation-delay:${s.delay}"></div>`)
    .join("");
  const fireflyHtml = fireflies
    .map((f) => `<div class="firefly" style="top:${f.top};left:${f.left};animation-delay:${f.delay}"></div>`)
    .join("");

  return `
    <div class="aurora-ribbons"><span></span><span></span><span></span></div>
    ${starHtml}
    ${saucerHtml}
    ${fireflyHtml}
    <div class="garden-foreground">${gardenForegroundSvg()}</div>
  `;
}

function treatJarHtml(state: GameState): string {
  const jar = state.treatJar;
  return `
    <span title="Chicken Comets" class="treat-chip"><span class="treat-icon">${symbolSvg("treat_chicken")}</span>${jar.chicken}</span>
    <span title="Salmon Stars" class="treat-chip"><span class="treat-icon">${symbolSvg("treat_salmon")}</span>${jar.salmon}</span>
    <span title="Bougie Bites" class="treat-chip"><span class="treat-icon">${symbolSvg("treat_bougie")}</span>${jar.bougie}</span>
  `;
}

export function renderGridHtml(
  grid: SpinResult["steps"][number]["grid"],
  keepsakeZone?: SpinResult["steps"][number]["keepsakeZone"],
  showGuide = false,
  winningLineIndices: readonly number[] = [],
): string {
  let html = "";
  for (let reel = 0; reel < REELS; reel++) {
    html += `<div class="reel-col" data-reel="${reel}">`;
    for (let row = 0; row < ROWS; row++) {
      const cell = grid[reel][row];
      const symbol = cell.symbol;
      const visibleMultiplier = cell.multiplier ?? cell.handbagMultiplier;
      const badge = visibleMultiplier
        ? `<span class="multiplier-badge" aria-label="${visibleMultiplier} times wild">×${visibleMultiplier}</span>`
        : "";
      const chaiWild = symbol === "wild_chai";
      const chaiWildBadge = chaiWild ? `<span class="chai-wild-badge" aria-hidden="true">WILD CHAI</span>` : "";
      const classes = [
        "cell",
        visibleMultiplier ? "multiplier-wild" : "",
        chaiWild ? "chai-wild-cell" : "",
        cell.sticky === "lap_quest" ? "lap-quest-wild" : "",
      ].filter(Boolean).join(" ");
      const accessibility = chaiWild ? ` role="img" aria-label="Mermaid cup wild chai"` : "";
      html += `<div class="${classes}" data-row="${row}" data-symbol="${symbol}"${accessibility}>${symbolSvg(symbol as SymbolId)}${badge}${chaiWildBadge}</div>`;
    }
    html += "</div>";
  }
  if (keepsakeZone) {
    html += `<div class="keepsake-constellation" aria-label="${keepsakeZone.width} by ${keepsakeZone.height} giant keepsake" aria-live="polite">
      <div class="keepsake-constellation-symbol" style="grid-column:${keepsakeZone.leftReel + 1} / span ${keepsakeZone.width};grid-row:${keepsakeZone.topRow + 1} / span ${keepsakeZone.height}">
        ${symbolSvg(keepsakeZone.symbol)}
      </div>
    </div>`;
  }
  const winning = new Set(winningLineIndices);
  const paths = PAYLINES.map((line, lineIndex) => {
    const points = line.map((row, reel) => `${10 + reel * 20},${12.5 + row * 25}`);
    const winningClass = winning.has(lineIndex) ? " is-winning" : "";
    return `<path class="payline-path${showGuide ? " is-guide" : ""}${winningClass}" data-line-index="${lineIndex}" d="M${points.join(" L")}" pathLength="1"/>`;
  }).join("");
  return `${html}<svg class="payline-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${paths}</svg>`;
}

function setStatus(root: HTMLElement, message: string): void {
  const el = root.querySelector<HTMLDivElement>("#status-line")!;
  el.textContent = message;
  window.clearTimeout(statusTimeout);
  statusTimeout = window.setTimeout(() => {
    el.textContent = "";
  }, 4000);
}

function updateJar(root: HTMLElement, count: number): void {
  const icon = root.querySelector<HTMLDivElement>("#jar-icon");
  if (icon) icon.innerHTML = fireflyJarSvg(count);
  const label = root.querySelector<HTMLSpanElement>("#meter-count");
  if (label) label.textContent = `${count} / 4`;
}

function wireControls(root: HTMLElement, state: GameState, bets: number[]): void {
  const sparkleBtn = root.querySelector<HTMLButtonElement>("#sparkle-btn")!;
  const betDisplay = root.querySelector<HTMLSpanElement>("#bet-display")!;
  const betUp = root.querySelector<HTMLButtonElement>("#bet-up")!;
  const betDown = root.querySelector<HTMLButtonElement>("#bet-down")!;
  const settingsBtn = root.querySelector<HTMLButtonElement>("#settings-btn")!;
  const paytableBtn = root.querySelector<HTMLButtonElement>("#paytable-btn")!;

  betUp.addEventListener("click", () => {
    const idx = bets.indexOf(state.bet);
    if (idx < bets.length - 1) {
      state.bet = bets[idx + 1];
      betDisplay.textContent = String(state.bet);
      saveGameState(state);
    }
  });

  betDown.addEventListener("click", () => {
    const idx = bets.indexOf(state.bet);
    if (idx > 0) {
      state.bet = bets[idx - 1];
      betDisplay.textContent = String(state.bet);
      saveGameState(state);
    }
  });

  settingsBtn.addEventListener("click", () => openSettingsPage(root, state));
  paytableBtn.addEventListener("click", () => openPaytablePage(root));

  sparkleBtn.addEventListener("click", () => {
    if (!isUnlocked()) unlock();
    startBaseMusic();
    if (sparkleBtn.disabled) return;
    void runSpin(root, state, sparkleBtn);
  });
}

function resolveTheme(theme: ThemeMode): "dark" | "light" {
  if (theme === "light" || theme === "dark") return theme;
  return typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function openSettingsPage(root: HTMLElement, state: GameState): void {
  const page = document.createElement("section");
  page.className = "game-page settings-page";
  page.setAttribute("role", "dialog");
  page.setAttribute("aria-modal", "true");
  page.setAttribute("aria-labelledby", "settings-title");
  page.innerHTML = `
    <div class="game-page-topbar">
      <button class="page-close chrome-btn" aria-label="Close settings">←</button>
      <div><p class="page-eyebrow">YOUR CHAI CHASE</p><h2 id="settings-title">Settings</h2></div>
      <span class="page-top-spacer" aria-hidden="true"></span>
    </div>
    <div class="game-page-scroll">
      <section class="settings-card">
        <h3>Look &amp; feel</h3>
        <p class="settings-help">Choose how the night garden appears on this device.</p>
        <div class="theme-choice" role="radiogroup" aria-label="Appearance">
          ${(["system", "dark", "light"] as ThemeMode[]).map((theme) => `
            <button type="button" class="theme-option ${state.theme === theme ? "is-selected" : ""}" data-theme-option="${theme}" role="radio" aria-checked="${state.theme === theme}">
              <span class="theme-swatch theme-swatch--${theme}" aria-hidden="true"></span>${theme[0].toUpperCase() + theme.slice(1)}
            </button>`).join("")}
        </div>
      </section>

      <section class="settings-card">
        <div class="settings-heading-row"><div><h3>Sound</h3><p class="settings-help">A warm mix, tuned your way.</p></div>
          <label class="sound-switch"><input id="settings-sound-toggle" type="checkbox" ${state.soundOn ? "checked" : ""}/><span aria-hidden="true"></span><b id="sound-status">${state.soundOn ? "On" : "Off"}</b></label>
        </div>
        ${volumeControl("music", "Music", state.musicVolume, "The Chai Chase score")}
        ${volumeControl("sfx", "Sound effects", state.sfxVolume, "Cascades, cats, and celebrations")}
      </section>

      <section class="settings-card settings-card--compact">
        <div><h3>Reduce motion</h3><p class="settings-help">Use gentle fades instead of movement.</p></div>
        <label class="sound-switch"><input id="reduced-motion-toggle" type="checkbox" ${state.reducedMotion ? "checked" : ""}/><span aria-hidden="true"></span><b>${state.reducedMotion ? "On" : "Off"}</b></label>
      </section>

      <section class="settings-card settings-card--compact">
        <div><h3>Payline guide</h3><p class="settings-help">Show all 40 paylines faintly on the resting board. Winning lines still glow after every win.</p></div>
        <label class="sound-switch"><input id="payline-guide-toggle" type="checkbox" ${state.paylineGuideOn ? "checked" : ""}/><span aria-hidden="true"></span><b>${state.paylineGuideOn ? "On" : "Off"}</b></label>
      </section>

      <section class="settings-card about-card">
        <h3>About this gift</h3>
        <p>A cozy, original Chai Chase for Glee — fictional Glee-coins only, with no purchases or ads. Basic reach measurement helps Jamie understand how the gift is finding people.</p>
      </section>

      <button id="settings-reset" class="reset-progress-btn">Start fresh</button>
    </div>`;
  root.querySelector(".cc-root")?.appendChild(page);

  const close = () => page.remove();
  page.querySelector<HTMLButtonElement>(".page-close")?.addEventListener("click", close);
  page.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });
  page.querySelectorAll<HTMLButtonElement>("[data-theme-option]").forEach((button) => {
    button.addEventListener("click", () => {
      state.theme = button.dataset.themeOption as ThemeMode;
      const resolved = resolveTheme(state.theme);
      root.querySelector<HTMLElement>(".cc-root")?.setAttribute("data-theme", resolved);
      document.documentElement.dataset.theme = resolved;
      page.querySelectorAll<HTMLButtonElement>("[data-theme-option]").forEach((option) => {
        const selected = option === button;
        option.classList.toggle("is-selected", selected);
        option.setAttribute("aria-checked", String(selected));
      });
      saveGameState(state);
    });
  });

  const soundToggle = page.querySelector<HTMLInputElement>("#settings-sound-toggle")!;
  soundToggle.addEventListener("change", () => {
    state.soundOn = soundToggle.checked;
    setSfxEnabled(state.soundOn);
    setMusicEnabled(state.soundOn);
    if (state.soundOn) startBaseMusic(); else stopBaseMusic();
    page.querySelector("#sound-status")!.textContent = state.soundOn ? "On" : "Off";
    saveGameState(state);
  });

  wireVolume(page, "music", (value) => { state.musicVolume = value; setMusicVolume(value); }, () => saveGameState(state));
  wireVolume(page, "sfx", (value) => { state.sfxVolume = value; setSfxVolume(value); }, () => saveGameState(state));

  const reducedMotion = page.querySelector<HTMLInputElement>("#reduced-motion-toggle")!;
  reducedMotion.addEventListener("change", () => {
    state.reducedMotion = reducedMotion.checked;
    root.querySelector<HTMLElement>(".cc-root")?.setAttribute("data-reduced-motion", String(state.reducedMotion));
    const motionStatus = reducedMotion.parentElement?.querySelector("b");
    if (motionStatus) motionStatus.textContent = state.reducedMotion ? "On" : "Off";
    saveGameState(state);
  });

  const paylineGuide = page.querySelector<HTMLInputElement>("#payline-guide-toggle")!;
  paylineGuide.addEventListener("change", () => {
    state.paylineGuideOn = paylineGuide.checked;
    root.querySelectorAll<SVGPathElement>(".payline-path").forEach((path) => {
      path.classList.toggle("is-guide", state.paylineGuideOn);
    });
    const guideStatus = paylineGuide.parentElement?.querySelector("b");
    if (guideStatus) guideStatus.textContent = state.paylineGuideOn ? "On" : "Off";
    saveGameState(state);
  });

  page.querySelector<HTMLButtonElement>("#settings-reset")?.addEventListener("click", () => {
    if (confirm("Start fresh? This clears your Chai Chase progress and settings on this device.")) {
      resetAll();
      location.reload();
    }
  });
  page.querySelector<HTMLButtonElement>(".page-close")?.focus();
}

function volumeControl(id: "music" | "sfx", label: string, value: number, help: string): string {
  const percent = Math.round(value * 100);
  const maxPercent = id === "music" ? MUSIC_VOLUME_MAX * 100 : SFX_VOLUME_MAX * 100;
  return `<label class="volume-control" for="${id}-volume"><span><b>${label}</b><small>${help}</small></span><output id="${id}-volume-value" for="${id}-volume">(max)</output><input id="${id}-volume" type="range" min="0" max="${maxPercent}" value="${percent}" aria-label="${label} volume"/></label>`;
}

function wireVolume(
  page: HTMLElement,
  id: "music" | "sfx",
  apply: (value: number) => void,
  persist: () => void,
): void {
  const input = page.querySelector<HTMLInputElement>(`#${id}-volume`)!;
  input.addEventListener("input", () => {
    const value = Number(input.value) / 100;
    apply(value);
  });
  input.addEventListener("change", persist);
}

function openPaytablePage(root: HTMLElement): void {
  const page = document.createElement("section");
  page.className = "game-page paytable-page";
  page.setAttribute("role", "dialog");
  page.setAttribute("aria-modal", "true");
  page.setAttribute("aria-labelledby", "paytable-title");
  page.innerHTML = `
    <div class="game-page-topbar">
      <button class="page-close chrome-btn" aria-label="Close symbol guide">←</button>
      <div><p class="page-eyebrow">HOW THE CHAI CHASE PAYS</p><h2 id="paytable-title">Symbol guide</h2></div>
      <span class="page-top-spacer" aria-hidden="true"></span>
    </div>
    <div class="game-page-scroll">
      <section class="paytable-intro"><strong>40 fixed lines</strong><span>Match 3, 4, or 5 symbols from the left. Values are × your line bet.</span></section>
      <section class="paytable-grid" aria-label="Paying symbols">${PAYTABLE_SYMBOLS.map(paytableCard).join("")}</section>
      <h3 class="page-section-title">Special symbols</h3>
      <section class="feature-symbol-grid">
        ${featureCard("wild_joey", "Joey Saucer Wild", "Substitutes for every paying symbol. A wild-only line pays as the Mermaid Tumbler.")}
        ${featureCard("wild_phoebe", "Phoebe Saucer Wild", "Substitutes for every paying symbol. A wild-only line pays as the Mermaid Tumbler.")}
        ${featureCard("wild_handbag", "Handbag Wild", "A rare high-value wild. Each one carries a randomized ×3, ×5, or ×10 line multiplier, including bonus boards.")}
        ${featureCard("treat_chicken", "Chicken Comets", "A Phoebe treat. It joins the Treat Jar and can invite a helpful cat pop-in.")}
        ${featureCard("treat_salmon", "Salmon Stars", "A Phoebe treat. It joins the Treat Jar and can invite a helpful cat pop-in.")}
        ${featureCard("treat_bougie", "Bougie Bites", "Joey's favorite. Keep one in the Treat Jar for his stronger assist.")}
        ${featureCard("doorbell", "Doorbell", "A pair on the first two positions of any line begins Doorbell Panic free spins.")}
        ${featureCard("chai_pump", "Bold Chai Pump", "A same-payline pair opens the 30-second barista pump scene. Main spins only.")}
        ${featureCard("uniglee", "UniGlee", "The rare rainbow-butterfly legend begins a special Chai Chase celebration.")}
        ${featureCard("wild_chai", "Wild Chai", "The mermaid iced-chai cup substitutes for every paying symbol and can carry a bonus multiplier.")}
      </section>
      <p class="paytable-footnote">Line values are shown with the game’s live tuning applied, so this guide always matches what the board awards.</p>
    </div>`;
  root.querySelector(".cc-root")?.appendChild(page);
  const close = () => page.remove();
  page.querySelector<HTMLButtonElement>(".page-close")?.addEventListener("click", close);
  page.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });
  page.querySelector<HTMLButtonElement>(".page-close")?.focus();
}

function paytableCard({ id, name }: { id: SymbolId; name: string }): string {
  const values = PAYTABLE[id]!;
  return `<article class="pay-symbol-card"><div class="pay-symbol-art">${symbolSvg(id)}</div><h3>${name}</h3><dl><div><dt>3</dt><dd>${formatMultiplier(values[3])}</dd></div><div><dt>4</dt><dd>${formatMultiplier(values[4])}</dd></div><div><dt>5</dt><dd>${formatMultiplier(values[5])}</dd></div></dl></article>`;
}

function featureCard(id: SymbolId, name: string, description: string): string {
  return `<article class="feature-symbol-card"><div class="feature-symbol-art">${symbolSvg(id)}</div><div><h3>${name}</h3><p>${description}</p></div></article>`;
}

function formatMultiplier(value: number): string {
  const tuned = value * PAYOUT_SCALE;
  return `${Number.isInteger(tuned) ? tuned : tuned.toFixed(1)}×`;
}

async function runSpin(
  root: HTMLElement,
  state: GameState,
  sparkleBtn: HTMLButtonElement,
): Promise<void> {
  const { balance: refilled, refilled: didRefill } = applyBustProofRefill(state.balance, state.bet);
  state.balance = refilled;
  if (didRefill) setStatus(root, "AskJamie found coins under the couch! +500 coins");

  state.balance -= state.bet;
  sparkleBtn.disabled = true;
  sparkleBtn.classList.add("is-spinning");

  const seed = productionSeed();
  let treatJarSpinsAwarded = state.pendingTreatJarSpins;
  state.pendingTreatJarSpins = 0;
  const settledTreatJar = settleTreatJar(state.treatJar);
  state.treatJar = settledTreatJar.jar;
  treatJarSpinsAwarded += settledTreatJar.freeSpinsAwarded;
  const treatJarAwards: TreatKind[] = [...settledTreatJar.completed];
  const result = spin({
    rng: mulberry32(seed),
    treatTimeRng: mulberry32(seed ^ 0x9e3779b9),
    allowTreatTimeBonus: true,
    betPerLine: betPerLine(state.bet),
    treatJar: state.treatJar,
    spinsSincePopIn: state.spinsSincePopIn,
  });

  await animateSteps(root, result.steps);

  let boldChaiSpinsAwarded = 0;

  state.balance += result.totalWin;
  state.xp += sparksForSpin(state.bet);
  state.fireflyMeter = result.cascades;
  state.bestCascade = Math.max(state.bestCascade, result.cascades);

  for (const treat of result.treatsCollected) {
    const collected = collectTreat(state.treatJar, treat);
    state.treatJar = collected.jar;
    if (collected.freeSpinsAwarded > 0) {
      treatJarSpinsAwarded += collected.freeSpinsAwarded;
      treatJarAwards.push(treat);
    }
  }

  if (result.unigleeTriggered) {
    playUniGleeSting();
    const award = result.unigleeTrigger?.initialAwardSpins ?? 300;
    startUniGleeMusic();
    await showUnigleeTakeover(root, result.unigleeTrigger, award);
    await runUniGleeMarathonBonus(root, state, award, seed ^ 0x51f15e5d);
    stopUniGleeMusic();
  } else if (result.doorbellPanic) {
    playStrangerDangerPanic();
    await showDoorbellPanic(root, result.doorbellPanic.freeSpinsAwarded, result.doorbellPanic.positions);
  } else if (result.boldChaiPump) {
    boldChaiSpinsAwarded = await runBoldChaiBonus(root);
  } else if (result.totalWin > 0) {
    await showWinCelebration(root, result.totalWin, state.bet);
  }

  if (result.catVisit) {
    state.spinsSincePopIn = 0;
    state.treatJar = consumeForVisit(state.treatJar, result.catVisit);
    if (result.catVisit.cat === "joey") playJoeyCue();
    else playPhoebeCue();
    await showCatPopIn(root, result.catVisit.cat, result.catVisit.fed, result.catVisit.quip);
    if (result.catVisit.fed) playBonusFanfare();
  } else {
    state.spinsSincePopIn += 1;
  }

  saveGameState(state);

  const btnAgain = root.querySelector<HTMLButtonElement>("#sparkle-btn");
  btnAgain?.classList.remove("is-spinning");

  if (result.treatTimeBonus) {
    await runTreatTimeBonus(root, state, result.treatTimeBonus.mode, result.treatTimeBonus.freeSpinsAwarded);
  }

  if (result.freeSpinsAwarded > 0) {
    if (result.doorbellPanic) await runDoorbellPanic(root, state, result.freeSpinsAwarded);
    else await runWheelAndFreeSpins(root, state, result.freeSpinsAwarded);
    if (treatJarSpinsAwarded > 0) await runTreatJarFreeSpins(root, state, treatJarSpinsAwarded, treatJarAwards);
    return;
  }

  if (boldChaiSpinsAwarded > 0) {
    await runBoldChaiFreeSpins(root, state, boldChaiSpinsAwarded);
    if (treatJarSpinsAwarded > 0) await runTreatJarFreeSpins(root, state, treatJarSpinsAwarded, treatJarAwards);
    return;
  }

  if (treatJarSpinsAwarded > 0) {
    await runTreatJarFreeSpins(root, state, treatJarSpinsAwarded, treatJarAwards);
    return;
  }

  if (!result.treatTimeBonus) renderBoard(root, state, result.steps[result.steps.length - 1]?.grid);
}

/** Runs the dedicated Bold Chai scene inside the existing cabinet footprint. */
function runBoldChaiBonus(root: HTMLElement): Promise<number> {
  return new Promise((resolve) => {
    const cabinet = root.querySelector<HTMLElement>(".cabinet-frame");
    const reelGrid = root.querySelector<HTMLElement>("#reel-grid");
    if (!cabinet || !reelGrid) { resolve(0); return; }

    reelGrid.hidden = true;
    const scene = document.createElement("section");
    scene.className = "bold-chai-scene";
    scene.setAttribute("aria-label", "Bold Chai rapid pump bonus");
    scene.innerHTML = `
      <div class="bold-chai-headline"><strong>BOLD CHAI!</strong><span>Barista mode · 12 pumps per strong chai</span></div>
      <div class="bold-chai-timer" aria-live="polite"><span id="bold-chai-seconds">30.0</span><small>seconds</small></div>
      <div class="bold-chai-workbench">
        <div class="bold-chai-layered-art" aria-hidden="true">
          <img class="bold-chai-layer" src="${boldChaiAsset("pump-body.svg")}" alt="" />
          <img class="bold-chai-layer" id="bold-chai-plunger" src="${boldChaiAsset("plunger-up.svg")}" alt="" />
          <img class="bold-chai-layer" src="${boldChaiAsset("spout.svg")}" alt="" />
          <img class="bold-chai-layer bold-chai-fill" id="bold-chai-fill" src="${boldChaiAsset("fill-01.svg")}" alt="" hidden />
          <img class="bold-chai-layer bold-chai-cup" id="bold-chai-cup" src="${boldChaiAsset("cup-empty.svg")}" alt="" />
        </div>
      </div>
      <button type="button" class="bold-chai-pump-button" id="bold-chai-pump-button" aria-label="Press the chai pump">
        PRESS PUMP <span id="bold-chai-count">0 / ${BOLD_CHAI_PUMPS_PER_CUP}</span>
      </button>
      <div class="bold-chai-status" id="bold-chai-status" aria-live="polite">Tap fast — make it strong!</div>`;
    cabinet.appendChild(scene);

    let pumpState = createBoldChaiPumpState();
    const button = scene.querySelector<HTMLButtonElement>("#bold-chai-pump-button")!;
    const seconds = scene.querySelector<HTMLSpanElement>("#bold-chai-seconds")!;
    const count = scene.querySelector<HTMLSpanElement>("#bold-chai-count")!;
    const plunger = scene.querySelector<HTMLImageElement>("#bold-chai-plunger")!;
    const fill = scene.querySelector<HTMLImageElement>("#bold-chai-fill")!;
    const cup = scene.querySelector<HTMLImageElement>("#bold-chai-cup")!;
    const status = scene.querySelector<HTMLDivElement>("#bold-chai-status")!;
    let settled = false;
    let plungerTimers: number[] = [];

    const setPlungerState = (next: "up" | "mid" | "down") => {
      plunger.src = boldChaiAsset(`plunger-${next}.svg`);
      scene.dataset.plungerState = next;
    };

    const animatePlungerPress = () => {
      plungerTimers.forEach((timer) => window.clearTimeout(timer));
      plungerTimers = [];
      setPlungerState("down");
      plungerTimers.push(window.setTimeout(() => setPlungerState("mid"), 68));
      plungerTimers.push(window.setTimeout(() => setPlungerState("up"), 150));
    };

    const paint = (now: number) => {
      pumpState = settleBoldChaiPump(pumpState, now);
      const elapsed = pumpState.startedAtMs === undefined ? 0 : Math.max(0, now - pumpState.startedAtMs);
      seconds.textContent = (Math.max(0, BOLD_CHAI_DURATION_MS - elapsed) / 1000).toFixed(1);
      count.textContent = `${pumpState.pumpsInCurrentCup} / ${BOLD_CHAI_PUMPS_PER_CUP}`;
      scene.classList.toggle("is-resetting", pumpState.phase === "resetting");
      scene.dataset.fillLevel = String(pumpState.pumpsInCurrentCup);
      if (pumpState.phase === "resetting") {
        cup.src = boldChaiAsset("cup-swap.svg");
        cup.alt = "Barista swapping the full iced chai cup";
        fill.hidden = true;
        status.textContent = "Swap the cup — keep moving!";
      } else {
        cup.src = boldChaiAsset("cup-empty.svg");
        cup.alt = "Clear iced chai cup with ice";
        if (pumpState.pumpsInCurrentCup > 0) {
          fill.src = boldChaiAsset(`fill-${String(pumpState.pumpsInCurrentCup).padStart(2, "0")}.svg`);
          fill.hidden = false;
        } else {
          fill.hidden = true;
        }
      }
    };

    const finish = (now: number) => {
      if (settled) return;
      settled = true;
      pumpState = settleBoldChaiPump(pumpState, now);
      playBoldChaiTimerBuzzer();
      button.disabled = true;
      plungerTimers.forEach((timer) => window.clearTimeout(timer));
      plungerTimers = [];
      setPlungerState("up");
      status.textContent = "Time! Counting your strong chais…";
      const outcome = completeBoldChaiPump(pumpState, now);
      window.setTimeout(() => {
        setBoldChaiUrgency(false);
        scene.remove();
        reelGrid.hidden = false;
        resolve(outcome.freeSpinsAwarded);
      }, 750);
    };

    const frame = (now: number) => {
      if (settled) return;
      paint(now);
      if (pumpState.startedAtMs !== undefined && now - pumpState.startedAtMs >= BOLD_CHAI_DURATION_MS) { finish(now); return; }
      requestAnimationFrame(frame);
    };

    const registerPump = (now: number) => {
      if (settled) return;
      const action = pumpBoldChai(pumpState, now);
      pumpState = action.state;
      if (!action.accepted) {
        paint(now);
        return;
      }
      animatePlungerPress();
      const completed = action.event?.kind === "chai_completed";
      playBoldChaiPumpPress(completed);
      paint(now);
      if (completed) {
        playBoldChaiCupSwap();
        status.textContent = "Strong chai! Empty cup coming in…";
      }
    };

    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      registerPump(performance.now());
    });
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      registerPump(performance.now());
    });
    paint(performance.now());
    setBoldChaiUrgency(true);
    requestAnimationFrame(frame);
  });
}

/**
 * Runs the memory-match presentation inside the existing reel-stage box.
 * Engine ownership stays explicit: this adapter forwards indexes and renders
 * only the returned state/event payloads.
 */
export function runKeepsakeMemoryBonus(root: HTMLElement, controller: KeepsakeMemoryController): Promise<number> {
  return new Promise((resolve) => {
    const cabinet = root.querySelector<HTMLElement>(".cabinet-frame");
    const reelGrid = root.querySelector<HTMLElement>("#reel-grid");
    if (!cabinet || !reelGrid) { resolve(0); return; }

    reelGrid.hidden = true;
    const scene = document.createElement("section");
    scene.className = "keepsake-memory-scene";
    scene.setAttribute("aria-label", "Moonlit Keepsake Trail memory bonus");
    scene.innerHTML = `
      <div class="keepsake-trail-backdrop" aria-hidden="true">${keepsakeMemoryTrailSvg()}</div>
      <div class="keepsake-memory-header">
        <strong>MOONLIT KEEPSAKE TRAIL</strong>
        <span>Six keepsakes. Twelve stops. One path to follow.</span>
      </div>
      <div class="keepsake-memory-status" id="keepsake-memory-status" aria-live="polite">The trail is laid out. Memorize the keepsakes…</div>
      <div class="keepsake-memory-grid" id="keepsake-memory-grid" role="group" aria-label="Twelve keepsake memory cards"></div>
      <div class="keepsake-memory-footer">
        <span id="keepsake-memory-pairs">Pairs 0 / 6</span>
        <span class="keepsake-mismatch-track" id="keepsake-memory-fails" aria-label="Mismatches 0 of 2">
          <b>Mismatches</b>
          <i data-strike="0" aria-label="First mismatch unused"></i>
          <i data-strike="1" aria-label="Second mismatch unused"></i>
          <em>0 / 2</em>
        </span>
      </div>
      <div class="keepsake-memory-result" id="keepsake-memory-result" hidden role="status" aria-live="assertive"></div>`;
    cabinet.appendChild(scene);

    const grid = scene.querySelector<HTMLDivElement>("#keepsake-memory-grid")!;
    const status = scene.querySelector<HTMLDivElement>("#keepsake-memory-status")!;
    const pairs = scene.querySelector<HTMLSpanElement>("#keepsake-memory-pairs")!;
    const fails = scene.querySelector<HTMLSpanElement>("#keepsake-memory-fails")!;
    const result = scene.querySelector<HTMLDivElement>("#keepsake-memory-result")!;
    let view = controller.state;
    let activeCompare: number[] = [];
    let settled = false;
    let previewTimer: number | undefined;
    let mismatchTimer: number | undefined;

    grid.innerHTML = view.cards.map(renderKeepsakeMemoryCard).join("");

    const updateCardButtons = (next: KeepsakeMemoryViewState, animate: boolean): void => {
      const previous = view;
      view = next;
      next.cards.forEach((card) => {
        const button = grid.querySelector<HTMLButtonElement>(`[data-card-index="${card.index}"]`);
        if (!button) return;
        const face = button.querySelector<HTMLElement>(".keepsake-memory-card");
        if (!face) return;
        const before = previous.cards.find((candidate) => candidate.index === card.index);
        const changedFace = animate && before !== undefined && before.revealed !== card.revealed;
        button.classList.toggle("is-active", activeCompare.includes(card.index));
        button.classList.toggle("is-matched", card.matched);
        button.classList.toggle("is-mismatch", activeCompare.includes(card.index) && next.phase === "resolving_mismatch");
        button.setAttribute("aria-label", keepsakeMemoryCardLabel(card));
        if (changedFace) animateKeepsakeCard(face, card.revealed);
        else face.classList.toggle("is-revealed", card.revealed);
      });
      pairs.textContent = `Pairs ${next.pairsFound} / 6`;
      const usedFails = Math.min(next.fails, next.maxFails);
      fails.setAttribute("aria-label", `Mismatches ${usedFails} of ${next.maxFails}`);
      fails.querySelector("em")!.textContent = `${usedFails} / ${next.maxFails}`;
      fails.querySelectorAll<HTMLElement>("[data-strike]").forEach((marker, index) => {
        marker.classList.toggle("is-filled", index < usedFails);
        marker.setAttribute("aria-label", `${index < usedFails ? "Used" : "Unused"} ${index === 0 ? "first" : "second"} mismatch`);
      });
    };

    const showOutcome = (outcome: "success" | "failure"): void => {
      if (settled) return;
      settled = true;
      result.hidden = false;
      result.className = `keepsake-memory-result is-${outcome}`;
      result.textContent = outcome === "success"
        ? "All six pairs found! You win 40 free spins!"
        : "Trail over — no free spins this time. The night is still lovely.";
      if (outcome === "success") playKeepsakeSuccess();
      else playKeepsakeFailure();
      window.setTimeout(() => {
        window.clearTimeout(previewTimer);
        window.clearTimeout(mismatchTimer);
        scene.remove();
        reelGrid.hidden = false;
        resolve(view.freeSpinsAwarded);
      }, 1500);
    };

    const handlePick = (index: number): void => {
      if (settled) return;
      const action = controller.pick(index);
      if (!action.accepted) return;
      const event = action.event;
      activeCompare = event?.kind === "card_revealed" ? [event.index] : event && "indices" in event ? [...event.indices] : activeCompare;
      updateCardButtons(action.state, true);
      if (!event) return;

      if (event.kind === "card_revealed") {
        playKeepsakeCardFlip();
        status.textContent = "A keepsake is glowing. Find its match.";
        return;
      }

      if (event.kind === "match" || event.kind === "completed") {
        playKeepsakeCardFlip();
        playKeepsakeMatch();
        activeCompare = [];
        grid.querySelectorAll<HTMLButtonElement>(".is-active").forEach((card) => card.classList.remove("is-active"));
        status.textContent = event.kind === "completed" ? "The whole trail is glowing!" : "Pair found. Keep following the trail.";
        if (event.kind === "completed") window.setTimeout(() => showOutcome("success"), 450);
        return;
      }

      if (event.kind === "mismatch" || event.kind === "failed") {
        playKeepsakeCardFlip();
        playKeepsakeMismatch();
        status.textContent = event.kind === "failed" || ("fails" in event && event.fails === 2)
          ? "The keepsakes are taking a little night walk."
          : "A near-match. The trail is still glowing.";
        mismatchTimer = window.setTimeout(() => {
          const resolved = controller.resolveMismatch();
          activeCompare = [];
          updateCardButtons(resolved.state, true);
          if (resolved.event?.kind === "failed" || resolved.state.phase === "failed") {
            showOutcome("failure");
            return;
          }
          status.textContent = "Choose the next keepsake pair.";
        }, 900);
      }
    };

    grid.querySelectorAll<HTMLButtonElement>("[data-card-index]").forEach((button) => {
      button.addEventListener("click", () => handlePick(Number(button.dataset.cardIndex)));
    });

    updateCardButtons(view, false);
    previewTimer = window.setTimeout(() => {
      const next = controller.begin();
      status.textContent = "The trail is ready. Choose a keepsake.";
      activeCompare = [];
      updateCardButtons(next, true);
    }, 2500);
  });
}

function keepsakeMemoryCardLabel(card: KeepsakeMemoryViewCard): string {
  if (!card.revealed) return `Hidden keepsake card ${card.index + 1}`;
  const name = PAYTABLE_SYMBOLS.find((symbol) => symbol.id === card.symbol)?.name ?? "Keepsake";
  return `${name} memory card${card.matched ? ", matched" : ", revealed"}`;
}

function renderKeepsakeMemoryCard(card: KeepsakeMemoryViewCard): string {
  return `<button type="button" class="keepsake-memory-card-button" data-card-index="${card.index}" aria-label="${keepsakeMemoryCardLabel(card)}">
    <span class="keepsake-memory-card${card.revealed ? " is-revealed" : ""}">
      <span class="keepsake-card-face keepsake-card-back" aria-hidden="true">${publicPicture("keepsake-memory-card-back.png", "keepsake-card-image")}</span>
      <span class="keepsake-card-face keepsake-card-front">${symbolSvg(card.symbol)}</span>
      <span class="keepsake-mismatch-mark" aria-hidden="true">${publicPicture("keepsake-memory-mismatch-overlay.png", "keepsake-card-image")}</span>
    </span>
  </button>`;
}

function animateKeepsakeCard(face: HTMLElement, revealed: boolean): void {
  face.classList.remove("is-flipping-front", "is-flipping-back");
  void face.offsetWidth;
  if (revealed) face.classList.add("is-revealed");
  face.classList.add(revealed ? "is-flipping-front" : "is-flipping-back");
  window.setTimeout(() => {
    face.classList.toggle("is-revealed", revealed);
    face.classList.remove("is-flipping-front", "is-flipping-back");
  }, 470);
}

function keepsakeMemoryTrailSvg(): string {
  return `<svg viewBox="0 0 500 320" preserveAspectRatio="none">
    <defs><linearGradient id="keepsake-trail-fill" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#573c78"/><stop offset=".55" stop-color="#29204f"/><stop offset="1" stop-color="#171335"/></linearGradient></defs>
    <path d="M-22 304C90 255 83 182 196 190s104 86 194 42 54-119 132-173" fill="none" stroke="#11102b" stroke-width="92" opacity=".58"/>
    <path d="M-22 304C90 255 83 182 196 190s104 86 194 42 54-119 132-173" fill="none" stroke="url(#keepsake-trail-fill)" stroke-width="76" opacity=".9"/>
    <path d="M-22 304C90 255 83 182 196 190s104 86 194 42 54-119 132-173" fill="none" stroke="#f5d576" stroke-width="2" stroke-dasharray="2 13" opacity=".36"/>
    <circle cx="70" cy="268" r="4" fill="#9fe8c5"/><circle cx="228" cy="194" r="3" fill="#f5d576"/><circle cx="390" cy="205" r="4" fill="#9fe8c5"/>
  </svg>`;
}

/** Bold Chai awards enter the existing free-spin session without the wheel. */
async function runBoldChaiFreeSpins(root: HTMLElement, state: GameState, spinsAwarded: number): Promise<void> {
  const session = runFreeSpinSession(mulberry32(productionSeed()), "chai_back", betPerLine(state.bet), spinsAwarded, { allowChaiStorm: false });
  await playFreeSpinSession(root, state, session);
  state.balance += session.totalWin;
  state.bestCascade = Math.max(state.bestCascade, session.bestCascade);
  saveGameState(state);
  await showBonusSummary(root, session.totalWin, session.retriggers, session.totalSpins);
  const lastRound = session.rounds[session.rounds.length - 1];
  renderBoard(root, state, lastRound?.steps[lastRound.steps.length - 1]?.grid);
}

/** Treat Jar rewards are additive free spins that never retrigger or touch Firefly progress. */
async function runTreatJarFreeSpins(
  root: HTMLElement,
  state: GameState,
  spinsAwarded: number,
  awards: TreatKind[],
): Promise<void> {
  const awardLabels = awards.map((treat) => `${treatJarLabel(treat)} +${TREAT_JAR_FREE_SPINS[treat]}`).join(", ");
  setStatus(root, `Treat Jar complete: ${awardLabels} free spins · no retriggers`);
  const session = runFreeSpinSession(
    mulberry32(productionSeed()),
    "chai_back",
    betPerLine(state.bet),
    spinsAwarded,
    { allowChaiStorm: false, allowRetriggers: false },
  );
  await playFreeSpinSession(root, state, session, { label: "Treat Jar Bonus", title: "TREAT JAR BONUS!" });
  state.balance += session.totalWin;
  state.bestCascade = Math.max(state.bestCascade, session.bestCascade);
  saveGameState(state);
  await showBonusSummary(root, session.totalWin, 0, session.totalSpins);
  const lastRound = session.rounds[session.rounds.length - 1];
  renderBoard(root, state, lastRound?.steps[lastRound.steps.length - 1]?.grid);
}

function treatJarLabel(treat: TreatKind): string {
  switch (treat) {
    case "chicken": return "Chicken Comets";
    case "salmon": return "Salmon Stars";
    case "bougie": return "Bougie Bites";
  }
}

function showDoorbellPanic(
  root: HTMLElement,
  spinsAwarded: number,
  positions: Array<[number, number]>,
): Promise<void> {
  return new Promise((resolve) => {
    positions.forEach(([reel, row]) => {
      root.querySelector<HTMLDivElement>(`#reel-grid [data-reel="${reel}"] [data-row="${row}"]`)?.classList.add("doorbell-ringing");
    });
    const overlay = document.createElement("div");
    overlay.className = "doorbell-panic-banner";
    overlay.innerHTML = `
      <div class="doorbell-panic-bell">${symbolSvg("doorbell")}</div>
      <div class="doorbell-panic-title">DOORBELL PANIC!</div>
      <div class="doorbell-panic-sub">Joey &amp; Phoebe fled into ${spinsAwarded} free spins!</div>
    `;
    root.querySelector(".cc-root")?.appendChild(overlay);
    window.setTimeout(() => {
      overlay.remove();
      resolve();
    }, 1550);
  });
}

function animateSteps(root: HTMLElement, steps: CascadeStep[]): Promise<void> {
  return new Promise((resolve) => {
    const grid = root.querySelector<HTMLDivElement>("#reel-grid")!;
    let i = 0;
    let doorbellRang = false;

    const next = () => {
      if (i >= steps.length) {
        resolve();
        return;
      }
      const step = steps[i];
      grid.innerHTML = renderGridHtml(step.grid, step.keepsakeZone, false, step.wins.map((win) => win.lineIndex));
      if (!doorbellRang && step.grid.flat().some((cell) => cell.symbol === "doorbell")) {
        playDoorbellRing();
        doorbellRang = true;
      }
      grid.querySelectorAll<HTMLElement>(".cell").forEach((cell, index) => {
        if (i === 0) {
          cell.classList.add("symbol-pop");
          return;
        }
        cell.style.setProperty("--drop-delay", `${(index % ROWS) * 22 + Math.floor(index / ROWS) * 14}ms`);
        cell.classList.add("beam-drop");
      });
      updateJar(root, step.meterAfter);

      if (step.wins.length > 0) {
        const winningCells = new Set<HTMLDivElement>();
        playCascadeArpeggio(step.meterAfter);
        beamToSaucers(root);
        for (const win of step.wins) {
          for (const [reel, row] of win.positions) {
            const cell = grid.querySelector<HTMLDivElement>(`[data-reel="${reel}"] [data-row="${row}"]`);
            cell?.classList.add("win-flash");
            if (cell) {
              winningCells.add(cell);
              spawnParticles(root, cell, 3);
            }
          }
        }
        window.setTimeout(() => {
          winningCells.forEach((cell) => cell.classList.add("beam-up"));
        }, 220);
        playWinPluck();
      } else {
        playCascadeTick();
      }

      i++;
      window.setTimeout(next, 480);
    };

    next();
  });
}

/** Fires the saucer fleet's tractor beams briefly — the win "beam-up" hero moment. */
function beamToSaucers(root: HTMLElement): void {
  const bg = root.querySelector("#bg-layer, .night-garden");
  const beams = (bg ?? root).querySelectorAll<HTMLDivElement>(".saucer-beam");
  beams.forEach((beam) => {
    beam.classList.add("beaming");
    window.setTimeout(() => beam.classList.remove("beaming"), 700);
  });
}

/** Small CSS particle burst from a winning cell — capped, cheap (transform/opacity only). */
function spawnParticles(root: HTMLElement, cell: Element, count: number): void {
  const rect = cell.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  const layer = root.querySelector<HTMLDivElement>("#particle-layer") ?? createParticleLayer(root);
  for (let n = 0; n < count; n++) {
    const p = document.createElement("span");
    p.className = "particle";
    const angle = (n / count) * 360 + Math.random() * 40;
    const dist = 18 + Math.random() * 14;
    p.style.setProperty("--dx", `${Math.cos((angle * Math.PI) / 180) * dist}px`);
    p.style.setProperty("--dy", `${Math.sin((angle * Math.PI) / 180) * dist}px`);
    p.style.left = `${rect.left - rootRect.left + rect.width / 2}px`;
    p.style.top = `${rect.top - rootRect.top + rect.height / 2}px`;
    layer.appendChild(p);
    window.setTimeout(() => p.remove(), 650);
  }
}

function createParticleLayer(root: HTMLElement): HTMLDivElement {
  const layer = document.createElement("div");
  layer.id = "particle-layer";
  layer.className = "particle-layer";
  root.querySelector(".cc-root")?.appendChild(layer);
  return layer;
}

/** Win-tier celebration overlay — nice / big / huge, per docs §11 "celebration kit". */
function showWinCelebration(root: HTMLElement, amount: number, bet: number): Promise<void> {
  const ratio = amount / Math.max(1, bet);
  const tier = ratio >= 40 ? "huge" : ratio >= 15 ? "big" : ratio >= 5 ? "nice" : null;
  if (!tier) {
    setStatus(root, `+${amount.toLocaleString()} coins`);
    return Promise.resolve();
  }
  const label = tier === "huge" ? "HUGE WIN!" : tier === "big" ? "BIG WIN!" : "NICE WIN!";
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = `win-tier win-tier-${tier}`;
    overlay.innerHTML = `
      <div class="win-tier-burst">${burstDots(tier === "huge" ? 24 : tier === "big" ? 16 : 10)}</div>
      <div class="win-tier-label">${label}</div>
      <div class="win-tier-amount">+${amount.toLocaleString()} coins</div>
    `;
    root.querySelector(".cc-root")?.appendChild(overlay);
    playBonusFanfare();
    const dur = tier === "huge" ? 2400 : tier === "big" ? 1900 : 1400;
    window.setTimeout(() => {
      overlay.remove();
      resolve();
    }, dur);
  });
}

function burstDots(count: number): string {
  return Array.from({ length: Math.min(count, 30) }, (_, i) => {
    const angle = (i / count) * 360;
    return `<span class="burst-dot" style="--angle:${angle}deg;--delay:${(i % 6) * 0.03}s"></span>`;
  }).join("");
}

/** Animated cat pop-in moment — sequences pose states per docs §6/§11. */
function showCatPopIn(root: HTMLElement, cat: "joey" | "phoebe", fed: boolean, quip: string): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "cat-popin";
    const spriteEl = document.createElement("div");
    spriteEl.className = "cat-sprite";
    const quipEl = document.createElement("div");
    quipEl.className = "cat-quip";
    quipEl.textContent = quip;
    const wrap = document.createElement("div");
    wrap.className = "cat-popin-inner";
    wrap.append(spriteEl, quipEl);
    overlay.appendChild(wrap);
    root.querySelector(".cc-root")?.appendChild(overlay);

    const isJoeyAssist = fed && cat === "joey";
    const sequence: CatPose[] = isJoeyAssist ? ["strut", "assist", "eat"] : fed ? ["strut", "eat"] : ["strut", "unimpressed"];
    let idx = 0;
    const paint = () => {
      spriteEl.innerHTML = catSprite(cat, sequence[idx]);
    };
    paint();
    const stepMs = 750;
    const interval = window.setInterval(() => {
      idx++;
      if (idx >= sequence.length) {
        window.clearInterval(interval);
        return;
      }
      paint();
    }, stepMs);

    window.setTimeout(() => {
      window.clearInterval(interval);
      overlay.remove();
      resolve();
    }, stepMs * sequence.length + 500);
  });
}

/** UniGlee entry: the captured symbol flies out of the board into the marathon. */
function showUnigleeTakeover(root: HTMLElement, trigger: UniGleeTrigger | undefined, award: 300 | 400 | 500): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "uniglee-takeover";
    const butterflies = Array.from({ length: 14 }, (_, i) => {
      const left = 4 + ((i * 41) % 92);
      const delay = (i % 7) * 0.25;
      const dur = 3.2 + (i % 4) * 0.6;
      return `<div class="uniglee-butterfly" style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s">${symbolSvg("butterfly")}</div>`;
    }).join("");
    overlay.innerHTML = `
      <div class="uniglee-butterflies">${butterflies}</div>
      <div class="uniglee-content">
        <div class="uniglee-avatar">${gleeAvatarSvg()}</div>
        <div class="uniglee-title">UNI-GLEE!</div>
        <div class="uniglee-sub">The mythical capture is yours.</div>
        <div class="uniglee-award">${award} SPIN MARATHON · REEL ${(trigger?.reel ?? 2) + 1}</div>
      </div>
    `;
    root.querySelector(".cc-root")?.appendChild(overlay);
    window.setTimeout(() => {
      overlay.remove();
      resolve();
    }, 3200);
  });
}

function uniGleeChapterTitle(id: string): string {
  switch (id) {
    case "joey_laundry_helper": return "Joey’s Laundry Helper";
    case "were_multiplying": return "We’re Multiplying";
    case "keepsake_collection": return "Keepsake Collection";
    default: return "Nighttime Treat Time";
  }
}

async function runUniGleeMarathonBonus(
  root: HTMLElement,
  state: GameState,
  award: 300 | 400 | 500,
  seed: number,
): Promise<void> {
  const marathon: UniGleeBaseMarathonResult = runUniGleeBaseMarathon(
    mulberry32(seed),
    betPerLine(state.bet),
    award,
  );
  let totalWin = 0;
  let totalSpins = 0;
  let totalRetriggers = 0;
  const chapterNumber = (id: string): number => marathon.plan.order.indexOf(id as never) + 1;

  for (const chapter of marathon.chapters) {
    const title = uniGleeChapterTitle(chapter.id);
    if (chapter.id === "joey_laundry_helper") {
      await playJoeyLaundryChapter(root, chapter.session as JoeyLaundrySessionResult);
    } else {
      await playFreeSpinSession(root, state, chapter.session as FreeSpinSessionResult, {
        label: `UniGlee · Chapter ${chapterNumber(chapter.id)}`,
        title,
      });
    }
    totalWin += chapter.totalWin;
    totalSpins += chapter.totalSpins;
    totalRetriggers += chapter.retriggers;
    state.balance += chapter.totalWin;
    state.bestCascade = Math.max(
      state.bestCascade,
      chapter.session.bestCascade,
    );
    saveGameState(state);
  }

  const lapQuest = await runLapQuestChapter(root, state, mulberry32(seed ^ 0x6a09e667));
  if (lapQuest) {
    totalWin += lapQuest.totalWin;
    totalSpins += lapQuest.totalSpins;
    totalRetriggers += lapQuest.retriggers;
  }
  await showUniGleeSummary(root, award, totalWin, totalSpins, totalRetriggers);
  setStatus(root, `UNI-GLEE complete · +${totalWin.toLocaleString()} coins · ${totalSpins} spins played`);
}

function showUniGleeSummary(
  root: HTMLElement,
  award: number,
  totalWin: number,
  totalSpins: number,
  retriggers: number,
): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "uniglee-summary-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML = `
      <div class="uniglee-summary-butterfly">${symbolSvg("butterfly")}</div>
      <div class="uniglee-summary-title">UNI-GLEE COMPLETE!</div>
      <p class="uniglee-summary-copy">The mythical marathon is captured.</p>
      <div class="uniglee-summary-stats">
        <span><b>${totalSpins}</b><small>spins played</small></span>
        <span><b>${totalWin.toLocaleString()}</b><small>Glee-coins won</small></span>
      </div>
      <p class="uniglee-summary-note">${award} initial spins · ${retriggers} local retrigger${retriggers === 1 ? "" : "s"} · Phoebe’s sweetener included</p>
      <button id="uniglee-summary-continue" class="sparkle-btn">Return to the chase</button>`;
    root.querySelector(".cc-root")?.appendChild(overlay);
    playBonusFanfare();
    overlay.querySelector<HTMLButtonElement>("#uniglee-summary-continue")?.addEventListener("click", () => {
      overlay.remove();
      resolve();
    });
  });
}

/** Reusable UniGlee chapter hook; the marathon session owns when to call it. */
export interface LapQuestChapterSummary {
  lastRound: LapQuestRoundResult;
  totalWin: number;
  totalSpins: number;
  retriggers: number;
  bestCascade: number;
  endReason: string;
}

export async function runLapQuestChapter(
  root: HTMLElement,
  state: GameState,
  rng = mulberry32(productionSeed()),
): Promise<LapQuestChapterSummary | undefined> {
  const challenge = createLapQuestChallenge(rng);
  const selectedSpot = await showLapQuestChoice(root, challenge);
  const round = spinLapQuestRound(rng, challenge, selectedSpot, betPerLine(state.bet));

  await showLapQuestReveal(root, round);
  const ledge = mountLapQuestLedge(root, {
    interruptAtMs: 15_000 + Math.floor(rng() * 75_001),
    reducedMotion: state.reducedMotion,
    onPet: ({ petCount }) => {
      const status = root.querySelector<HTMLElement>("#status-line");
      if (status) status.textContent = `Phoebe's Lap Quest · ${petCount} gentle pet${petCount === 1 ? "" : "s"}`;
    },
  });
  let lastRound = round;
  let totalWin = 0;
  let totalSpins = 0;
  let retriggers = 0;
  let bestCascade = 0;
  let ledgeEnded = false;
  ledge.finished.then(() => { ledgeEnded = true; });

  const playRound = async (nextRound: LapQuestRoundResult): Promise<void> => {
    lastRound = nextRound;
    totalSpins += 1;
    retriggers += nextRound.freeSpinsAwarded > 0 ? 1 : 0;
    totalWin += nextRound.totalWin;
    bestCascade = Math.max(bestCascade, nextRound.cascades);
    await playLapQuestRound(root, nextRound);
  };

  await playRound(round);
  while (!ledgeEnded) {
    await Promise.race([ledge.finished, sleep(900)]);
    if (ledgeEnded) break;
    await playRound(spinLapQuestRound(rng, challenge, selectedSpot, betPerLine(state.bet)));
  }

  const ledgeResult = await ledge.finished;

  state.balance += totalWin;
  state.bestCascade = Math.max(state.bestCascade, bestCascade);
  saveGameState(state);
  const finalStep = lastRound.steps[lastRound.steps.length - 1];
  renderBoard(root, state, finalStep?.grid);
  setStatus(root, ledgeResult.reason === "joey_interrupt"
    ? `Phoebe's Lap Quest · Joey whisked her away · +${totalWin.toLocaleString()} coins`
    : ledgeResult.reason === "inactivity"
      ? `Phoebe's Lap Quest · she wandered off · +${totalWin.toLocaleString()} coins`
      : `Phoebe's Lap Quest · complete · +${totalWin.toLocaleString()} coins`);
  return {
    lastRound,
    totalWin,
    totalSpins,
    retriggers,
    bestCascade,
    endReason: ledgeResult.reason,
  };
}

function showLapQuestChoice(root: HTMLElement, challenge: LapQuestChallenge): Promise<LapQuestSpot> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "lap-quest-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "lap-quest-title");
    overlay.innerHTML = `
      <div class="lap-quest-panel">
        <div class="lap-quest-cat" aria-hidden="true">${catSprite("phoebe", "strut")}</div>
        <h2 id="lap-quest-title" class="lap-quest-title">Phoebe’s Lap Quest</h2>
        <p class="lap-quest-copy">Phoebe is conducting a comfort survey. Which cozy place should she investigate?</p>
        <div class="lap-quest-choices" role="group" aria-label="Choose Phoebe's cozy place">
          ${challenge.choices.map((spot) => `
            <button type="button" class="lap-quest-choice" data-lap-spot="${spot}">
              <span class="lap-quest-choice-spark" aria-hidden="true">✦</span>
              <strong>${LAP_QUEST_SPOT_LABELS[spot]}</strong>
              <small> Phoebe-approved comfort</small>
            </button>
          `).join("")}
        </div>
      </div>
    `;
    root.querySelector(".cc-root")?.appendChild(overlay);
    playPhoebeCue();

    const finish = (spot: LapQuestSpot): void => {
      overlay.remove();
      resolve(spot);
    };
    overlay.querySelectorAll<HTMLButtonElement>("[data-lap-spot]").forEach((button) => {
      button.addEventListener("click", () => finish(button.dataset.lapSpot as LapQuestSpot), { once: true });
    });
    overlay.querySelector<HTMLButtonElement>("[data-lap-spot]")?.focus();
  });
}

function showLapQuestReveal(root: HTMLElement, round: LapQuestRoundResult): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "lap-quest-reveal";
    overlay.setAttribute("role", "status");
    overlay.innerHTML = `
      <div class="lap-quest-reveal-cat" aria-hidden="true">${catSprite("phoebe", "eat")}</div>
      <strong>${round.perfectLap ? "Perfect lap located." : "A cozy lap will do beautifully."}</strong>
      <span>${round.perfectLap ? "Phoebe has made a decision." : "Phoebe is settling in."}</span>
    `;
    root.querySelector(".cc-root")?.appendChild(overlay);
    playLapQuestReveal(round.perfectLap);
    window.setTimeout(() => {
      overlay.remove();
      resolve();
    }, 1050);
  });
}

async function playLapQuestRound(root: HTMLElement, round: LapQuestRoundResult): Promise<void> {
  const grid = root.querySelector<HTMLDivElement>("#reel-grid");
  const status = root.querySelector<HTMLElement>("#status-line");
  const shell = root.querySelector<HTMLElement>(".cc-shell");
  if (!grid || !status) return;

  shell?.classList.add("lap-quest-mode");
  try {
    status.textContent = `Phoebe’s Lap Quest · ${LAP_QUEST_SPOT_LABELS[round.selectedSpot]}`;
    for (const [stepIndex, step] of round.steps.entries()) {
      grid.innerHTML = renderGridHtml(step.grid, step.keepsakeZone, false, step.wins.map((win) => win.lineIndex));
      if (stepIndex === 0 && round.comfortWilds.length > 0) {
        round.comfortWilds.forEach(({ position: [reel, row] }) => {
          grid.querySelector<HTMLElement>(`[data-reel="${reel}"] [data-row="${row}"]`)?.classList.add("lap-quest-wild-land");
        });
        playLapQuestWildLand(round.comfortWilds.length);
      }
      grid.querySelectorAll<HTMLElement>(".cell").forEach((cell) => cell.classList.add("beam-drop"));
      updateJar(root, step.meterAfter);
      if (step.wins.length > 0) {
        playCascadeArpeggio(step.meterAfter);
        beamToSaucers(root);
        playWinPluck();
      } else {
        playCascadeTick();
      }
      await sleep(360);
    }

    status.textContent = round.totalWin > 0
      ? `Phoebe’s Lap Quest · +${round.totalWin.toLocaleString()} coins`
      : "Phoebe’s Lap Quest · cozy and complete";
    await sleep(420);
  } finally {
    shell?.classList.remove("lap-quest-mode");
  }
}

async function runTreatTimeBonus(
  root: HTMLElement,
  state: GameState,
  mode: TreatTimeMode,
  spinsAwarded: number,
): Promise<void> {
  const wedge: WheelWedge = mode === "morning" ? "treat_time_morning" : "treat_time_nighttime";
  await showTreatTimeEntry(root, mode, spinsAwarded);

  const rng = mulberry32(productionSeed());
  const session = runFreeSpinSession(rng, wedge, betPerLine(state.bet), spinsAwarded);
  await playTreatTimeOnMainBoard(root, state, mode, session);

  state.balance += session.totalWin;
  state.bestCascade = Math.max(state.bestCascade, session.bestCascade);
  saveGameState(state);

  const lastRound = session.rounds[session.rounds.length - 1];
  const lastStep = lastRound?.steps[lastRound.steps.length - 1];
  renderBoard(root, state, lastStep?.grid);
  setStatus(root, `IT'S TREAT TIME! Complete — +${session.totalWin.toLocaleString()} coins · ${session.totalSpins} spins${session.retriggers > 0 ? ` · ${session.retriggers} retrigger${session.retriggers > 1 ? "s" : ""}` : ""}`);
}

function showTreatTimeEntry(root: HTMLElement, mode: TreatTimeMode, spinsAwarded: number): Promise<void> {
  return new Promise((resolve) => {
    const nighttime = mode === "nighttime";
    const overlay = document.createElement("div");
    overlay.className = `treat-time-entry treat-time-entry--main ${nighttime ? "treat-time-entry--night" : "treat-time-entry--morning"}`;
    overlay.innerHTML = `
      <div class="treat-time-entry-hand">${treatTimeHandSvg()}</div>
      <div class="treat-time-entry-copy">
        <div class="treat-time-entry-title">IT'S TREAT TIME!</div>
        <div class="treat-time-entry-sub">${nighttime ? "Phoebe found the nighttime spread — Joey is awake too!" : "Phoebe's morning Chicken Comets are READY!"}</div>
        <div class="treat-time-entry-spins">${spinsAwarded} free spins · every spin gets a treat toss</div>
      </div>
    `;
    root.querySelector(".cabinet-frame")?.appendChild(overlay);
    playTreatTimeCue(mode);
    window.setTimeout(() => {
      overlay.remove();
      resolve();
    }, 1350);
  });
}

/** Treat Time stays inside the primary cabinet instead of creating a bonus screen. */
async function playTreatTimeOnMainBoard(
  root: HTMLElement,
  state: GameState,
  mode: TreatTimeMode,
  session: FreeSpinSessionResult,
): Promise<void> {
  const grid = root.querySelector<HTMLDivElement>("#reel-grid");
  const cabinet = root.querySelector<HTMLElement>(".cabinet-frame");
  const status = root.querySelector<HTMLElement>("#status-line");
  const shell = root.querySelector<HTMLElement>(".cc-shell");
  if (!grid || !cabinet || !status) return;

  shell?.classList.add("treat-time-main-mode");
  try {
    for (const [roundIndex, round] of session.rounds.entries()) {
      const totalBeforeRound = roundIndex === 0
        ? session.initialSpins
        : roundIndex + (session.rounds[roundIndex - 1].spinsRemaining ?? session.rounds.length - roundIndex);
      status.textContent = `${mode === "nighttime" ? "Nighttime" : "Morning"} Treat Time · Spin ${roundIndex + 1} of ${totalBeforeRound}`;

      for (const [stepIndex, step] of round.steps.entries()) {
        grid.innerHTML = renderGridHtml(step.grid, step.keepsakeZone, false, step.wins.map((win) => win.lineIndex));
        if (stepIndex === 0 && round.treatTimeWilds?.length) {
          await animateTreatTimeCast(cabinet, grid, round.treatTimeWilds);
        }

        grid.querySelectorAll<HTMLElement>(".cell").forEach((cell) => cell.classList.add("beam-drop"));
        updateJar(root, step.meterAfter);
        if (step.wins.length > 0) {
          playCascadeArpeggio(step.meterAfter);
          beamToSaucers(root);
          playWinPluck();
          for (const win of step.wins) {
            for (const [reel, row] of win.positions) {
              grid.querySelector<HTMLElement>(`[data-reel="${reel}"] [data-row="${row}"]`)?.classList.add("win-flash");
            }
          }
        } else {
          playCascadeTick();
        }
        await sleep(360);
      }

      if (round.totalWin > 0) {
        status.textContent = `Treat Time · +${round.totalWin.toLocaleString()} coins`;
      }
      await sleep(400);
    }
  } finally {
    shell?.classList.remove("treat-time-main-mode");
  }
  void state;
}

/** AskJamie Wheel + the free-spin bonus session it unlocks — docs §7. */
async function runWheelAndFreeSpins(root: HTMLElement, state: GameState, spinsAwarded: number): Promise<void> {
  const rng = mulberry32(productionSeed());
  const wedge = await showWheelScreen(root, rng);

  if (wedge === "keepsake_memory") {
    const memory = createKeepsakeMemory(mulberry32(productionSeed()));
    const earnedSpins = await runKeepsakeMemoryBonus(root, createKeepsakeMemoryController(memory));
    if (earnedSpins === 0) {
      renderBoard(root, state);
      return;
    }
    const standardSession = runFreeSpinSession(rng, "standard", betPerLine(state.bet), earnedSpins);
    await playFreeSpinSession(root, state, standardSession);
    state.balance += standardSession.totalWin;
    state.bestCascade = Math.max(state.bestCascade, standardSession.bestCascade);
    saveGameState(state);
    await showBonusSummary(root, standardSession.totalWin, standardSession.retriggers, standardSession.totalSpins);
    const lastRound = standardSession.rounds[standardSession.rounds.length - 1];
    renderBoard(root, state, lastRound?.steps[lastRound.steps.length - 1]?.grid);
    return;
  }

  const session = runFreeSpinSession(rng, wedge, betPerLine(state.bet), spinsAwarded);

  await playFreeSpinSession(root, state, session);

  state.balance += session.totalWin;
  state.bestCascade = Math.max(state.bestCascade, session.bestCascade);
  saveGameState(state);

  await showBonusSummary(root, session.totalWin, session.retriggers, session.totalSpins);
  const lastRound = session.rounds[session.rounds.length - 1];
  const lastStep = lastRound?.steps[lastRound.steps.length - 1];
  renderBoard(root, state, lastStep?.grid);
}

async function runDoorbellPanic(root: HTMLElement, state: GameState, spinsAwarded: number): Promise<void> {
  const rng = mulberry32(productionSeed());
  const session = runFreeSpinSession(rng, "doorbell_panic", betPerLine(state.bet), spinsAwarded);

  await playFreeSpinSession(root, state, session);

  state.balance += session.totalWin;
  state.bestCascade = Math.max(state.bestCascade, session.bestCascade);
  saveGameState(state);

  await showBonusSummary(root, session.totalWin, session.retriggers, session.totalSpins);
  const lastRound = session.rounds[session.rounds.length - 1];
  const lastStep = lastRound?.steps[lastRound.steps.length - 1];
  renderBoard(root, state, lastStep?.grid);
}

function showWheelScreen(root: HTMLElement, rng: () => number): Promise<WheelWedge> {
  return new Promise((resolve) => {
    const wedge = spinWheel(rng);
    const finalDeg = 1080 + (({ multiplying: 30, keepsake_memory: 150, chai_back: 270, doorbell_panic: 0 } as Partial<Record<WheelWedge, number>>)[wedge] ?? 0);

    const overlay = document.createElement("div");
    overlay.className = "bonus-cabinet-overlay wheel-scrim text-amber-100";
    overlay.innerHTML = `
      <h2 class="wheel-heading"><span>Free Spins!</span> Joey &amp; Phoebe's Sparkle Wheel</h2>
      <div class="wheel-stage">
        ${wheelHeroArt()}
        <div class="wheel-glow-ring"></div>
        <div id="wheel-ring" class="wheel-energy-ring" style="--wheel-final-deg:${finalDeg}deg">
          <span></span><span></span><span></span>
        </div>
        <div class="wheel-pointer"></div>
      </div>
      <div class="wheel-legends" aria-hidden="true">
        <span><b>We're Multiplying</b> Extra sparkle</span>
        <span><b>Moonlit Keepsake Trail</b> memory match</span>
        <span><b>Iced Chai</b> wild rain</span>
      </div>
      <p id="wheel-result" class="min-h-[1.5rem] text-center font-semibold"></p>
    `;
    const host = root.querySelector<HTMLElement>(".cabinet-frame") ?? root;
    host.appendChild(overlay);

    playWheelTick();
    window.setTimeout(() => {
      const resultEl = overlay.querySelector<HTMLParagraphElement>("#wheel-result")!;
      resultEl.textContent = wheelWedgeLabel(wedge) + "!";
      playBonusFanfare();
      window.setTimeout(() => {
        overlay.remove();
        resolve(wedge);
      }, 1400);
    }, 2450);
  });
}

async function playFreeSpinSession(
  root: HTMLElement,
  state: GameState,
  session: FreeSpinSessionResult,
  presentation: { label?: string; title?: string } = {},
): Promise<void> {
  const { wedge, rounds } = session;
  const cabinet = root.querySelector<HTMLElement>(".cabinet-frame");
  const standardGrid = root.querySelector<HTMLDivElement>("#reel-grid");
  if (!cabinet || !standardGrid) return;

  const bgLayer = root.querySelector<HTMLDivElement>("#bg-layer");
  bgLayer?.classList.add("aurora");
  document.body.classList.add("aurora-mode");

  const treatTime = wedge === "treat_time_morning" || wedge === "treat_time_nighttime";
  const chaiStormSession = wedge === "chai_back" && rounds.some((round) => round.chaiRain !== undefined);
  const displayWedgeLabel = presentation.label ?? (wedge === "standard" ? "Standard Chai Chase" : wedge === "chai_back" && !chaiStormSession ? "Bold Chai" : wheelWedgeLabel(wedge));
  const title = presentation.title ?? (treatTime ? "IT'S TREAT TIME!" : wedge === "doorbell_panic" ? "Panic Spins" : displayWedgeLabel === "Bold Chai" ? "BOLD CHAI!" : "Free Spins");
  const panel = document.createElement("section");
  panel.className = `free-spins-panel text-amber-100 ${wedge === "doorbell_panic" ? "panic-free-spins" : ""} ${treatTime ? "treat-time-free-spins treat-time-cabinet" : ""}`;
  panel.setAttribute("aria-label", `${displayWedgeLabel} bonus spins`);
  panel.innerHTML = `
    <div class="free-spins-panel-heading">
      <span class="free-spins-panel-kicker">${displayWedgeLabel}</span>
      <strong>${title}</strong>
    </div>
    <div class="free-spins-panel-stats" aria-live="polite">Spin <span id="fs-index">1</span> of <span id="fs-total">${session.initialSpins}</span> · Round win: <span id="fs-round-win">0</span></div>
    <div id="fs-grid" class="reel-grid"></div>
    <div id="fs-status" class="status-line" aria-live="polite"></div>
  `;
  standardGrid.hidden = true;
  cabinet.appendChild(panel);

  const grid = panel.querySelector<HTMLDivElement>("#fs-grid")!;
  const indexEl = panel.querySelector<HTMLSpanElement>("#fs-index")!;
  const totalEl = panel.querySelector<HTMLSpanElement>("#fs-total")!;
  const roundWinEl = panel.querySelector<HTMLSpanElement>("#fs-round-win")!;
  const statusEl = panel.querySelector<HTMLDivElement>("#fs-status")!;
  const panicBellTimer = wedge === "doorbell_panic" ? window.setInterval(playDoorbellRing, 3000) : undefined;
  if (panicBellTimer !== undefined) playDoorbellRing();

  const chaiStorm = wedge === "chai_back" ? rounds.find((round) => round.chaiRain)?.chaiRain : undefined;
  try {
    if (chaiStorm) await showChaiStormSplash(panel, chaiStorm.wilds.length);

    for (let r = 0; r < rounds.length; r++) {
      const round = rounds[r];
      let doorbellRang = false;
      indexEl.textContent = String(r + 1);
      const totalBeforeRound = r === 0
        ? session.initialSpins
        : r + (rounds[r - 1].spinsRemaining ?? rounds.length - r);
      totalEl.textContent = String(totalBeforeRound);
      roundWinEl.textContent = round.totalWin.toLocaleString();
      if (round.multiplierWild) {
        statusEl.textContent = `×${round.multiplierWild.multiplier} wild on reel ${round.multiplierWild.position[0] + 1}!`;
      }

      for (const [stepIndex, step] of round.steps.entries()) {
        grid.innerHTML = renderGridHtml(step.grid, step.keepsakeZone, false, step.wins.map((win) => win.lineIndex));
        if (stepIndex === 0 && round.treatTimeWilds?.length) {
          await animateTreatTimeCast(panel, grid, round.treatTimeWilds);
        }
        if (r === 0 && stepIndex === 0 && round.chaiRain) {
          await animateChaiStormConversions(grid, round.chaiRain.wilds);
        }
        if (!doorbellRang && step.grid.flat().some((cell) => cell.symbol === "doorbell")) {
          playDoorbellRing();
          doorbellRang = true;
        }
        grid.classList.toggle("panic-grid", wedge === "doorbell_panic");
        grid.querySelectorAll(".cell").forEach((cell) => cell.classList.add("beam-drop"));
        if (step.wins.length > 0) {
          playCascadeArpeggio(step.meterAfter);
          playWinPluck();
        } else {
          playCascadeTick();
        }
        await sleep(360);
      }

      if (round.panicWildsAdded > 0) {
        statusEl.textContent = `DOORBELL PANIC! ${round.panicWildsAdded} flying wild cats!`;
        playJoeyCue();
        playPhoebeCue();
        await sleep(520);
      } else if (round.chaiRain) {
        statusEl.textContent = round.chaiRain.wilds.length > 0
          ? `WILD CHAI STORM! ${round.chaiRain.wilds.length} mermaid-cup wild chai!`
          : "WILD CHAI STORM! The chai sky is charged!";
        await sleep(520);
      } else if (round.totalWin > 0) {
        statusEl.textContent = `+${round.totalWin.toLocaleString()} coins`;
        await sleep(400);
      } else {
        statusEl.textContent = "";
      }
    }
  } finally {
    if (panicBellTimer !== undefined) window.clearInterval(panicBellTimer);
    panel.remove();
    standardGrid.hidden = false;
    bgLayer?.classList.remove("aurora");
    document.body.classList.remove("aurora-mode");
  }
  void state; // state saved by caller after totals are tallied
}

/**
 * Presents the already-resolved Joey Laundry chapter. The parent UniGlee
 * controller supplies the typed session; this layer only owns timing, art,
 * audio, and accessibility announcements.
 */
export async function playJoeyLaundryChapter(
  root: HTMLElement,
  session: JoeyLaundrySessionResult,
): Promise<void> {
  const overlay = document.createElement("div");
  overlay.className = "joey-laundry-overlay";
  overlay.setAttribute("role", "region");
  overlay.setAttribute("aria-label", "Joey's Laundry Helper sub-bonus");
  overlay.innerHTML = `
    <div class="night-garden aurora">${gardenDecor()}</div>
    <div class="relative z-10 h-full w-full flex flex-col cc-shell free-spins-shell joey-laundry-shell">
      <header class="marquee joey-laundry-header">
        <div class="marquee-row">
          <span class="level-chip">UniGlee · Chapter 1</span>
          <h1 class="marquee-title">Joey’s Laundry Helper</h1>
        </div>
      </header>
      <div class="jar-meter joey-laundry-meter">
        <div class="jar-meter-text">Laundry spin <span id="laundry-index">1</span> of <span id="laundry-total">${session.rounds.length}</span> · Round win: <span id="laundry-round-win">0</span></div>
      </div>
      <main class="cabinet-frame joey-laundry-cabinet">
        <div class="joey-laundry-perch" aria-hidden="true">${catSprite("joey", "assist")}</div>
        <div id="laundry-grid" class="reel-grid"></div>
      </main>
      <div id="laundry-status" class="status-line" aria-live="polite"></div>
    </div>
  `;
  root.appendChild(overlay);

  const grid = overlay.querySelector<HTMLDivElement>("#laundry-grid")!;
  const indexEl = overlay.querySelector<HTMLSpanElement>("#laundry-index")!;
  const totalEl = overlay.querySelector<HTMLSpanElement>("#laundry-total")!;
  const roundWinEl = overlay.querySelector<HTMLSpanElement>("#laundry-round-win")!;
  const statusEl = overlay.querySelector<HTMLDivElement>("#laundry-status")!;
  const cabinet = overlay.querySelector<HTMLElement>(".joey-laundry-cabinet")!;
  const reduced = (root.querySelector(".cc-root")?.getAttribute("data-reduced-motion") === "true")
    || (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);

  playJoeyCue();
  await sleep(reduced ? 80 : 520);

  for (const [roundIndex, round] of session.rounds.entries()) {
    indexEl.textContent = String(roundIndex + 1);
    totalEl.textContent = String(session.rounds.length);
    roundWinEl.textContent = round.totalWin.toLocaleString();
    const effect = round.laundryEffect;

    for (const [stepIndex, step] of round.steps.entries()) {
      grid.innerHTML = renderGridHtml(step.grid, step.keepsakeZone, false, step.wins.map((win) => win.lineIndex));
      grid.querySelectorAll<HTMLElement>(".cell").forEach((cell, cellIndex) => {
        cell.style.setProperty("--drop-delay", `${(cellIndex % ROWS) * 16 + Math.floor(cellIndex / ROWS) * 10}ms`);
        cell.classList.add(stepIndex === 0 ? "symbol-pop" : "beam-drop");
      });

      if (stepIndex === 0 && effect) {
        await animateLaundryEffects(cabinet, grid, effect, statusEl, reduced);
      }

      updateJar(root, step.meterAfter);
      if (step.wins.length > 0) {
        playCascadeArpeggio(step.meterAfter);
        playWinPluck();
        step.wins.forEach((win) => win.positions.forEach(([reel, row]) => {
          grid.querySelector<HTMLElement>(`[data-reel="${reel}"] [data-row="${row}"]`)?.classList.add("win-flash");
        }));
      } else {
        playCascadeTick();
      }
      await sleep(reduced ? 28 : 170);
    }

    if (round.freeSpinsAwarded > 0) {
      statusEl.textContent = `Joey caught a bonus sock — +${round.freeSpinsAwarded} Laundry spin${round.freeSpinsAwarded === 1 ? "" : "s"}.`;
      playBonusFanfare();
      await sleep(reduced ? 40 : 360);
    } else if (round.totalWin > 0) {
      statusEl.textContent = `Joey’s Laundry Helper · +${round.totalWin.toLocaleString()} coins`;
      await sleep(reduced ? 30 : 120);
    }
  }

  statusEl.textContent = `Joey’s Laundry Helper complete · ${session.rounds.length} spins · +${session.totalWin.toLocaleString()} coins`;
  playBonusFanfare();
  await sleep(reduced ? 80 : 560);
  overlay.remove();
}

/** Resolves the chapter UI and persists its already-accounted session total. */
export async function runJoeyLaundryChapter(
  root: HTMLElement,
  state: GameState,
  session: JoeyLaundrySessionResult,
): Promise<void> {
  await playJoeyLaundryChapter(root, session);
  state.balance += session.totalWin;
  state.bestCascade = Math.max(state.bestCascade, session.bestCascade);
  saveGameState(state);
  const lastRound = session.rounds[session.rounds.length - 1];
  renderBoard(root, state, lastRound?.steps[lastRound.steps.length - 1]?.grid);
}

function animateLaundryEffects(
  cabinet: HTMLElement,
  grid: HTMLElement,
  effect: NonNullable<FreeSpinRoundResult["laundryEffect"]>,
  statusEl: HTMLElement,
  reduced: boolean,
): Promise<void> {
  const layer = document.createElement("div");
  layer.className = "joey-laundry-effect-layer";
  cabinet.appendChild(layer);
  const messages: string[] = [];
  const timers: number[] = [];

  if (effect.sockDrop) {
    const firstCell = grid.querySelector<HTMLElement>(`[data-reel="${effect.sockDrop.reel}"] [data-row="0"]`);
    const lastCell = grid.querySelector<HTMLElement>(`[data-reel="${effect.sockDrop.reel}"] [data-row="${ROWS - 1}"]`);
    if (firstCell && lastCell) {
      const stageRect = cabinet.getBoundingClientRect();
      const firstRect = firstCell.getBoundingClientRect();
      const lastRect = lastCell.getBoundingClientRect();
      const column = document.createElement("div");
      column.className = "joey-laundry-sock-column";
      column.style.left = `${firstRect.left - stageRect.left}px`;
      column.style.top = `${firstRect.top - stageRect.top}px`;
      column.style.width = `${firstRect.width}px`;
      column.style.height = `${lastRect.bottom - firstRect.top}px`;
      layer.appendChild(column);

      const sock = document.createElement("div");
      sock.className = "joey-laundry-sock";
      sock.innerHTML = laundrySockSvg();
      sock.style.left = `${firstRect.left - stageRect.left + firstRect.width * 0.18}px`;
      sock.style.top = `${Math.max(4, firstRect.top - stageRect.top - firstRect.height * 1.5)}px`;
      sock.style.setProperty("--sock-drop-distance", `${lastRect.bottom - firstRect.top + firstRect.height}px`);
      layer.appendChild(sock);
      messages.push(`Sock on reel ${effect.sockDrop.reel + 1}: full column wild.`);
      playLaundrySockDrop();
    }
  }

  if (effect.pawStrike) {
    const [reel, row] = effect.pawStrike.position;
    const cell = grid.querySelector<HTMLElement>(`[data-reel="${reel}"] [data-row="${row}"]`);
    if (cell) {
      const stageRect = cabinet.getBoundingClientRect();
      const cellRect = cell.getBoundingClientRect();
      const paw = document.createElement("div");
      paw.className = "joey-laundry-paw";
      paw.innerHTML = laundryPawSvg();
      paw.style.left = `${cellRect.left - stageRect.left}px`;
      paw.style.top = `${cellRect.top - stageRect.top - cellRect.height * 0.5}px`;
      paw.style.width = `${cellRect.width}px`;
      paw.style.height = `${cellRect.height * 1.5}px`;
      layer.appendChild(paw);
      messages.push(`Joey’s paw strike: ${effect.pawStrike.multiplier} times wild on reel ${reel + 1}, row ${row + 1}.`);
      playLaundryPawStrike(effect.pawStrike.multiplier);
    }
  }

  const sharedReel = effect.sockDrop && effect.pawStrike && effect.sockDrop.reel === effect.pawStrike.position[0];
  statusEl.textContent = messages.length === 2 && sharedReel
    ? `Joey caught a sock and enhanced reel ${effect.sockDrop!.reel + 1} with a ${effect.pawStrike!.multiplier} times wild.`
    : messages.join(" ");

  const duration = reduced ? 80 : 720;
  timers.push(window.setTimeout(() => {
    layer.querySelectorAll<HTMLElement>(".joey-laundry-sock-column").forEach((column) => column.classList.add("is-landed"));
  }, reduced ? 0 : 560));
  return new Promise((resolve) => {
    window.setTimeout(() => {
      timers.forEach((timer) => window.clearTimeout(timer));
      layer.remove();
      resolve();
    }, duration);
  });
}

function laundrySockSvg(): string {
  return `<svg viewBox="0 0 58 78" aria-hidden="true"><path d="M17 5h24v32c0 8 4 13 12 19-3 12-14 17-28 13C11 66 7 57 14 47l3-6z" fill="#f5d576" stroke="#2d1f4c" stroke-width="4" stroke-linejoin="round"/><path d="M17 15h24M17 26h24" stroke="#e8a5b8" stroke-width="5" stroke-linecap="round"/></svg>`;
}

function laundryPawSvg(): string {
  return `<svg viewBox="0 0 88 110" aria-hidden="true"><path d="M22 82c-7-5-8-14-3-20 4-4 9-4 14-1-4-12-3-22 3-24 6-2 9 4 11 14 0-16 4-23 10-22 6 1 7 8 6 21 4-10 9-13 14-10 5 4 2 13-1 22 6-5 12-3 14 2 3 7-4 16-12 23-9 8-18 12-31 9z" fill="#9fe8c5" stroke="#2d1f4c" stroke-width="4" stroke-linejoin="round"/></svg>`;
}

function showChaiStormSplash(parent: HTMLElement, convertedCount: number): Promise<void> {
  return new Promise((resolve) => {
    const splash = document.createElement("div");
    splash.className = "chai-storm-splash";
    const droplets = Array.from({ length: 28 }, (_, index) => {
      const left = (index * 37) % 100;
      const delay = ((index * 0.071) % 0.8).toFixed(2);
      const duration = (0.8 + (index % 5) * 0.12).toFixed(2);
      const size = 5 + (index % 4) * 2;
      return `<span class="chai-storm-drop" style="--drop-left:${left}%;--drop-delay:${delay}s;--drop-duration:${duration}s;--drop-size:${size}px"></span>`;
    }).join("");
    splash.innerHTML = `
      <div class="chai-storm-drops" aria-hidden="true">${droplets}</div>
      <div class="chai-storm-sparkles" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="chai-storm-copy" role="status" aria-live="assertive">
        <div class="chai-storm-kicker">AskJamie pours the sky open</div>
        <h2>WILD CHAI STORM</h2>
        <p>Chai storm! Chai storm!</p>
        <small>${convertedCount > 0 ? `${convertedCount} mermaid cups are becoming wild chai.` : "The mermaid cups are listening."}</small>
      </div>
    `;
    parent.appendChild(splash);
    playChaiStorm(convertedCount);
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    window.setTimeout(() => {
      splash.remove();
      resolve();
    }, reduced ? 720 : 1320);
  });
}

function animateChaiStormConversions(grid: HTMLElement, wilds: ChaiRainWild[]): Promise<void> {
  return new Promise((resolve) => {
    const targets = wilds
      .map(({ position: [reel, row] }) => grid.querySelector<HTMLElement>(`[data-reel="${reel}"] [data-row="${row}"]`))
      .filter((cell): cell is HTMLElement => Boolean(cell));
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    targets.forEach((cell, index) => {
      window.setTimeout(() => cell.classList.add("chai-wild-conversion"), reduced ? 0 : index * 70);
    });
    window.setTimeout(() => resolve(), reduced ? 100 : 560 + targets.length * 70);
  });
}

function animateTreatTimeCast(stage: HTMLElement, grid: HTMLElement, wilds: TreatTimeWild[]): Promise<void> {
  return new Promise((resolve) => {
    const layer = document.createElement("div");
    layer.className = "treat-time-cast-layer";
    layer.innerHTML = `<div class="treat-time-hand">${treatTimeHandSvg()}</div>`;
    stage.appendChild(layer);

    const stageRect = stage.getBoundingClientRect();
    const treatSymbols: Record<TreatTimeWild["treat"], SymbolId> = {
      chicken: "treat_chicken",
      salmon: "treat_salmon",
      bougie: "treat_bougie",
    };
    const targets: HTMLElement[] = [];
    const startX = 8;
    const startY = Math.max(8, stageRect.height - 76);

    wilds.forEach((wild, index) => {
      const [reel, row] = wild.position;
      const cell = grid.querySelector<HTMLElement>(`[data-reel="${reel}"] [data-row="${row}"]`);
      if (!cell) return;
      const cellRect = cell.getBoundingClientRect();
      const token = document.createElement("div");
      token.className = "treat-time-token";
      token.innerHTML = symbolSvg(treatSymbols[wild.treat]);
      token.style.width = `${cellRect.width}px`;
      token.style.height = `${cellRect.height}px`;
      token.style.left = `${startX}px`;
      token.style.top = `${startY}px`;
      token.style.setProperty("--target-x", `${cellRect.left - stageRect.left - startX}px`);
      token.style.setProperty("--target-y", `${cellRect.top - stageRect.top - startY}px`);
      token.style.setProperty("--treat-delay", `${index * 38}ms`);
      token.dataset.treat = wild.treat;
      layer.appendChild(token);
      targets.push(cell);
    });

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    window.requestAnimationFrame(() => layer.classList.add("is-casting"));
    window.setTimeout(() => {
      targets.forEach((cell) => cell.classList.add("treat-time-wild-land"));
      playTreatLand(wilds.length);
      layer.remove();
      resolve();
    }, reduced ? 90 : 980);
  });
}

function treatTimeHandSvg(): string {
  return `<svg viewBox="0 0 88 110" aria-hidden="true">
    <path d="M28 101c-7-7-9-19-6-31l6-24c1-5 8-5 9 0l1 14 2-34c0-6 8-6 9 0l1 31 2-39c0-6 8-6 9 0l1 38 3-28c1-6 9-5 9 1l-2 38c-1 16-7 26-18 34z" fill="#f5d576" stroke="#2d1f4c" stroke-width="4" stroke-linejoin="round"/>
    <path d="M24 69c-7-7-13-9-17-4-4 5 1 12 10 17" fill="none" stroke="#2d1f4c" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}

function showBonusSummary(root: HTMLElement, totalWin: number, retriggers: number, totalSpins: number): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "bonus-cabinet-overlay wheel-scrim text-amber-100";
    overlay.innerHTML = `
      <h2 class="text-2xl font-bold">Free Spins Complete!</h2>
      <p class="text-lg">You won ${totalWin.toLocaleString()} coins across ${totalSpins} free spins${retriggers > 0 ? ` (with ${retriggers} retrigger${retriggers > 1 ? "s" : ""}!)` : ""}</p>
      <button id="bonus-continue" class="sparkle-btn mt-4">Continue</button>
    `;
    const host = root.querySelector<HTMLElement>(".cabinet-frame") ?? root;
    host.appendChild(overlay);
    playBonusFanfare();
    overlay.querySelector("#bonus-continue")?.addEventListener("click", () => {
      overlay.remove();
      resolve();
    });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export { BET_LEVELS, LINES };
