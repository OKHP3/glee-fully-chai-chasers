/**
 * How It Works — five-section player guide overlay.
 *
 * Opened from the splash screen ("How it works ↗") and game toolbar (ⓘ button).
 * Five sections, mobile-first (390×844 target). No iframe previews, no RTP
 * claims, no "1 in X" rates, no legacy symbol names.
 * Art via symbolSvg() and catSprite() — zero emoji on the symbol/cat art.
 */
import { FREE_SPIN_LADDER } from '../engine/types';
import { BET_LEVELS, BUST_PROOF_REFILL, LEVEL_6_UNLOCK_PLAYER_LEVEL } from '../engine/economy';
import { TREAT_JAR_FREE_SPINS } from '../engine/features';
import { symbolSvg, catSprite } from './symbols';
import { trapFocus } from './focus-trap';

/* ------------------------------------------------------------------ */
/*  Section 1 — Sparkle                                                */
/* ------------------------------------------------------------------ */

function buildSparkle(): string {
  const sampleSymbols: Array<'tumbler' | 'butterfly' | 'mixtape' | 'crystal' | 'chai' | 'candle' | 'cassette'> =
    ['tumbler', 'butterfly', 'mixtape', 'crystal', 'chai', 'candle', 'cassette'];

  return `
  <section class="hiw-section" aria-labelledby="hiw-sparkle-title">
    <h2 class="hiw-section__title" id="hiw-sparkle-title">Sparkle!</h2>
    <p class="hiw-section__body">
      Tap <strong>SPARKLE!</strong> to play a board. Five reels and four
      rows of symbols land across forty fixed paylines — all active every
      spin. Three or more matching symbols left to right on any payline
      can make a win. No lines to select, no per-line bet.
    </p>
    <div class="hiw-sym-row" aria-label="Sample paying symbols" role="img">
      ${sampleSymbols.map(id => `<span class="hiw-sym-chip">${symbolSvg(id)}</span>`).join('')}
    </div>
  </section>`;
}

/* ------------------------------------------------------------------ */
/*  Section 2 — Cascade                                                */
/* ------------------------------------------------------------------ */

function buildCascade(): string {
  const entries = Object.entries(FREE_SPIN_LADDER)
    .map(([k, v]) => [Number(k), v] as [number, number])
    .sort((a, b) => a[0] - b[0]);
  const minDepth = entries[0][0];
  const maxDepth = entries[entries.length - 1][0];

  const ladderRows = entries.map(([depth, spins]) => {
    const isMax = depth === maxDepth;
    const label = isMax ? `${depth}+` : `${depth}`;
    const pct = Math.round((depth / maxDepth) * 100);
    return `
      <div class="hiw-rung" role="listitem">
        <span class="hiw-rung__depth">${label}</span>
        <div class="hiw-rung__bar">
          <div class="hiw-rung__fill" style="width:${pct}%"></div>
        </div>
        <span class="hiw-rung__award">${spins} spins</span>
      </div>`;
  }).join('');

  return `
  <section class="hiw-section" aria-labelledby="hiw-cascade-title">
    <h2 class="hiw-section__title" id="hiw-cascade-title">Cascade</h2>
    <p class="hiw-section__body">
      Winning symbols clear from the board and new ones fall from above.
      If the fresh symbols also form a win, the chain continues — each
      winning round counts as one cascade. Longer chains grow the Firefly
      Cascade meter. Reach <strong>${minDepth} cascades</strong> and the
      Sparkle Wheel spins to award a free-spin feature.
    </p>
    <div class="hiw-ladder" role="list" aria-label="Free-spin ladder by cascade depth">
      ${ladderRows}
    </div>
    <p class="hiw-section__caption">
      The Sparkle Wheel has three outcomes: extra wilds on the opening
      board, a memory-match round, or an iced-chai storm.
    </p>
  </section>`;
}

/* ------------------------------------------------------------------ */
/*  Section 3 — Joey, Phoebe & Treats                                  */
/* ------------------------------------------------------------------ */

