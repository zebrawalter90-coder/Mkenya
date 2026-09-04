---
name: Vercel deployment readiness
description: The monorepo frontend has an explicit Vercel build/output config and can use an external API base URL.
---

The website can build on Vercel from the repository root using the workspace frontend filter and the nested static output directory. Set `VITE_API_BASE_URL` in Vercel when the API is hosted separately; otherwise the static frontend falls back to its local seed experience while API mutations need a backend.

**Why:** The web artifact and Express API are separate services, while Vercel hosts the frontend build unless an API deployment is configured too.

**How to apply:** Keep the frontend build command and output directory aligned with `vercel.json`, and configure the API origin before expecting live products, uploads, chat, or seller mutations in the Vercel deployment.