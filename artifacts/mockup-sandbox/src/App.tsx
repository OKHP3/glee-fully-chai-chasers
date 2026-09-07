import { useEffect, useRef, useState, type ComponentType } from "react";

import { modules as discoveredModules } from "./.generated/mockup-components";

// ── Types ─────────────────────────────────────────────────────────────────────

type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

// ── React component preview (existing /preview/... path) ──────────────────────

/** Returns v if it is a function, otherwise undefined. */
function _isFn(v: unknown): v is ComponentType {
  return typeof v === "function";
}

function _resolveComponent(
  mod: Record<string, unknown>,
  name: string,
): ComponentType | undefined {
  const fns = Object.values(mod).filter(_isFn);
  // Each prioritised candidate is checked with typeof before being accepted.
  // A truthy default export that is a plain object, string, or number is NOT a
  // component and must not be returned — doing so causes a silent blank/crash.
  const resolved =
    (_isFn(mod.default)  ? mod.default  : undefined) ||
    (_isFn(mod.Preview)  ? mod.Preview  : undefined) ||
    (_isFn(mod[name])    ? mod[name]    : undefined) ||
    fns[fns.length - 1];
  if (!resolved) {
    console.warn(
      `[mockup-sandbox] _resolveComponent: no React component found for "${name}". ` +
      `The file must export at least one function component (named export "${name}", ` +
      `"default", or "Preview"). Check that the file does not use a default-export ` +
      `non-component (e.g. a plain object or string).`,
    );
  }
  return resolved;
}

function PreviewRenderer({
  componentPath,
  modules,
}: {
  componentPath: string;
  modules: ModuleMap;
}) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setComponent(null);
    setError(null);

    async function loadComponent(): Promise<void> {
      const key = `./components/mockups/${componentPath}.tsx`;
      const loader = modules[key];
      if (!loader) {
        setError(`No component found at ${componentPath}.tsx`);
        return;
      }

      try {
        const mod = await loader();
        if (cancelled) return;
        const name = componentPath.split("/").pop()!;
        const comp = _resolveComponent(mod, name);
        if (!comp) {
          setError(
            `No exported React component found in ${componentPath}.tsx\n\nMake sure the file has at least one exported function component.`,
          );
          return;
        }
        setComponent(() => comp);
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : String(e);
        setError(`Failed to load preview.\n${message}`);
      }
    }

    void loadComponent();
    return () => { cancelled = true; };
  }, [componentPath, modules]);

  if (error) {
    return (
      <pre style={{ color: "red", padding: "2rem", fontFamily: "system-ui" }}>
        {error}
      </pre>
    );
  }

  if (!Component) return null;
  return <Component />;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getBasePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}

function getPreviewPath(): string | null {
  const basePath = getBasePath();
  const { pathname } = window.location;
  const local =
    basePath && pathname.startsWith(basePath)
      ? pathname.slice(basePath.length) || "/"
      : pathname;
  const match = local.match(/^\/preview\/(.+)$/);
  return match ? match[1] : null;
}

// ── Scene gallery ─────────────────────────────────────────────────────────────

/**
 * Prefix → group label, in display order.
 *
 * When you add a new scene whose filename prefix is not listed here it will
 * silently land in the "Other" bucket and a console warning fires in dev.
 * Add the prefix to the right group (or create a new group) to keep the
 * sidebar organised.
 *
 * Current prefix → group mapping
 * ───────────────────────────────
 * Base Game  : board-, game-, ice-, levelup-, paytable-, spin-, splash-
 * Settings   : settings-
 * Cascade    : cascade-
 * Cat Visits : cat-, joey-, phoebe-
 * Win States : win-
 * Lap Quest  : lap-quest-
 * Bonus      : bold-, bonus-, chai-storm-, doorbell-, free-spin-,
 *              free-spins-, iced-chai-, standard-, treat-, were-
 * UniGlee    : keepsake-, uniglee-
 */
