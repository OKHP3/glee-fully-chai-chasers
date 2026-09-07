---
name: GitHub tree API safety
description: Safety constraint for synchronizing repository commits through the GitHub Git Data API.
---

When creating a GitHub tree through the Git Data API, always provide the verified parent commit's full tree SHA as `base_tree` and verify the resulting recursive tree before advancing the branch ref.

**Why:** Omitting `base_tree` can produce a syntactically valid but sparse commit containing only the explicitly listed path, which can damage the hosted branch even when the API reports success.

**How to apply:** Before any API-based push, verify the branch parent, fetch its commit/tree metadata, create the new tree from that base, advance the ref without force, and confirm expected sentinel files plus the recursive tree size afterward.