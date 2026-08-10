---
name: pnpm root catalog drift
description: Why off-catalog version pins in the workspace root package break plugin typechecking in artifact packages
---

The workspace root package.json is an implicit pnpm workspace member. If it pins a dependency (e.g. vite, @types/node) at a different version than the `catalog:` entry in pnpm-workspace.yaml, two instances land in the store, and packages without their own copy (plugin d.ts files resolving bare `vite`) walk up to the root `node_modules` and bind to the wrong one — producing cross-instance type collisions (e.g. Rolldown vs Rollup PluginOption).

**Why:** This silently forced vite.config.ts out of the sandbox tsconfig include, hiding real type errors from CI.

**How to apply:** Keep root deps that also appear in the catalog on `"catalog:"`. Even the same semver version duplicates when peer keys (like @types/node) differ — align those too. Diagnose with `ls node_modules/.pnpm | grep '^<pkg>@'`.
