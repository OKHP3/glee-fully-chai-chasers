# src/audio — Web Audio synth (all original, zero samples)

AudioContext initialized on first user tap (iOS requirement — the splash button is the gesture). Sound toggle persisted via state.ts; the game must be fully playable muted.

`music.ts` now provides the base Chai Chase score: a 60-second, 20-bar original Web Audio loop at 80 BPM. It uses a dedicated low-volume music bus beneath the state SFX and stops completely with the shared Sound toggle. Chapter stems remain future work.

IP rule (docs/IP-GUARDRAILS.md): style homage only. No samples, no melodies close enough to hum-match any real song.
