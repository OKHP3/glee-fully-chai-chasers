/**
 * Entry point — splash (audio unlock) -> main board.
 * Spec: docs/DESIGN-SPEC.md §3. Real UI now lives in src/ui/board.ts.
 */
import "./style.css";
import { unlock, setMusicEnabled, setSfxEnabled, setSfxVolume, playChaiChaseStart } from "./audio/synth";
import { setMusicVolume, startBaseMusic } from "./audio/music";
import { loadGameState } from "./state";
import { renderBoard, runLapQuestChapter } from "./ui/board";
import { renderSplash, isBirthdayBonusAvailable, claimBirthdayBonus } from "./splash";

const app = document.querySelector<HTMLDivElement>("#app")!;

function tapIn(): void {
  const state = loadGameState();
  if (isBirthdayBonusAvailable()) {
    claimBirthdayBonus(state);
  }
  setSfxEnabled(state.soundOn);
  setMusicEnabled(state.soundOn);
  setSfxVolume(state.sfxVolume);
  setMusicVolume(state.musicVolume);
  unlock();
  playChaiChaseStart();
  startBaseMusic();
  renderBoard(app, state);
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
  renderSplash(app, tapIn);
}
