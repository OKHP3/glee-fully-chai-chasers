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
    html += `<div class="flex flex-col gap-1" data-reel="${reel}">`;
    for (let row = 0; row < ROWS; row++) {
      const symbol = grid[reel][row].symbol;
      html += `<div class="cell w-14 h-14 flex items-center justify-center rounded-lg bg-white/5 p-1.5" data-row="${row}" data-symbol="${symbol}">${symbolSvg(symbol as SymbolId)}</div>`;
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

function animateSteps(root: HTMLElement, steps: CascadeStep[]): Promise<void> {
  return new Promise((resolve) => {
    const grid = root.querySelector<HTMLDivElement>("#reel-grid")!;
    const meter = root.querySelector<HTMLSpanElement>("#meter-count")!;
    let i = 0;

    const next = () => {
      if (i >= steps.length) {
        resolve();
        return;
      }
      const step = steps[i];
      grid.innerHTML = renderGridHtml(step.grid);
      grid.querySelectorAll(".cell").forEach((cell) => cell.classList.add("symbol-pop"));
      meter.textContent = String(step.meterAfter);

      if (step.wins.length > 0) {
        playCascadeArpeggio(step.meterAfter);
        for (const win of step.wins) {
          for (const [reel, row] of win.positions) {
            const cell = grid.querySelector<HTMLDivElement>(`[data-reel="${reel}"] [data-row="${row}"]`);
            cell?.classList.add("win-flash");
          }
        }
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
  document.body.classList.add("aurora-mode");

  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 z-40 flex flex-col text-amber-100 night-garden aurora";
  overlay.innerHTML = `
    ${gardenDecor()}
    <div class="relative z-10 h-full w-full flex flex-col">
      <header class="px-4 pt-3 text-center text-sm">
        <span>${wheelWedgeLabel(wedge)} — Free Spins</span>
      </header>
      <div class="mx-4 mt-2 rounded-xl bg-black/20 px-3 py-2 text-center text-sm">
        Spin <span id="fs-index">1</span> of <span id="fs-total">${rounds.length}</span> · Round win: <span id="fs-round-win">0</span>
      </div>
      <main class="flex-1 flex items-center justify-center px-2">
        <div id="fs-grid" class="grid grid-cols-5 gap-1 bg-black/25 rounded-2xl p-2"></div>
      </main>
      <div id="fs-status" class="min-h-[2rem] px-4 text-center text-sm"></div>
    </div>
  `;
  root.appendChild(overlay);

  const grid = overlay.querySelector<HTMLDivElement>("#fs-grid")!;
  const indexEl = overlay.querySelector<HTMLSpanElement>("#fs-index")!;
  const totalEl = overlay.querySelector<HTMLSpanElement>("#fs-total")!;
  const roundWinEl = overlay.querySelector<HTMLSpanElement>("#fs-round-win")!;
  const statusEl = overlay.querySelector<HTMLDivElement>("#fs-status")!;

  for (let r = 0; r < rounds.length; r++) {
    const round = rounds[r];
    indexEl.textContent = String(r + 1);
    totalEl.textContent = String(rounds.length);
    roundWinEl.textContent = round.totalWin.toLocaleString();

    for (const step of round.steps) {
      grid.innerHTML = renderGridHtml(step.grid);
      grid.querySelectorAll(".cell").forEach((cell) => cell.classList.add("beam-drop"));
      if (step.wins.length > 0) {
        playCascadeArpeggio(step.meterAfter);
        playWinPluck();
      } else {
        playCascadeTick();
      }
      await sleep(360);
    }

    if (round.twelvePumps) {
      statusEl.textContent = "TWELVE PUMPS! 12x wild multiplier!";
      playTwelvePumps();
      await sleep(900);
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

  overlay.remove();
  bgLayer?.classList.remove("aurora");
  document.body.classList.remove("aurora-mode");
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
