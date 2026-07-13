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
import type { CascadeStep, SpinResult, SymbolId, TreatTimeMode, TreatTimeWild } from "../engine/types";
import { REELS, ROWS } from "../engine/reels";
import { BET_LEVELS, LINES, availableBetLevels, betPerLine, sparksForSpin, xpIntoLevel, applyBustProofRefill } from "../engine/economy";
import { spin } from "../engine/cascade";
import { PAYOUT_SCALE, PAYTABLE } from "../engine/paylines";
import { addTreat, consumeForVisit } from "../engine/features";
import { mulberry32, productionSeed } from "../engine/rng";
import { runFreeSpinSession, spinWheel, wheelWedgeLabel, type FreeSpinRoundResult, type WheelWedge } from "../engine/freespins";
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
  askJamieSvg,
  type CatPose,
} from "./symbols";
import {
  isUnlocked,
  playBonusFanfare,
  playCascadeArpeggio,
  playCascadeTick,
  playDoorbellRing,
  playJoeyCue,
  playPhoebeCue,
  playTreatLand,
  playTreatTimeCue,
  playUniGleeSting,
  playWinPluck,
  playWheelTick,
  playFullFlavorFrenzy,
  playStrangerDangerPanic,
  setMusicEnabled,
  setSfxEnabled,
  setSfxVolume,
  unlock,
} from "../audio/synth";
import { setMusicVolume, startBaseMusic, stopBaseMusic } from "../audio/music";

