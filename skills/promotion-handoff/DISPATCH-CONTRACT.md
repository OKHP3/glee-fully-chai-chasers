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
- Producer input is exactly 40 lowercase hexadecimal characters. Uppercase
  letters and surrounding whitespace are rejected, not silently normalized.
  Copy the exact recorded accepted commit; input convenience must not rewrite
  an acceptance record or turn an unrelated main commit into a promotion.
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

For this template and the receiver's decoded resolver, install `PyYAML==6.0.3`
in the test environment, then run from this repository root:

```text
python3 -B -m unittest discover -s skills/promotion-handoff/tests -v
```

These offline fixtures cover the correctly dedented heredoc, exact manifest
matching, and the hard failure for a dispatched SHA without a matching manifest.

## Review adjudication, 2026-09-08

- The producer and this template explicitly send `Content-Type: application/json`.
  The offline HTTP stub rejects a missing or incorrect JSON content type.
- The Skillz contract test selects the dispatch step by its unique stable name,
  not its position. Setup steps may be inserted without changing the test target.
  Its CI actions follow existing immutable SHA pins and use the tracked Python
  and Node version files, including triggering tests when those files change.
- SHA normalization is a usability suggestion, not a correctness repair.
  Strict accepted-SHA validation and the receiver's missing-manifest failure
  gate remain unchanged. No historical acceptance records were rewritten.
- The existing **Notify landing verification** display name is retained in this
  bounded correction. Its explicit-only trigger and the distinction between
  dispatch success and verification success are documented above.
- The heredoc comment on [PR 15](https://github.com/OKHP3/glee-fully-chai-chasers/pull/15#discussion_r3939108840)
  is a false positive: YAML removes the common block indentation, leaving
  `PYEOF` at column zero in the shell script. No receiver change is needed.
  [Receiver run 34240718717](https://github.com/OKHP3/glee-fully-chai-chasers/actions/runs/34240718717),
  inspected on 2026-09-08 at commit
  `3a40deea2b3e3007e72fc572688c9037cd937f33`, successfully executed both
  **Resolve target commit SHA and manifest list** and **Run landing verification**.
  That is evidence for the heredoc path, not blanket proof of every promotion.
