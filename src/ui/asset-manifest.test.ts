import { describe, expect, it } from "vitest";
import { SYMBOL_ASSETS, SYMBOL_ATLASES, SYMBOL_IDS } from "./asset-manifest";
import { symbolSvg } from "./symbols";

describe("canonical symbol asset manifest", () => {
  it("covers every engine symbol exactly once", () => {
    expect(Object.keys(SYMBOL_ASSETS).sort()).toEqual([...SYMBOL_IDS].sort());
  });

  it("uses the correct atlas geometry for every atlas-backed symbol", () => {
    for (const id of SYMBOL_IDS) {
      const asset = SYMBOL_ASSETS[id];
      const html = symbolSvg(id);
      if (asset.kind === "atlas") {
        const atlas = SYMBOL_ATLASES[asset.atlas];
        expect(asset.column).toBeGreaterThanOrEqual(0);
        expect(asset.column).toBeLessThan(atlas.columns);
        expect(asset.row).toBeGreaterThanOrEqual(0);
        expect(asset.row).toBeLessThan(atlas.rows);
        expect(html).toContain(atlas.webp);
        expect(html).toContain(atlas.png);
        expect(html).toContain(`background-size:${atlas.columns * 100}% ${atlas.rows * 100}%`);
      } else if (asset.kind === "svg") {
        expect(html).toContain(asset.source);
      }
    }
  });
});