let statusTimeout: number | undefined;

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
            ${renderGridHtml(settledGrid)}
          </div>
        </main>

        <div class="companion-row">
          <div id="treat-jar" aria-label="Treat Jar" class="treat-jar-housing">
            <span class="treat-jar-title">Treat Jar</span>
            ${treatJarHtml(state)}
          </div>
          <div id="askjamie-perch" aria-label="AskJamie" class="askjamie-housing">
            <div class="askjamie-icon">${askJamieSvg()}</div>
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
    <span title="Boogie Bites" class="treat-chip"><span class="treat-icon">${symbolSvg("treat_boogie")}</span>${jar.boogie}</span>
  `;
}

function renderGridHtml(grid: SpinResult["steps"][number]["grid"]): string {
  let html = "";
  for (let reel = 0; reel < REELS; reel++) {
    html += `<div class="reel-col" data-reel="${reel}">`;
    for (let row = 0; row < ROWS; row++) {
      const symbol = grid[reel][row].symbol;
      html += `<div class="cell" data-row="${row}" data-symbol="${symbol}">${symbolSvg(symbol as SymbolId)}</div>`;
    }
    html += "</div>";
  }
  return html;
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
  return `<label class="volume-control" for="${id}-volume"><span><b>${label}</b><small>${help}</small></span><output id="${id}-volume-value" for="${id}-volume">${percent}%</output><input id="${id}-volume" type="range" min="0" max="100" value="${percent}" aria-label="${label} volume"/></label>`;
}

function wireVolume(
  page: HTMLElement,
  id: "music" | "sfx",
  apply: (value: number) => void,
  persist: () => void,
): void {
  const input = page.querySelector<HTMLInputElement>(`#${id}-volume`)!;
  const output = page.querySelector<HTMLOutputElement>(`#${id}-volume-value`)!;
  input.addEventListener("input", () => {
    const value = Number(input.value) / 100;
    output.value = `${input.value}%`;
    output.textContent = output.value;
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
      <section class="paytable-intro"><strong>25 fixed lines</strong><span>Match 3, 4, or 5 symbols from the left. Values are × your line bet.</span></section>
      <section class="paytable-grid" aria-label="Paying symbols">${PAYTABLE_SYMBOLS.map(paytableCard).join("")}</section>
      <h3 class="page-section-title">Special symbols</h3>
      <section class="feature-symbol-grid">
        ${featureCard("wild_joey", "Joey Saucer Wild", "Substitutes for every paying symbol. A wild-only line pays as the Mermaid Tumbler.")}
        ${featureCard("wild_phoebe", "Phoebe Saucer Wild", "Substitutes for every paying symbol. A wild-only line pays as the Mermaid Tumbler.")}
        ${featureCard("treat_chicken", "Chicken Comets", "A Phoebe treat. It joins the Treat Jar and can invite a helpful cat pop-in.")}
        ${featureCard("treat_salmon", "Salmon Stars", "A Phoebe treat. It joins the Treat Jar and can invite a helpful cat pop-in.")}
        ${featureCard("treat_boogie", "Boogie Bites", "Joey's favorite. Keep one in the Treat Jar for his stronger assist.")}
        ${featureCard("doorbell", "Doorbell", "A pair on the first two positions of any line begins Doorbell Panic free spins.")}
        ${featureCard("uniglee", "UniGlee", "The rare rainbow-butterfly legend begins a special Chai Chase celebration.")}
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
  if (didRefill) setStatus(root, "AskJamie found coins under the couch! +500,000 coins");

  state.balance -= state.bet;
  sparkleBtn.disabled = true;
  sparkleBtn.classList.add("is-spinning");

  const seed = productionSeed();
  const result = spin({
    rng: mulberry32(seed),
    treatTimeRng: mulberry32(seed ^ 0x9e3779b9),
    allowTreatTimeBonus: true,
    betPerLine: betPerLine(state.bet),
    treatJar: state.treatJar,
    spinsSincePopIn: state.spinsSincePopIn,
  });

  await animateSteps(root, result.steps);

  state.balance += result.totalWin;
  state.xp += sparksForSpin(state.bet);
  state.fireflyMeter = result.cascades;
  state.bestCascade = Math.max(state.bestCascade, result.cascades);

  for (const treat of result.treatsCollected) {
    state.treatJar = addTreat(state.treatJar, treat);
  }

  if (result.doorbellPanic) {
    playStrangerDangerPanic();
    await showDoorbellPanic(root, result.doorbellPanic.freeSpinsAwarded, result.doorbellPanic.positions);
  } else if (result.unigleeTriggered) {
    playUniGleeSting();
    await showUnigleeTakeover(root);
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

  if (result.freeSpinsAwarded > 0) {
    if (result.treatTimeBonus) await runTreatTimeBonus(root, state, result.treatTimeBonus.mode, result.treatTimeBonus.freeSpinsAwarded);
    else if (result.doorbellPanic) await runDoorbellPanic(root, state, result.freeSpinsAwarded);
    else await runWheelAndFreeSpins(root, state, result.freeSpinsAwarded);
    return;
  }

  if (result.treatTimeBonus) {
    await runTreatTimeBonus(root, state, result.treatTimeBonus.mode, result.treatTimeBonus.freeSpinsAwarded);
    return;
  }

  renderBoard(root, state, result.steps[result.steps.length - 1]?.grid);
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
      grid.innerHTML = renderGridHtml(step.grid);
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

/** UniGlee legend takeover — violet dim, butterfly storm, Glee avatar. ~1/400 (docs §5). */
function showUnigleeTakeover(root: HTMLElement): Promise<void> {
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
        <div class="uniglee-title">UNIGLEE!</div>
        <div class="uniglee-sub">Freak'n facts on FACTS.</div>
      </div>
    `;
    root.querySelector(".cc-root")?.appendChild(overlay);
    window.setTimeout(() => {
      overlay.remove();
      resolve();
    }, 2600);
  });
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
  await playFreeSpinSession(root, state, session.wedge, session.rounds);

  state.balance += session.totalWin;
  state.bestCascade = Math.max(state.bestCascade, session.bestCascade);
  saveGameState(state);

  await showBonusSummary(root, session.totalWin, session.retriggers);
  const lastRound = session.rounds[session.rounds.length - 1];
  const lastStep = lastRound?.steps[lastRound.steps.length - 1];
  renderBoard(root, state, lastStep?.grid);
}

function showTreatTimeEntry(root: HTMLElement, mode: TreatTimeMode, spinsAwarded: number): Promise<void> {
  return new Promise((resolve) => {
    const nighttime = mode === "nighttime";
    const overlay = document.createElement("div");
    overlay.className = `treat-time-entry ${nighttime ? "treat-time-entry--night" : "treat-time-entry--morning"}`;
    overlay.innerHTML = `
      <div class="treat-time-entry-hand">${treatTimeHandSvg()}</div>
      <div class="treat-time-entry-copy">
        <div class="treat-time-entry-title">IT'S TREAT TIME!</div>
        <div class="treat-time-entry-sub">${nighttime ? "Phoebe found the nighttime spread — Joey is awake too!" : "Phoebe's morning Chicken Comets are READY!"}</div>
        <div class="treat-time-entry-spins">${spinsAwarded} free spins · every spin gets a treat toss</div>
      </div>
    `;
    root.querySelector(".cc-root")?.appendChild(overlay);
    playTreatTimeCue(mode);
    window.setTimeout(() => {
      overlay.remove();
      resolve();
    }, 1350);
  });
}

/** AskJamie Wheel + the free-spin bonus session it unlocks — docs §7. */
async function runWheelAndFreeSpins(root: HTMLElement, state: GameState, spinsAwarded: number): Promise<void> {
  const rng = mulberry32(productionSeed());
  const wedge = await showWheelScreen(root, rng);
  const session = runFreeSpinSession(rng, wedge, betPerLine(state.bet), spinsAwarded);

  await playFreeSpinSession(root, state, session.wedge, session.rounds);

  state.balance += session.totalWin;
  state.bestCascade = Math.max(state.bestCascade, session.bestCascade);
  saveGameState(state);

  await showBonusSummary(root, session.totalWin, session.retriggers);
  const lastRound = session.rounds[session.rounds.length - 1];
  const lastStep = lastRound?.steps[lastRound.steps.length - 1];
  renderBoard(root, state, lastStep?.grid);
}

async function runDoorbellPanic(root: HTMLElement, state: GameState, spinsAwarded: number): Promise<void> {
  const rng = mulberry32(productionSeed());
  const session = runFreeSpinSession(rng, "doorbell_panic", betPerLine(state.bet), spinsAwarded);

  await playFreeSpinSession(root, state, session.wedge, session.rounds);

  state.balance += session.totalWin;
  state.bestCascade = Math.max(state.bestCascade, session.bestCascade);
  saveGameState(state);

  await showBonusSummary(root, session.totalWin, session.retriggers);
  const lastRound = session.rounds[session.rounds.length - 1];
  const lastStep = lastRound?.steps[lastRound.steps.length - 1];
  renderBoard(root, state, lastStep?.grid);
}

function showWheelScreen(root: HTMLElement, rng: () => number): Promise<WheelWedge> {
  return new Promise((resolve) => {
    const wedge = spinWheel(rng);
    const finalDeg = 1080 + (({ multiplying: 30, giant_gnome: 150, chai_back: 270, doorbell_panic: 0 } as Partial<Record<WheelWedge, number>>)[wedge] ?? 0);

    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 wheel-scrim text-amber-100";
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
        <span><b>Keepsake Constellation</b> mega-keepsakes</span>
        <span><b>Iced Chai</b> wild rain</span>
      </div>
      <p id="wheel-result" class="min-h-[1.5rem] text-center font-semibold"></p>
    `;
    root.appendChild(overlay);

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
  wedge: WheelWedge,
  rounds: FreeSpinRoundResult[],
): Promise<void> {
  const bgLayer = root.querySelector<HTMLDivElement>("#bg-layer");
  bgLayer?.classList.add("aurora");
  document.body.classList.add("aurora-mode");

  const overlay = document.createElement("div");
  const treatTime = wedge === "treat_time_morning" || wedge === "treat_time_nighttime";
  overlay.className = `free-spins-overlay text-amber-100 ${wedge === "doorbell_panic" ? "panic-free-spins" : ""} ${treatTime ? "treat-time-free-spins" : ""}`;
  overlay.innerHTML = `
    <div class="night-garden aurora">${gardenDecor()}</div>
    <div class="relative z-10 h-full w-full flex flex-col">
      <header class="marquee">
        <div class="marquee-row">
          <span class="level-chip">${wheelWedgeLabel(wedge)}</span>
          <h1 class="marquee-title">${treatTime ? "IT'S TREAT TIME!" : wedge === "doorbell_panic" ? "Panic Spins" : "Free Spins"}</h1>
        </div>
      </header>
      <div class="jar-meter">
        <div class="jar-meter-text">Spin <span id="fs-index">1</span> of <span id="fs-total">${rounds.length}</span> · Round win: <span id="fs-round-win">0</span></div>
      </div>
      <main class="cabinet-frame ${treatTime ? "treat-time-cabinet" : ""}">
        <div id="fs-grid" class="reel-grid"></div>
      </main>
      <div id="fs-status" class="status-line"></div>
    </div>
  `;
  root.appendChild(overlay);

  const grid = overlay.querySelector<HTMLDivElement>("#fs-grid")!;
  const indexEl = overlay.querySelector<HTMLSpanElement>("#fs-index")!;
  const totalEl = overlay.querySelector<HTMLSpanElement>("#fs-total")!;
  const roundWinEl = overlay.querySelector<HTMLSpanElement>("#fs-round-win")!;
  const statusEl = overlay.querySelector<HTMLDivElement>("#fs-status")!;
  const panicBellTimer = wedge === "doorbell_panic" ? window.setInterval(playDoorbellRing, 3000) : undefined;
  if (panicBellTimer !== undefined) playDoorbellRing();

  for (let r = 0; r < rounds.length; r++) {
    const round = rounds[r];
    let doorbellRang = false;
    indexEl.textContent = String(r + 1);
    totalEl.textContent = String(rounds.length);
    roundWinEl.textContent = round.totalWin.toLocaleString();

    for (const [stepIndex, step] of round.steps.entries()) {
      grid.innerHTML = renderGridHtml(step.grid);
      if (stepIndex === 0 && round.treatTimeWilds?.length) {
        await animateTreatTimeCast(
          overlay.querySelector<HTMLElement>(".treat-time-cabinet")!,
          grid,
          round.treatTimeWilds,
        );
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
    } else if (round.twelvePumps) {
      await showFullFlavorFrenzy(overlay);
      playFullFlavorFrenzy();
    } else if (round.extraWildsAdded > 0) {
      statusEl.textContent = "We Want Our Chai Back — extra wilds landed!";
      await sleep(500);
    } else if (round.totalWin > 0) {
      statusEl.textContent = `+${round.totalWin.toLocaleString()} coins`;
      await sleep(400);
    } else {
      statusEl.textContent = "";
    }
    if (round.freeSpinsAwarded > 0) {
      statusEl.textContent = `Retrigger! +${round.freeSpinsAwarded} more free spins!`;
      playBonusFanfare();
      await sleep(800);
    }
  }

  if (panicBellTimer !== undefined) window.clearInterval(panicBellTimer);
  overlay.remove();
  bgLayer?.classList.remove("aurora");
  document.body.classList.remove("aurora-mode");
  void state; // state saved by caller after totals are tallied
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
      boogie: "treat_boogie",
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

function showFullFlavorFrenzy(overlay: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const callout = document.createElement("div");
    callout.className = "full-flavor-frenzy";
    callout.innerHTML = `<div class="full-flavor-frenzy-ring">${burstDots(20)}</div><div class="full-flavor-frenzy-text">FULL-FLAVOR FRENZY!<span>A bold wild multiplier</span></div>`;
    overlay.appendChild(callout);
    window.setTimeout(() => {
      callout.remove();
      resolve();
    }, 1300);
  });
}

function showBonusSummary(root: HTMLElement, totalWin: number, retriggers: number): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 wheel-scrim text-amber-100";
    overlay.innerHTML = `
      <h2 class="text-2xl font-bold">Free Spins Complete!</h2>
      <p class="text-lg">You won ${totalWin.toLocaleString()} coins${retriggers > 0 ? ` (with ${retriggers} retrigger${retriggers > 1 ? "s" : ""}!)` : ""}</p>
      <button id="bonus-continue" class="sparkle-btn mt-4">Continue</button>
    `;
    root.appendChild(overlay);
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
