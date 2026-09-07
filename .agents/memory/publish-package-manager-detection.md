---
name: Publish package-manager detection
description: Replit publishing can select npm when a pnpm workspace retains a conflicting root package-lock.
---

In a pnpm workspace that uses the `catalog:` protocol, keep only the canonical pnpm lockfile at the repository root and declare the exact pnpm version through the root package manifest's package-manager field.

**Why:** A publish attempt selected `npm install` when both root npm and pnpm lockfiles were tracked. npm then failed before the build with `EUNSUPPORTEDPROTOCOL` because it cannot parse pnpm's `catalog:` dependency specifier. The workspace stack setting and pnpm commands in artifact production config did not prevent this early automatic-install choice.

**How to apply:** If publishing unexpectedly runs npm in a pnpm workspace, inspect root lockfiles first. Remove stale competing root lockfiles, retain the canonical pnpm lockfile, declare pnpm explicitly, and verify with a frozen pnpm install before retrying Publish.