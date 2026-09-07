import { describe, expect, it } from "vitest";
import { ICE_NOTES, nextIceNoteIndex } from "./ice-notes";

describe("Ice Notes", () => {
  it("has a broad, ingredient-led factoid pool", () => {
    expect(ICE_NOTES).toHaveLength(66);
    expect(new Set(ICE_NOTES.map((note) => note.ingredient)).size).toBe(22);
    for (const note of ICE_NOTES) {
      expect(note.flavor).not.toHaveLength(0);
      expect(note.chaiRole).not.toHaveLength(0);
      expect(note.source).not.toHaveLength(0);
      expect(note.harvest).not.toHaveLength(0);
    }
  });

  it("adds the fifteen product-label ingredient categories", () => {
    const ingredients = new Set(ICE_NOTES.map((note) => note.ingredient));
    expect([
      "Water", "Black Pepper", "Cinnamon", "Cloves", "Natural Flavors",
      "Cane Sugar", "Honey", "Ginger Juice", "Vanilla Extract", "Citric Acid",
      "Spice Extracts", "Nonfat Ultra-Filtered Milk", "Lactase Enzyme",
      "Vitamin A Palmitate", "Vitamin D3",
    ].every((ingredient) => ingredients.has(ingredient))).toBe(true);
  });

  it("selects randomly without repeating the currently visible factoid", () => {
    expect(nextIceNoteIndex(10, () => 0)).toBe(0);
    expect(nextIceNoteIndex(10, () => 0.999999)).toBe(65);
    expect(nextIceNoteIndex(0, () => 0)).toBe(1);
    expect(nextIceNoteIndex(65, () => 0.999999)).toBe(64);
  });

  // ── Placeholder name detection ────────────────────────────────────────────
  //
  // A naive length check (ingredient.length >= 3) would pass a placeholder
  // like "Xxx" — three characters that look like a fill-in, not a real
  // culinary name.  The tests below add a pattern-based guard that catches
  // names of that shape even when they clear the minimum length.

  /**
   * Returns true if `name` matches a placeholder pattern:
   *   • all-same-character strings: "aaa", "xxx", "zzz"
   *   • capital + repeated same lowercase letter(s): "Xxx", "Yyy"
   *   • known placeholder words regardless of case: "foo", "bar", "baz", etc.
   *
   * Real culinary names ("Ice", "Cardamom", "Oat Milk") are not flagged.
   */
  function looksLikePlaceholder(name: string): boolean {
    const trimmed = name.trim();
    // All-same-character (any length, any case): aaa, XXX, zzz
    if (/^(.)\1+$/i.test(trimmed)) return true;
    // Capital letter followed by one or more of the same lowercase letter: Xxx, Yyy
    if (/^[A-Z]([a-z])\1+$/.test(trimmed)) return true;
    // Known placeholder dictionary words (case-insensitive)
    if (/^(foo|bar|baz|qux|test|lorem|ipsum|abc|xyz|temp|tmp)$/i.test(trimmed)) return true;
    return false;
  }

  it("placeholder detector catches 'Xxx' which passes the 3-char minimum but is not a real ingredient", () => {
    // "Xxx" is 3 characters — it clears a naive length >= 3 gate.
    expect("Xxx".length).toBeGreaterThanOrEqual(3);
    // The pattern-based guard must still flag it as a placeholder.
    expect(looksLikePlaceholder("Xxx")).toBe(true);

    // Additional placeholder shapes that would also slip through a length-only check:
    expect(looksLikePlaceholder("aaa")).toBe(true);   // all-same lowercase
    expect(looksLikePlaceholder("AAA")).toBe(true);   // all-same uppercase
    expect(looksLikePlaceholder("foo")).toBe(true);   // placeholder dictionary word
    expect(looksLikePlaceholder("Foo")).toBe(true);   // same, mixed-case
    expect(looksLikePlaceholder("Yyy")).toBe(true);   // cap + repeated lowercase

    // Real ingredient names must not be flagged:
    expect(looksLikePlaceholder("Ice")).toBe(false);        // 3-char real name
    expect(looksLikePlaceholder("Cardamom")).toBe(false);
    expect(looksLikePlaceholder("Oat Milk")).toBe(false);
    expect(looksLikePlaceholder("Natural Flavors")).toBe(false);
    expect(looksLikePlaceholder("Vitamin D3")).toBe(false);
  });

  it("no ingredient name in ICE_NOTES is a placeholder-shaped string", () => {
    for (const note of ICE_NOTES) {
      const name = note.ingredient;
      expect(
        looksLikePlaceholder(name),
        `"${name}" matches a placeholder pattern — replace it with the real ingredient name`,
      ).toBe(false);
    }
  });
});
