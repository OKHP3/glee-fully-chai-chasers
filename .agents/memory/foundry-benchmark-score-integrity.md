---
name: Foundry benchmark score integrity
description: Rules for keeping manually graded Foundry benchmark aggregates honest after strict re-grades and targeted reruns.
---

Treat every expectation as a strict conjunction: if a response covers only part
of an expectation, it fails. Do not infer an omitted requirement from the skill
body or from the hypothetical's narrower focus.

**Why:** Manual evidence corrections can leave a run's aggregate score attached
to the wrong eval or inconsistent with its own expectation booleans, producing
a benchmark that looks valid but cannot be recomputed.

**How to apply:** After every re-grade or targeted rerun, calculate each run's
passed count and pass rate directly from its expectation booleans, then
recalculate configuration means and delta. Re-sync any public mirror after the
benchmark changes.