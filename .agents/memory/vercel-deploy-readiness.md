---
name: Vercel deployment readiness
description: The monorepo frontend has an explicit Vercel build/output config and can use an external API base URL.
---

The website can build on Vercel from the repository root using the workspace frontend filter and the nested static output directory. Set `VITE_API_BASE_URL` in Vercel when the API is hosted separately; otherwise the static frontend falls back to its local seed experience while API mutations need a backend. Use the shared API URL helper for raw fetches and API-hosted image paths as well as generated client calls.

**Why:** The web artifact and Express API are separate services, while Vercel hosts the frontend build unless an API deployment is configured too. A raw same-origin upload request and relative product-image URLs bypass the generated client’s configured API base and 404 on the static host.

**How to apply:** Keep the frontend build command and output directory aligned with `vercel.json`, route all API calls and API-served assets through the shared URL helper, and configure the API origin before expecting live products, uploads, chat, or seller mutations in the Vercel deployment.