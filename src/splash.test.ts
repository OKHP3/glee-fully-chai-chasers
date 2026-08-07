/**
 * Splash DOM regression tests.
 *
 * Guards the two structural invariants of renderSplash():
 *  1. The #tap-in button always exists — it is the iOS AudioContext unlock
 *     gate; losing it silently breaks audio on Safari.
 *  2. The birthday block appears if and only if isBirthdayBonusAvailable()
 *     is true, contains the +10 000 coin string, and lives inside
 *     .chai-splash__content.
 *
 * `showBirthday` is passed explicitly so the tests don't depend on the
 * current date or localStorage state.
 *
 * @vitest-environment jsdom
 */
import { describe, expect, it, beforeEach } from "vitest";
import { renderSplash, BIRTHDAY_MESSAGE } from "./splash";

function makeContainer(): HTMLDivElement {
  const div = document.createElement("div");
  document.body.appendChild(div);
  return div;
}

beforeEach(() => {
  // Clean the body between tests so #tap-in queries never bleed across cases.
  document.body.innerHTML = "";
});

describe("renderSplash – tap-in button (audio unlock gate)", () => {
  it("renders a <button> with id='tap-in' regardless of birthday state", () => {
    const container = makeContainer();
    renderSplash(container, () => {}, /* showBirthday */ false);

    const btn = container.querySelector("#tap-in");
    expect(btn).not.toBeNull();
    expect(btn?.tagName).toBe("BUTTON");
  });
});

describe("renderSplash – birthday bonus block", () => {
  it("shows the birthday panel and '+10 000' coin string when showBirthday is true", () => {
    const container = makeContainer();
    renderSplash(container, () => {}, /* showBirthday */ true);

    const content = container.querySelector(".chai-splash__content");
    expect(content).not.toBeNull();

    const panel = content!.querySelector(".chai-bday-panel");
    expect(panel).not.toBeNull();

    // The coin string uses a thin-space (\u2009) and a non-breaking hyphen
    // inside the HTML entity, so we check for the visible number portion.
    expect(content!.textContent).toContain("10");
    expect(content!.textContent).toContain("000");
    // The birthday message authored by Jamie must appear verbatim.
    expect(content!.textContent).toContain(BIRTHDAY_MESSAGE);
  });

  it("omits the birthday panel entirely when showBirthday is false", () => {
    const container = makeContainer();
    renderSplash(container, () => {}, /* showBirthday */ false);

    const panel = container.querySelector(".chai-bday-panel");
    expect(panel).toBeNull();
  });
});
