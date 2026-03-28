# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Purpose of this file:** This document provides complete context for any AI assistant continuing development on Urban Wealth. It captures the owner's vision, architectural decisions, development philosophy, and established patterns. Read this before writing any code.

---

## 1. What Is Urban Wealth

Urban Wealth is a **fractional real estate investment platform** focused on the European market. Users browse curated properties, calculate projected returns (yield + appreciation), and invest in fractional shares starting from €50.

**This is a simulated platform** — no real money is exchanged. The goal is to build a production-grade codebase that demonstrates real-world architecture, not to launch a live fintech product. However, code quality, security, and architecture should be treated as if it were going to production.

The aesthetic is **"investor-grade"** — think minimalist, sophisticated, premium. Neutral tones (alabaster/sand in light mode, obsidian/charcoal in dark mode), clean typography (Inter for body, Outfit for display headings), subtle animations. Not flashy, not startup-y. Think private wealth management portal, not a consumer app.

---

## 2. The Owner's Development Philosophy

These are non-negotiable principles the owner has established. Follow them without question:

### 2.1 Architecture-First, Always

The owner explicitly requested that component architecture be planned **before** building features. Every component must:

- Live in its own file (never inline a component in a page file)
- Be placed according to its scope:
  - **Page-specific** → `app/<route>/_components/ComponentName.tsx`
  - **Shared across pages** → `src/components/<domain>/ComponentName.tsx`
  - **Pure UI primitives** → `src/components/ui/ComponentName.tsx`
- The `_components/` folder convention (underscore prefix) is intentional — Next.js ignores these in routing

### 2.2 Mobile-First Mindset (React Native Planned)

The owner explicitly stated: **"I will have a React Native app in the future."** This drove the entire package architecture:

- **`packages/core`** — Framework-agnostic business logic: entities, validators (Zod schemas), repository interfaces, use-cases. Zero React imports. This package will be consumed by both web and mobile.
- **`packages/ui`** — Platform-agnostic shared logic: hooks (like `useInvestmentCalculator`), type contracts (like `CalcRowProps`, `MetricProps`, `SummaryCardProps`). No JSX — just TypeScript types and pure logic. React Native will import from here.
- **`packages/web`** — The Next.js app. Web-specific UI components, API routes, providers. This is the only package that imports React DOM.

When the React Native app is created, it should:
1. Import entities, validators, and use-cases from `@urban-wealth/core`
2. Import shared hooks and types from `@urban-wealth/ui`
3. Implement its own native UI components using those contracts

### 2.3 Testing Strategy

The owner chose a pragmatic testing approach:

- **Unit tests** (Jest) cover business logic in `packages/core` — validators, use-cases, mock data integrity. 44 tests.
- **E2E tests** (Playwright) cover real user flows in a real browser — registration, login, property browsing, investing, theme toggle, dashboard. 20 tests.
- **No component tests** — the owner explicitly rejected these as redundant with E2E: *"Don't implement this stuff. I think it will be redundant or overkill since we will have E2E."*
- Test documentation lives in `docs/TESTING.md` and must be kept updated when tests change.

### 2.4 Route Groups Over Flat Files

The owner asked about the `(home)` route group and chose to use it. The homepage lives at `app/(home)/page.tsx` instead of `app/page.tsx`. The parentheses are a Next.js convention — they group files without affecting the URL. The route is still `/`.

---

## 3. Technical Architecture

### 3.1 Monorepo Structure

