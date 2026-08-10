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

  // ── Nested overlay stack ──────────────────────────────────────────────────
  //
  // In the game, Settings and Paytable are both appended to .cc-root as
  // siblings (openSettingsPage → root.querySelector(".cc-root")?.appendChild,
  // openPaytablePage → same).  Each overlay registers its own keydown listener
  // on itself.  Tab events from within the inner overlay bubble through the
  // inner overlay's DOM ancestors — they never reach the outer overlay's
  // element (a sibling), so the traps are naturally isolated.
  //
  // These tests confirm that contract:
  //   1. Tab stays within the inner overlay while it is open.
  //   2. Closing the inner overlay restores focus to the inner opener
  //      (i.e. the settings close button, not the original board button).
  //   3. Closing the outer overlay then restores focus to the original opener.

  describe("nested overlay stack — inner paytable over outer settings", () => {
    let parent: HTMLElement;
    let settings: HTMLElement;
    let paytable: HTMLElement;
    let releaseSettings: () => void;
    let releasePaytable: () => void;

    // Build a minimal settings overlay with three focusable buttons.
    function makeSettings(): HTMLElement {
      const el = document.createElement("section");
      el.className = "settings-page";
      for (const id of ["settings-close", "settings-sound", "settings-motion"]) {
        const btn = document.createElement("button");
        btn.id = id; btn.type = "button"; btn.textContent = id;
        el.appendChild(btn);
      }
      return el;
    }

    // Build a minimal paytable overlay with three focusable buttons.
    function makePaytable(): HTMLElement {
      const el = document.createElement("section");
      el.className = "paytable-page";
      for (const id of ["paytable-close", "paytable-sym-a", "paytable-sym-b"]) {
        const btn = document.createElement("button");
        btn.id = id; btn.type = "button"; btn.textContent = id;
        el.appendChild(btn);
      }
      return el;
    }

    beforeEach(() => {
      // Replicate the .cc-root container that both overlays share in production.
      parent = document.createElement("div");
      parent.className = "cc-root";
      document.body.appendChild(parent);
    });

    afterEach(() => {
      // Release in inner-first order so returnTarget chains resolve correctly.
      releasePaytable?.();
      releaseSettings?.();
      parent.remove();
      document.body.innerHTML = "";
      releaseSettings = () => {};
      releasePaytable = () => {};
    });

    it("Tab wraps within the inner overlay and does not escape to the outer overlay", () => {
      // Set up the original opener (e.g. the settings button on the main board).
      const opener = document.createElement("button");
      opener.id = "original-opener";
      parent.appendChild(opener);
      opener.focus();

      // Open settings — focus moves to settings-close.
      settings = makeSettings();
      parent.appendChild(settings);
      releaseSettings = trapFocus(settings);
      expect(document.activeElement?.id).toBe("settings-close");

      // Open paytable as a sibling — focus moves to paytable-close.
      paytable = makePaytable();
      parent.appendChild(paytable);
      releasePaytable = trapFocus(paytable);
      expect(document.activeElement?.id).toBe("paytable-close");

      // Tab at the last paytable item should wrap to the first paytable item,
      // NOT escape to settings (which is a sibling, not an ancestor).
      document.getElementById("paytable-sym-b")!.focus();
      tab(document.getElementById("paytable-sym-b")!);
      expect(document.activeElement?.id).toBe("paytable-close");
    });

    it("closing the inner overlay returns focus to the settings close button, not the original opener", () => {
      const opener = document.createElement("button");
      opener.id = "original-opener";
      parent.appendChild(opener);
      opener.focus();

      settings = makeSettings();
      parent.appendChild(settings);
      releaseSettings = trapFocus(settings);
      // Active element when paytable opens → settings-close (the returnTarget for paytable)
      expect(document.activeElement?.id).toBe("settings-close");

      paytable = makePaytable();
      parent.appendChild(paytable);
      releasePaytable = trapFocus(paytable);

      // Close the inner overlay — must restore to settings-close, not original-opener.
      releasePaytable();
      releasePaytable = () => {};

      expect(document.activeElement?.id).toBe("settings-close");
      expect(document.activeElement?.id).not.toBe("original-opener");
    });

    it("closing the outer overlay after the inner returns focus to the original opener", () => {
      const opener = document.createElement("button");
      opener.id = "original-opener";
      parent.appendChild(opener);
      opener.focus();

      settings = makeSettings();
      parent.appendChild(settings);
      releaseSettings = trapFocus(settings);

      paytable = makePaytable();
      parent.appendChild(paytable);
      releasePaytable = trapFocus(paytable);

      // Close inner first, then outer.
      releasePaytable();
      releasePaytable = () => {};
      releaseSettings();
      releaseSettings = () => {};

      expect(document.activeElement?.id).toBe("original-opener");
    });
  });
});
