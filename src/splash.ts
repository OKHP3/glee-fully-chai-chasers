/**
 * Splash screen rendering — audio-unlock gate + birthday bonus block.
 *
 * Extracted from main.ts so the DOM structure can be tested in isolation
 * without triggering the top-level side-effects in main.ts.
 *
 * `renderSplash` accepts an explicit `showBirthday` flag so tests can
 * inject `true` or `false` without needing to mock the date or localStorage.
 */
import { load, save, loadGameState } from "./state";
import { renderHowItWorks } from "./ui/how-it-works";

/**
 * Jamie's birthday message to Glee. Written by Jamie. Do not edit, translate,
 * summarize, or "improve" this string. It is the whole point.
 */
export const BIRTHDAY_MESSAGE =
  "I built you a tiny universe where the coins never run out, the chai is " +
  "always iced, and the cats finally have jobs. Every sparkle in it is " +
  "something you taught me to see. Do you love it? Wait. No. Really love it? " +
  "Happy birthday, my bride. Eternal love, Jamie";

/**
 * True during July 17–31 of any year, once per device per year.
 * The window (not a single day) means every device Glee opens in July
 * gets its own birthday moment; the per-year claimed flag keeps it
 * one-time per device per calendar year so it recurs every July.
 */
export function isBirthdayBonusAvailable(): boolean {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 6, 17); // July 17 00:00 local
  const end   = new Date(year, 7, 1);  // August 1 00:00 local
  return now >= start && now < end && !load(`birthdayBonusClaimed_${year}`, false);
}

/** Marks the birthday bonus as claimed and adds 10 000 coins to state. */
export function claimBirthdayBonus(state: ReturnType<typeof loadGameState>): void {
  const year = new Date().getFullYear();
  save(`birthdayBonusClaimed_${year}`, true);
  state.balance += 10000;
  save("balance", state.balance);
}

/**
 * Renders the splash screen into `container`.
 *
 * @param container  The host element (typically `#app`).
 * @param onTapIn    Callback fired when the player taps the primary button
 *                   (after the browser AudioContext has been unlocked).
 * @param showBirthday  Whether to show the birthday bonus block.
 *                      Defaults to `isBirthdayBonusAvailable()`.
 *                      Pass an explicit value in tests to avoid date/storage
 *                      dependencies.
 */
export function renderSplash(
  container: HTMLElement,
  onTapIn: () => void,
  showBirthday: boolean = isBirthdayBonusAvailable(),
): void {
  const birthdayBlock = showBirthday
    ? `<div class="chai-bday-panel" role="status" aria-live="polite">
        <span class="chai-bday-emoji" aria-hidden="true">🎂🦋🎉</span>
        <strong class="chai-bday-headline">Happy Birthday, Glee!</strong>
        <p class="chai-bday-body">${BIRTHDAY_MESSAGE}</p>
        <p class="chai-bday-body"><span class="chai-bday-coins">+10&thinsp;000&nbsp;Glee&#8209;coins</span>&nbsp;are waiting in your wallet. Tap in to collect&nbsp;them!</p>
       </div>`
    : "";

  const PAW_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8.2 10.5c-1.7.2-3.3-1.8-2.8-3.4.4-1.4 1.8-1.8 2.8-.7.8.9.8 2.9 0 4.1Zm7.6 0c1.7.2 3.3-1.8 2.8-3.4-.4-1.4-1.8-1.8-2.8-.7-.8.9-.8 2.9 0 4.1ZM5.7 14c-1.3-.9-3.3-.2-3.4 1.4-.1 1.3 1.3 2.2 2.5 1.7 1.1-.4 1.8-2.3.9-3.1Zm12.6 0c1.3-.9 3.3-.2 3.4 1.4.1 1.3-1.3 2.2-2.5 1.7-1.1-.4-1.8-2.3-.9-3.1Zm-6.3-1.8c-2.8 0-5.5 2.4-5.1 5 .3 2.2 3 2.2 5.1 1.2 2.1 1 4.8 1 5.1-1.2.4-2.6-2.3-5-5.1-5Z"/></svg>`;

  // Use a relative path for the base URL so tests (where import.meta.env.BASE_URL
  // is "/") and production both resolve the asset correctly.
  const base = typeof import.meta !== "undefined" && import.meta.env?.BASE_URL
    ? import.meta.env.BASE_URL
    : "/";

  container.innerHTML = `
    <div class="chai-splash">
      <div class="chai-splash__orb" aria-hidden="true"></div>

      <section class="chai-splash__art" aria-label="Joey and Phoebe under a cosmic chai sky">
        <picture>
          <source type="image/webp" srcset="${base}assets/optimized/chai-chase-splash.webp" />
          <img
            src="${base}assets/chai-chase-splash.png"
            alt="Illustrated cats Joey and Phoebe with cosmic iced chai treasures"
          />
        </picture>
      </section>

      <footer class="chai-splash__credit" role="contentinfo">
        <span>OverKill&nbsp;Hill&nbsp;P&sup3;&trade; &middot; Built&nbsp;with&nbsp;<a
          href="https://replit.com/refer/overkillhillp3/"
          target="_blank"
          rel="noopener noreferrer"
          class="chai-splash__credit-replit"
        >Replit</a></span>
      </footer>

      <section class="chai-splash__content">
        <div class="chai-splash__inner">
          <p class="chai-splash__eyebrow">A cozy cosmic collectible game</p>
          <h1 class="chai-splash-title">Glee-fully<br>Chai Chasers</h1>
          <p class="chai-splash__hook">Chase sparkling treasures with Joey and Phoebe while building the perfect iced chai.</p>
          ${birthdayBlock}
          <div class="chai-splash__actions">
            <button id="tap-in"
              class="chai-splash__primary${showBirthday ? " chai-splash-button--bday" : ""}"
              type="button">
              ${showBirthday ? "🎂 Start the Chai Chase" : "Start the Chai Chase"}
            </button>
          </div>
          <div class="chai-splash__showcase" role="navigation" aria-label="Designathon showcase">
            <a href="/chai-chasers-slides/" target="_blank" rel="noopener noreferrer" class="chai-splash__showcase-link">📊 Pitch deck</a>
            <button class="chai-splash__showcase-link chai-splash__showcase-link--btn" type="button" id="chai-how-it-works-btn">⚙️ How it works</button>
            <a href="/chai-chasers-video/" target="_blank" rel="noopener noreferrer" class="chai-splash__showcase-link">🎬 Build story</a>
          </div>
          <div class="chai-splash__loop" aria-label="The three-step chai chase loop">
            <div class="chai-splash__step">
              <span class="chai-splash__step-icon">✦</span>
              <span class="chai-splash__step-label">Sparkle</span>
            </div>
            <span class="chai-splash__connector" aria-hidden="true"></span>
            <div class="chai-splash__step">
              <span class="chai-splash__step-icon">${PAW_SVG}</span>
              <span class="chai-splash__step-label">Collect treats</span>
            </div>
            <span class="chai-splash__connector" aria-hidden="true"></span>
            <div class="chai-splash__step">
              <span class="chai-splash__step-icon">★</span>
              <span class="chai-splash__step-label">Grow the Cascade</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  // "How it works" opens the full interactive guide overlay.
  container.querySelector("#chai-how-it-works-btn")?.addEventListener("click", () => {
    renderHowItWorks(container);
  });

  // iOS requires a user gesture to unlock AudioContext — this button is that gesture.
  container.querySelector("#tap-in")?.addEventListener("click", onTapIn);
}
