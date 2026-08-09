/**
 * How It Works — full-screen interactive guide overlay.
 *
 * Rendered as an absolute overlay on top of the splash screen so the
 * splash stays alive underneath. Scene previews are loaded from the
 * mockup-sandbox at /__mockup/scenes/; they silently hide if that
 * server is not reachable (e.g. GitHub Pages visitors).
 */

const SCENE_ROOT = '/__mockup/scenes';

/* ------------------------------------------------------------------ */
/*  Scene iframe helper                                                 */
/* ------------------------------------------------------------------ */

function sceneThumb(file: string, label: string): string {
  return `
    <div class="hiw-scene" data-src="${SCENE_ROOT}/${file}" aria-label="Preview: ${label}">
      <div class="hiw-scene__loading" aria-hidden="true">
        <span class="hiw-scene__dot"></span>
        <span class="hiw-scene__dot"></span>
        <span class="hiw-scene__dot"></span>
      </div>
      <iframe
        class="hiw-scene__frame"
        src="${SCENE_ROOT}/${file}"
        title="${label} scene preview"
        scrolling="no"
        loading="lazy"
        tabindex="-1"
        aria-hidden="true"
      ></iframe>
    </div>`;
}

function noThumb(): string {
  return `<div class="hiw-scene hiw-scene--empty" aria-hidden="true"></div>`;
}

/* ------------------------------------------------------------------ */
/*  Section builders                                                    */
/* ------------------------------------------------------------------ */

function buildLoop(): string {
  return `
  <section class="hiw-section hiw-section--loop" aria-labelledby="hiw-loop-title">
    <h2 class="hiw-section__title" id="hiw-loop-title">The Chase Loop</h2>
    <p class="hiw-section__lead">Three things repeat until the cats go to bed.</p>
    <ol class="hiw-steps" aria-label="Core gameplay steps">
      <li class="hiw-step">
        <div class="hiw-step__icon hiw-step__icon--spin" aria-hidden="true">✦</div>
        <div class="hiw-step__body">
          <strong class="hiw-step__name">Spin</strong>
          <p class="hiw-step__desc">Five reels tumble across four rows — 20 symbols land on 40 winding paylines that never change and are always all active. No per-line bet to manage.</p>
        </div>
      </li>
      <div class="hiw-step__arrow" aria-hidden="true">↓</div>
      <li class="hiw-step">
        <div class="hiw-step__icon hiw-step__icon--cascade" aria-hidden="true">★</div>
        <div class="hiw-step__body">
          <strong class="hiw-step__name">Cascade</strong>
          <p class="hiw-step__desc">Winning symbols vanish. Fresh ones fall from above. Every new win extends the chain. Reach six cascades and you unlock the Sparkle Wheel for free spins.</p>
        </div>
      </li>
      <div class="hiw-step__arrow" aria-hidden="true">↓</div>
      <li class="hiw-step">
        <div class="hiw-step__icon hiw-step__icon--collect" aria-hidden="true">
          <svg viewBox="0 0 24 24" aria-hidden="true" width="28" height="28" fill="currentColor"><path d="M8.2 10.5c-1.7.2-3.3-1.8-2.8-3.4.4-1.4 1.8-1.8 2.8-.7.8.9.8 2.9 0 4.1Zm7.6 0c1.7.2 3.3-1.8 2.8-3.4-.4-1.4-1.8-1.8-2.8-.7-.8.9-.8 2.9 0 4.1ZM5.7 14c-1.3-.9-3.3-.2-3.4 1.4-.1 1.3 1.3 2.2 2.5 1.7 1.1-.4 1.8-2.3.9-3.1Zm12.6 0c1.3-.9 3.3-.2 3.4 1.4.1 1.3-1.3 2.2-2.5 1.7-1.1-.4-1.8-2.3-.9-3.1Zm-6.3-1.8c-2.8 0-5.5 2.4-5.1 5 .3 2.2 3 2.2 5.1 1.2 2.1 1 4.8 1 5.1-1.2.4-2.6-2.3-5-5.1-5Z"/></svg>
        </div>
        <div class="hiw-step__body">
          <strong class="hiw-step__name">Collect</strong>
          <p class="hiw-step__desc">Treats land in three jars — fill one and earn bonus spins. The cats visit. Bonuses trigger. Joey and Phoebe have a whole world of surprises waiting.</p>
        </div>
      </li>
    </ol>
  </section>`;
}

