/**
 * Entry point — splash (audio unlock) -> main board.
 * Spec: docs/DESIGN-SPEC.md §3. Real UI now lives in src/ui/board.ts.
 */
import "./style.css";
import { unlock, setSfxEnabled, playToolboxChime } from "./audio/synth";
import { loadGameState } from "./state";
import { renderBoard } from "./ui/board";

const app = document.querySelector<HTMLDivElement>("#app")!;

function renderSplash(): void {
  app.innerHTML = `
    <div class="h-full w-full flex flex-col items-center justify-center gap-6"
         style="background: linear-gradient(#1a1f3c, #2d1f4c)">
      <div class="text-6xl">🎰🦋</div>
      <h1 class="text-2xl font-bold text-amber-100 text-center px-8">
        Glee-fully Chai Chasers
      </h1>
      <p class="text-amber-200/70 text-center px-10">
        Iced chai, two cats, and zero real money.
      </p>
      <button id="tap-in"
        class="mt-4 px-8 py-4 rounded-2xl bg-orange-600 text-white text-lg font-semibold active:scale-95 transition-transform min-h-[64px]">
        Tap to open the Toolbox 🧰
      </button>
    </div>
  `;

  // iOS requires a user gesture to unlock AudioContext — this button is that gesture.
  document.querySelector("#tap-in")?.addEventListener("click", () => {
    const state = loadGameState();
    setSfxEnabled(state.soundOn);
    unlock();
    playToolboxChime();
    renderBoard(app, state);
  });
}

renderSplash();
