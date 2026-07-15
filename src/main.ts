/**
 * Entry point — splash (audio unlock) -> main board.
 * Spec: docs/DESIGN-SPEC.md §3. Real UI now lives in src/ui/board.ts.
 */
import "./style.css";
import { unlock, setMusicEnabled, setSfxEnabled, setSfxVolume, playChaiChaseStart } from "./audio/synth";
import { setMusicVolume, startBaseMusic } from "./audio/music";
import { loadGameState } from "./state";
import { renderBoard, runLapQuestChapter } from "./ui/board";

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
    setSfxVolume(state.sfxVolume);
    setMusicVolume(state.musicVolume);
    unlock();
    playChaiChaseStart();
    startBaseMusic();
    renderBoard(app, state);
  });
}

// Dev-only QA aids: these hashes skip the splash tap-in gate so screenshots/
// manual QA can reach the board or the Lap Quest presentation without a user
// gesture. Never referenced by game logic; real players never enter them.
if (location.hash === "#board") {
  const state = loadGameState();
  setSfxEnabled(state.soundOn);
  setMusicEnabled(state.soundOn);
  setSfxVolume(state.sfxVolume);
  setMusicVolume(state.musicVolume);
  renderBoard(app, state);
} else if (location.hash === "#lap-quest") {
  const state = loadGameState();
  setSfxEnabled(state.soundOn);
  setMusicEnabled(state.soundOn);
  setSfxVolume(state.sfxVolume);
  setMusicVolume(state.musicVolume);
  renderBoard(app, state);
  requestAnimationFrame(() => { void runLapQuestChapter(app, state, () => 0); });
} else {
  renderSplash();
}