const GROUP_PREFIXES: Array<{ label: string; prefixes: string[] }> = [
  {
    label: "Base Game",
    prefixes: [
      "game-", "board-", "ice-",
      "levelup-", "paytable-", "spin-", "splash-",
    ],
  },
  { label: "Settings",   prefixes: ["settings-"] },
  { label: "Cascade",    prefixes: ["cascade-"] },
  { label: "Cat Visits", prefixes: ["cat-", "joey-", "phoebe-"] },
  { label: "Win States", prefixes: ["win-"] },
  { label: "Lap Quest",  prefixes: ["lap-quest-"] },
  {
    label: "Bonus",
    prefixes: [
      "bold-", "bonus-", "chai-storm-", "doorbell-",
      "free-spin-", "free-spins-", "iced-chai-",
      "standard-", "treat-", "were-",
    ],
  },
  { label: "UniGlee",    prefixes: ["uniglee-", "keepsake-"] },
];

/**
 * Human-readable display names for every scene in the gallery.
 * Keys are filenames (with .html extension). Values are shown in the sidebar.
 * Derived from the <title> tag of each scene file; strip " — Chai Chasers Design Review".
 * Unmapped scenes (future additions) fall back to auto-capitalised filename logic below.
 */
const SCENE_LABELS: Record<string, string> = {
  // ── Base Game ──────────────────────────────────────────────────────────────
  "game-base.html":                        "Base Game",
  "board-askjamie-bubble.html":            "AskJamie Bubble (Daily Coin Grant)",
  "ice-notes.html":                        "Ice Notes",
  "levelup-overlay.html":                  "Level-Up Overlay",
  "paytable-page.html":                    "Paytable — Symbol Guide",
  "spin-wheel.html":                       "Joey & Phoebe Sparkle Wheel",
  "splash-birthday.html":                  "Splash — Birthday Variant",
  "splash-standard.html":                  "Splash — Standard",

  // ── Settings ───────────────────────────────────────────────────────────────
  "settings-page.html":                    "Settings Page",
  "settings-about.html":                   "Settings — About",
  "settings-look-and-feel.html":           "Settings — Look & Feel",
  "settings-payline-guide.html":           "Settings — Payline Guide",
  "settings-reduce-motion.html":           "Settings — Reduce Motion",
  "settings-sound.html":                   "Settings — Sound",
  "settings-start-fresh.html":             "Settings — Start Fresh Confirmation",

  // ── Cascade ────────────────────────────────────────────────────────────────
  "cascade-beam-up.html":                  "Cascade — Beam-Up Removal",
  "cascade-initial-pop.html":              "Cascade — Initial Pop (Step 0)",
  "cascade-payline-guide-off.html":        "Cascade — Payline Guide Off (Default)",
  "cascade-payline-guide-on.html":         "Cascade — Payline Guide On",
  "cascade-resting-board.html":            "Cascade — Resting Board (No Animation Classes)",
  "cascade-staggered-drop.html":           "Cascade — Staggered Drop (Step 1+)",
  "cascade-win-highlight.html":            "Cascade — Win Highlight",

  // ── Cat Visits ─────────────────────────────────────────────────────────────
  "cat-visit-joey.html":                   "Joey Cat Visit",
  "cat-visit-phoebe.html":                 "Phoebe Cat Visit",
  "cat-popin-joey-fed.html":               "Joey Pop-In — Fed (Assist → Eat)",
  "cat-popin-joey-unfed.html":             "Joey Pop-In — Unfed (Unimpressed)",
  "cat-popin-phoebe-fed.html":             "Phoebe Pop-In — Fed (Eat Pose)",
  "cat-popin-phoebe-unfed.html":           "Phoebe Pop-In — Unfed (Unimpressed)",

  // ── Win States ─────────────────────────────────────────────────────────────
  "win-celebration.html":                  "Win Celebration (Huge Win)",
  "win-celebration-big.html":              "Win Celebration — BIG WIN!",
  "win-celebration-nice.html":             "Win Celebration — NICE WIN!",
  "win-status-only.html":                  "Win — Status Line Only (sub-threshold)",

  // ── Lap Quest ──────────────────────────────────────────────────────────────
  "lap-quest-ledge.html":                  "Lap Quest Ledge — Grace Phase",
  "lap-quest-ledge-exit-inactivity.html":  "Lap Quest Ledge — Inactivity Exit",
  "lap-quest-ledge-exit-joey.html":        "Lap Quest Ledge — Joey Exit",
  "lap-quest-reveal.html":                 "Lap Quest Reveal",
  "lap-quest-round-play.html":             "Lap Quest Round Play",
  "phoebe-lap-quest.html":                 "Phoebe's Lap Quest",

  // ── Bonus ──────────────────────────────────────────────────────────────────
  "bold-chai-pump.html":                   "Bold Chai Pump",
  "bold-chai-free-spins.html":             "Bold Chai Free Spins",
  "bonus-summary.html":                    "Bonus Summary — Free Spins Complete",
  "chai-storm-splash.html":                "Wild Chai Storm Splash",
  "doorbell-panic.html":                   "Doorbell Panic",
  "doorbell-panic-free-spins.html":        "Doorbell Panic Free Spins",
  "free-spin-board.html":                  "Free Spins Board",
  "free-spins-session.html":               "Free Spins Session",
  "iced-chai-wild-rain-board.html":        "Iced Chai Wild Rain Board",
  "joey-laundry.html":                     "Joey's Laundry Helper",
  "joey-laundry-combined-strike.html":     "Joey's Laundry — Combined Strike",
  "joey-laundry-paw-strike.html":          "Joey's Laundry — Paw Strike Effect",
  "joey-laundry-sock-drop.html":           "Joey's Laundry — Sock Drop Effect",
  "standard-free-spins.html":              "Standard Chai Chase",
  "treat-jar-free-spins.html":             "Treat Jar Bonus",
  "treat-time.html":                       "Treat Time",
  "treat-time-entry-morning.html":         "Treat Time Entry — Morning",
  "treat-time-entry-nighttime.html":       "Treat Time Entry — Nighttime",
  "treat-time-main-board.html":            "Treat Time Main Board",
  "were-multiplying.html":                 "We're Multiplying — Free Spins Board",

  // ── UniGlee ────────────────────────────────────────────────────────────────
  "keepsake-constellation.html":           "Keepsake Constellation",
  "keepsake-memory.html":                  "Moonlit Keepsake Trail",
  "keepsake-memory-failed.html":           "Moonlit Keepsake Trail — Trail Over",
  "keepsake-memory-mismatch.html":         "Moonlit Keepsake Trail — Mismatch Mid-Flash",
  "keepsake-memory-success.html":          "Moonlit Keepsake Trail — All Pairs Found",
  "uniglee-trigger.html":                  "UniGlee Trigger",
  "uniglee-chapter-banner.html":           "UniGlee Chapter Banner",
  "uniglee-act-keepsake-collection.html":  "UniGlee Act — Keepsake Collection",
  "uniglee-act-nighttime-treat-time.html": "UniGlee Act — Nighttime Treat Time",
  "uniglee-act-were-multiplying.html":     "UniGlee Act — We're Multiplying",
  "uniglee-marathon-levelup.html":         "UniGlee Marathon — Level-Up",
  "uniglee-summary.html":                  "UniGlee Marathon Summary",
};