function buildBoard(): string {
  const symbols = [
    { name: 'Mermaid Tumbler', tier: 'High', emoji: '🏆' },
    { name: 'Butterfly',       tier: 'High', emoji: '🦋' },
    { name: 'Mixtape',         tier: 'High', emoji: '📼' },
    { name: 'Crystal',         tier: 'High', emoji: '💎' },
    { name: 'Iced Chai',       tier: 'Mid',  emoji: '🧋' },
    { name: 'Candle',          tier: 'Mid',  emoji: '🕯️' },
    { name: 'Cassette',        tier: 'Mid',  emoji: '📟' },
    { name: 'Gnome',           tier: 'Mid',  emoji: '🧙' },
    { name: 'Mailbox',         tier: 'Low',  emoji: '📬' },
    { name: 'VHS',             tier: 'Low',  emoji: '📹' },
    { name: 'Teapot',          tier: 'Low',  emoji: '🫖' },
    { name: 'Yarn',            tier: 'Low',  emoji: '🧶' },
  ];

  const tierClass: Record<string, string> = { High: 'hiw-sym--high', Mid: 'hiw-sym--mid', Low: 'hiw-sym--low' };

  const symbolGrid = symbols.map(s => `
    <li class="hiw-sym ${tierClass[s.tier]}">
      <span class="hiw-sym__icon" aria-hidden="true">${s.emoji}</span>
      <span class="hiw-sym__name">${s.name}</span>
      <span class="hiw-sym__tier">${s.tier}</span>
    </li>`).join('');

  return `
  <section class="hiw-section" aria-labelledby="hiw-board-title">
    <h2 class="hiw-section__title" id="hiw-board-title">Your Board</h2>
    <div class="hiw-board-stats" role="list">
      <div class="hiw-stat" role="listitem">
        <span class="hiw-stat__num">5</span>
        <span class="hiw-stat__label">Reels</span>
      </div>
      <div class="hiw-stat" role="listitem">
        <span class="hiw-stat__num">4</span>
        <span class="hiw-stat__label">Rows</span>
      </div>
      <div class="hiw-stat" role="listitem">
        <span class="hiw-stat__num">40</span>
        <span class="hiw-stat__label">Paylines</span>
      </div>
      <div class="hiw-stat" role="listitem">
        <span class="hiw-stat__num">3+</span>
        <span class="hiw-stat__label">To win</span>
      </div>
    </div>
    <p class="hiw-section__sub">Three or more matching symbols left to right on any payline. All 40 lines pay simultaneously — a single cell can score on multiple lines at once.</p>
    <h3 class="hiw-subsection__title">Paying symbols</h3>
    <ul class="hiw-sym-grid" aria-label="Symbol tiers">
      ${symbolGrid}
    </ul>
    <p class="hiw-sym-note">
      <span class="hiw-badge hiw-badge--wild">Wilds</span>
      Joey and Phoebe appear on reels 2–5 as wildcards that substitute for any paying symbol.
      A Handbag Wild on reel 5 multiplies its line by 2×, 3×, or 5×.
    </p>
    <p class="hiw-sym-note">
      <span class="hiw-badge hiw-badge--treat">Treats</span>
      Chicken Comets, Salmon Stars, and Bougie Bites land on reels 1, 3, and 5 only. They don't pay lines — they fill your treat jars.
    </p>
    ${sceneThumb('game-base.html', 'Base game board')}
  </section>`;
}