```
urban-wealth/
├── packages/
│   ├── core/                 # @urban-wealth/core
│   │   ├── src/entities/     # Property, User, Investment types
│   │   ├── src/validators/   # Zod schemas (property, user, investment)
│   │   ├── src/repositories/ # Interface contracts (IPropertyRepository, IInvestmentRepository)
│   │   ├── src/use-cases/    # Business operations (getProperties, investInProperty, etc.)
│   │   └── src/mockData.ts   # 8 seeded European properties
│   │
│   ├── ui/                   # @urban-wealth/ui
│   │   ├── src/hooks/        # calculateInvestment (pure math, no React)
│   │   └── src/types/        # Shared prop contracts (CalcRowProps, MetricProps, etc.)
│   │
│   └── web/                  # @urban-wealth/web (Next.js 15)
│       ├── src/app/
│       │   ├── (home)/               # Homepage (route group, URL = /)
│       │   │   ├── page.tsx          # Slim shell
│       │   │   └── _components/      # HeroSection, StatsSection, PropertiesSection
│       │   ├── properties/[id]/
│       │   │   ├── page.tsx
│       │   │   └── _components/      # InvestmentCalculator, ConfirmModal, Metric, CalcRow, RiskDisclaimer
│       │   ├── dashboard/
│       │   │   ├── page.tsx
│       │   │   └── _components/      # SummaryCard
│       │   ├── how-it-works/
│       │   │   ├── page.tsx
│       │   │   └── _components/      # Step, FaqItem
│       │   ├── login/page.tsx
│       │   ├── register/page.tsx
│       │   └── api/                  # API routes
│       │       ├── auth/             # register, login, refresh, logout
│       │       ├── properties/       # list + [id] detail
│       │       ├── investments/      # create
│       │       └── dashboard/        # portfolio
│       ├── src/components/
│       │   ├── ui/                   # FormField, Modal (shared across pages)
│       │   ├── property/             # PropertyCard, PropertyFilters, StatusBadge
│       │   ├── layout/              # Navbar, Footer
│       │   └── states/              # LoadingSkeleton, ErrorState, EmptyState
│       ├── src/lib/                  # prisma, jwt, auth, rate-limit, csrf, constants
│       ├── src/providers/            # AuthProvider, QueryProvider, ThemeProvider
│       └── prisma/                   # schema.prisma, seed.ts
│
├── e2e/                      # Playwright E2E tests
│   ├── global-setup.ts       # Seeds test user before suite
│   ├── auth.spec.ts          # Registration + login flows
│   ├── properties.spec.ts    # Browsing + filtering + detail
│   ├── investment.spec.ts    # Full investment flow
│   └── navigation.spec.ts   # Theme toggle, HIW, dashboard
│
├── docs/
│   └── TESTING.md            # Full test-by-test documentation
│
├── playwright.config.ts
└── package.json              # Turborepo + Yarn workspaces
```

### 3.2 Tech Stack

| Concern | Choice | Why |
|---|---|---|
| Monorepo | Turborepo + Yarn 1.x workspaces | Simple, proven, fast |
| Framework | Next.js 15 (App Router) | SSR, API routes, file-based routing |
| Language | TypeScript 5.9 (strict, no `any`) | Type safety across all packages |
| Styling | Tailwind CSS v4 | Utility-first, `@theme` for design tokens |
| Animations | Framer Motion | Scroll-triggered parallax, micro-animations |
| Theming | next-themes | Dark/light mode with system detection |
| Auth | JWT (jose) + bcrypt | HttpOnly cookie-based, access + refresh tokens |
| Database | Prisma ORM → Supabase (PostgreSQL) | Type-safe queries, managed hosting |
| Validation | Zod | Shared between client forms and API routes |
| Forms | React Hook Form + @hookform/resolvers | Performance-optimized, Zod integration |
| Data Fetching | TanStack Query v5 | Caching, background refetch, loading states |
| Icons | Lucide React | Consistent, tree-shakeable |
| Unit Testing | Jest + ts-jest | Fast, simple |
| E2E Testing | Playwright | Real browser, Next.js recommended |

### 3.3 Design System

The design system uses CSS custom properties mapped to Tailwind's `@theme` directive:

- **Light mode**: Alabaster backgrounds, charcoal text, sand accents
- **Dark mode**: Rich charcoal/obsidian backgrounds, ivory text
- **Fonts**: Inter (body, 300–700), Outfit (headings, 500–700)
- **Accent**: Warm taupe/stone primary (`oklch(0.55 0.03 60)` light, `oklch(0.72 0.04 60)` dark)
- **Positive**: Muted emerald for yields/gains
- **Shadows**: Multi-layer, subtle depth (card, card-hover, elevated, modal)
- **No generic colors** — everything is curated via oklch

### 3.4 API Security

- JWT access tokens (15 min) + refresh tokens (7 days) in HttpOnly cookies
- Password hashing: bcrypt cost factor 12
- Sliding window rate limiting (5 login attempts / 15 min, 10 invest / 15 min)
- `E2E_TESTING=true` env var bypasses rate limiting during Playwright tests
- CSRF double-submit cookie with HMAC
- Security headers: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Redirect allowlist validation

