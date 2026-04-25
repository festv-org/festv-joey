# FESTV — Project Context (Claude Quick-Start)

> Read this file at the start of any new session to get up to speed fast.

---

## What is FESTV?

FESTV is a luxury event-planning marketplace that connects event planners (clients) with vendors — restaurants, caterers, entertainment, photographers, and florists. Planners browse vendors, create event requests, receive quotes, and book vendors with a deposit. Vendors manage their profile, incoming requests, and bookings through a dedicated dashboard. There is also an AI assistant named **Jess** embedded site-wide as a chat widget.

---

## Tech Stack

### Backend (`/backend/`)
| Tool | Version | Purpose |
|------|---------|---------|
| Node.js + Express | 4.18.3 | HTTP API server |
| TypeScript | 5.3.3 | Language |
| Prisma | 5.10.0 | ORM + migrations (PostgreSQL) |
| Zod | 3.22.4 | Request validation schemas |
| jsonwebtoken | 9.0.2 | JWT auth (access 7d + refresh 30d) |
| bcryptjs | 2.4.3 | Password hashing (12 rounds) |
| @anthropic-ai/sdk | 0.39.0 | Jess AI widget + PDF import |
| Resend | 6.9.3 | Email delivery |
| Multer + Sharp | — | File uploads + image processing |
| Socket.io | 4.7.4 | Real-time (configured, partially used) |
| pdf-parse | 1.1.1 | PDF text extraction |

### Frontend
There are **two** frontends. The active one is the static HTML frontend:

- **`/backend/public/`** — The real FESTV UI. Plain HTML + CSS + vanilla JS pages served by Express. All active development happens here.
- **`/frontend/`** — A legacy React/Vite/TailwindCSS SPA (React 18, React Router v6, Recharts). Still in the repo but **not the primary UI**. Treat it as a reference/scaffold.

### Deployment
- Deployed on **Render** (single web service)
- Render blueprint: `render.yaml` at both root and `/backend/`
- Build command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
- Start: `npm start` (runs `tsx src/index.ts`)
- Database: PostgreSQL on Render free tier
- Live URL: `festv.org`

---

## Folder Structure

```
festv-joey/
├── backend/
│   ├── public/              ← ACTIVE UI — all HTML pages live here
│   │   ├── festv-index.html
│   │   ├── signin.html
│   │   ├── accounttype.html
│   │   ├── vendorsetup.html
│   │   ├── vendordashboard.html
│   │   ├── vendorprofile.html
│   │   ├── plannerdashboard.html
│   │   ├── plannerquote.html
│   │   ├── browsevendors.html
│   │   ├── createevent.html
│   │   ├── admindashboard.html
│   │   ├── forgotpassword.html
│   │   ├── friends.html
│   │   ├── *approval.html (6 files — vendor-type-specific booking approval pages)
│   │   ├── jess-widget.js   ← Shared: Jess AI FAB chat widget
│   │   ├── profile-menu.js  ← Shared: profile dropdown + auth state
│   │   └── auth-chip.js     ← Shared: auth token utilities
│   ├── src/
│   │   ├── index.ts         ← Server entry, middleware, static file serving
│   │   ├── config/
│   │   │   ├── index.ts     ← All env config (JWT, DB, uploads, CORS, Stripe)
│   │   │   └── database.ts  ← Prisma client singleton
│   │   ├── controllers/     ← Business logic (16 controllers)
│   │   ├── routes/          ← Express routers (17 files), all mounted at /api/v1
│   │   ├── middleware/
│   │   │   ├── auth.ts      ← authenticate, requireProvider, requireClient, requireAdmin
│   │   │   └── errorHandler.ts
│   │   ├── services/        ← Service layer (email, notifications, etc.)
│   │   ├── utils/
│   │   │   └── validators.ts ← All Zod schemas
│   │   └── types/index.ts   ← TypeScript interfaces
│   ├── prisma/
│   │   ├── schema.prisma    ← Full DB schema (all models + enums)
│   │   ├── seed.ts          ← DB seed script
│   │   └── migrations/      ← Migration history
│   └── package.json
├── frontend/                ← Legacy React SPA (not the active UI)
├── roadMap.txt              ← Project roadmap and completed task log
├── FESTV_CONTEXT.md         ← This file
└── README.md                ← Outdated (says "CaterEase") — ignore
```

---

## Pages & Routes

All pages are in `/backend/public/`. They use vanilla JS with `fetch()` calls to `/api/v1`.

