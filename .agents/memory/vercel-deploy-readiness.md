---
name: Vercel deployment readiness
description: Hosting constraint and required services for the shop's Vercel-only deployment.
---

The user has chosen Vercel-only production hosting and wants existing shop data preserved during migration.

**Why:** A static frontend alone cannot handle uploads or persist shop data; production services must remain on Vercel rather than Replit.

**How to apply:** Keep production API requests same-origin through Vercel Functions, use Vercel Blob for public product images and a Vercel-connected PostgreSQL provider for records. Replit storage and database may be read for one-time migration only; do not publish a Replit runtime API. Confirm Vercel resources and environment before deploying.