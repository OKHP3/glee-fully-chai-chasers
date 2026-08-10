/**
 * Symbol Reference Card — design-canvas companion to the atlas panels.
 * Shows every symbol's ID, payout category, atlas group, and sprite position.
 * Read-only design artifact; no runtime game-engine connection.
 *
 * Asset paths use the sandbox's own public/assets/ directory, which mirrors
 * the game's public/assets/ tree. BASE_URL resolves to "/__mockup/" in both
 * dev and build, so all atlas and SVG images are self-contained within this
 * artifact and do not depend on the game's dev server being co-running.
 */

// ── Color constants (match SystemShowcase) ────────────────────────────────────
const C = {
  void:         "#06081a",
  night:        "#070d20",
  surface:      "#12173f",
  panel:        "#181e50",
  border:       "#252d72",
  gold:         "#f2c84b",
  mint:         "#5ed4c4",
  orange:       "#f47b3f",
  cream:        "#fff8ee",
  creamDim:     "rgba(255,248,238,.72)",
  muted:        "#8b89b6",
  teal:         "#41b8b7",
  auroraPurple: "#7c3aed",
  firefly:      "#a8ff78",
  dustyPink:    "#e8a0b4",
  red:          "#f87171",
} as const;

// ── Category badge config ─────────────────────────────────────────────────────
type Category = "High" | "Mid" | "Low" | "Treat" | "Wild" | "Scatter" | "Blocker";

const CATEGORY_STYLE: Record<Category, { bg: string; color: string; border: string }> = {
  High:    { bg: "rgba(242,200,75,.18)",  color: C.gold,         border: "rgba(242,200,75,.55)"  },
  Mid:     { bg: "rgba(65,184,183,.15)",  color: C.teal,         border: "rgba(65,184,183,.45)"  },
  Low:     { bg: "rgba(139,137,182,.15)", color: C.muted,        border: "rgba(139,137,182,.45)" },
  Treat:   { bg: "rgba(244,123,63,.15)",  color: C.orange,       border: "rgba(244,123,63,.45)"  },
  Wild:    { bg: "rgba(94,212,196,.15)",  color: C.mint,         border: "rgba(94,212,196,.45)"  },
  Scatter: { bg: "rgba(124,58,237,.18)",  color: "#b8a8ff",      border: "rgba(124,58,237,.5)"   },
  Blocker: { bg: "rgba(248,113,113,.15)", color: C.red,          border: "rgba(248,113,113,.45)" },
};

// ── Atlas geometry ────────────────────────────────────────────────────────────
// Assets are served from the sandbox's own public/assets/ directory.
// import.meta.env.BASE_URL resolves to "/__mockup/" in dev and build.
const BASE = import.meta.env.BASE_URL;
const STANDARD_WEBP = `${BASE}assets/atlases/standard-symbol-atlas.webp`;
const STANDARD_PNG  = `${BASE}assets/atlases/standard-symbol-atlas.png`;
const SPECIAL_WEBP  = `${BASE}assets/atlases/special-symbol-atlas.webp`;
const SPECIAL_PNG   = `${BASE}assets/atlases/special-symbol-atlas.png`;

type AtlasGroup = "standard" | "special" | "svg";

interface SymbolDef {
  id:         string;
  name:       string;
  category:   Category;
  group:      AtlasGroup;
  col:        number | null;  // null for SVG
  row:        number | null;
  svgSrc?:    string;
}