| File | What it does |
|------|-------------|
| `festv-index.html` | Landing page — hero, how it works, sign in / get started CTAs |
| `signin.html` | Login form. Stores `accessToken`, `refreshToken`, `user` in localStorage |
| `accounttype.html` | Registration — choose Planner or Vendor, fill details, create account |
| `vendorsetup.html` | Vendor onboarding — Step 1: business profile. Step 2: services + menu (PDF import or manual). Publishes to API on submit |
| `vendordashboard.html` | Vendor's main dashboard — Booked Events, Incoming Requests, Analytics, Messages, Services & Pricing, Portfolio |
| `vendorprofile.html` | Public vendor profile — hero, About+Contact strip, services, menu, reviews. Also doubles as the request-sending page when `fromEvent=1` is in the URL |
| `plannerdashboard.html` | Planner's main dashboard — Quotes Received, Saved Requests, Messages, Favorites, Quick Actions, Pending/Upcoming/Completed events |
| `plannerquote.html` | Quote detail page for planners — shows itemized pricing, 15% tax, estimated total, 10% deposit card, Book Vendor & Pay Deposit button |
| `browsevendors.html` | Search and filter vendors — category pills (enum values), price range, date availability. Cards link to vendorprofile |
| `createevent.html` | Multi-step event creator — pick vendor categories, choose vendors, fill event details, submit request |
| `admindashboard.html` | Admin controls — vendor verification, user management (not yet fully wired) |
| `forgotpassword.html` | Password reset request form |
| `friends.html` | Friends/guestlist page (placeholder, not wired to API) |
| `vendorapproval.html` | Vendor receives and reviews a quote request |
| `*approval.html` (5 more) | Vendor-type-specific approval pages (bartender, caterer, DJ, photographer, venue) |

---

## API Routes (`/api/v1`)

| Prefix | Controller | Notes |
|--------|-----------|-------|
| `/auth` | authController | register, login, refresh, forgot/reset password, me, add-role, switch-role |
| `/users` | userController | profile GET/PUT |
| `/providers` | providerController | profile CRUD, services CRUD, menu-items CRUD, search, availability |
| `/event-requests` | eventRequestController | client creates requests, vendor views them |
| `/quotes` | quoteController | vendor creates quotes, client accepts/declines |
| `/bookings` | bookingController | booking lifecycle, deposit tracking |
| `/favorites` | favoriteController | save/unsave vendors |
| `/reviews` | reviewController | post and fetch reviews |
| `/portfolio` | portfolioController | vendor photo/video portfolio |
| `/notifications` | notificationController | user notification feed |
| `/jess` | jessController | Jess AI chat + PDF import via Claude API |
| `/pdf-import` | pdfImportController | Upload vendor PDF → Claude extracts services/menu |
| `/admin` | adminController | Admin-only operations |
| `/verification` | verificationController | Email/phone verification codes |

---

## Database Models (Prisma)

Key models to know:

- **User** — `role` (primary) + `roles[]` (all). Status: ACTIVE, PENDING_VERIFICATION, SUSPENDED
- **ProviderProfile** — linked to User via `userId`. Has `primaryType`, `providerTypes[]`, `verificationStatus`, pricing fields
- **Service** — packages offered by a vendor (name, description, priceType, basePrice, features[])
- **MenuItem** — food/drink items (name, category, price, dietaryInfo[])
- **EventRequest** — a planner's request (eventType, date, guestCount, budget, selectedServices)
- **Quote** — vendor's response to a request (lineItems, totalAmount, depositRequired, status)
- **Booking** — confirmed engagement (status: PENDING_DEPOSIT → DEPOSIT_PAID → CONFIRMED → COMPLETED)

**Key Enums:**
```
ProviderType:  RESTO_VENUE | CATERER | ENTERTAINMENT | PHOTO_VIDEO | FLORIST_DECOR
BookingStatus: PENDING_DEPOSIT | DEPOSIT_PAID | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED
QuoteStatus:   DRAFT | SENT | VIEWED | ACCEPTED | REJECTED | EXPIRED
PriceType:     FLAT_RATE | PER_PERSON | PER_HOUR | CUSTOM
EventType:     WEDDING | CORPORATE | BIRTHDAY | ANNIVERSARY | ...
```

> ⚠️ The 5 ProviderType enums are canonical across the entire codebase. Never use old names (DJ, Photographer, Bartender, Restaurant, Venue) anywhere.

---

## Design System

All pages share these CSS variables and fonts (defined inline in each HTML `<style>` block):

```css
:root {
  --gold:       #C4A06A;   /* Primary brand — buttons, accents, highlights */
  --gold-light: #D9BF8C;   /* Lighter gold */
  --gold-dark:  #9C7A45;   /* Hover states */
  --bg:         #F5F3EF;   /* Page background — warm off-white/beige */
  --white:      #FFFFFF;
  --dark:       #1A1714;   /* Near-black — headings, dark sections */
  --charcoal:   #3A3530;   /* Body text */
  --muted:      #7A7068;   /* Secondary text, labels */
  --border:     rgba(0,0,0,0.09);
  --green:      #3A8A55;   /* Success states */
  --red:        #B84040;   /* Error states */
}
```

**Fonts** (loaded from Google Fonts):
- `'Cormorant Garamond'` — serif, for display text, headings, vendor names (weights 300–700)
- `'Montserrat'` — sans-serif, for body, labels, UI elements (weights 300–700)