function toDisplayName(filename: string): string {
  if (Object.prototype.hasOwnProperty.call(SCENE_LABELS, filename)) {
    return SCENE_LABELS[filename];
  }
  // Fallback for any future scenes not yet in the map
  return filename
    .replace(/\.html$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function groupScenes(
  scenes: string[],
): Array<{ label: string; scenes: string[] }> {
  const used = new Set<string>();
  const groups: Array<{ label: string; scenes: string[] }> = [];

  for (const { label, prefixes } of GROUP_PREFIXES) {
    const matched = scenes.filter(
      (s) => !used.has(s) && prefixes.some((p) => s.startsWith(p)),
    );
    if (matched.length) {
      matched.forEach((s) => used.add(s));
      groups.push({ label, scenes: matched });
    }
  }

  const rest = scenes.filter((s) => !used.has(s));
  if (rest.length) {
    groups.push({ label: "Other", scenes: rest });
    // Dev-only nudge: a scene landed in "Other" because its filename prefix
    // is not listed in GROUP_PREFIXES. Add it to the right group above.
    if (import.meta.env.DEV) {
      console.warn(
        "[scene-gallery] The following scenes have no matching prefix in " +
        "GROUP_PREFIXES and fell through to \"Other\". Update the prefix " +
        "mapping at the top of App.tsx to keep the sidebar organised:\n" +
        rest.map((s) => `  • ${s}`).join("\n"),
      );
    }
  }

  return groups;
}

// Inline styles kept as constants for legibility
const S = {
  root: {
    display: "flex",
    height: "100vh",
    fontFamily: "'system-ui', sans-serif",
    background: "#090f24",
    color: "#e2e8f0",
    overflow: "hidden",
  } satisfies React.CSSProperties,

  sidebar: {
    width: 220,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column" as const,
    borderRight: "1px solid #1a2540",
    background: "#060c1a",
    overflow: "hidden",
  } satisfies React.CSSProperties,

  sidebarHead: {
    padding: "14px 12px 10px",
    borderBottom: "1px solid #1a2540",
    flexShrink: 0,
  } satisfies React.CSSProperties,

  sidebarTitle: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "#334155",
  } satisfies React.CSSProperties,

  sidebarCount: {
    fontSize: 11,
    color: "#475569",
    marginTop: 2,
  } satisfies React.CSSProperties,

  sidebarScroll: {
    flex: 1,
    overflowY: "auto" as const,
    paddingBottom: 16,
  } satisfies React.CSSProperties,

  groupLabel: {
    padding: "10px 12px 4px",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "#1e3a5f",
  } satisfies React.CSSProperties,

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
  } satisfies React.CSSProperties,

  toolbar: {
    padding: "8px 14px",
    borderBottom: "1px solid #1a2540",
    background: "#060c1a",
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
    minHeight: 38,
  } satisfies React.CSSProperties,

  toolbarLabel: {
    fontSize: 12,
    color: "#64748b",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  } satisfies React.CSSProperties,

  navCounter: {
    fontSize: 11,
    color: "#475569",
    flexShrink: 0,
    minWidth: 48,
    textAlign: "center" as const,
  } satisfies React.CSSProperties,

  navBtn: {
    fontSize: 14,
    lineHeight: 1,
    padding: "3px 8px",
    background: "#0f2744",
    color: "#93c5fd",
    border: "1px solid #1e3a5f",
    borderRadius: 4,
    cursor: "pointer",
    flexShrink: 0,
    userSelect: "none" as const,
  } satisfies React.CSSProperties,

  navBtnDisabled: {
    opacity: 0.3,
    cursor: "default",
  } satisfies React.CSSProperties,

  openLink: {
    fontSize: 11,
    color: "#3b82f6",
    textDecoration: "none",
    flexShrink: 0,
  } satisfies React.CSSProperties,

  placeholder: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column" as const,
    gap: 10,
    color: "#1e293b",
  } satisfies React.CSSProperties,

  placeholderIcon: {
    fontSize: 40,
  } satisfies React.CSSProperties,

  placeholderText: {
    fontSize: 13,
    color: "#334155",
  } satisfies React.CSSProperties,
} as const;

