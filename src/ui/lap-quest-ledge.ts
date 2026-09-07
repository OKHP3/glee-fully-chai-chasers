import { playLapQuestJoeyInterrupt, playLapQuestPet, playLapQuestSelfExit, playLapQuestStart } from "../audio/synth";
import { catSprite } from "./symbols";

export type LapQuestLedgePhase = "grace" | "active" | "ending";
export type LapQuestLedgeEndReason = "joey_interrupt" | "inactivity" | "engine_end" | "cancelled";

export interface LapQuestLedgeSnapshot {
  phase: LapQuestLedgePhase;
  elapsedMs: number;
  petCount: number;
  graceRemainingMs: number;
  activeRemainingMs: number;
}

export interface LapQuestLedgeResult extends LapQuestLedgeSnapshot {
  reason: LapQuestLedgeEndReason;
}

export interface LapQuestLedgeOptions {
  /** Grace before petting is required. Defaults to the approved 15 seconds. */
  graceMs?: number;
  /** Inactivity window after grace. Defaults to the approved ~5 seconds. */
  inactivityMs?: number;
  /** Maximum presentation window. Defaults to the approved 90 seconds. */
  maxMs?: number;
  /** Parent-selected Joey arrival time. Keeping this injectable keeps RNG out of UI. */
  interruptAtMs?: number;
  /**
   * Seeded RNG to use when computing Joey's arrival time if `interruptAtMs`
   * is not supplied.  Routing through the injected RNG makes the timing
   * deterministic under test.  Falls back to `Math.random` when absent so
   * existing production call sites are unaffected.
   */
  rng?: () => number;
  reducedMotion?: boolean;
  onPet?: (snapshot: LapQuestLedgeSnapshot) => void;
  onTick?: (snapshot: LapQuestLedgeSnapshot) => void;
  onEnd?: (result: LapQuestLedgeResult) => void;
}

export interface LapQuestLedgeController {
  readonly element: HTMLElement;
  readonly finished: Promise<LapQuestLedgeResult>;
  pet(): void;
  end(reason?: LapQuestLedgeEndReason): void;
  snapshot(): LapQuestLedgeSnapshot;
  destroy(): void;
}

const DEFAULT_GRACE_MS = 15_000;
const DEFAULT_INACTIVITY_MS = 5_000;
const DEFAULT_MAX_MS = 90_000;

/**
 * Canonical Lap Quest phase 2: mounts the timed petting/end-condition layer
 * over the live cabinet after board.ts completes the spot choice and reveal.
 * This is intentionally composed with (not an alternative to) board.ts's
 * choice/reveal/reel presentation. The surface is pointer-transparent except
 * for the pet target so later reel rounds remain visible beneath it.
 */
