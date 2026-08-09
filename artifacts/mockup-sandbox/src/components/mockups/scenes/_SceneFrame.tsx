/**
 * _SceneFrame — shared wrapper for static HTML scene previews.
 * Underscore prefix keeps this file out of the auto-discovery map.
 */
export function SceneFrame({ file, title }: { file: string; title: string }) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <iframe
      src={`${base}/scenes/${file}`}
      title={title}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        border: "none",
        background: "#1c103a",
      }}
    />
  );
}