function buildCascade(): string {
  const depths = [
    { depth: '1–5',  label: 'Bonus spins', detail: 'Keep going' },
    { depth: '6',    label: '6 Cascades',  detail: '6–20 spins' },
    { depth: '9',    label: '9 Cascades',  detail: '25 spins' },
    { depth: '12',   label: '12 Cascades', detail: '40 spins' },
    { depth: '15',   label: '15 Cascades', detail: '60 spins' },
  ];

  return `
  <section class="hiw-section" aria-labelledby="hiw-cascade-title">
    <h2 class="hiw-section__title" id="hiw-cascade-title">The Cascade</h2>
    <p class="hiw-section__lead">Every win keeps the board alive.</p>
    <ol class="hiw-cascade-steps" aria-label="Cascade sequence">
      <li class="hiw-cs">
        <span class="hiw-cs__num" aria-hidden="true">1</span>
        <div>Winning symbols are removed from the board.</div>
      </li>
      <li class="hiw-cs">
        <span class="hiw-cs__num" aria-hidden="true">2</span>
        <div>Surviving symbols drop down. Fresh ones fall from above.</div>
      </li>
      <li class="hiw-cs">
        <span class="hiw-cs__num" aria-hidden="true">3</span>
        <div>New lines are evaluated. Another win? Another cascade.</div>
      </li>
      <li class="hiw-cs">
        <span class="hiw-cs__num" aria-hidden="true">4</span>
        <div>Wild-bearing wins sometimes trigger a <strong>Sparkle Sort</strong> (blasts random symbols) or a <strong>Drop-In Saucer</strong> (fills a whole reel with cats). These extend the chain even from a dead board.</div>
      </li>
    </ol>
    <h3 class="hiw-subsection__title">Cascade meter → Sparkle Wheel</h3>
    <p class="hiw-section__sub">Every board-clearing event adds to your cascade meter. Hit six and you earn free spins via the Sparkle Wheel. The deeper the chain, the more spins.</p>
    <div class="hiw-ladder" role="list" aria-label="Free-spin ladder">
      ${depths.map(d => `
      <div class="hiw-rung" role="listitem">
        <span class="hiw-rung__depth">${d.depth}</span>
        <div class="hiw-rung__bar">
          <div class="hiw-rung__fill" style="width:${Math.min(100, (parseInt(d.depth) / 15) * 100)}%"></div>
        </div>
        <span class="hiw-rung__award">${d.detail}</span>
      </div>`).join('')}
    </div>
    <p class="hiw-sym-note">
      <strong>UniGlee spins double the award.</strong> Capturing a UniGlee symbol seeds five specialty wilds, drives the cascade to an average depth of 6.97, and doubles whatever the ladder awards — 73% of the time.
    </p>
  </section>`;
}

interface BonusCard {
  icon: string;
  name: string;
  freq: string;
  freqDetail: string;
  desc: string;
  rtpNote?: string;
  agencyNote?: string;
  scene?: string;
  sceneLabel?: string;
}