export function mountLapQuestLedge(root: HTMLElement, options: LapQuestLedgeOptions = {}): LapQuestLedgeController {
  const graceMs = Math.max(0, options.graceMs ?? DEFAULT_GRACE_MS);
  const inactivityMs = Math.max(1_000, options.inactivityMs ?? DEFAULT_INACTIVITY_MS);
  const maxMs = Math.max(graceMs, options.maxMs ?? DEFAULT_MAX_MS);
  const suppliedInterrupt = options.interruptAtMs ?? graceMs + Math.floor((options.rng ?? Math.random)() * (maxMs - graceMs + 1));
  const interruptAtMs = Math.min(maxMs, Math.max(graceMs, suppliedInterrupt));
  const reducedMotion = options.reducedMotion
    ?? (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  const cabinet = root.querySelector<HTMLElement>(".cabinet-frame") ?? root;
  const element = document.createElement("section");
  element.className = "lap-quest-ledge";
  element.setAttribute("role", "region");
  element.setAttribute("aria-label", "Phoebe's Lap Quest ledge");
  element.dataset.phase = "grace";
  element.innerHTML = `
    <div class="lap-quest-ledge-surface" aria-hidden="true">
      <span class="lap-quest-ledge-stitch"></span>
      <span class="lap-quest-ledge-glow"></span>
    </div>
    <div class="lap-quest-phoebe-wrap" data-exit="none">
      <div class="lap-quest-phoebe" role="img" aria-label="Phoebe resting across the cozy lap ledge">
        ${phoebeLedgeSvg()}
      </div>
      <div class="lap-quest-phoebe-speech" aria-hidden="true"><span>I’m getting comfy…</span></div>
      <button type="button" class="lap-quest-pet-target" aria-label="Pet Phoebe to keep her cozy" aria-describedby="lap-quest-help" disabled>
        <span class="lap-quest-paw-mark" aria-hidden="true">✦</span>
      </button>
    </div>
    <div class="lap-quest-joey-entrant" aria-hidden="true">${catSprite("joey", "assist")}</div>
    <div class="lap-quest-ledge-copy">
      <strong>Phoebe's Lap Quest</strong>
      <span id="lap-quest-help">Phoebe is settling in.</span>
    </div>
    <div class="lap-quest-ledge-timer" aria-live="polite" aria-atomic="true">
      <span class="lap-quest-timer-label">Grace lap</span>
      <span class="lap-quest-timer-value">15</span><small>s</small>
    </div>
    <div class="lap-quest-ledge-progress" aria-hidden="true"><span></span></div>
    <div class="lap-quest-ledge-status" aria-live="polite" aria-atomic="true"></div>
  `;
  cabinet.appendChild(element);

  const petTarget = element.querySelector<HTMLButtonElement>(".lap-quest-pet-target")!;
  const help = element.querySelector<HTMLElement>("#lap-quest-help")!;
  const timerLabel = element.querySelector<HTMLElement>(".lap-quest-timer-label")!;
  const timerValue = element.querySelector<HTMLElement>(".lap-quest-timer-value")!;
  const status = element.querySelector<HTMLElement>(".lap-quest-ledge-status")!;
  const speech = element.querySelector<HTMLElement>(".lap-quest-phoebe-speech span")!;
  const progress = element.querySelector<HTMLElement>(".lap-quest-ledge-progress span")!;
  const phoebe = element.querySelector<HTMLElement>(".lap-quest-phoebe-wrap")!;
  const joey = element.querySelector<HTMLElement>(".lap-quest-joey-entrant")!;
  const startedAt = performance.now();
  let phase: LapQuestLedgePhase = "grace";
  let petCount = 0;
  let ended = false;
  let finishTimer: number | undefined;
  let graceTimer: number | undefined;
  let interruptTimer: number | undefined;
  let inactivityTimer: number | undefined;
  let tickTimer: number | undefined;
  let resolveFinished!: (result: LapQuestLedgeResult) => void;

  const finished = new Promise<LapQuestLedgeResult>((resolve) => { resolveFinished = resolve; });

  const snapshot = (): LapQuestLedgeSnapshot => {
    const elapsedMs = Math.max(0, performance.now() - startedAt);
    return {
      phase,
      elapsedMs,
      petCount,
      graceRemainingMs: Math.max(0, graceMs - elapsedMs),
      activeRemainingMs: Math.max(0, interruptAtMs - elapsedMs),
    };
  };

  const clearTimers = (): void => {
    [finishTimer, graceTimer, interruptTimer, inactivityTimer, tickTimer].forEach((timer) => {
      if (timer !== undefined) window.clearTimeout(timer);
    });
  };

  const announce = (message: string, spoken = message): void => {
    help.textContent = message;
    status.textContent = message;
    speech.textContent = spoken;
  };

  const finish = (reason: LapQuestLedgeEndReason): void => {
    if (ended) return;
    ended = true;
    phase = "ending";
    clearTimers();
    const result: LapQuestLedgeResult = { ...snapshot(), phase: "ending", reason };
    element.dataset.phase = "ending";
    petTarget.disabled = true;
    petTarget.tabIndex = -1;
    if (reason === "joey_interrupt") {
      element.dataset.exit = "joey";
      announce("Joey arrived. Phoebe is scampering off the ledge.", "Oh no—Joey!");
      joey.removeAttribute("aria-hidden");
      joey.setAttribute("role", "img");
      joey.setAttribute("aria-label", "Joey arrived to interrupt the lap");
      playLapQuestJoeyInterrupt();
    } else if (reason === "inactivity") {
      element.dataset.exit = "self";
      announce("Phoebe lost interest and curled away.", "I need more attention…");
      playLapQuestSelfExit();
    } else {
      element.dataset.exit = "quiet";
      announce(reason === "cancelled" ? "The lap quest was tucked away." : "The lap quest is complete.");
    }
    options.onEnd?.(result);
    finishTimer = window.setTimeout(() => {
      element.remove();
      resolveFinished(result);
    }, reducedMotion ? 40 : reason === "joey_interrupt" ? 720 : 520);
  };

  const beginActive = (): void => {
    if (ended || phase !== "grace") return;
    phase = "active";
    element.dataset.phase = "active";
    petTarget.disabled = false;
    petTarget.tabIndex = 0;
    timerLabel.textContent = "Pet Phoebe";
    announce("Pet Phoebe to keep her cozy.", "Pet me, please!");
    inactivityTimer = window.setTimeout(() => finish("inactivity"), inactivityMs);
  };

  const pet = (): void => {
    if (ended || phase !== "active") return;
    petCount += 1;
    phoebe.classList.remove("is-petted");
    void phoebe.offsetWidth;
    phoebe.classList.add("is-petted");
    const petLines = ["Yes, right there!", "Keep petting me!", "I could do this all day!"];
    announce(`Soft pets: ${petCount}. Phoebe is staying put.`, petLines[(petCount - 1) % petLines.length]);
    playLapQuestPet();
    options.onPet?.(snapshot());
    if (inactivityTimer !== undefined) window.clearTimeout(inactivityTimer);
    inactivityTimer = window.setTimeout(() => finish("inactivity"), inactivityMs);
  };

  petTarget.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    pet();
  });
  petTarget.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pet();
    }
  });

  const paint = (): void => {
    if (ended) return;
    const current = snapshot();
    const displayMs = phase === "grace" ? current.graceRemainingMs : current.activeRemainingMs;
    timerValue.textContent = String(Math.ceil(displayMs / 1000));
    progress.style.width = `${Math.min(100, (current.elapsedMs / interruptAtMs) * 100)}%`;
    options.onTick?.(current);
    tickTimer = window.setTimeout(paint, reducedMotion ? 500 : 250);
  };

  playLapQuestStart();
  graceTimer = window.setTimeout(beginActive, graceMs);
  interruptTimer = window.setTimeout(() => finish("joey_interrupt"), interruptAtMs);
  tickTimer = window.setTimeout(paint, 0);
  paint();

  return {
    element,
    finished,
    pet,
    end: (reason = "engine_end") => finish(reason),
    snapshot,
    destroy: () => finish("cancelled"),
  };
}

