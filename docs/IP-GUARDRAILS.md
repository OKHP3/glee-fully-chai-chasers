# IP-GUARDRAILS.md — hard rules for a public repo

Every tool and every commit follows these. Not legal advice; a conservative zero-risk posture for a zero-revenue public gift.

| Domain | Rule | What we do instead |
|---|---|---|
| WMS / L&W / SciPlay trade dress | No cows, farmers, farms, "Moolah," "Invaders from the Planet…" naming, traced art, ripped SFX, copied reel strips or UI layouts | Cats, chai, butterflies, original name. Mechanics (cascades, meters, wheels, ladders) are unprotectable ideas — clone the *feel*, never the *skin* |
| Friends / Schitt's Creek | Zero audio/video clips; zero verbatim script quotes | Homage-style original lines; cat names Joey & Phoebe are the real cats' names (names alone unprotectable) |
| Stevie Nicks / Fleetwood Mac / any music | No samples; no melodies close enough to hum-match | Original chiptune in the *style* of 70s soft-rock / 90s grunge. Style isn't copyrightable; recordings and compositions are |
| Starbucks / Tazo / Swig Life | No brand names, logos, siren imagery, or product trade dress | "Jewel-toned mermaid-pattern 24oz tumbler" as original art; "12 pumps" as a number, not an order quote |
| Cat Man Doo / Orijen / Chewy | No brand names, logos, or traced packaging | Generic pouches echoing silhouette/color: Chicken Comets (yellow), Salmon Stars (blue), Boogie Bites (navy) |
| Glee's likeness | No photos of Glee in repo, game, history, or derived assets | Abstract Chai Captain presence; original illustrated avatar only if she approves the design |
| Gambling optics | No real money, purchases, ads, cash-out, or odds claims; no "casino" in name/store text | README states: free fan-made birthday gift, fictional currency, no wagering, not affiliated with any casino, game studio, or brand |

## Enforcement

- Pre-release audit step in the deploy checklist: grep shipped bundle for brand strings; verify `reference-photos/` and `private-work/` absent from `dist/` and git history.
- Any asset without documented provenance in `docs/ASSET-CHECKLIST.md` does not ship.