function SceneButton({
  name,
  selected,
  onClick,
}: {
  name: string;
  selected: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  return (
    <button
      ref={ref}
      onClick={onClick}
      title={name}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "5px 12px 5px 16px",
        fontSize: 11,
        background: selected ? "#0f2744" : "transparent",
        color: selected ? "#93c5fd" : "#64748b",
        border: "none",
        borderLeft: selected ? "2px solid #3b82f6" : "2px solid transparent",
        cursor: "pointer",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        lineHeight: 1.5,
      }}
    >
      {toDisplayName(name)}
    </button>
  );
}

function SceneGallery() {
  const basePath = getBasePath();
  const [scenes, setScenes] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  /** True when the Design System showcase is shown instead of a scene. */
  const [dsView, setDsView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${basePath}/api/scenes`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<string[]>;
      })
      .then((data) => {
        setScenes(data);
        setLoading(false);
      })
      .catch((e: unknown) => {
        setFetchError(e instanceof Error ? e.message : "Failed to load scenes");
        setLoading(false);
      });
  }, [basePath]);

  const groups = groupScenes(scenes);

  // Flat ordered list matching sidebar display order
  const flatScenes = groups.flatMap((g) => g.scenes);
  const selectedIdx = selected ? flatScenes.indexOf(selected) : -1;
  const hasPrev = selectedIdx > 0;
  const hasNext = selectedIdx >= 0 && selectedIdx < flatScenes.length - 1;

  const navigate = (delta: -1 | 1) => {
    const nextIdx = selectedIdx + delta;
    if (nextIdx >= 0 && nextIdx < flatScenes.length) {
      setSelected(flatScenes[nextIdx]);
    }
  };

  // Keyboard arrow navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); navigate(-1); }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); navigate(1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIdx, flatScenes.length]);

  const iframeSrc = dsView
    ? `${basePath}/preview/design-system/SystemShowcase`
    : selected
      ? `${basePath}/scenes/${selected}`
      : null;

  return (
    <div style={S.root}>
      {/* ── Sidebar ── */}
      <aside style={S.sidebar}>
        <div style={S.sidebarHead}>
          <div style={S.sidebarTitle}>Scene Gallery</div>
          <div style={S.sidebarCount}>
            {loading
              ? "Loading…"
              : fetchError
                ? "Error"
                : `${scenes.length} scenes`}
          </div>
        </div>

        <div style={S.sidebarScroll}>
          {fetchError && (
            <div
              style={{
                padding: "10px 12px",
                color: "#f87171",
                fontSize: 11,
              }}
            >
              {fetchError}
            </div>
          )}

          {/* ── Pinned: Design System reference ── */}
          <div>
            <div style={S.groupLabel}>Reference</div>
            <button
              onClick={() => { setDsView(true); setSelected(null); }}
              title="Design System — System Showcase"
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "5px 12px 5px 16px",
                fontSize: 11,
                background: dsView ? "#0f2744" : "transparent",
                color: dsView ? "#f5d576" : "#9b8ea0",
                border: "none",
                borderLeft: dsView ? "2px solid #f5d576" : "2px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.5,
              }}
            >
              ✦ Design System
            </button>
          </div>

          {groups.map((g) => (
            <div key={g.label}>
              <div style={S.groupLabel}>{g.label}</div>
              {g.scenes.map((scene) => (
                <SceneButton
                  key={scene}
                  name={scene}
                  selected={selected === scene}
                  onClick={() => { setDsView(false); setSelected(scene); }}
                />
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Preview pane ── */}
      <main style={S.main}>
        <div style={S.toolbar}>
          {/* Prev button */}
          <button
            onClick={() => navigate(-1)}
            disabled={!hasPrev}
            title="Previous scene (← ↑)"
            style={{
              ...S.navBtn,
              ...(!hasPrev ? S.navBtnDisabled : {}),
            }}
          >
            ‹
          </button>

          <span style={S.toolbarLabel}>
            {dsView
              ? "Design System — System Showcase"
              : selected
                ? toDisplayName(selected)
                : "Select a scene to preview"}
          </span>

          {/* Scene counter — only shown for scene navigation, not design system view */}
          {!dsView && selectedIdx >= 0 && (
            <span style={S.navCounter}>
              {selectedIdx + 1} / {flatScenes.length}
            </span>
          )}

          {/* Next button */}
          <button
            onClick={() => navigate(1)}
            disabled={!hasNext}
            title="Next scene (→ ↓)"
            style={{
              ...S.navBtn,
              ...(!hasNext ? S.navBtnDisabled : {}),
            }}
          >
            ›
          </button>

          {iframeSrc && (
            <a
              href={iframeSrc}
              target="_blank"
              rel="noopener noreferrer"
              style={S.openLink}
            >
              Open ↗
            </a>
          )}
        </div>

        {iframeSrc ? (
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            style={{ flex: 1, border: "none", background: "#090f24" }}
            title={dsView ? "Design System — System Showcase" : (selected ?? "Scene preview")}
          />
        ) : (
          <div style={S.placeholder}>
            <span style={S.placeholderIcon}>🎭</span>
            <span style={S.placeholderText}>
              {loading ? "Loading scene list…" : "Select a scene from the sidebar"}
            </span>
          </div>
        )}
      </main>
    </div>
  );
}

// ── App router ────────────────────────────────────────────────────────────────

function App() {
  const previewPath = getPreviewPath();

  if (previewPath) {
    return (
      <PreviewRenderer
        componentPath={previewPath}
        modules={discoveredModules}
      />
    );
  }

  return <SceneGallery />;
}

export default App;
