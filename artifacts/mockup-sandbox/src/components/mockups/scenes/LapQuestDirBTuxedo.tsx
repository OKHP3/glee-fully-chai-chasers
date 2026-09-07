import { SceneFrame } from "./_SceneFrame";

/**
 * Lap Quest — Direction B: Tuxedo Vector
 *
 * A bespoke inline SVG Phoebe drawn to match the S18 production art baseline:
 * near-black body, prominent white chest bib, bright green eyes (#38c97a),
 * dusty-pink inner ears, white paws with toe lines, and a long sweeping tail.
 * Bold ink outlines throughout — cartoony not photorealistic.
 *
 * State shown: active petting phase (pet button live, speech bubble updating).
 *
 * This is the direction implemented in production code.
 */
export default function LapQuestDirBTuxedo() {
  return (
    <SceneFrame
      file="lap-quest-dir-b-tuxedo.html"
      title="Lap Quest – Direction B: Tuxedo Vector (Active Petting Phase) ★ Selected"
    />
  );
}
