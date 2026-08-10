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

/** Prefix → group label, in display order. */
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

function toDisplayName(filename: string): string {
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
  if (rest.length) groups.push({ label: "Other", scenes: rest });

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

  const iframeSrc = selected ? `${basePath}/scenes/${selected}` : null;

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

          {groups.map((g) => (
            <div key={g.label}>
              <div style={S.groupLabel}>{g.label}</div>
              {g.scenes.map((scene) => (
                <SceneButton
                  key={scene}
                  name={scene}
                  selected={selected === scene}
                  onClick={() => setSelected(scene)}
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
            {selected ? toDisplayName(selected) : "Select a scene to preview"}
          </span>

          {/* Scene counter */}
          {selectedIdx >= 0 && (
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
            title={selected ?? "Scene preview"}
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
