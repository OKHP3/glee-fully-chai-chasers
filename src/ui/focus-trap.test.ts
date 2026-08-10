// @vitest-environment jsdom
/**
 * Focus-trap utility tests.
 *
 * Verifies the three core focus-lifecycle contracts:
 *  1. Focus enters the overlay on open (moves to first focusable child).
 *  2. Tab / Shift+Tab cycle within the overlay and never escape it.
 *  3. Focus returns to the invoking element when the trap is released.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { trapFocus } from "./focus-trap";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeOverlay(...ids: string[]): HTMLElement {
  const overlay = document.createElement("div");
  for (const id of ids) {
    const btn = document.createElement("button");
    btn.id = id;
    btn.type = "button";
    btn.textContent = id;
    overlay.appendChild(btn);
  }
  document.body.appendChild(overlay);
  return overlay;
}

function tab(target: HTMLElement, shift = false): void {
  target.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Tab", shiftKey: shift, bubbles: true }),
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("trapFocus", () => {
  let overlay: HTMLElement;
  let release: () => void;

  afterEach(() => {
    release?.();
    overlay?.remove();
    document.body.innerHTML = "";
  });

  describe("focus-on-open", () => {
    beforeEach(() => {
      overlay = makeOverlay("close", "link", "last");
      release = trapFocus(overlay);
    });

    it("moves focus to the first focusable child immediately", () => {
      expect(document.activeElement?.id).toBe("close");
    });
  });

  describe("Tab cycling", () => {
    beforeEach(() => {
      overlay = makeOverlay("close", "middle", "last");
      release = trapFocus(overlay);
    });

    it("Tab at the last element wraps focus to the first", () => {
      document.getElementById("last")!.focus();
      tab(document.getElementById("last")!);
      expect(document.activeElement?.id).toBe("close");
    });

    it("Tab at a mid element does not wrap (native Tab takes over)", () => {
      document.getElementById("middle")!.focus();
      // We do NOT prevent default for mid-element Tab; the browser handles it.
      // Just confirm the keydown fires without throwing.
      tab(document.getElementById("middle")!);
      // activeElement stays on middle because jsdom doesn't advance focus natively.
      expect(document.activeElement?.id).toBe("middle");
    });
  });

  describe("Shift+Tab cycling", () => {
    beforeEach(() => {
      overlay = makeOverlay("close", "middle", "last");
      release = trapFocus(overlay);
    });

    it("Shift+Tab at the first element wraps focus to the last", () => {
      document.getElementById("close")!.focus();
      tab(document.getElementById("close")!, true /* shift */);
      expect(document.activeElement?.id).toBe("last");
    });
  });

  describe("focus restoration on release", () => {
    it("returns focus to the element that was active before the overlay opened", () => {
      const opener = document.createElement("button");
      opener.id = "opener";
      document.body.appendChild(opener);
      opener.focus();
      expect(document.activeElement?.id).toBe("opener");

      overlay = makeOverlay("close", "other");
      const rel = trapFocus(overlay);
      expect(document.activeElement?.id).toBe("close");

      rel();
      expect(document.activeElement?.id).toBe("opener");
      release = () => {}; // already released
    });
  });

  describe("non-Tab keys are not intercepted", () => {
    beforeEach(() => {
      overlay = makeOverlay("close", "last");
      release = trapFocus(overlay);
    });

    it("Escape keydown passes through without changing focus", () => {
      document.getElementById("last")!.focus();
      overlay.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
      expect(document.activeElement?.id).toBe("last");
    });
  });
});
