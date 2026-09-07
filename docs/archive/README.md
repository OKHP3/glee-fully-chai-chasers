# docs/archive

One-time implementation contracts that have shipped and whose work is complete.
Preserved for design history per the repo's standing rule of never deleting
history. Do not treat API listings or tables in these files as current — the
live implementation supersedes them.

| File | Date | Why archived |
|---|---|---|
| `HANDBAG-WILD-2026-07-14.md` | 2026-07-14 | One-time chapter contract for the Handbag Wild mechanic. Work shipped; live implementation is `src/engine/reels.ts` and the shared reel-strip path. The 2026-08-09 delta section inside the doc records the known oracle discrepancy, which is tracked as D8 in `docs/DECISION-LOG.md`. The S30 settled decision that cites this file remains authoritative; that decision now points to `docs/archive/HANDBAG-WILD-2026-07-14.md`. |
| `JOEYS-LAUNDRY-HELPER-2026-07-15.md` | 2026-07-15 | One-time chapter contract for Joey's Laundry Helper. Work shipped; live implementation is `src/engine/laundry.ts`. |
| `PHOEBES-LAP-QUEST-2026-07-15.md` | 2026-07-15 | One-time chapter contract for Phoebe's Lap Quest. Work shipped; live implementation is `src/engine/lap-quest.ts` + `src/ui/lap-quest-ledge.ts`. The doc carries an archival notice at its head recording the API removal from task #152. |
