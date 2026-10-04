---
name: API schema generation
description: Prevent duplicate exports after regenerating API Zod types.
---

When API code generation updates `lib/api-zod`, keep its package entry point explicitly exporting the generated API module instead of also wildcard-exporting generated types when those types duplicate names from the API module. For UUID request fields, use a UUID regex pattern rather than OpenAPI `format: uuid` if generation emits `zod.uuid()` for this workspace's Zod 3.

**Why:** Codegen has produced both duplicate-export errors and a `zod.uuid()` call unsupported by the workspace's Zod 3 dependency.

**How to apply:** After running API codegen, inspect `lib/api-zod/src/index.ts`, use `.string().regex()`-compatible OpenAPI patterns for UUID fields, and run `pnpm run typecheck:libs`.