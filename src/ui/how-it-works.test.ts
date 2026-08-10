// @vitest-environment jsdom
/**
 * Content-accuracy assertions for the How It Works guide.
 *
 * Guards against stale copy (wrong constants, forbidden claims, incorrect
 * cat-visit rule) creeping back in without a test failure.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHowItWorks } from "./how-it-works";
import { FREE_SPIN_LADDER } from "../engine/types";
import { BET_LEVELS, BUST_PROOF_REFILL, LEVEL_6_UNLOCK_PLAYER_LEVEL } from "../engine/economy";
import { TREAT_JAR_FREE_SPINS } from "../engine/features";

describe("How It Works guide — content accuracy", () => {
  let container: HTMLDivElement;
  let html: string;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    renderHowItWorks(container);
    html = container.innerHTML;
  });

  afterEach(() => {
    document.getElementById("hiw-overlay")?.remove();
    document.getElementById("hiw-styles")?.remove();
    container.remove();
  });

  // ── Forbidden strings ────────────────────────────────────────────────────

  it.each([
    "Gnome",
    "Mailbox",
    "Teapot",
    "Yarn",
    "RTP",
    "1 in ",          // "1 in X" probability claims
    "highest value",
    "2× / 3×",        // wrong Handbag Wild multipliers from old guide
    "1,000",          // old wrong bust-proof refill threshold (refill is BUST_PROOF_REFILL=500)
  ])("does not contain forbidden string: %s", (pattern) => {
    expect(html).not.toContain(pattern);
  });

  // ── Engine constant values ───────────────────────────────────────────────

  it("shows the correct free-spin cascade threshold from FREE_SPIN_LADDER", () => {
    const minCascades = Math.min(...Object.keys(FREE_SPIN_LADDER).map(Number));
    expect(html).toContain(`${minCascades} cascades`);
  });

  it("shows the correct bust-proof refill amount from BUST_PROOF_REFILL", () => {
    expect(html).toContain(BUST_PROOF_REFILL.toLocaleString());
  });

  it("shows the top bet tier from BET_LEVELS", () => {
    const topTier = BET_LEVELS[BET_LEVELS.length - 1];
    expect(html).toContain(String(topTier));
  });

  it("shows the top-tier unlock player level from LEVEL_6_UNLOCK_PLAYER_LEVEL", () => {
    expect(html).toContain(String(LEVEL_6_UNLOCK_PLAYER_LEVEL));
  });

  it("shows treat jar free-spin rewards from TREAT_JAR_FREE_SPINS", () => {
    expect(html).toContain(`+${TREAT_JAR_FREE_SPINS.chicken}`);
    expect(html).toContain(`+${TREAT_JAR_FREE_SPINS.salmon}`);
    expect(html).toContain(`+${TREAT_JAR_FREE_SPINS.bougie}`);
  });

  // ── Cat visit rule ───────────────────────────────────────────────────────

  it("does not imply Phoebe only visits when any treat is stocked", () => {
    // Old incorrect copy — cats visit unconditionally; treats only determine
    // whether the visit is 'fed' (treat consumed) or 'unfed' (no cost).
    expect(html).not.toContain("Pops in when any treat is stocked");
  });

  it("does not imply Joey only visits when Bougie Bites are stocked", () => {
    expect(html).not.toContain("Shows up when Bougie Bites are in the jar");
  });

  it("makes clear both cats visit regardless of jar stock", () => {
    // Both bios use 'still shows up' for the unfed-visit case.
    // Split the html so we can confirm both Phoebe AND Joey sections carry it.
    const phoebeSection = html.slice(0, html.indexOf("hiw-cat--joey"));
    const joeySection   = html.slice(html.indexOf("hiw-cat--joey"));
    expect(phoebeSection).toContain("still shows up");
    expect(joeySection).toContain("still shows up");
  });

  // ── Art helpers ──────────────────────────────────────────────────────────

  it("uses symbolSvg() for symbol art (no plain emoji symbols)", () => {
    // symbolSvg() produces elements with class 'symbol-sprite' or 'symbol-asset'
    expect(html).toMatch(/symbol-sprite|symbol-asset/);
  });

  it("uses catSprite() for Joey and Phoebe portraits", () => {
    // catSprite() produces spans with class 'cat-pop-asset'
    expect(html).toContain("cat-pop-asset--phoebe");
    expect(html).toContain("cat-pop-asset--joey");
  });

  // ── Modal shell ──────────────────────────────────────────────────────────

  it("renders a dialog overlay with correct ARIA attributes", () => {
    const overlay = document.getElementById("hiw-overlay");
    expect(overlay).not.toBeNull();
    expect(overlay?.getAttribute("role")).toBe("dialog");
    expect(overlay?.getAttribute("aria-modal")).toBe("true");
  });

  it("renders a close button", () => {
    const btn = document.getElementById("hiw-close-btn");
    expect(btn).not.toBeNull();
    expect(btn?.getAttribute("type")).toBe("button");
  });

  // ── No iframe previews ───────────────────────────────────────────────────

  it("contains no iframe scene preview slots", () => {
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("hiw-scene__frame");
  });
});
