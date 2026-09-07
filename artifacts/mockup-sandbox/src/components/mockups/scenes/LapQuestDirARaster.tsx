import { SceneFrame } from "./_SceneFrame";

/**
 * Lap Quest — Direction A: Raster Sprite
 *
 * Uses the S18 production atlas (joey-phoebe-wilds.png) directly.
 * Phoebe's right-half sprite is cropped and positioned above the ledge
 * surface — zero illustration delta from the rest of the game's cat art.
 *
 * State shown: grace phase (entry — Phoebe settling in, pet button disabled).
 */
export default function LapQuestDirARaster() {
  return (
    <SceneFrame
      file="lap-quest-dir-a-raster.html"
      title="Lap Quest – Direction A: Raster Sprite (Entry / Grace Phase)"
    />
  );
}
