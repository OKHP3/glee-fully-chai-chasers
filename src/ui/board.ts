/**
 * Main-board rendering & animation. Consumes engine `SpinResult`/`CascadeStep`
 * objects and animates them; owns zero game math (per src/ui/README.md contract).
 * Spec: docs/DESIGN-SPEC.md §3 (layout), §7 (free spins/wheel), §11 (animation).
 *
 * Zero emoji on the shipped board — all symbols/cats/wheel are original inline
 * SVG (src/ui/symbols.ts). Night-garden backdrop + drifting saucers/fireflies
 * are CSS-only (src/style.css) to keep this file DOM-orchestration only.
 */
import type { CascadeStep, SpinResult, SymbolId } from "../engine/types";
import { REELS, ROWS } from "../engine/reels";
import { BET_LEVELS, LINES, availableBetLevels, betPerLine, sparksForSpin, xpIntoLevel, applyBustProofRefill } from "../engine/economy";
import { spin } from "../engine/cascade";
import { addTreat, consumeForVisit } from "../engine/features";
import { mulberry32, productionSeed } from "../engine/rng";
import { runFreeSpinSession, spinWheel, wheelWedgeLabel, type FreeSpinRoundResult, type WheelWedge } from "../engine/freespins";
import type { GameState } from "../state";
import { resetAll, saveGameState } from "../state";
import { symbolSvg, catSprite, wheelSvg } from "./symbols";
import {
  isUnlocked,
  playBonusFanfare,
  playCascadeArpeggio,
  playCascadeTick,
  playWinPluck,
  playWheelTick,
  playTwelvePumps,
  setSfxEnabled,
  unlock,
} from "../audio/synth";

let statusTimeout: number | undefined;

export function renderBoard(root: HTMLElement, state: GameState): void {
  const level = xpIntoLevel(state.xp);
  const bets = availableBetLevels(level.level);

  root.innerHTML = `
    <div class="relative h-full w-full flex flex-col text-amber-100 overflow-hidden">
      <div class="night-garden" id="bg-layer">${gardenDecor()}</div>
      <div class="relative z-10 h-full w-full flex flex-col">
        <header class="flex items-center justify-between px-4 pt-3 text-sm">
          <span aria-label="Player level">Lvl ${level.level} · ${level.into}/${level.span} Chai Sparks</span>
          <button id="settings-btn" class="min-w-[48px] min-h-[48px] flex items-center justify-center" aria-label="Settings">
            <svg viewBox="0 0 24 24" class="w-6 h-6" fill="none" stroke="#f5d576" stroke-width="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="3.2"/>
              <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2L10 21h4l.6-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.07-.4.1-.8.1-1.2z"/>
            </svg>
          </button>
        </header>

        <div id="cascade-meter" class="mx-4 mt-2 rounded-xl bg-black/20 px-3 py-2 text-center text-sm" aria-live="polite">
          Cascade meter: <span id="meter-count">0</span>
        </div>

        <main class="flex-1 flex flex-col items-center justify-center gap-1 px-2">
          <div id="reel-grid" class="grid grid-cols-5 gap-1 bg-black/25 rounded-2xl p-2 backdrop-blur-sm" role="img" aria-label="Reel board">
            ${renderGridHtml(spin({ rng: mulberry32(1), betPerLine: 1, treatJar: state.treatJar, spinsSincePopIn: 0 }).steps[0].grid)}
          </div>
        </main>

        <div class="flex items-center justify-between px-4 text-sm">
          <div id="treat-jar" aria-label="Treat Jar" class="flex items-center gap-2">
            ${treatJarHtml(state)}
          </div>
          <div id="askjamie-perch" aria-label="AskJamie" class="text-xs opacity-70">AskJamie</div>
        </div>

        <div id="status-line" class="min-h-[1.5rem] px-4 text-center text-sm text-amber-200/90" aria-live="polite"></div>

        <footer class="flex items-center gap-2 px-4 py-3">
          <span class="text-sm" aria-label="Glee-coin balance">${state.balance.toLocaleString()} coins</span>
          <div class="flex-1"></div>
          <button id="bet-down" class="min-w-[48px] min-h-[48px] rounded-lg bg-white/10" aria-label="Decrease bet">−</button>
          <span class="text-sm w-16 text-center" id="bet-display">${state.bet}</span>
          <button id="bet-up" class="min-w-[48px] min-h-[48px] rounded-lg bg-white/10" aria-label="Increase bet">+</button>
          <button id="sparkle-btn"
            class="ml-2 px-8 min-h-[64px] rounded-2xl bg-orange-600 text-white text-lg font-bold active:scale-95 transition-transform">
            SPARKLE!
          </button>
        </footer>

        <div class="px-4 pb-2 text-center text-xs">
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" id="sound-toggle" ${state.soundOn ? "checked" : ""} class="min-w-[24px] min-h-[24px]" />
            Sound
          </label>
          <button id="reset-btn" class="ml-4 underline">Reset progress</button>
        </div>
      </div>
    </div>
  `;

  wireControls(root, state, bets);
}

