/**
 * Main-board rendering & animation. Consumes engine `SpinResult`/`CascadeStep`
 * objects and animates them; owns zero game math (per src/ui/README.md contract).
 * Spec: docs/DESIGN-SPEC.md §3 (layout), §11 (animation language).
 *
 * Vertical-slice note: this renders one board + the SPARKLE loop end to end.
 * The wheel, Chai Bonus shelf, milestone scenes, and birthday reveal screens
 * are follow-up work — see docs/REPLIT-HANDOFF.md.
 */
import type { CascadeStep, SpinResult, SymbolId } from "../engine/types";
import { REELS, ROWS } from "../engine/reels";
import { BET_LEVELS, LINES, availableBetLevels, betPerLine, sparksForSpin, xpIntoLevel, applyBustProofRefill } from "../engine/economy";
import { spin } from "../engine/cascade";
import { addTreat, consumeForVisit } from "../engine/features";
import { mulberry32, productionSeed } from "../engine/rng";
import type { GameState } from "../state";
import { resetAll, saveGameState } from "../state";
import {
  isUnlocked,
  playBonusFanfare,
  playCascadeArpeggio,
  playCascadeTick,
  playWinPluck,
  setSfxEnabled,
  unlock,
} from "../audio/synth";

const SYMBOL_GLYPH: Record<SymbolId, string> = {
  tumbler: "🧜",
  butterfly: "🦋",
  mixtape: "📼",
  crystal: "🔮",
  chai: "🥤",
  candle: "🕯",
  cassette: "📻",
  gnome: "🍄",
  mailbox: "📬",
  vhs: "📼",
  teapot: "🫖",
  yarn: "🧶",
  treat_chicken: "🍗",
  treat_salmon: "🐟",
  treat_boogie: "✨",
  wild_joey: "🐈‍⬛",
  wild_phoebe: "🐱",
  uniglee: "🌈",
};

let statusTimeout: number | undefined;

export function renderBoard(root: HTMLElement, state: GameState): void {
  const level = xpIntoLevel(state.xp);
  const bets = availableBetLevels(level.level);

  root.innerHTML = `
    <div class="h-full w-full flex flex-col text-amber-100" style="background: linear-gradient(#1a1f3c, #2d1f4c)">
      <header class="flex items-center justify-between px-4 pt-3 text-sm">
        <span aria-label="Player level">Lvl ${level.level} · ${level.into}/${level.span} Chai Sparks ✨</span>
        <button id="settings-btn" class="min-w-[48px] min-h-[48px] text-xl" aria-label="Settings">⚙️</button>
      </header>

      <div id="cascade-meter" class="mx-4 mt-2 rounded-xl bg-black/20 px-3 py-2 text-center text-sm" aria-live="polite">
        🫙 Cascade meter: <span id="meter-count">0</span>
      </div>

      <main class="flex-1 flex flex-col items-center justify-center gap-1 px-2">
        <div id="reel-grid" class="grid grid-cols-5 gap-1 bg-black/20 rounded-2xl p-2" role="img" aria-label="Reel board">
          ${renderGridHtml(spin({ rng: mulberry32(1), betPerLine: 1, treatJar: state.treatJar, spinsSincePopIn: 0 }).steps[0].grid)}
        </div>
      </main>

      <div class="flex items-center justify-between px-4 text-sm">
        <div id="treat-jar" aria-label="Treat Jar">
          🍗${state.treatJar.chicken} 🐟${state.treatJar.salmon} ✨${state.treatJar.boogie}
        </div>
        <div id="askjamie-perch" aria-label="AskJamie">🧑‍💻</div>
      </div>

      <div id="status-line" class="min-h-[1.5rem] px-4 text-center text-sm text-amber-200/90" aria-live="polite"></div>

      <footer class="flex items-center gap-2 px-4 py-3">
        <span class="text-sm" aria-label="Glee-coin balance">🪙 ${state.balance.toLocaleString()}</span>
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
  `;

  wireControls(root, state, bets);
}

function renderGridHtml(grid: SpinResult["steps"][number]["grid"]): string {
  let html = "";
  for (let reel = 0; reel < REELS; reel++) {
    html += `<div class="flex flex-col gap-1" data-reel="${reel}">`;
    for (let row = 0; row < ROWS; row++) {
      const symbol = grid[reel][row].symbol;
      html += `<div class="cell w-14 h-14 flex items-center justify-center text-2xl rounded-lg bg-white/5" data-row="${row}">${SYMBOL_GLYPH[symbol]}</div>`;
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
  if (didRefill) setStatus(root, "AskJamie found coins under the couch! +500,000 🪙");

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
    setStatus(root, `${result.catVisit.cat === "joey" ? "🐈‍⬛ Joey" : "🐱 Phoebe"}: ${result.catVisit.quip}`);
    if (result.catVisit.fed) playBonusFanfare();
  } else {
    state.spinsSincePopIn += 1;
  }

  if (result.unigleeTriggered) {
    setStatus(root, "🌈 UNIGLEE! Freak'n facts on FACTS.");
    playBonusFanfare();
  } else if (result.freeSpinsAwarded > 0) {
    setStatus(root, `Cascade meter maxed! ${result.freeSpinsAwarded} free spins earned (coming soon — logged for now).`);
    playBonusFanfare();
  } else if (result.totalWin > 0) {
    setStatus(root, `Nice cascade! +${result.totalWin.toLocaleString()} Glee-coins.`);
  }

  saveGameState(state);
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

export { BET_LEVELS, LINES };