function buildCats(): string {
  return `
  <section class="hiw-section" aria-labelledby="hiw-cats-title">
    <h2 class="hiw-section__title" id="hiw-cats-title">Joey, Phoebe &amp; Treats</h2>
    <p class="hiw-section__body">
      Three treat types land on the board and collect in the Treat Jar.
      Fill a jar to earn free spins — then watch who shows up.
    </p>

    <div class="hiw-treat-row" aria-label="Treat types and free-spin rewards">
      <div class="hiw-treat">
        <div class="hiw-treat__art">${symbolSvg('treat_chicken')}</div>
        <span class="hiw-treat__label">Chicken Comets</span>
        <span class="hiw-treat__reward">+${TREAT_JAR_FREE_SPINS.chicken} free spin</span>
      </div>
      <div class="hiw-treat">
        <div class="hiw-treat__art">${symbolSvg('treat_salmon')}</div>
        <span class="hiw-treat__label">Salmon Stars</span>
        <span class="hiw-treat__reward">+${TREAT_JAR_FREE_SPINS.salmon} free spins</span>
      </div>
      <div class="hiw-treat">
        <div class="hiw-treat__art">${symbolSvg('treat_bougie')}</div>
        <span class="hiw-treat__label">Bougie Bites</span>
        <span class="hiw-treat__reward">+${TREAT_JAR_FREE_SPINS.bougie} free spins</span>
      </div>
    </div>

    <div class="hiw-cat-duo">
      <div class="hiw-cat hiw-cat--phoebe">
        <div class="hiw-cat__portrait">${catSprite('phoebe', 'strut')}</div>
        <strong class="hiw-cat__name">Phoebe</strong>
        <p class="hiw-cat__bio">Drops by unexpectedly after a spin. When she
          visits and the jar has any treat stocked, she eats one and gets
          cozy. No treat? She's unimpressed but still shows up.</p>
      </div>
      <div class="hiw-cat hiw-cat--joey">
        <div class="hiw-cat__portrait">${catSprite('joey', 'strut')}</div>
        <strong class="hiw-cat__name">Joey</strong>
        <p class="hiw-cat__bio">Also drops by unexpectedly. When he visits and
          Bougie Bites are stocked, he eats one and delivers his signature
          assist. No Bougie Bites? He has standards, but he still shows up.</p>
      </div>
    </div>
  </section>`;
}

/* ------------------------------------------------------------------ */
/*  Section 4 — Free Forever                                           */
/* ------------------------------------------------------------------ */

function buildFreeForever(): string {
  // Show the complete bet ladder. The top tier (last entry) has its own unlock
  // condition; source both the value and the threshold from economy constants
  // so the guide can never drift from what the engine enforces.
  const topTier = BET_LEVELS[BET_LEVELS.length - 1];
  const standardTiers = BET_LEVELS.slice(0, BET_LEVELS.length - 1).join(' · ');

  return `
  <section class="hiw-section" aria-labelledby="hiw-econ-title">
    <h2 class="hiw-section__title" id="hiw-econ-title">Free Forever</h2>
    <ul class="hiw-econ-list" role="list">
      <li class="hiw-econ-item">
        <span class="hiw-econ-item__icon" aria-hidden="true">🪙</span>
        <div>
          <strong>Glee-coins only.</strong> No real money, no purchases,
          no wagering, no cash-out, no account. The coins are fictional —
          this is a gift.
        </div>
      </li>
      <li class="hiw-econ-item">
        <span class="hiw-econ-item__icon" aria-hidden="true">✨</span>
        <div>
          <strong>AskJamie makes sure play can continue.</strong> If your
          balance falls too low to cover the current bet, AskJamie finds
          ${BUST_PROOF_REFILL.toLocaleString()} Glee-coins — automatically,
          every time.
        </div>
      </li>
      <li class="hiw-econ-item">
        <span class="hiw-econ-item__icon" aria-hidden="true">⚙️</span>
        <div>
          <strong>Bet size.</strong> Tap the coin icon to pick your bet:
          ${standardTiers} coins per spin — available from the start. The
          ${topTier}-coin level unlocks at player
          level ${LEVEL_6_UNLOCK_PLAYER_LEVEL}. All forty paylines are active
          at every size.
        </div>
      </li>
    </ul>
  </section>`;
}