function buildBonuses(): string {
  const bonuses: BonusCard[] = [
    {
      icon: '🔔',
      name: 'Doorbell Panic',
      freq: '1 in 504',
      freqDetail: 'per spin',
      desc: 'A doorbell pair on reels 1 and 2 sends the cats scrambling. You get 3–6 turbo free spins with 3–6 cat wilds preloaded onto the board — including reel 1, the only way wilds reach that column.',
      rtpNote: 'Highest value per free spin in the game: 5.6× the total bet per spin played.',
      scene: 'doorbell-panic.html',
      sceneLabel: 'Doorbell Panic overlay',
    },
    {
      icon: '⚡',
      name: 'Bold Chai Pump',
      freq: '1 in 577',
      freqDetail: 'per spin',
      desc: 'A chai pump pair triggers a 30-second rapid-tap minigame. Every 12 pumps completes a chai and earns 3 free spins. A 3-second reset follows each cup.',
      agencyNote: 'Skill bonus: tap faster for more spins. Returns diminish past 6 taps/second — the 3-second reset is the real cap.',
      scene: 'bold-chai-pump.html',
      sceneLabel: 'Bold Chai Pump minigame',
    },
    {
      icon: '✦',
      name: 'Sparkle Wheel',
      freq: '1 in 207',
      freqDetail: 'per spin',
      desc: 'Reaching 6 cascades spins the wheel. It chooses one of three free-spin modes. One click — the outcome is already decided before the wheel animation starts.',
      scene: 'spin-wheel.html',
      sceneLabel: 'Sparkle Wheel pre-spin',
    },
    {
      icon: '×3',
      name: "We're Multiplying",
      freq: '40%',
      freqDetail: 'of wheel spins',
      desc: "Each opening board gets a marked Joey or Phoebe wild with a random multiplier: ×2 (35%), ×3 (30%), ×5 (15%), or ×10 (5%). The wild lands on reel 2, 3, 4, or 5 respectively — rarer placement, bigger reward.",
      rtpNote: 'Highest per-spin value of any bonus mode: 1.97× total bet per spin.',
      scene: 'free-spins-session.html',
      sceneLabel: "We're Multiplying free spins",
    },
    {
      icon: '🌙',
      name: 'Moonlit Keepsake Trail',
      freq: '35%',
      freqDetail: 'of wheel spins',
      desc: '12 cards face up for 2.5 seconds — memorise where the 6 pairs are. Then match them blind. Two mismatches ends the round with zero; a perfect run gives 40 free spins.',
      agencyNote: 'The only bonus in the game with real skill: perfect recall guarantees a win. No memory at all and the bonus usually fails. The gap is the largest skill-driven swing in the game.',
      scene: 'keepsake-memory.html',
      sceneLabel: 'Moonlit Keepsake Trail',
    },
    {
      icon: '🍵',
      name: 'Iced Chai Wild Rain',
      freq: '25%',
      freqDetail: 'of wheel spins',
      desc: 'Every iced chai symbol on the first opening board is converted to a wild chai. The storm fires only on round one — after that, ordinary free spins. The quiet, low-volatility wedge.',
      rtpNote: 'Smallest of the three wheel modes by design — its role is to give the wheel a spread.',
    },
    {
      icon: '🍗',
      name: 'Treat Jar',
      freq: '1 in 25',
      freqDetail: 'per spin (avg)',
      desc: 'Three treat types — Chicken Comets, Salmon Stars, Bougie Bites — each fill a separate jar. Fill a jar and earn 1, 2, or 3 free spins. Only opening-board treats count; cascade refills are ignored.',
      rtpNote: 'Highest hit rate in the game. 43.7× total bet per event — modest but relentless.',
    },
    {
      icon: '🌅',
      name: 'Morning Treat Time',
      freq: '1 in 247',
      freqDetail: 'per spin',
      desc: 'Phoebe\'s warm-up: 5–8 free spins, with 0–4 Phoebe wilds cast onto each opening board. Chicken Comet-flavoured, so every wild is Phoebe.',
      scene: 'treat-time.html',
      sceneLabel: 'Treat Time entry screen',
    },
    {
      icon: '🌃',
      name: 'Nighttime Treat Time',
      freq: '1 in 496',
      freqDetail: 'per spin',
      desc: '8–14 free spins with a mix of Phoebe and Joey wilds. Bougie Bites summon Joey — the only Treat Time mode that gives him a spot.',
    },
    {
      icon: '🦋',
      name: 'UniGlee Marathon',
      freq: '1 in 1,229',
      freqDetail: 'per spin',
      desc: 'The legend. One UniGlee butterfly capturing on reel 3, 4, or 5 triggers a five-act marathon: 40, 60, or 80 spins spread across four distinct chapters, ending with Phoebe\'s Lap Quest.',
      rtpNote: 'Worth 10.2 points of RTP including the doubled Firefly cascade it seeds — the largest single contributor in the game.',
      scene: 'uniglee-trigger.html',
      sceneLabel: 'UniGlee takeover overlay',
    },
    {
      icon: '🧺',
      name: "Joey's Laundry Helper",
      freq: 'Act 1',
      freqDetail: 'of every marathon',
      desc: 'Joey opens the show with sock drops (whole column of wilds on reels 2–4, 25% per round) and paw strikes (one marked multiplier wild, 18% per round). Both can fire the same round.',
      scene: 'joey-laundry.html',
      sceneLabel: "Joey's Laundry Helper",
    },
    {
      icon: '😼',
      name: "Phoebe's Lap Quest",
      freq: 'Act 5',
      freqDetail: 'of every marathon',
      desc: 'Pick a spot — window perch, blanket nest, or moonlit cushion. 1-in-3 chance of a perfect lap (4 sticky wilds) vs cozy lap (2 sticky wilds). Then pet Phoebe to keep the chapter going.',
      agencyNote: 'The chapter runs until Joey shows up (15–90s) or inactivity ends it. Pet every 4 seconds from the moment grace ends. Every extra second is another wild-stacked round.',
      scene: 'phoebe-lap-quest.html',
      sceneLabel: "Phoebe's Lap Quest",
    },
    {
      icon: '😸',
      name: 'Cat Pop-ins',
      freq: '1 in 22',
      freqDetail: 'per spin',
      desc: 'Joey or Phoebe appears after a spin. Fed: consumes a treat from your jar (slows bag completion). Unfed: unimpressed expression, no cost. Your choice, real tradeoff.',
      scene: 'cat-visit-joey.html',
      sceneLabel: 'Joey cat pop-in',
    },
  ];

  const cards = bonuses.map(b => `
    <li class="hiw-card">
      <div class="hiw-card__head">
        <span class="hiw-card__icon" aria-hidden="true">${b.icon}</span>
        <div class="hiw-card__meta">
          <strong class="hiw-card__name">${b.name}</strong>
          <span class="hiw-card__freq">
            <span class="hiw-card__freq-num">${b.freq}</span>
            <span class="hiw-card__freq-label">${b.freqDetail}</span>
          </span>
        </div>
      </div>
      <p class="hiw-card__desc">${b.desc}</p>
      ${b.rtpNote ? `<p class="hiw-card__note hiw-card__note--rtp">📈 ${b.rtpNote}</p>` : ''}
      ${b.agencyNote ? `<p class="hiw-card__note hiw-card__note--skill">🎮 ${b.agencyNote}</p>` : ''}
      ${b.scene ? sceneThumb(b.scene, b.sceneLabel ?? b.name) : noThumb()}
    </li>`).join('');

  return `
  <section class="hiw-section" aria-labelledby="hiw-bonus-title">
    <h2 class="hiw-section__title" id="hiw-bonus-title">Bonus Features</h2>
    <p class="hiw-section__lead">Thirteen distinct mechanics. All free, all stacked on top of each other.</p>
    <ul class="hiw-cards" aria-label="Bonus features">
      ${cards}
    </ul>
  </section>`;
}

