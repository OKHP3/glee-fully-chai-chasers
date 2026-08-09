# `src/engine` — pure game math

The engine is the tested, browser-DOM-free heart of Glee-fully Chai Chasers. It owns deterministic RNG, five-by-four reel generation, 40-payline evaluation, cascades, free spins, specialty wilds, the Treat Jar and cat visits, Doorbell Panic, Treat Time, Bold Chai, Moonlit Keepsake Trail, and the UniGlee marathon.

UI code consumes typed engine results; it does not calculate payouts, weights, or feature outcomes. Keep engine changes simulation-backed and preserve the release-oracle thresholds in `simulation.test.ts`.

Run `npm test` for the full engine and UI suite, then `npm run build` before integrating an engine change.