/* ------------------------------------------------------------------ */
/*  Section 5 — Surprises to Discover                                  */
/* ------------------------------------------------------------------ */

function buildSurprises(): string {
  return `
  <section class="hiw-section" aria-labelledby="hiw-surprises-title">
    <h2 class="hiw-section__title" id="hiw-surprises-title">Surprises to Discover</h2>
    <p class="hiw-section__body">
      The Sparkle Wheel, cat pop-in moments, Bold Chai, and the rare
      UniGlee marathon are all better experienced than described.
      Play long enough and they find you.
    </p>
  </section>`;
}

/* ------------------------------------------------------------------ */
/*  CSS                                                                 */
/* ------------------------------------------------------------------ */

const STYLES = `
<style id="hiw-styles">
:root {
  --hiw-bg: #070c1f;
  --hiw-surface: rgba(255,255,255,.04);
  --hiw-border: rgba(255,255,255,.07);
  --hiw-mint: #41b8b7;
  --hiw-butter: #f5d576;
  --hiw-orange: #f47b3f;
  --hiw-pink: #e8a5b8;
  --hiw-text: rgba(255,238,197,.88);
  --hiw-muted: rgba(255,238,197,.52);
}

#hiw-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: var(--hiw-bg);
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  opacity: 0;
  transform: translateY(24px);
  transition: opacity .28s ease, transform .28s ease;
  font-family: system-ui, -apple-system, sans-serif;
  color: var(--hiw-text);
}
#hiw-overlay.hiw-overlay--visible {
  opacity: 1;
  transform: translateY(0);
}

/* Header — absorbs the iOS/PWA safe-area inset so the notch is covered
   and the close button is always reachable above the status bar. */
.hiw-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding:
    calc(.75rem + env(safe-area-inset-top, 0px))
    max(1.25rem, env(safe-area-inset-right, 0px))
    .75rem
    max(1.25rem, env(safe-area-inset-left, 0px));
  background: rgba(7,12,31,.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--hiw-border);
}
.hiw-header__wordmark {
  font-family: "Baloo Display", "Arial Black", sans-serif;
  font-size: 1rem;
  color: var(--hiw-mint);
  letter-spacing: .02em;
}
.hiw-header__title {
  font-size: .9rem;
  color: var(--hiw-muted);
  font-weight: 500;
}
.hiw-close {
  background: none;
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 999px;
  color: var(--hiw-text);
  font-size: .8rem;
  padding: .3rem .85rem;
  cursor: pointer;
  transition: border-color .15s, color .15s;
  font-family: inherit;
}
.hiw-close:hover, .hiw-close:focus-visible {
  border-color: var(--hiw-mint);
  color: var(--hiw-mint);
  outline: none;
}

/* Content wrapper — extra bottom padding clears the iOS home indicator. */
.hiw-content {
  max-width: 680px;
  margin: 0 auto;
  padding:
    2rem
    max(1.25rem, env(safe-area-inset-right, 0px))
    max(5rem, calc(3rem + env(safe-area-inset-bottom, 0px)))
    max(1.25rem, env(safe-area-inset-left, 0px));
}

/* Sections */
.hiw-section {
  margin-bottom: 3.5rem;
}
.hiw-section__title {
  font-family: "Baloo Display", "Arial Black", sans-serif;
  font-size: 1.35rem;
  color: var(--hiw-butter);
  margin: 0 0 .75rem;
  letter-spacing: .01em;
}
.hiw-section__body {
  margin: 0 0 1.25rem;
  font-size: .9rem;
  line-height: 1.7;
  color: var(--hiw-text);
}
.hiw-section__body strong { color: var(--hiw-butter); }
.hiw-section__caption {
  margin: .75rem 0 0;
  font-size: .825rem;
  line-height: 1.6;
  color: var(--hiw-muted);
}
.hiw-section + .hiw-section {
  border-top: 1px solid var(--hiw-border);
  padding-top: 3rem;
}

/* Symbol row (Section 1) */
.hiw-sym-row {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
  margin: 0 0 .75rem;
}
.hiw-sym-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: var(--hiw-surface);
  border: 1px solid var(--hiw-border);
  border-radius: 10px;
  overflow: hidden;
}
/* Symbol sprite sizing in the guide context */
#hiw-overlay .symbol-sprite,
#hiw-overlay .symbol-sprite--atlas {
  display: inline-block;
  width: 36px;
  height: 36px;
  background-repeat: no-repeat;
}
#hiw-overlay .symbol-asset {
  width: 36px;
  height: 36px;
  object-fit: contain;
}
#hiw-overlay .symbol-picture {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Cascade ladder (Section 2) */
.hiw-ladder {
  display: flex;
  flex-direction: column;
  gap: .4rem;
  margin: .75rem 0 1rem;
}
.hiw-rung {
  display: flex;
  align-items: center;
  gap: .75rem;
  font-size: .8rem;
}
.hiw-rung__depth {
  width: 3rem;
  text-align: right;
  color: var(--hiw-muted);
  font-size: .78rem;
  white-space: nowrap;
}
.hiw-rung__bar {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,.07);
  border-radius: 99px;
  overflow: hidden;
}
.hiw-rung__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--hiw-mint), var(--hiw-butter));
  border-radius: 99px;
}
.hiw-rung__award {
  width: 5rem;
  color: var(--hiw-butter);
  font-family: "Baloo Display", "Arial Black", sans-serif;
  font-size: .78rem;
}

/* Treat row (Section 3) */
.hiw-treat-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .5rem;
  margin: 0 0 1.25rem;
}
.hiw-treat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .35rem;
  background: var(--hiw-surface);
  border: 1px solid var(--hiw-border);
  border-radius: 12px;
  padding: .85rem .5rem;
  text-align: center;
}
.hiw-treat__art {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  overflow: hidden;
}
.hiw-treat__label {
  font-size: .7rem;
  color: var(--hiw-muted);
  line-height: 1.3;
}
.hiw-treat__reward {
  font-size: .75rem;
  color: var(--hiw-mint);
  font-family: "Baloo Display", "Arial Black", sans-serif;
}

/* Cat duo (Section 3) */
.hiw-cat-duo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .75rem;
}
.hiw-cat {
  background: var(--hiw-surface);
  border: 1px solid var(--hiw-border);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
}
.hiw-cat--joey   { border-color: rgba(65,184,183,.25); }
.hiw-cat--phoebe { border-color: rgba(232,165,184,.25); }
.hiw-cat__portrait {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  margin-bottom: .5rem;
  overflow: hidden;
}
/* Cat sprite sizing in the guide context */
#hiw-overlay .cat-pop-asset {
  display: inline-block;
  width: 72px;
  height: 72px;
  background-size: 200% 100%;
  background-repeat: no-repeat;
}
.hiw-cat__name {
  display: block;
  font-family: "Baloo Display", "Arial Black", sans-serif;
  color: var(--hiw-butter);
  margin-bottom: .4rem;
}
.hiw-cat__bio {
  margin: 0;
  font-size: .775rem;
  line-height: 1.6;
  color: var(--hiw-muted);
  text-align: left;
}

/* Economy list (Section 4) */
.hiw-econ-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: .5rem;
}
.hiw-econ-item {
  display: flex;
  gap: .75rem;
  background: var(--hiw-surface);
  border: 1px solid var(--hiw-border);
  border-radius: 10px;
  padding: .85rem 1rem;
  font-size: .875rem;
  line-height: 1.65;
}
.hiw-econ-item__icon {
  font-size: 1.4rem;
  flex-shrink: 0;
  margin-top: .1rem;
}
.hiw-econ-item strong { color: var(--hiw-butter); }

/* Footer */
.hiw-footer {
  border-top: 1px solid var(--hiw-border);
  margin-top: 3rem;
  padding-top: 1.25rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: .5rem;
  font-size: .72rem;
  color: var(--hiw-muted);
}
.hiw-footer__built { white-space: nowrap; }
.hiw-footer__replit {
  color: #FF3C00;
  text-decoration: none;
  font-weight: 700;
}
.hiw-footer__replit:hover,
.hiw-footer__replit:focus-visible {
  text-decoration: underline;
  outline: none;
}
.hiw-footer__copy {
  text-align: center;
  white-space: nowrap;
}
.hiw-footer__right { text-align: right; }

/* Mobile squeeze */
@media (max-width: 420px) {
  .hiw-cat-duo      { grid-template-columns: 1fr; }
  .hiw-treat-row    { grid-template-columns: repeat(3, 1fr); gap: .35rem; }
  .hiw-treat        { padding: .65rem .35rem; }
  .hiw-treat__label { font-size: .65rem; }
  .hiw-footer {
    grid-template-columns: 1fr;
    text-align: center;
    gap: .3rem;
  }
  .hiw-footer__right { text-align: center; }
}
</style>`;

