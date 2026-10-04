---
name: API schema generation
description: Prevent duplicate exports after regenerating API Zod types.
---

When API code generation updates `lib/api-zod`, keep its package entry point explicitly exporting the generated API module instead of also wildcard-exporting generated types when those types duplicate names from the API module.

**Why:** A typecheck after codegen produced TS2308 duplicate-export errors for request and response type names.

**How to apply:** After running API codegen, inspect `lib/api-zod/src/index.ts` and run `pnpm run typecheck:libs`; restore the explicit export if generation reintroduces the colliding wildcard.