/**
 * Phoebe ledge art — Direction B (Tuxedo Vector), chosen after design-canvas review.
 *
 * Black-and-white tuxedo Phoebe matching the S18 production art baseline
 * (public/assets/joey-phoebe-wilds.png):
 *   · Near-black body (#0d0d0d) with radial sheen gradient
 *   · Prominent white chest bib — classic tuxedo marking
 *   · Bright green eyes (#38c97a) matching the production wild-symbol art
 *   · Dusty-pink inner ears (#c4788a) from the approved palette
 *   · White paws with toe-line detail draping over the ledge front
 *   · Long, gracefully sweeping tail curling right behind the body
 *   · Bold ink outlines — cartoony, not photorealistic (S15)
 *
 * Replaces the off-baseline purple SVG (S18 compliance fix).
 * Only this function changed; board.ts, symbols.ts, and the atlas are untouched.
 */
function phoebeLedgeSvg(): string {
  return `<svg viewBox="0 0 320 126" class="lap-quest-phoebe-art" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="lqPhoebeBody" cx="38%" cy="35%" r="55%"><stop offset="0%" stop-color="#2a2a2a"/><stop offset="100%" stop-color="#0d0d0d"/></radialGradient>
      <radialGradient id="lqPhoebeHead" cx="42%" cy="38%" r="52%"><stop offset="0%" stop-color="#282828"/><stop offset="100%" stop-color="#0d0d0d"/></radialGradient>
    </defs>
    <path d="M242 68 C266 54 288 38 276 18 C264 -1 244 4 248 20 C252 34 268 36 256 52" fill="none" stroke="#0d0d0d" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M242 68 C266 54 288 38 276 18 C264 -1 244 4 248 20 C252 34 268 36 256 52" fill="none" stroke="#242424" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse cx="156" cy="72" rx="106" ry="33" fill="url(#lqPhoebeBody)" stroke="#0a0a0a" stroke-width="2.5"/>
    <path d="M120 50 C136 40 162 40 178 52 C186 62 184 78 170 86 C154 94 130 92 118 82 C106 70 106 58 120 50Z" fill="#f0ede8"/>
    <path d="M120 82 C130 88 154 90 170 84 C160 92 136 94 120 82Z" fill="rgba(200,185,175,0.3)"/>
    <circle cx="66" cy="52" r="36" fill="url(#lqPhoebeHead)" stroke="#0a0a0a" stroke-width="2.5"/>
    <path d="M44 28 L32 3 L64 20" fill="#0d0d0d" stroke="#0a0a0a" stroke-width="2" stroke-linejoin="round"/>
    <path d="M46 26 L38 9 L61 20" fill="#c4788a"/>
    <path d="M82 24 L90 1 L106 20" fill="#0d0d0d" stroke="#0a0a0a" stroke-width="2" stroke-linejoin="round"/>
    <path d="M83 22 L90 8 L103 20" fill="#c4788a"/>
    <ellipse cx="65" cy="64" rx="21" ry="16" fill="#f0ede8"/>
    <ellipse cx="51" cy="46" rx="10" ry="9" fill="#38c97a"/>
    <ellipse cx="77" cy="43" rx="10" ry="9" fill="#38c97a"/>
    <ellipse cx="51" cy="47" rx="5" ry="8" fill="#0a0a0a"/>
    <ellipse cx="77" cy="44" rx="5" ry="8" fill="#0a0a0a"/>
    <circle cx="54" cy="43" r="2.8" fill="white"/>
    <circle cx="80" cy="40" r="2.8" fill="white"/>
    <path d="M60 64 L65 59 L70 64 Q65 69 60 64Z" fill="#d35b2d"/>
    <path d="M61 67 Q65 72 69 67" fill="none" stroke="#6a2020" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="44" y1="63" x2="14" y2="57" stroke="#c0b8a6" stroke-width="1.6" stroke-linecap="round" opacity="0.8"/>
    <line x1="44" y1="67" x2="12" y2="67" stroke="#c0b8a6" stroke-width="1.6" stroke-linecap="round" opacity="0.8"/>
    <line x1="86" y1="63" x2="116" y2="57" stroke="#c0b8a6" stroke-width="1.6" stroke-linecap="round" opacity="0.8"/>
    <line x1="86" y1="67" x2="118" y2="67" stroke="#c0b8a6" stroke-width="1.6" stroke-linecap="round" opacity="0.8"/>
    <path d="M90 90 C80 100 64 112 50 110 C40 108 40 98 50 94 C62 88 78 88 90 90Z" fill="#f0ede8" stroke="#0a0a0a" stroke-width="1.8"/>
    <path d="M48 108 Q54 113 59 109" fill="none" stroke="#b8a898" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M57 110 Q63 114 68 110" fill="none" stroke="#b8a898" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M124 92 C114 102 98 114 84 112 C74 110 74 100 84 96 C96 90 112 90 124 92Z" fill="#f0ede8" stroke="#0a0a0a" stroke-width="1.8"/>
    <path d="M82 110 Q88 115 93 111" fill="none" stroke="#b8a898" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M91 112 Q97 116 102 112" fill="none" stroke="#b8a898" stroke-width="1.3" stroke-linecap="round"/>
  </svg>`;
}