/* ------------------------------------------------------------------ */
/*  Entry point                                                         */
/* ------------------------------------------------------------------ */

export function renderHowItWorks(container: HTMLElement): void {
  if (document.getElementById('hiw-overlay')) return; // already open

  if (!document.getElementById('hiw-styles')) {
    const tpl = document.createElement('div');
    tpl.innerHTML = STYLES;
    document.head.appendChild(tpl.firstElementChild as HTMLStyleElement);
  }

  const overlay = document.createElement('div');
  overlay.id = 'hiw-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'hiw-dialog-title');

  overlay.innerHTML = `
    <header class="hiw-header">
      <div>
        <span class="hiw-header__wordmark">Glee-fully Chai Chasers</span>
        <div class="hiw-header__title" id="hiw-dialog-title">How It Works</div>
      </div>
      <button class="hiw-close" id="hiw-close-btn" type="button" aria-label="Close guide">✕ Close</button>
    </header>
    <div class="hiw-content">
      ${buildSparkle()}
      ${buildCascade()}
      ${buildCats()}
      ${buildFreeForever()}
      ${buildSurprises()}
      <footer class="hiw-footer" role="contentinfo">
        <span class="hiw-footer__built">
          Built with&nbsp;<a
            href="https://replit.com/refer/overkillhillp3/"
            target="_blank"
            rel="noopener noreferrer"
            class="hiw-footer__replit"
          >Replit</a>
        </span>
        <span class="hiw-footer__copy">
          &copy; ${new Date().getFullYear()} OverKill&nbsp;Hill&nbsp;P&sup3;&trade;
        </span>
        <span class="hiw-footer__right">All&nbsp;rights&nbsp;reserved</span>
      </footer>
    </div>`;

  container.appendChild(overlay);

  // Trap focus inside the overlay and move focus to the Close button.
  // releaseFocus() restores focus to whichever control opened the guide.
  const releaseFocus = trapFocus(overlay);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => overlay.classList.add('hiw-overlay--visible'));
  });

  // Close button
  const closeBtn = overlay.querySelector<HTMLButtonElement>('#hiw-close-btn');
  closeBtn?.addEventListener('click', close);

  // Close on Escape — the keydown listener on the overlay itself handles
  // Tab-trapping; Escape is caught at document level so it fires even if
  // focus somehow escapes (defensive).
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKeyDown);

  function close() {
    overlay.classList.remove('hiw-overlay--visible');
    document.removeEventListener('keydown', onKeyDown);
    releaseFocus(); // restore focus to the invoking control immediately
    setTimeout(() => overlay.remove(), 300);
  }
}
