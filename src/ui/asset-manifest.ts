import type { SymbolId } from "../engine/types";

export type SymbolAtlasName = "standard" | "special";

export type SymbolAsset =
  | { kind: "atlas"; atlas: SymbolAtlasName; column: number; row: number }
  | { kind: "image"; source: string; optimized?: string }
  | { kind: "svg"; source: string };

export const SYMBOL_IDS = [
  "tumbler", "butterfly", "mixtape", "crystal",
  "chai", "candle", "cassette", "gnome",
  "mailbox", "vhs", "teapot", "yarn",
  "doorbell", "chai_pump",
  "treat_chicken", "treat_salmon", "treat_bougie",
  "wild_joey", "wild_phoebe", "wild_handbag", "wild_chai", "uniglee",
] as const satisfies readonly SymbolId[];

export const SYMBOL_ATLASES: Record<SymbolAtlasName, {
  columns: number;
  rows: number;
  webp: string;
  png: string;
}> = {
  standard: {
    columns: 4,
    rows: 4,
    webp: "assets/atlases/standard-symbol-atlas.webp",
    png: "assets/atlases/standard-symbol-atlas.png",
  },
  special: {
    columns: 4,
    rows: 2,
    webp: "assets/atlases/special-symbol-atlas.webp",
    png: "assets/atlases/special-symbol-atlas.png",
  },
};

/** Canonical engine-ID to art mapping. Keep this exhaustive when IDs change. */
export const SYMBOL_ASSETS: Record<SymbolId, SymbolAsset> = {
  tumbler: { kind: "atlas", atlas: "standard", column: 0, row: 0 },
  butterfly: { kind: "atlas", atlas: "standard", column: 1, row: 0 },
  mixtape: { kind: "atlas", atlas: "standard", column: 2, row: 0 },
  crystal: { kind: "atlas", atlas: "standard", column: 3, row: 0 },
  chai: { kind: "atlas", atlas: "standard", column: 0, row: 1 },
  candle: { kind: "atlas", atlas: "standard", column: 1, row: 1 },
  cassette: { kind: "atlas", atlas: "standard", column: 2, row: 1 },
  gnome: { kind: "atlas", atlas: "standard", column: 3, row: 1 },
  mailbox: { kind: "atlas", atlas: "standard", column: 0, row: 2 },
  vhs: { kind: "atlas", atlas: "standard", column: 1, row: 2 },
  teapot: { kind: "atlas", atlas: "standard", column: 2, row: 2 },
  yarn: { kind: "atlas", atlas: "standard", column: 3, row: 2 },
  treat_chicken: { kind: "atlas", atlas: "standard", column: 0, row: 3 },
  treat_salmon: { kind: "atlas", atlas: "standard", column: 1, row: 3 },
  treat_bougie: { kind: "atlas", atlas: "standard", column: 2, row: 3 },
  uniglee: { kind: "atlas", atlas: "special", column: 0, row: 0 },
  wild_joey: { kind: "atlas", atlas: "special", column: 1, row: 0 },
  wild_phoebe: { kind: "atlas", atlas: "special", column: 2, row: 0 },
  wild_handbag: {
    kind: "atlas",
    atlas: "special",
    column: 3,
    row: 0,
  },
  wild_chai: { kind: "atlas", atlas: "special", column: 0, row: 1 },
  doorbell: { kind: "svg", source: "assets/symbols/doorbell.svg" },
  chai_pump: { kind: "svg", source: "assets/symbols/chai-pump.svg" },
};
