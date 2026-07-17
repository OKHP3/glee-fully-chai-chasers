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

/**
 * Jamie's birthday message to Glee. Written by Jamie. Do not edit, translate,
 * summarize, or "improve" this string. It is the whole point.
 */
const BIRTHDAY_MESSAGE =
  "I built you a tiny universe where the coins never run out, the chai is " +
  "always iced, and the cats finally have jobs. Every sparkle in it is " +
  "something you taught me to see. Do you love it? Wait. No. Really love it? " +
  "Happy birthday, my bride. Eternal love, Jamie";

/**
 * True from Glee's birthday (July 17, 2026) through the end of July, once per
 * device. The window (not a single day) means every device she opens in July
 * gets its own birthday moment; the claimed flag keeps it one-time per device.
 * After July 2026 the path goes dormant permanently.
 */
function isBirthdayBonusAvailable(): boolean {
  const now = new Date();
  const start = new Date(2026, 6, 17); // July 17, 2026 00:00 local
  const end = new Date(2026, 7, 1);    // August 1, 2026 00:00 local
  return now >= start && now < end && !load("birthdayBonusClaimed", false);
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
        <p class="chai-bday-body">${BIRTHDAY_MESSAGE}</p>
        <p class="chai-bday-body"><span class="chai-bday-coins">+1&thinsp;000&nbsp;Glee&#8209;coins</span>&nbsp;are waiting in your wallet. Tap in to collect&nbsp;them!</p>
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