function gardenDecor(): string {
  const saucers = [
    { top: "8%", left: "12%", delay: "0s" },
    { top: "14%", left: "70%", delay: "1.4s" },
  ];
  const fireflies = Array.from({ length: 8 }, (_, i) => ({
    top: `${10 + ((i * 37) % 70)}%`,
    left: `${5 + ((i * 53) % 90)}%`,
    delay: `${(i % 5) * 0.7}s`,
  }));
  const saucerHtml = saucers
    .map((s) => `<div class="saucer" style="top:${s.top};left:${s.left};animation-delay:${s.delay}"></div>`)
    .join("");
  const fireflyHtml = fireflies
    .map((f) => `<div class="firefly" style="top:${f.top};left:${f.left};animation-delay:${f.delay}"></div>`)
    .join("");
  return saucerHtml + fireflyHtml;
}

function treatJarHtml(state: GameState): string {
  const jar = state.treatJar;
  return `
    <span title="Chicken Comets" class="inline-flex items-center gap-1"><span class="w-4 h-4 inline-block">${symbolSvg("treat_chicken")}</span>${jar.chicken}</span>
    <span title="Salmon Stars" class="inline-flex items-center gap-1"><span class="w-4 h-4 inline-block">${symbolSvg("treat_salmon")}</span>${jar.salmon}</span>
    <span title="Boogie Bites" class="inline-flex items-center gap-1"><span class="w-4 h-4 inline-block">${symbolSvg("treat_boogie")}</span>${jar.boogie}</span>
  `;
}

