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
 * Mounts Phoebe's ledge directly over the live cabinet. The surface is
 * pointer-transparent except for the small pet target, so reel controls remain
 * available to the parent session beneath it.
 */
export function mountLapQuestLedge(root: HTMLElement, options: LapQuestLedgeOptions = {}): LapQuestLedgeController {
  const graceMs = Math.max(0, options.graceMs ?? DEFAULT_GRACE_MS);
  const inactivityMs = Math.max(1_000, options.inactivityMs ?? DEFAULT_INACTIVITY_MS);
  const maxMs = Math.max(graceMs, options.maxMs ?? DEFAULT_MAX_MS);
  const suppliedInterrupt = options.interruptAtMs ?? graceMs + Math.floor(Math.random() * (maxMs - graceMs + 1));
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

function phoebeLedgeSvg(): string {
  return `<svg viewBox="0 0 320 126" class="lap-quest-phoebe-art" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="lapPhoebeBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#77669d"/><stop offset="1" stop-color="#2d1f4c"/></linearGradient>
      <linearGradient id="lapPhoebeChest" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4e0"/><stop offset="1" stop-color="#e8c6d4"/></linearGradient>
    </defs>
    <path d="M28 91c34-15 83-18 142-10 50 7 91 8 122-4l-7 18H31z" fill="#b9788e" stroke="#20163a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M42 86c38-20 111-22 165-10 26 6 54 5 77-2-15 22-55 27-95 20-56-10-100-4-147 7z" fill="#e8a5b8" opacity=".72"/>
    <ellipse cx="160" cy="63" rx="96" ry="30" fill="url(#lapPhoebeBody)" stroke="#20163a" stroke-width="4"/>
    <path d="M80 73c-20-8-33-21-31-35 2-13 16-20 29-13 10 5 15 17 10 29 16 4 25 10 32 18z" fill="url(#lapPhoebeBody)" stroke="#20163a" stroke-width="4"/>
    <path d="M60 35l4-20 16 14M84 29l15-14 1 22" fill="#4d3f73" stroke="#20163a" stroke-width="4" stroke-linejoin="round"/>
    <ellipse cx="72" cy="37" rx="4" ry="3" fill="#f5d576"/><path d="M65 49c6 4 13 4 19 0" fill="none" stroke="#20163a" stroke-width="3" stroke-linecap="round"/>
    <path d="M76 82c-15 10-28 11-37 3M102 82c-11 10-21 12-30 5" fill="none" stroke="url(#lapPhoebeChest)" stroke-width="9" stroke-linecap="round"/>
    <path d="M242 51c32-26 53-16 44 1-7 12-21 17-38 19" fill="none" stroke="#4d3f73" stroke-width="14" stroke-linecap="round"/>
    <path d="M116 54c28-11 76-10 104 2" fill="none" stroke="#d4c0e8" stroke-width="3" stroke-linecap="round" opacity=".7"/>
  </svg>`;
}
