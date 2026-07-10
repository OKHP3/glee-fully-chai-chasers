# src/ui — rendering & animation (no game math here)

Owner: pending D2 (vanilla TS vs React) in docs/DECISION-LOG.md. Do not start until settled.

Contract with the engine: UI consumes `SpinResult`/`CascadeStep` objects and animates them; it never computes wins, weights, or randomness. Animation rules: transform/opacity only, `will-change` on reels, 60fps on iPhone, honor `prefers-reduced-motion` (fades replace drops), touch targets ≥48px, aria-live announcements for wins.

Screens: splash (audio unlock), main board (reels + meter + Treat Jar + bet bar), wheel, Chai Bonus shelf, daily wheel, birthday reveal, settings/reset.