function renderGridHtml(grid: SpinResult["steps"][number]["grid"]): string {
  let html = "";
  for (let reel = 0; reel < REELS; reel++) {
    html += `<div class="flex flex-col gap-1 overflow-hidden" data-reel="${reel}">`;
    for (let row = 0; row < ROWS; row++) {
      const symbol = grid[reel][row].symbol;
      html += `<div class="cell flex items-center justify-center rounded-lg bg-white/5 p-1.5" data-row="${row}" data-symbol="${symbol}">${symbolSvg(symbol as SymbolId)}</div>`;
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

function wireControls(root: HTMLElement, state: GameState, bets: number[]): void {
  const sparkleBtn = root.querySelector<HTMLButtonElement>("#sparkle-btn")!;
  const betDisplay = root.querySelector<HTMLSpanElement>("#bet-display")!;
  const betUp = root.querySelector<HTMLButtonElement>("#bet-up")!;
  const betDown = root.querySelector<HTMLButtonElement>("#bet-down")!;
  const soundToggle = root.querySelector<HTMLInputElement>("#sound-toggle")!;
  const resetBtn = root.querySelector<HTMLButtonElement>("#reset-btn")!;

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

  soundToggle.addEventListener("change", () => {
    state.soundOn = soundToggle.checked;
    setSfxEnabled(state.soundOn);
    saveGameState(state);
  });

  resetBtn.addEventListener("click", () => {
    if (confirm("Reset all progress and start fresh?")) {
      resetAll();
      location.reload();
    }
  });

  sparkleBtn.addEventListener("click", () => {
    if (!isUnlocked()) unlock();
    if (sparkleBtn.disabled) return;
    void runSpin(root, state, sparkleBtn);
  });
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

  const result = spin({
    rng: mulberry32(productionSeed()),
    betPerLine: betPerLine(state.bet),
    treatJar: state.treatJar,
    spinsSincePopIn: state.spinsSincePopIn,
  });

  await animateSteps(root, result.steps);

  state.balance += result.totalWin;
  state.xp += sparksForSpin(state.bet);
  state.bestCascade = Math.max(state.bestCascade, result.cascades);

  for (const treat of result.treatsCollected) {
    state.treatJar = addTreat(state.treatJar, treat);
  }

  if (result.catVisit) {
    state.spinsSincePopIn = 0;
    state.treatJar = consumeForVisit(state.treatJar, result.catVisit);
    await showCatPopIn(root, result.catVisit.cat, result.catVisit.quip);
    if (result.catVisit.fed) playBonusFanfare();
  } else {
    state.spinsSincePopIn += 1;
  }

  if (result.unigleeTriggered) {
    setStatus(root, "UNIGLEE! Freak'n facts on FACTS.");
    playBonusFanfare();
  } else if (result.totalWin > 0) {
    setStatus(root, `Nice cascade! +${result.totalWin.toLocaleString()} coins.`);
  }

  saveGameState(state);

  if (result.freeSpinsAwarded > 0) {
    await runWheelAndFreeSpins(root, state, result.freeSpinsAwarded);
    return;
  }

  renderBoard(root, state);
}

/* ── Mechanical reel-spin helpers ────────────────────────────────────────── */

/**
 * Symbols shown while reels are spinning (common, visually distinct pool).
 * Wilds and specials are deliberately excluded so they only appear on the
 * real result, preserving their visual impact as the reel stops.
 */
const SPIN_SYMS: readonly SymbolId[] = [
  "chai", "crystal", "butterfly", "gnome", "tumbler",
  "mailbox", "vhs", "teapot", "yarn", "candle",
] as const;

/**
 * How many consecutive reels from left-0 share the same symbol on ANY row.
 * Used to compute anticipation delay bonuses for later reels.
 */
function getLongestMatchRun(grid: CascadeStep["grid"]): number {
  let max = 1;
  for (let row = 0; row < ROWS; row++) {
    const sym0 = grid[0][row].symbol;
    let run = 1;
    for (let reel = 1; reel < REELS; reel++) {
      if (grid[reel][row].symbol === sym0) { run++; } else { break; }
    }
    if (run > max) max = run;
  }
  return max;
}

/**
 * Step 0 of every spin: all five reels spin simultaneously (blurring symbols
 * flicker past), then stop one-by-one left-to-right with a landing bounce.
 *
 * Anticipation system — if the result has consecutive matches from reel 0,
 * later reels spin proportionally longer to build tension:
 *   ≥2 match → reel 2 takes +400 ms extra
 *   ≥3 match → reel 3 takes +550 ms extra on top of that
 *   ≥4 match → reel 4 takes +850 ms extra on top of that
 *   5-way    → reel 4 gets an additional +650 ms jackpot slow-down
 *
 * Every reel's column also gets a brief golden-glow "suspense" pulse when a
 * match is still live after it stops (so the player notices the streak).
 */
/**
 * Accepts the actual grid DOM element directly so this function works
 * for both the base-game #reel-grid and the free-spin #fs-grid.
 */
async function animateInitialSpin(gridEl: HTMLDivElement, step: CascadeStep): Promise<void> {
  const reelDivs = Array.from(gridEl.querySelectorAll<HTMLDivElement>("[data-reel]"));
  const finalGrid = step.grid;
  const matchRun = getLongestMatchRun(finalGrid);

  // Absolute stop times from spin start (ms). Base spacing = 350 ms per reel.
  const stopTimes = [700, 1050, 1400, 1750, 2100];
  if (matchRun >= 2) { stopTimes[2] += 400; stopTimes[3] += 400; stopTimes[4] += 400; }
  if (matchRun >= 3) { stopTimes[3] += 550; stopTimes[4] += 550; }
  if (matchRun >= 4) { stopTimes[4] += 850; }
  if (matchRun >= 5) { stopTimes[4] += 650; }

  // Start all reels spinning — rapidly cycle symbols + blur
  const intervals = reelDivs.map((reelDiv) => {
    reelDiv.classList.add("reel-spinning");
    return window.setInterval(() => {
      if (!document.contains(reelDiv)) return;
      reelDiv.querySelectorAll<HTMLDivElement>(".cell").forEach((cell) => {
        const sym = SPIN_SYMS[Math.floor(Math.random() * SPIN_SYMS.length)];
        cell.innerHTML = symbolSvg(sym);
      });
    }, 65);
  });

  const spinStart = Date.now();

  for (let i = 0; i < REELS; i++) {
    const waitMs = stopTimes[i] - (Date.now() - spinStart);
    if (waitMs > 0) await sleep(waitMs);

    window.clearInterval(intervals[i]);
    const reelDiv = reelDivs[i];
    if (!document.contains(reelDiv)) continue;

    reelDiv.classList.remove("reel-spinning");

    // Snap to final symbols
    reelDiv.querySelectorAll<HTMLDivElement>(".cell").forEach((cell, row) => {
      const sym = finalGrid[i][row].symbol as SymbolId;
      cell.innerHTML = symbolSvg(sym);
      cell.dataset.symbol = sym;
    });

    // Bounce landing animation
    reelDiv.classList.add("reel-landing");
    window.setTimeout(() => reelDiv.classList.remove("reel-landing"), 380);

    playCascadeTick();

    // Suspense glow when a run is still alive after this reel stops
    if (i > 0 && i < REELS - 1 && i < matchRun - 1) {
      reelDiv.classList.add("reel-suspense");
      window.setTimeout(() => reelDiv.classList.remove("reel-suspense"), 960);
      if (i === 2) playWinPluck();          // 3-in-a-row tension sound
      if (i === 3) playBonusFanfare();      // 4-in-a-row excitement sound
    }
  }

  // Settle time before evaluating wins
  await sleep(320);
}

async function animateSteps(root: HTMLElement, steps: CascadeStep[]): Promise<void> {
  if (steps.length === 0) return;

  const grid = root.querySelector<HTMLDivElement>("#reel-grid")!;
  const meter = root.querySelector<HTMLSpanElement>("#meter-count")!;

  // Step 0: mechanical reel spin
  await animateInitialSpin(grid, steps[0]);
  meter.textContent = String(steps[0].meterAfter);

  if (steps[0].wins.length > 0) {
    playCascadeArpeggio(steps[0].meterAfter);
    for (const win of steps[0].wins) {
      for (const [reel, row] of win.positions) {
        grid.querySelector<HTMLDivElement>(`[data-reel="${reel}"] [data-row="${row}"]`)?.classList.add("win-flash");
      }
    }
    playWinPluck();
  }

  // Steps 1+: cascade refills (symbols drop in from above)
  for (let i = 1; i < steps.length; i++) {
    await sleep(480);
    const step = steps[i];
    grid.innerHTML = renderGridHtml(step.grid);
    grid.querySelectorAll(".cell").forEach((cell) => cell.classList.add("symbol-pop"));
    meter.textContent = String(step.meterAfter);

    if (step.wins.length > 0) {
      playCascadeArpeggio(step.meterAfter);
      for (const win of step.wins) {
        for (const [reel, row] of win.positions) {
          grid.querySelector<HTMLDivElement>(`[data-reel="${reel}"] [data-row="${row}"]`)?.classList.add("win-flash");
        }
      }
      playWinPluck();
    } else {
      playCascadeTick();
    }
  }
}

/** Animated cat pop-in moment — docs §11, "Workstream D". */
function showCatPopIn(root: HTMLElement, cat: "joey" | "phoebe", quip: string): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "cat-popin";
    overlay.innerHTML = `
      <div class="mb-24 flex flex-col items-center gap-2">
        <div class="cat-sprite">${catSprite(cat)}</div>
        <div class="cat-quip max-w-[280px] rounded-2xl bg-white/95 px-4 py-2 text-center text-sm text-[#2d1f4c] shadow-lg">
          ${quip}
        </div>
      </div>
    `;
    root.appendChild(overlay);
    window.setTimeout(() => {
      overlay.remove();
      resolve();
    }, 2200);
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
  renderBoard(root, state);
}

function showWheelScreen(root: HTMLElement, rng: () => number): Promise<WheelWedge> {
  return new Promise((resolve) => {
    const wedge = spinWheel(rng);
    const finalDeg = 1080 + { multiplying: 30, giant_gnome: 150, chai_back: 270 }[wedge];

    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#1a1f3c]/95 text-amber-100";
    overlay.innerHTML = `
      <h2 class="text-xl font-bold text-center px-8">Free Spins! Spin the AskJamie Wheel</h2>
      <div class="relative w-56 h-56">
        <div id="wheel-ring" class="wheel-wedge-ring w-full h-full" style="--wheel-final-deg:${finalDeg}deg">
          ${wheelSvg()}
        </div>
        <div class="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-[14px] border-l-transparent border-r-transparent border-t-amber-200"></div>
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

  const overlay = document.createElement("div");
  // Do NOT put night-garden on this element — that CSS rule sets position:absolute
  // which would override Tailwind's fixed, making the overlay non-fixed and letting
  // the base board bleed through. Use a child div for the background instead.
  overlay.className = "fixed inset-0 z-40 flex flex-col text-amber-100";
  overlay.innerHTML = `
    <div class="night-garden aurora" aria-hidden="true"></div>
    ${gardenDecor()}
    <div class="relative z-10 h-full w-full flex flex-col">
      <header class="px-4 pt-3 text-center text-sm font-semibold text-amber-300">
        ✦ ${wheelWedgeLabel(wedge)} — Free Spins ✦
      </header>
      <div class="mx-4 mt-2 rounded-xl bg-black/30 px-3 py-2 text-center text-sm">
        Spin <span id="fs-index">1</span> of <span id="fs-total">${rounds.length}</span>
        &nbsp;·&nbsp; Round win: <span id="fs-round-win">0</span>
        &nbsp;·&nbsp; Cascade: <span id="fs-meter">0</span>
      </div>
      <main class="flex-1 flex items-center justify-center px-2">
        <div id="fs-grid" class="grid grid-cols-5 gap-1 bg-black/25 rounded-2xl p-2 overflow-hidden backdrop-blur-sm"></div>
      </main>
      <div id="fs-status" class="min-h-[2.5rem] px-4 text-center text-sm text-amber-200" aria-live="polite"></div>
    </div>
  `;
  root.appendChild(overlay);

  const fsGrid = overlay.querySelector<HTMLDivElement>("#fs-grid")!;
  const indexEl = overlay.querySelector<HTMLSpanElement>("#fs-index")!;
  const totalEl = overlay.querySelector<HTMLSpanElement>("#fs-total")!;
  const roundWinEl = overlay.querySelector<HTMLSpanElement>("#fs-round-win")!;
  const meterEl = overlay.querySelector<HTMLSpanElement>("#fs-meter")!;
  const statusEl = overlay.querySelector<HTMLDivElement>("#fs-status")!;

  // Seed the grid with the first round's initial layout so reel divs exist
  // before animateInitialSpin queries them. They'll immediately be blurred by
  // the spinning animation so the player never sees this "preview".
  if (rounds.length > 0) {
    fsGrid.innerHTML = renderGridHtml(rounds[0].steps[0].grid);
  }

  let totalWinSoFar = 0;

  for (let r = 0; r < rounds.length; r++) {
    const round = rounds[r];
    indexEl.textContent = String(r + 1);
    totalEl.textContent = String(rounds.length);
    statusEl.textContent = "";

    // ── Step 0: mechanical reel spin (same system as base game) ──────────
    await animateInitialSpin(fsGrid, round.steps[0]);
    meterEl.textContent = String(round.steps[0].meterAfter);

    if (round.steps[0].wins.length > 0) {
      playCascadeArpeggio(round.steps[0].meterAfter);
      for (const win of round.steps[0].wins) {
        for (const [reel, row] of win.positions) {
          fsGrid.querySelector<HTMLDivElement>(`[data-reel="${reel}"] [data-row="${row}"]`)?.classList.add("win-flash");
        }
      }
      playWinPluck();
    }

    // ── Steps 1+: cascade refills ─────────────────────────────────────────
    for (let s = 1; s < round.steps.length; s++) {
      await sleep(460);
      const step = round.steps[s];
      fsGrid.innerHTML = renderGridHtml(step.grid);
      fsGrid.querySelectorAll(".cell").forEach((cell) => cell.classList.add("symbol-pop"));
      meterEl.textContent = String(step.meterAfter);

      if (step.wins.length > 0) {
        playCascadeArpeggio(step.meterAfter);
        for (const win of step.wins) {
          for (const [reel, row] of win.positions) {
            fsGrid.querySelector<HTMLDivElement>(`[data-reel="${reel}"] [data-row="${row}"]`)?.classList.add("win-flash");
          }
        }
        playWinPluck();
      } else {
        playCascadeTick();
      }
    }

    // ── Round result callouts ─────────────────────────────────────────────
    await sleep(300);
    totalWinSoFar += round.totalWin;
    roundWinEl.textContent = totalWinSoFar.toLocaleString();

    if (round.twelvePumps) {
      statusEl.textContent = "TWELVE PUMPS! 12× wild multiplier!";
      playTwelvePumps();
      await sleep(1000);
    } else if (round.extraWildsAdded > 0) {
      statusEl.textContent = "We Want Our Chai Back — extra wilds!";
      await sleep(600);
    } else if (round.totalWin > 0) {
      statusEl.textContent = `+${round.totalWin.toLocaleString()} coins`;
      await sleep(450);
    }

    if (round.freeSpinsAwarded > 0) {
      statusEl.textContent = `Retrigger! +${round.freeSpinsAwarded} more free spins!`;
      playBonusFanfare();
      await sleep(900);
    }
  }

  overlay.remove();
  bgLayer?.classList.remove("aurora");
  void state; // state saved by caller after totals are tallied
}

function showBonusSummary(root: HTMLElement, totalWin: number, retriggers: number): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#1a1f3c]/95 text-amber-100";
    overlay.innerHTML = `
      <h2 class="text-2xl font-bold">Free Spins Complete!</h2>
      <p class="text-lg">You won ${totalWin.toLocaleString()} coins${retriggers > 0 ? ` (with ${retriggers} retrigger${retriggers > 1 ? "s" : ""}!)` : ""}</p>
      <button id="bonus-continue" class="mt-4 px-8 py-3 rounded-2xl bg-orange-600 text-white text-lg font-bold min-h-[56px]">Continue</button>
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