function buildCats(): string {
  return `
  <section class="hiw-section hiw-section--cats" aria-labelledby="hiw-cats-title">
    <h2 class="hiw-section__title" id="hiw-cats-title">The Cats</h2>
    <div class="hiw-cat-duo">
      <div class="hiw-cat hiw-cat--joey">
        <div class="hiw-cat__portrait" aria-hidden="true">🐱</div>
        <strong class="hiw-cat__name">Joey</strong>
        <p class="hiw-cat__bio">The saucer-cat wild on reels 2–5. Appears as a whole-column sock drop during his Laundry Helper act. Arrives uninvited to end Phoebe's Lap Quest. Shows up in Nighttime Treat Time when Bougie Bites are on the menu.</p>
      </div>
      <div class="hiw-cat hiw-cat--phoebe">
        <div class="hiw-cat__portrait" aria-hidden="true">🐈</div>
        <strong class="hiw-cat__name">Phoebe</strong>
        <p class="hiw-cat__bio">The other saucer-cat wild. Stars in Morning Treat Time exclusively — and in Lap Quest, where every pet you give her keeps the chapter alive and the wilds sticking. The only bonus whose length is set by your affection.</p>
      </div>
    </div>
    <div class="hiw-cat-scene-row">
      ${sceneThumb('cat-visit-joey.html', 'Joey cat visit')}
      ${sceneThumb('cat-visit-phoebe.html', 'Phoebe cat visit')}
    </div>
  </section>`;
}

