/**
 * Entry point — splash (audio unlock) -> main board.
 * Spec: docs/DESIGN-SPEC.md §3. Real UI now lives in src/ui/board.ts.
 */
import "./style.css";
import { unlock, setMusicEnabled, setSfxEnabled, playChaiChaseStart } from "./audio/synth";
import { startBaseMusic } from "./audio/music";
import { loadGameState } from "./state";
import { renderBoard } from "./ui/board";

const app = document.querySelector<HTMLDivElement>("#app")!;

function renderSplash(): void {
  app.innerHTML = `
    <div class="chai-splash">
      <img
        class="chai-splash-art"
        src="${import.meta.env.BASE_URL}assets/chai-chase-splash.png"
        alt=""
        aria-hidden="true"
      />
      <div class="chai-splash-copy">
        <h1 class="chai-splash-title">Glee-fully Chai Chasers</h1>
        <p class="chai-splash-subtitle">Joey and Phoebe are ready. The chai chase is on.</p>
        <button id="tap-in"
          class="chai-splash-button">
          START THE CHAI CHASE
        </button>
      </div>
    </div>
  `;

  // iOS requires a user gesture to unlock AudioContext — this button is that gesture.
  document.querySelector("#tap-in")?.addEventListener("click", () => {
    const state = loadGameState();
    setSfxEnabled(state.soundOn);
    setMusicEnabled(state.soundOn);
    unlock();
    playChaiChaseStart();
    startBaseMusic();
    renderBoard(app, state);
  });
}

// Dev-only QA aid: `#board` skips the splash tap-in gate so screenshots/manual
// QA can reach the main board without a user gesture. Never referenced by
// game logic; safe to leave in since it changes nothing for real players.
if (location.hash === "#board") {
  const state = loadGameState();
  setSfxEnabled(state.soundOn);
  setMusicEnabled(state.soundOn);
  renderBoard(app, state);
} else {
  renderSplash();
}
