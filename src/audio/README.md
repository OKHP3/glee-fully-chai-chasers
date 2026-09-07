# src/audio — Web Audio synth (all original, zero samples)

AudioContext initialized on first user tap (iOS requirement — the splash button is the gesture). Sound toggle persisted via state.ts; the game must be fully playable muted.

`music.ts` now provides the base Chai Chase score: a 60-second, 20-bar original Web Audio loop at 80 BPM, plus a separate 48-bar UniGlee score of roughly 103 seconds at 112 BPM. The marathon score uses its own bus and start/stop lifecycle, so the signature bonus does not reuse the base-game loop. Both stop completely with the shared Sound toggle. Chapter stems remain future work.

IP rule (docs/IP-GUARDRAILS.md): style homage only. No samples, no melodies close enough to hum-match any real song.
