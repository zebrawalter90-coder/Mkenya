# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## ShopWithElizabeth App (`artifacts/shop-with-elizabeth`)

A Kenyan fashion marketplace built as a frontend-only React + Vite app. All data persisted in localStorage.

### Features
- **20 pre-seeded products** — Kenyan/African fashion items with picsum.photos images (key: `elizabeth_products_v2`)
- **Explore page** — search, category filter (Clothing, Accessories, Fabric, Footwear, Jewelry, Beauty, Other), and sort options
- **Community Chat** — localStorage-based chat with 2s polling, WhatsApp-style UI
- **User identity** — UUID-based session with user-set display name (keys: `elizabeth_user_id`, `elizabeth_username`)
- **Ownership** — products have `ownerId`; only the poster sees Edit/Delete buttons on their own cards
- **Like toggle** — tracks `likedBy[]` so each user can only like once (toggles on re-click)
- **Comments with attribution** — comments stored as `{ id, userId, username, text, timestamp }` objects
- **Animated hero** — word-by-word spring animation with floating bubble background elements
- **Bubbling images** — Framer Motion continuous float animation, each card at different timing
- **Category chips** on Add Product form; category badge displayed on every product card

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