// ── Symbol table ──────────────────────────────────────────────────────────────
// Atlas positions sourced from src/ui/asset-manifest.ts.
// Category tiers sourced from src/engine/types.ts comments.
const SYMBOLS: SymbolDef[] = [
  // ── Standard atlas ────────────────────────────────────────────────────────
  // High-pay row 0
  { id: "tumbler",       name: "Tumbler",       category: "High",    group: "standard", col: 0, row: 0 },
  { id: "butterfly",     name: "Butterfly",     category: "High",    group: "standard", col: 1, row: 0 },
  { id: "mixtape",       name: "Mixtape",       category: "High",    group: "standard", col: 2, row: 0 },
  { id: "crystal",       name: "Crystal",       category: "High",    group: "standard", col: 3, row: 0 },
  // Mid-pay row 1
  { id: "chai",          name: "Chai",          category: "Mid",     group: "standard", col: 0, row: 1 },
  { id: "candle",        name: "Candle",        category: "Mid",     group: "standard", col: 1, row: 1 },
  { id: "cassette",      name: "Cassette",      category: "Mid",     group: "standard", col: 2, row: 1 },
  { id: "gnome",         name: "Gnome",         category: "Mid",     group: "standard", col: 3, row: 1 },
  // Low-pay row 2
  { id: "mailbox",       name: "Mailbox",       category: "Low",     group: "standard", col: 0, row: 2 },
  { id: "vhs",           name: "VHS",           category: "Low",     group: "standard", col: 1, row: 2 },
  { id: "teapot",        name: "Teapot",        category: "Low",     group: "standard", col: 2, row: 2 },
  { id: "yarn",          name: "Yarn",          category: "Low",     group: "standard", col: 3, row: 2 },
  // Treat row 3 (feature symbols — reels 1/3/5 only)
  { id: "treat_chicken", name: "Chicken Comet", category: "Treat",   group: "standard", col: 0, row: 3 },
  { id: "treat_salmon",  name: "Salmon Star",   category: "Treat",   group: "standard", col: 1, row: 3 },
  { id: "treat_bougie",  name: "Bougie Bite",   category: "Treat",   group: "standard", col: 2, row: 3 },
  // ── Special atlas ─────────────────────────────────────────────────────────
  { id: "uniglee",       name: "UniGlee",       category: "Scatter", group: "special",  col: 0, row: 0 },
  { id: "wild_joey",     name: "Wild Joey",     category: "Wild",    group: "special",  col: 1, row: 0 },
  { id: "wild_phoebe",   name: "Wild Phoebe",   category: "Wild",    group: "special",  col: 2, row: 0 },
  { id: "wild_handbag",  name: "Wild Handbag",  category: "Wild",    group: "special",  col: 3, row: 0 },
  { id: "wild_chai",     name: "Wild Chai",     category: "Wild",    group: "special",  col: 0, row: 1 },
  // ── SVG-only ──────────────────────────────────────────────────────────────
  { id: "doorbell",      name: "Doorbell",      category: "Blocker", group: "svg",      col: null, row: null, svgSrc: `${BASE}assets/symbols/doorbell.svg`  },
  { id: "chai_pump",     name: "Chai Pump",     category: "Blocker", group: "svg",      col: null, row: null, svgSrc: `${BASE}assets/symbols/chai-pump.svg` },
];

// ── Sprite rendering ──────────────────────────────────────────────────────────