### 3.5 Data Model

Currently uses **mock data** (`packages/core/src/mockData.ts`) for properties. Auth (users, tokens) uses **real Prisma + Supabase**. Prisma schema includes:

- `users` — id, fullName, email, passwordHash, role (USER/ADMIN)
- `properties` — would mirror the Property entity (currently mock)
- `investments` — userId, propertyId, amount, ownershipPercentage, status
- `refresh_token_denylist` — for token rotation

---

## 4. Current State (What's Done)

| Feature | Status |
|---|---|
| Homepage with parallax hero, stats, property grid | ✅ Complete |
| Property detail with investment calculator | ✅ Complete |
| User registration with password requirements | ✅ Complete |
| Login with JWT auth | ✅ Complete |
| Token refresh with rotation | ✅ Complete |
| Dashboard (portfolio overview) | ✅ Complete |
| How It Works (4 steps + FAQ) | ✅ Complete |
| Dark/light theme toggle | ✅ Complete |
| Component architecture refactor | ✅ Complete |
| `packages/ui` for React Native prep | ✅ Complete |
| 44 unit tests | ✅ Passing |
| 20 E2E tests | ✅ Passing |

---

## 5. What's NOT Done Yet (Next Steps)

These are logical next steps the owner has not yet requested but would follow naturally:

1. **React Native app** — Consume `@urban-wealth/core` and `@urban-wealth/ui`, implement native UI
2. **Real property data** — Migrate from mock data to Prisma-backed properties
3. **Investment persistence** — Currently investments return mock results; wire to real DB
4. **User profile page** — Settings, password change, account management
5. **Admin panel** — Property CRUD, user management
6. **CI/CD pipeline** — GitHub Actions running `yarn test:all` on PRs
7. **Responsive refinements** — Mobile-first has been considered but could be more thorough

---

## 6. Rules For AI Assistants

When continuing development:

1. **Never inline components in page files.** Extract to `_components/` (page-specific) or `components/` (shared).
2. **Never use `any` type.** TypeScript strict mode is enforced.
3. **Keep packages/core and packages/ui framework-agnostic.** No React imports, no JSX, no Next.js-specific code.
4. **Update `docs/TESTING.md`** when adding or modifying tests.
5. **Update `README.md`** when adding new scripts or changing architecture.
6. **Use the established design system.** Don't introduce new colors ad-hoc — use the CSS variables defined in `globals.css`.
7. **Rate limiting is bypassed during E2E tests** via `E2E_TESTING=true`. Don't remove this.
8. **The `(home)` route group** is intentional. Don't move the homepage back to `app/page.tsx`.
9. **Test-Driven Development is preferred.** When adding new features, write tests alongside or before implementation.
10. **The owner values architecture, scalability, and clean separation** over speed. Don't take shortcuts that compromise structure.
11. **All page shells should be slim.** Business logic in hooks/use-cases, UI logic in colocated `_components/`. Pages are just composition.

---

## 7. Running The Project

```bash
# Install
yarn install

# Dev server
yarn workspace @urban-wealth/web dev

# Lint & type-check
yarn lint
yarn check-types

# Unit tests
yarn workspace @urban-wealth/core test

# Single test file
yarn workspace @urban-wealth/core test -- --testPathPattern=validators

# E2E tests (starts dev server automatically if not running)
# Requires seeded DB and E2E_TESTING=true; test user: e2e@urbanwealth.test / TestPass1!
yarn test:e2e

# All tests
yarn test:all

# Database
yarn workspace @urban-wealth/web prisma:push      # sync schema (no migration file)
yarn workspace @urban-wealth/web prisma:migrate    # create migration + push
yarn workspace @urban-wealth/web prisma:generate   # regenerate client
yarn workspace @urban-wealth/web prisma:seed       # seed DB (includes E2E test user)
```

Environment variables go in `packages/web/.env.local`:
- `DATABASE_URL` — Supabase connection pooler URL
- `DIRECT_URL` — Supabase direct connection URL
- `JWT_ACCESS_SECRET` — 32-byte base64 secret
- `JWT_REFRESH_SECRET` — 32-byte base64 secret

---

*This document was written on 2026-03-28 and reflects the state of the codebase at that time. If the codebase has evolved significantly since, re-audit the structure before relying on specifics.*
