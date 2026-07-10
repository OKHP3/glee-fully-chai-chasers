---
name: Expose modifier-applied flags on spin/round result types
description: When a bonus modifier (e.g. a doubler) can scale an awarded value, add an explicit boolean field rather than having tests re-derive whether it applied.
---

In the cascading-slot engine, a "double sparkle" specialty wild could double
that spin's free-spin award. The oracle test originally asserted
`result.freeSpinsAwarded === freeSpinsForCascades(result.cascades)`, which
broke as soon as doubling could legitimately apply.

The fix: add a `doubleSparkleApplied: boolean` field to the result type,
set it alongside the doubled value, and have the test branch on it
(`expected * (applied ? 2 : 1)`) instead of loosening the assertion or
trying to re-infer whether doubling happened from other fields.

**Why:** Loosening a test to "just don't fail" hides real regressions;
re-deriving modifier state from indirect evidence is fragile. An explicit
flag on the result keeps the test precise and gives the UI a clean signal
to show "doubled!" feedback too.

**How to apply:** Any time a modifier/multiplier can conditionally alter an
awarded amount, add a same-shape boolean/enum field to the result type
alongside it, don't just widen the assertion that checks the final number.
