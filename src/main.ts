/**
 * Entry point — splash (audio unlock) -> main board.
 * Spec: docs/DESIGN-SPEC.md §3. Real UI now lives in src/ui/board.ts.
 */
import "./style.css";
import { unlock, setMusicEnabled, setSfxEnabled, setSfxVolume, playChaiChaseStart } from "./audio/synth";
import { setMusicVolume, startBaseMusic } from "./audio/music";
import { loadGameState, load, save } from "./state";
import { renderBoard, runLapQuestChapter } from "./ui/board";

const app = document.querySelector<HTMLDivElement>("#app")!;

/** Returns true if today is Glee's birthday (July 17, 2026) and the one-time bonus has not yet been claimed. */
function isBirthdayBonusAvailable(): boolean {
  const now = new Date();
  return (
    now.getFullYear() === 2026 &&
    now.getMonth() === 6 && // July is month index 6
    now.getDate() === 17 &&
    !load("birthdayBonusClaimed", false)
  );
}

/** Marks the birthday bonus as claimed and adds 1 000 coins to state. */
function claimBirthdayBonus(state: ReturnType<typeof loadGameState>): void {
  save("birthdayBonusClaimed", true);
  state.balance += 1000;
  save("balance", state.balance);
}

function renderSplash(): void {
  const showBirthday = isBirthdayBonusAvailable();

  const birthdayBlock = showBirthday
    ? `<div class="chai-bday-panel" role="status" aria-live="polite">
        <span class="chai-bday-emoji" aria-hidden="true">🎂🦋🎉</span>
        <strong class="chai-bday-headline">Happy Birthday, Glee!</strong>
        <p class="chai-bday-body">Jamie hid&nbsp;<span class="chai-bday-coins">+1&thinsp;000&nbsp;Glee&#8209;coins</span>&nbsp;in your wallet as a birthday surprise — tap in to collect&nbsp;them!</p>
       </div>`
    : "";

  app.innerHTML = `
    <div class="chai-splash">
      <picture>
        <source type="image/webp" srcset="${import.meta.env.BASE_URL}assets/optimized/chai-chase-splash.webp" />
        <img
          class="chai-splash-art"
          src="${import.meta.env.BASE_URL}assets/chai-chase-splash.png"
          alt=""
          aria-hidden="true"
        />
      </picture>
      <div class="chai-splash-copy">
        <h1 class="chai-splash-title">Glee-fully Chai Chasers</h1>
        <p class="chai-splash-subtitle">Joey and Phoebe are ready. The chai chase is on.</p>
        ${birthdayBlock}
        <button id="tap-in"
          class="chai-splash-button${showBirthday ? " chai-splash-button--bday" : ""}">
          ${showBirthday ? "🎂 START THE CHAI CHASE" : "START THE CHAI CHASE"}
        </button>
      </div>
    </div>
  `;

  // iOS requires a user gesture to unlock AudioContext — this button is that gesture.
  document.querySelector("#tap-in")?.addEventListener("click", () => {
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
