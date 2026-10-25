# NextNova — Future Tech Marketplace

A futuristic technology marketplace built with **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4**.
It catalogues real, already-released AI hardware alongside officially announced future launches —
with live search, category filters, side-by-side comparison, a buying flow, an admin dashboard and a
built-in AI assistant.

## Sections

| Section | What it holds |
| --- | --- |
| **Launched Products** | AI cars, humanoid robots, robot dogs, smart glasses, AI machines, drones and wearables you can order today — price, specifications and an official purchase link for each. |
| **Upcoming Launches** | Officially announced technology with an expected launch window and specifications. Anything not confirmed by the vendor is labelled **Reported** instead of **Official**. |

Data lives in `src/lib/seed-products.ts` and was checked against vendor pages (Tesla, Apple, Meta,
Unitree, Boston Dynamics, NVIDIA, DJI, Oura) and press reporting in October 2026.

## Features

- **Live search** across names, brands, categories, taglines and tags
- **Category filters** derived from the catalogue
- **Comparison** — pick up to 3 products and inspect them in a side-by-side table
- **Buying flow** — cart → checkout → order confirmation (demo checkout, no payment provider)
- **Admin dashboard** (`/admin`) — create, edit, delete and reset products
- **AI assistant** — floating chat widget answering questions from the catalogue (`/api/chat`)
- **Dark / light theme** with a switch in the header, remembered in `localStorage`
- **3D animations** — pointer-tracked card tilt, floating hero stack, scroll reveals (all respect `prefers-reduced-motion`)
- **SEO** — per-product metadata, canonical URLs, OpenGraph/Twitter cards, `Product` / `ItemList` /
  `WebSite` JSON-LD, `sitemap.xml`, `robots.txt`

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

Optional environment (see `.env.example`):

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

It sets the canonical origin used by metadata, JSON-LD, `sitemap.xml` and `robots.txt`.

## How state is stored

There is no database in this project, so the catalogue, cart and orders persist per browser:

| Data | Key | Where |
| --- | --- | --- |
| Catalogue edits | `nextnova:catalog:v1` | `src/lib/store.ts` |
| Cart | `nextnova:cart:v1` | `src/lib/cart-store.ts` |
| Orders | `nextnova:orders:v1` | `src/lib/orders.ts` |
| Theme | `nextnova:theme` | `src/components/theme-toggle.tsx` |

Server rendering always uses the seed catalogue, so every product page is statically prerendered and
search-engine friendly; edits made in the admin dashboard merge in on the client. **Reset catalogue**
in `/admin` clears the overrides.

To move to a real backend, replace the three store modules with `fetch` calls — the components only
ever read through `useProducts()` / `useCart()` / `useOrders()`.

## Project structure

```
src/
  app/
    page.tsx                 # home: hero + two marketplace sections
    products/[slug]/page.tsx # product detail, metadata + Product JSON-LD
    cart/  checkout/         # buying flow
    admin/page.tsx           # admin dashboard
    api/chat/route.ts        # AI assistant endpoint
    sitemap.ts  robots.ts  not-found.tsx
  components/                # hero, marketplace, cards, compare, chat, admin, ...
  lib/                       # types, seed data, stores, assistant engine
```

## Switching the assistant to a real LLM

`src/app/api/chat/route.ts` accepts `{ message, catalog }` and returns `{ reply, slugs }`. Point the
handler at a model call and keep the widget untouched.