/** Returns inline CSS for an atlas sprite cell (mirrors symbolSvg logic). */
function atlasStyle(
  group: "standard" | "special",
  col: number,
  row: number,
  sizePx: number,
): React.CSSProperties {
  // Both atlases have 4 columns; standard has 4 rows, special has 2.
  const cols  = 4;
  const rows  = group === "standard" ? 4 : 2;
  const webp  = group === "standard" ? STANDARD_WEBP : SPECIAL_WEBP;
  const png   = group === "standard" ? STANDARD_PNG  : SPECIAL_PNG;
  const x     = (col / (cols - 1)) * 100;
  const y     = rows > 1 ? (row / (rows - 1)) * 100 : 0;

  // React inline styles only accept one backgroundImage value — use the PNG
  // URL directly. The webp file is in the same directory for reference.
  void webp;
  return {
    width:              sizePx,
    height:             sizePx,
    backgroundImage:    `url('${png}')`,
    backgroundSize:     `${cols * 100}% ${rows * 100}%`,
    backgroundPosition: `${x}% ${y}%`,
    backgroundRepeat:   "no-repeat",
    flexShrink:         0,
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Badge({ category }: { category: Category }) {
  const s = CATEGORY_STYLE[category];
  return (
    <span style={{
      padding:       "2px 7px",
      borderRadius:  6,
      background:    s.bg,
      border:        `1px solid ${s.border}`,
      color:         s.color,
      fontSize:      8.5,
      fontWeight:    800,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      lineHeight:    1,
      whiteSpace:    "nowrap",
    }}>
      {category}
    </span>
  );
}

function CoordTag({ sym }: { sym: SymbolDef }) {
  const label =
    sym.group === "svg"
      ? "SVG"
      : `${sym.group === "standard" ? "std" : "spc"} (${sym.col}, ${sym.row})`;
  return (
    <span style={{
      fontSize:      8,
      fontWeight:    700,
      color:         C.muted,
      letterSpacing: "0.04em",
      fontFamily:    "'Fira Code', 'Courier New', monospace",
    }}>
      {label}
    </span>
  );
}

const SPRITE_SIZE = 72;
const CELL_W      = 112;
const CELL_H      = 148;

function SymbolCell({ sym }: { sym: SymbolDef }) {
  const isWin = sym.category === "High";

  return (
    <div style={{
      width:          CELL_W,
      height:         CELL_H,
      background:     isWin ? "rgba(242,200,75,.07)" : C.panel,
      border:         `1.5px solid ${isWin ? "rgba(242,200,75,.35)" : C.border}`,
      borderRadius:   10,
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "flex-start",
      padding:        "10px 6px 8px",
      gap:            5,
      boxSizing:      "border-box",
      position:       "relative",
    }}>
      {/* Sprite */}
      <div style={{
        width:           SPRITE_SIZE,
        height:          SPRITE_SIZE,
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        background:      "rgba(255,255,255,.03)",
        borderRadius:    8,
        border:          `1px solid rgba(255,255,255,.06)`,
        overflow:        "hidden",
        flexShrink:      0,
      }}>
        {sym.group === "svg" ? (
          <img
            src={sym.svgSrc}
            alt=""
            aria-hidden="true"
            style={{ width: 52, height: 52, objectFit: "contain" }}
          />
        ) : (
          <div style={atlasStyle(sym.group, sym.col!, sym.row!, SPRITE_SIZE)} />
        )}
      </div>

      {/* Symbol name */}
      <div style={{
        fontSize:      9,
        fontWeight:    700,
        color:         C.cream,
        textAlign:     "center",
        lineHeight:    1.3,
        letterSpacing: "0.02em",
      }}>
        {sym.name}
      </div>

      {/* Category badge */}
      <Badge category={sym.category} />

      {/* Atlas coordinate */}
      <CoordTag sym={sym} />

      {/* ID label at bottom */}
      <div style={{
        position:      "absolute",
        bottom:        5,
        left:          5,
        right:         5,
        textAlign:     "center",
        fontSize:      7.5,
        color:         "rgba(139,137,182,.6)",
        fontFamily:    "'Fira Code', 'Courier New', monospace",
        overflow:      "hidden",
        textOverflow:  "ellipsis",
        whiteSpace:    "nowrap",
      }}>
        {sym.id}
      </div>
    </div>
  );
}

function SectionHeading({ label, accent, note }: { label: string; accent: string; note: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
        <div style={{ width: 3, height: 16, background: accent, borderRadius: 2 }} />
        <span style={{
          fontSize:      10,
          fontWeight:    700,
          color:         C.cream,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 9, color: C.muted, paddingLeft: 11 }}>{note}</div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function SymbolReference() {
  const standard = SYMBOLS.filter((s) => s.group === "standard");
  const special  = SYMBOLS.filter((s) => s.group === "special");
  const svgOnly  = SYMBOLS.filter((s) => s.group === "svg");

  return (
    <div style={{
      width:       1440,
      minHeight:   900,
      background:  C.void,
      color:       C.cream,
      fontFamily:  "system-ui, sans-serif",
      boxSizing:   "border-box",
    }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{
        height:       64,
        display:      "flex",
        alignItems:   "center",
        padding:      "0 36px",
        background:   `linear-gradient(180deg, ${C.night} 0%, rgba(7,13,32,.92) 100%)`,
        borderBottom: `1px solid ${C.border}`,
        gap:          16,
        flexShrink:   0,
      }}>
        <div style={{
          width:          36,
          height:         36,
          borderRadius:   9,
          background:     `linear-gradient(135deg, ${C.mint}, ${C.gold})`,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontSize:       18,
          flexShrink:     0,
        }}>
          🎰
        </div>
        <div>
          <div style={{
            fontFamily:  "'Baloo 2', system-ui, sans-serif",
            fontSize:    16,
            fontWeight:  800,
            color:       C.cream,
            lineHeight:  1,
          }}>
            Symbol Reference
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: "0.05em" }}>
            22 symbols · atlas positions · payout tiers
          </div>
        </div>
        <div style={{ width: 1, height: 28, background: C.border }} />
        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
          Standard atlas 4×4 · Special atlas 4×2 · SVG-only (2)
        </div>

        {/* Category legend */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
          {(["High","Mid","Low","Treat","Wild","Scatter","Blocker"] as Category[]).map((cat) => {
            const s = CATEGORY_STYLE[cat];
            return (
              <div key={cat} style={{
                padding:       "2px 8px",
                borderRadius:  6,
                background:    s.bg,
                border:        `1px solid ${s.border}`,
                color:         s.color,
                fontSize:      8,
                fontWeight:    800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                {cat}
              </div>
            );
          })}
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div style={{ padding: "28px 36px", display: "flex", flexDirection: "column", gap: 32 }}>

        {/* Standard symbols */}
        <section>
          <SectionHeading
            label="Standard Symbols"
            accent={C.gold}
            note="16 cells · 4×4 atlas · rows: High / Mid / Low / Treat"
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[0, 1, 2, 3].map((rowIdx) => {
              const rowSymbols = standard.filter((s) => s.row === rowIdx);
              const rowLabels: Record<number, string> = { 0: "High", 1: "Mid", 2: "Low", 3: "Treat" };
              const rowAccents: Record<number, string> = {
                0: C.gold, 1: C.teal, 2: C.muted, 3: C.orange,
              };
              return (
                <div key={rowIdx} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  {/* Row label */}
                  <div style={{
                    width:          44,
                    flexShrink:     0,
                    paddingTop:     14,
                    fontSize:       8.5,
                    fontWeight:     700,
                    color:          rowAccents[rowIdx],
                    letterSpacing:  "0.12em",
                    textTransform:  "uppercase",
                    textAlign:      "right",
                  }}>
                    {rowLabels[rowIdx]}
                  </div>
                  <div style={{ width: 1, alignSelf: "stretch", background: `${rowAccents[rowIdx]}33` }} />
                  {/* Cells */}
                  <div style={{ display: "flex", gap: 8 }}>
                    {rowSymbols.map((sym) => <SymbolCell key={sym.id} sym={sym} />)}
                    {/* Empty slot placeholder at (3,3) */}
                    {rowIdx === 3 && (
                      <div style={{
                        width:          CELL_W,
                        height:         CELL_H,
                        border:         `1.5px dashed rgba(37,45,114,.6)`,
                        borderRadius:   10,
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "center",
                        color:          "rgba(37,45,114,.5)",
                        fontSize:       9,
                        fontStyle:      "italic",
                      }}>
                        empty slot
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Divider */}
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${C.border}, transparent)` }} />

        {/* Special symbols + SVG side by side */}
        <div style={{ display: "flex", gap: 48, alignItems: "flex-start" }}>

          {/* Special atlas */}
          <section style={{ flex: "0 0 auto" }}>
            <SectionHeading
              label="Special Symbols"
              accent={C.mint}
              note="5 symbols · 4×2 atlas · wilds & scatter"
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[0, 1].map((rowIdx) => {
                const rowSymbols = special.filter((s) => s.row === rowIdx);
                return (
                  <div key={rowIdx} style={{ display: "flex", gap: 8 }}>
                    {rowSymbols.map((sym) => <SymbolCell key={sym.id} sym={sym} />)}
                    {/* Empty slots for row 1 (only wild_chai at col 0) */}
                    {rowIdx === 1 && [1, 2, 3].map((c) => (
                      <div key={c} style={{
                        width:          CELL_W,
                        height:         CELL_H,
                        border:         `1.5px dashed rgba(37,45,114,.6)`,
                        borderRadius:   10,
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "center",
                        color:          "rgba(37,45,114,.5)",
                        fontSize:       9,
                        fontStyle:      "italic",
                      }}>
                        empty
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Vertical divider */}
          <div style={{ width: 1, alignSelf: "stretch", background: C.border }} />

          {/* SVG-only */}
          <section style={{ flex: "0 0 auto" }}>
            <SectionHeading
              label="SVG Symbols"
              accent={C.dustyPink}
              note="2 symbols · not in any atlas · bonus-trigger blockers"
            />
            <div style={{ display: "flex", gap: 8 }}>
              {svgOnly.map((sym) => <SymbolCell key={sym.id} sym={sym} />)}
            </div>
          </section>

          {/* Stats sidebar */}
          <section style={{ flex: 1 }}>
            <SectionHeading
              label="Summary"
              accent={C.auroraPurple}
              note="Symbol counts by tier"
            />
            <div style={{
              display:             "grid",
              gridTemplateColumns: "1fr 1fr",
              gap:                 8,
            }}>
              {([
                ["High pay",    "4",  C.gold],
                ["Mid pay",     "4",  C.teal],
                ["Low pay",     "4",  C.muted],
                ["Treat",       "3",  C.orange],
                ["Wild",        "4",  C.mint],
                ["Scatter",     "1",  "#b8a8ff"],
                ["Blocker",     "2",  C.dustyPink],
                ["Total",       "22", C.cream],
              ] as [string, string, string][]).map(([label, count, color]) => (
                <div key={label} style={{
                  padding:    "8px 12px",
                  background: C.surface,
                  border:     `1px solid ${C.border}`,
                  borderRadius: 8,
                  display:    "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <span style={{ fontSize: 9, color: C.muted, fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color }}>{count}</span>
                </div>
              ))}
            </div>

            {/* Pay ladder note */}
            <div style={{
              marginTop:    16,
              padding:      "12px 14px",
              background:   C.surface,
              border:       `1px solid ${C.border}`,
              borderRadius: 8,
            }}>
              <div style={{
                fontSize:      9,
                fontWeight:    700,
                color:         C.muted,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom:  6,
              }}>
                Payout Tier Notes
              </div>
              {[
                "High symbols pay most on 5-of-a-kind lines",
                "Treats only land on reels 1, 3, and 5",
                "Blockers (doorbell, chai pump) can only appear on 3 specific reels",
                "Wild Handbag carries a 3×, 5×, or 10× line multiplier",
                "UniGlee (scatter) triggers the marathon bonus on reels 3–5",
              ].map((note) => (
                <div key={note} style={{
                  fontSize:    9,
                  color:       C.creamDim,
                  display:     "flex",
                  gap:         6,
                  marginBottom: 4,
                  lineHeight:  1.5,
                }}>
                  <span style={{ color: C.mint, flexShrink: 0 }}>·</span>
                  {note}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
