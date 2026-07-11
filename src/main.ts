/**
 * Entry point — splash (audio unlock) -> main board.
 * Spec: docs/DESIGN-SPEC.md §3. Real UI now lives in src/ui/board.ts.
 */
import "./style.css";
import { unlock, setSfxEnabled, playToolboxChime } from "./audio/synth";
import { loadGameState } from "./state";
import { renderBoard } from "./ui/board";
import { symbolSvg } from "./ui/symbols";

const app = document.querySelector<HTMLDivElement>("#app")!;

function renderSplash(): void {
  app.innerHTML = `
    <div class="relative h-full w-full overflow-hidden">
      <div class="night-garden absolute inset-0"></div>
      <div class="relative z-10 h-full w-full flex flex-col items-center justify-center gap-6">
        <div class="flex items-center gap-2">
          <div class="w-16 h-16">${symbolSvg("crystal")}</div>
          <div class="w-16 h-16">${symbolSvg("butterfly")}</div>
        </div>
        <h1 class="text-2xl font-bold text-amber-100 text-center px-8">
          Glee-fully Chai Chasers
        </h1>
        <p class="text-amber-200/70 text-center px-10">
          Iced chai, two cats, and zero real money.
        </p>
        <button id="tap-in"
          class="mt-4 px-8 py-4 rounded-2xl bg-orange-600 text-white text-lg font-semibold active:scale-95 transition-transform min-h-[64px]">
          Tap to open the Toolbox
        </button>
      </div>
    </div>
  `;

  // iOS requires a user gesture to unlock AudioContext — this button is that gesture.
  document.querySelector("#tap-in")?.addEventListener("click", () => {
    const state = loadGameState();
    try {
      setSfxEnabled(state.soundOn);
      unlock();
      playToolboxChime();
    } catch {
      /* Audio is best-effort — never let it block the game from opening. */
    }
    renderBoard(app, state);
  });
}

// Dev-only QA aid: `#board` skips the splash tap-in gate so screenshots/manual
// QA can reach the main board without a user gesture. Never referenced by
// game logic; safe to leave in since it changes nothing for real players.
if (location.hash === "#board") {
  const state = loadGameState();
  setSfxEnabled(state.soundOn);
  renderBoard(app, state);
} else {
  renderSplash();
}
