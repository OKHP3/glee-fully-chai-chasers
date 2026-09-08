# Landing verification dispatch contract

## Correction, 2026-09-08

An ordinary Skillz push is not evidence of a new promotion. The former
producer sent every main commit to a receiver that requires an exact match
against a promotion manifest's accepted commit. This caused false failures
for unrelated maintenance, and could race the recording of a real promotion.
A path filter would not solve the manifest-recording race.

The companion producer is now explicitly dispatched after the manifest is
recorded. Install `okhp3-skillz-verify-landing.yml` as
`.github/workflows/verify-skill-landing.yml` in OKHP3/skillz.

## Promotion sequence

1. Merge the approved skill into Skillz through its normal review process.
2. Record the actual full accepted commit in the incubator promotion manifest.
3. Merge that manifest update into this repository's main branch. The existing
   receiver automatically verifies the recorded landing on that manifest push.
4. For an explicit retry, run Skillz's **Notify landing verification** workflow
   from main with `commit_sha` equal to the recorded accepted commit, not the
   latest unrelated Skillz main SHA. Authorized tooling may invoke the same
   workflow. No additional manual dispatch is needed for a normal manifest push.
5. Inspect the receiving **Verify skill landing** run. Successful dispatch only
   means GitHub accepted the request; it does not prove verification succeeded.

## Preserved gates

- Explicit targeted commits with no matching manifest still fail.
- Content/hash verification remains unchanged; do not rewrite historical
  acceptance records to silence unrelated alerts.
- An explicit dispatch without credentials fails visibly.
- Routine Skillz commits do not assert a promotion or dispatch this workflow.
- Older notifications remain unresolved until the corrected published behavior
  and the relevant receiver results have been verified.

## Regression checks

Skillz runs `python scripts/test_landing_dispatch.py -v` on relevant pull
requests and main pushes. The test executes the actual workflow shell with a
local HTTP stub, checks the exact payload, and rejects invalid input, missing
credentials, and non-main invocation. HTTP failures must propagate. It makes
no network requests and does not establish live cross-repository delivery.