**Visual language:** Luxury, editorial, warm neutrals. Gold accents throughout. Cards have `border-radius: 16px`, subtle borders, no hard shadows.

---

## Auth Flow (Frontend)

Every HTML page reads auth from `localStorage`:
```javascript
const token = localStorage.getItem('accessToken');
const user  = JSON.parse(localStorage.getItem('user') || '{}');
```

All authenticated API calls use:
```javascript
fetch('/api/v1/...', {
  headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
})
```

Token is set at page load — not refreshed mid-session in most pages. If a call returns 401/403, the page typically redirects to `signin.html`.

**Roles:**
- `CLIENT` — planners
- `PROVIDER` — vendors
- `ADMIN` — full access

---

## Data & State Management

- **No global state framework** — each HTML page is self-contained
- **localStorage** — `accessToken`, `refreshToken`, `user` (JSON), event drafts (`eventDraft_*`), favorites cache
- **In-memory JS vars** — page-level state (e.g. `pendingServices[]`, `window._bookingsMap`, `window._vendorPriceMap`)
- **API-first** — all real data comes from `/api/v1`. Mocked/fallback data is used only when API returns empty
- **`window._vendorDataReady`** — flag used on `vendorprofile.html` so draft restore waits for vendor API to load before trying to re-select services

---

## Shared JS Files

| File | Purpose |
|------|---------|
| `jess-widget.js` | Floating Jess AI chat button (bottom-right). Included on every page via `<script src="/jess-widget.js">`. Calls `/api/v1/jess/chat`. Has full inline CSS. |
| `profile-menu.js` | Top-right profile dropdown. Shows user name, role, sign out. Reads from localStorage. |
| `auth-chip.js` | Small auth utility helpers |

---

## Business Logic Notes

**Deposit calculation:** `Math.round(totalAmount * 1.15 * 0.10 * 100) / 100`
= 10% of (subtotal + 15% tax). Calculated in `quoteController.ts` and displayed in `plannerquote.html`.

**Quote flow:**
1. Planner creates EventRequest → vendor sees it in Incoming Requests
2. Vendor accepts + sends quote → quote appears in planner's dashboard
3. Planner views quote on `plannerquote.html` → clicks "Book Vendor & Pay Deposit"
4. Booking is created with status `PENDING_DEPOSIT`
5. Deposit payment → `DEPOSIT_PAID` → `CONFIRMED` (Stripe not yet wired)

**Vendor search:** Currently returns ALL providers (not VERIFIED only). Flip `verificationStatus` filter before launch.

---

## Current State

### ✅ Working end-to-end
- Full auth flow (register → verify email → login → dashboard)
- Planner flow: browse → vendor profile → create event → send request → receive quote → book
- Vendor flow: setup profile → receive requests → accept/send quote → manage bookings
- Jess AI widget (claude-haiku-4-5)
- PDF import (Claude AI extracts services/menu from vendor PDFs)
- Favorites (saved vendors, API-backed)
- Deposit calculation and display
- About + Contact strip on vendor profile and dashboard

### 🟡 Placeholder / Partial
- **Messages** — card UI exists on both dashboards, not wired to real conversations
- **Analytics** — card placeholder on vendor dashboard, no real data
- **Portfolio** — card UI exists with placeholder Unsplash images, Cloudinary not set up
- **Friends/Guestlist** — page exists, not wired to API
- **Admin dashboard** — page exists, not fully wired to admin routes
- **Stripe / payments** — deposit UI is built, actual payment not connected

### ❌ Not started
- Cloudinary image uploads
- Stripe deposit payment
- SMS verification (Twilio keys exist in old .env)
- OAuth (Google/Facebook sign-in)
- Mobile responsiveness pass
- `isAvailable` toggle for menu items

---

## Key Gotchas for New Devs

1. **Two frontends exist** — only `/backend/public/*.html` is the real UI. The `/frontend/` React app is legacy/unused.
2. **README says "CaterEase"** — the project was renamed to FESTV. Ignore the README.
3. **Safari caching** — all HTML pages need a `pageshow` bfcache listener in `<head>` and `Cache-Control: no-store` headers (already set in `index.ts`).
4. **UTC date bug** — always parse event dates as local midnight: `new Date(dateStr.split('T')[0] + 'T00:00:00')` not `new Date(dateStr)`.
5. **ProviderType enums** — only these 5 are valid everywhere: `RESTO_VENUE`, `CATERER`, `ENTERTAINMENT`, `PHOTO_VIDEO`, `FLORIST_DECOR`. Never use old names.
6. **`requireProvider` middleware** — checks role is `PROVIDER` or `ADMIN`. New vendor accounts need a provider profile created via `POST /providers/profile` before services can be saved.
7. **Git workflow** — always commit to `dev`, then merge to `main`, push both. Both branches should stay in sync.
8. **Render auto-deploys** from `main` branch.
