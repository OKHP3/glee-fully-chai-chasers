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
});