function buildEconomy(): string {
  return `
  <section class="hiw-section hiw-section--economy" aria-labelledby="hiw-econ-title">
    <h2 class="hiw-section__title" id="hiw-econ-title">Free Forever</h2>
    <ul class="hiw-econ-list" role="list">
      <li class="hiw-econ-item">
        <span class="hiw-econ-item__icon" aria-hidden="true">🪙</span>
        <div>
          <strong>Glee-coins only.</strong> No real money, no purchase, no wagering, no cash-out. This is a gift. The coins never run out — a bust-proof refill brings your balance back to 1,000 if it drops below 50.
        </div>
      </li>
      <li class="hiw-econ-item">
        <span class="hiw-econ-item__icon" aria-hidden="true">☀️</span>
        <div>
          <strong>AskJamie daily bonus.</strong> Once per day a speech bubble appears on the board. Tap it to collect a free top-up of Glee-coins.
        </div>
      </li>
      <li class="hiw-econ-item">
        <span class="hiw-econ-item__icon" aria-hidden="true">🎂</span>
        <div>
          <strong>Birthday window.</strong> Every July 17–31 the splash screen carries a birthday message and 10,000 bonus Glee-coins waiting in your wallet.
        </div>
      </li>
      <li class="hiw-econ-item">
        <span class="hiw-econ-item__icon" aria-hidden="true">⚙️</span>
        <div>
          <strong>Wager ladder.</strong> Tap the coin icon to cycle your bet: 20 → 40 → 80 → 200 → 400 coins per spin. Every payline is active at every bet size. Higher bets win proportionally more.
        </div>
      </li>
    </ul>
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
  --hiw-purple: #2d1f4c;
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

/* Header */
.hiw-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .75rem 1.25rem;
  background: rgba(7,12,31,.92);
  backdrop-filter: blur(12px);
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

/* Content */
.hiw-content {
  max-width: 680px;
  margin: 0 auto;
  padding: 2rem 1.25rem 5rem;
}

/* Sections */
.hiw-section {
  margin-bottom: 3.5rem;
}
.hiw-section__title {
  font-family: "Baloo Display", "Arial Black", sans-serif;
  font-size: 1.35rem;
  color: var(--hiw-butter);
  margin: 0 0 .25rem;
  letter-spacing: .01em;
}
.hiw-section__lead {
  color: var(--hiw-muted);
  margin: 0 0 1.25rem;
  font-size: .9rem;
}
.hiw-section__sub {
  color: var(--hiw-muted);
  font-size: .875rem;
  margin: .5rem 0 1.25rem;
  line-height: 1.6;
}
.hiw-subsection__title {
  font-family: "Baloo Display", "Arial Black", sans-serif;
  font-size: .95rem;
  color: var(--hiw-mint);
  margin: 1.5rem 0 .6rem;
  letter-spacing: .04em;
  text-transform: uppercase;
}

/* Decorative rule */
.hiw-section + .hiw-section {
  border-top: 1px solid var(--hiw-border);
  padding-top: 3rem;
}

/* Loop steps */
.hiw-steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.hiw-step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  background: var(--hiw-surface);
  border: 1px solid var(--hiw-border);
  border-radius: 12px;
  padding: 1rem 1.1rem;
}
.hiw-step__arrow {
  text-align: center;
  color: var(--hiw-mint);
  font-size: 1.2rem;
  padding: .25rem 0;
  opacity: .6;
}
.hiw-step__icon {
  font-size: 1.6rem;
  flex-shrink: 0;
  width: 2.2rem;
  text-align: center;
  margin-top: .1rem;
  color: var(--hiw-mint);
  display: flex;
  align-items: center;
  justify-content: center;
}
.hiw-step__name {
  display: block;
  font-family: "Baloo Display", "Arial Black", sans-serif;
  font-size: 1.05rem;
  color: var(--hiw-butter);
  margin-bottom: .2rem;
}
.hiw-step__desc {
  margin: 0;
  font-size: .875rem;
  line-height: 1.6;
  color: var(--hiw-text);
}

/* Board stats */
.hiw-board-stats {
  display: flex;
  gap: .75rem;
  margin-bottom: 1rem;
}
.hiw-stat {
  flex: 1;
  background: var(--hiw-surface);
  border: 1px solid var(--hiw-border);
  border-radius: 10px;
  padding: .75rem .5rem;
  text-align: center;
}
.hiw-stat__num {
  display: block;
  font-family: "Baloo Display", "Arial Black", sans-serif;
  font-size: 1.8rem;
  color: var(--hiw-mint);
  line-height: 1;
}
.hiw-stat__label {
  font-size: .72rem;
  color: var(--hiw-muted);
  text-transform: uppercase;
  letter-spacing: .05em;
}

/* Symbol grid */
.hiw-sym-grid {
  list-style: none;
  padding: 0;
  margin: 0 0 .75rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: .4rem;
}
.hiw-sym {
  display: flex;
  align-items: center;
  gap: .4rem;
  background: var(--hiw-surface);
  border: 1px solid var(--hiw-border);
  border-radius: 8px;
  padding: .35rem .5rem;
  font-size: .8rem;
}
.hiw-sym--high { border-color: rgba(245,213,118,.25); }
.hiw-sym--mid  { border-color: rgba(65,184,183,.18); }
.hiw-sym--low  { border-color: rgba(255,255,255,.07); }
.hiw-sym__icon { font-size: 1.1rem; }
.hiw-sym__name { flex: 1; color: var(--hiw-text); font-size: .78rem; }
.hiw-sym__tier { font-size: .65rem; color: var(--hiw-muted); letter-spacing: .04em; }

/* Badges */
.hiw-badge {
  display: inline-block;
  border-radius: 4px;
  font-size: .7rem;
  font-weight: 700;
  padding: .1rem .4rem;
  margin-right: .3rem;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.hiw-badge--wild   { background: rgba(65,184,183,.22); color: var(--hiw-mint); }
.hiw-badge--treat  { background: rgba(232,165,184,.2); color: var(--hiw-pink); }

.hiw-sym-note {
  font-size: .82rem;
  color: var(--hiw-muted);
  margin: .5rem 0;
  line-height: 1.6;
}

/* Cascade steps */
.hiw-cascade-steps {
  list-style: none;
  padding: 0;
  margin: 0 0 1.25rem;
  counter-reset: cs;
  display: flex;
  flex-direction: column;
  gap: .4rem;
}
.hiw-cs {
  display: flex;
  gap: .75rem;
  align-items: flex-start;
  font-size: .875rem;
  line-height: 1.6;
  background: var(--hiw-surface);
  border: 1px solid var(--hiw-border);
  border-radius: 8px;
  padding: .6rem .85rem;
}
.hiw-cs__num {
  font-family: "Baloo Display", "Arial Black", sans-serif;
  color: var(--hiw-mint);
  font-size: 1.05rem;
  flex-shrink: 0;
  width: 1.2rem;
}

/* Ladder */
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
  width: 2.8rem;
  text-align: right;
  color: var(--hiw-muted);
  font-size: .75rem;
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

/* Bonus cards */
.hiw-cards {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: .75rem;
}
.hiw-card {
  background: var(--hiw-surface);
  border: 1px solid var(--hiw-border);
  border-radius: 14px;
  padding: 1rem 1.1rem;
  overflow: hidden;
}
.hiw-card__head {
  display: flex;
  align-items: center;
  gap: .75rem;
  margin-bottom: .6rem;
}
.hiw-card__icon {
  font-size: 1.6rem;
  flex-shrink: 0;
  width: 2.2rem;
  text-align: center;
}
.hiw-card__name {
  display: block;
  font-family: "Baloo Display", "Arial Black", sans-serif;
  font-size: 1rem;
  color: var(--hiw-butter);
}
.hiw-card__freq {
  display: flex;
  gap: .3rem;
  align-items: baseline;
  margin-top: .1rem;
}
.hiw-card__freq-num {
  font-size: .9rem;
  color: var(--hiw-mint);
  font-family: "Baloo Display", "Arial Black", sans-serif;
}
.hiw-card__freq-label {
  font-size: .7rem;
  color: var(--hiw-muted);
}
.hiw-card__desc {
  margin: 0 0 .5rem;
  font-size: .855rem;
  line-height: 1.65;
  color: var(--hiw-text);
}
.hiw-card__note {
  margin: .3rem 0 0;
  font-size: .8rem;
  line-height: 1.5;
  border-radius: 6px;
  padding: .35rem .6rem;
}
.hiw-card__note--rtp   { background: rgba(245,213,118,.08); color: var(--hiw-butter); }
.hiw-card__note--skill { background: rgba(65,184,183,.08);  color: var(--hiw-mint); }

/* Scene thumbs */
.hiw-scene {
  position: relative;
  width: 100%;
  height: 180px;
  margin-top: .85rem;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--hiw-border);
  background: rgba(0,0,0,.35);
}
.hiw-scene--empty { display: none; }
.hiw-scene__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .35rem;
  pointer-events: none;
}
.hiw-scene__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--hiw-mint);
  opacity: .5;
  animation: hiw-dot-pulse 1.2s ease-in-out infinite;
}
.hiw-scene__dot:nth-child(2) { animation-delay: .2s; }
.hiw-scene__dot:nth-child(3) { animation-delay: .4s; }
@keyframes hiw-dot-pulse {
  0%,100% { transform: scale(1); opacity:.4; }
  50%      { transform: scale(1.4); opacity:.9; }
}
.hiw-scene__frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  opacity: 0;
  transition: opacity .3s ease;
  pointer-events: none;
}
.hiw-scene__frame.hiw-scene__frame--loaded {
  opacity: 1;
  pointer-events: auto;
}
.hiw-scene.hiw-scene--failed { display: none; }

/* Cats */
.hiw-cat-duo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .75rem;
  margin-bottom: .75rem;
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
.hiw-cat__portrait { font-size: 2.5rem; margin-bottom: .5rem; }
.hiw-cat__name {
  display: block;
  font-family: "Baloo Display", "Arial Black", sans-serif;
  color: var(--hiw-butter);
  margin-bottom: .4rem;
}
.hiw-cat__bio {
  margin: 0;
  font-size: .78rem;
  line-height: 1.6;
  color: var(--hiw-muted);
  text-align: left;
}
.hiw-cat-scene-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .75rem;
}
.hiw-cat-scene-row .hiw-scene { margin-top: 0; }

/* Economy */
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
  padding: .75rem 1rem;
  font-size: .875rem;
  line-height: 1.6;
}
.hiw-econ-item__icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}
.hiw-econ-item strong { color: var(--hiw-butter); }

/* Win scene at bottom */
.hiw-win-scene {
  margin: 2rem 0 0;
  border-radius: 14px;
  overflow: hidden;
}
.hiw-win-scene .hiw-scene { margin: 0; height: 200px; }

/* Mobile squeeze */
@media (max-width: 420px) {
  .hiw-cat-duo          { grid-template-columns: 1fr; }
  .hiw-cat-scene-row    { grid-template-columns: 1fr; }
  .hiw-board-stats      { gap: .4rem; }
  .hiw-stat__num        { font-size: 1.4rem; }
  .hiw-sym-grid         { grid-template-columns: 1fr 1fr; }
}

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
.hiw-footer__built {
  white-space: nowrap;
}
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
.hiw-footer__right {
  text-align: right;
}
@media (max-width: 480px) {
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
      ${buildLoop()}
      ${buildBoard()}
      ${buildCascade()}
      ${buildBonuses()}
      ${buildCats()}
      ${buildEconomy()}
      <div class="hiw-win-scene">
        ${sceneThumb('win-celebration.html', 'Win celebration overlay')}
      </div>
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

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => overlay.classList.add('hiw-overlay--visible'));
  });

  // Close button
  const closeBtn = overlay.querySelector<HTMLButtonElement>('#hiw-close-btn');
  closeBtn?.addEventListener('click', close);

  // Close on Escape
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKeyDown);

  // Wire iframe load / error
  overlay.querySelectorAll<HTMLIFrameElement>('.hiw-scene__frame').forEach(iframe => {
    iframe.addEventListener('load', () => {
      iframe.classList.add('hiw-scene__frame--loaded');
      const loading = iframe.closest('.hiw-scene')?.querySelector('.hiw-scene__loading');
      if (loading) (loading as HTMLElement).style.display = 'none';
    });
    iframe.addEventListener('error', () => {
      const scene = iframe.closest('.hiw-scene');
      if (scene) scene.classList.add('hiw-scene--failed');
    });
  });

  function close() {
    overlay.classList.remove('hiw-overlay--visible');
    document.removeEventListener('keydown', onKeyDown);
    setTimeout(() => overlay.remove(), 300);
  }
}
