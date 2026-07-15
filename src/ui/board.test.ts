import { describe, expect, it } from "vitest";
import type { Grid } from "../engine/types";
import { renderGridHtml } from "./board";

describe("free-spin multiplier overlay", () => {
  it("renders the one marked wild with its visible multiplier badge", () => {
    const grid: Grid = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, () => ({ symbol: "tumbler" as const })),
    );
    grid[4][2] = { symbol: "wild_phoebe", multiplier: 10 };

    const html = renderGridHtml(grid);

    expect(html).toContain('class="cell multiplier-wild"');
    expect(html).toContain('class="multiplier-badge" aria-label="10 times wild">×10</span>');
    expect((html.match(/multiplier-badge/g) ?? [])).toHaveLength(1);
  });

  it("renders converted mermaid cups as accessible Wild Chai cells", () => {
    const grid: Grid = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, () => ({ symbol: "tumbler" as const })),
    );
    grid[2][1] = { symbol: "wild_chai" };

    const html = renderGridHtml(grid);

    expect(html).toContain('data-symbol="wild_chai"');
    expect(html).toContain('aria-label="Mermaid cup wild chai"');
    expect(html).toContain("WILD CHAI");
    expect(html).toContain("symbol-sprite--chai-wild");
  });
});
