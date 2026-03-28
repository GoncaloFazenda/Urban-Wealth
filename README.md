# Urban Wealth

Fractional real estate investment platform. Browse curated European properties, calculate projected returns, and invest in fractional shares starting from €50.

> **Note:** This is a simulated platform — no real transactions or investments are made.

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + Yarn Workspaces |
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode, no `any`) |
| Styling | Tailwind CSS v4 |
| Auth | JWT (jose) + bcrypt |
| Database | Prisma → Supabase (PostgreSQL) |
| Validation | Zod |
| Forms | React Hook Form |
| Data | TanStack Query v5 |
| Testing | Jest (unit) + Playwright (E2E) |

## Architecture

```
urban-wealth/
├── packages/core/          # Framework-agnostic business logic
│   ├── src/entities/       # Property, User, Investment types
│   ├── src/validators/     # Zod schemas
│   ├── src/repositories/   # Interface contracts
│   ├── src/use-cases/      # Business operations
│   └── src/mockData.ts     # 8 European properties
├── packages/ui/            # Platform-agnostic shared logic (hooks, types)
├── packages/web/           # Next.js application
│   ├── src/app/            # Pages + API routes
│   │   ├── (home)/         # Homepage route group
│   │   │   └── _components/ # Colocated homepage components
│   │   ├── properties/[id]/
│   │   │   └── _components/ # Colocated detail components
│   │   ├── dashboard/_components/
│   │   └── how-it-works/_components/
│   ├── src/components/     # Shared UI components
│   ├── src/lib/            # Auth, JWT, rate-limit, CSRF
│   └── prisma/             # Schema + seed
├── e2e/                    # Playwright E2E tests
└── docs/                   # Test coverage & documentation
```

## Getting Started

### Prerequisites

- Node.js ≥ 20
- Yarn 1.x
- Supabase project (for database)

### Setup

```bash
# Install dependencies
yarn install

# Configure environment
cp packages/web/.env.example packages/web/.env.local
# Edit .env.local with your Supabase credentials and JWT secrets

# Generate Prisma client
yarn workspace @urban-wealth/web prisma:generate

# Push schema to database
yarn workspace @urban-wealth/web prisma:push

# Run core tests
yarn workspace @urban-wealth/core test

# Start dev server
yarn workspace @urban-wealth/web dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `packages/web/.env.local`:

```env
# Supabase / PostgreSQL
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# JWT secrets (generate with: openssl rand -base64 32)
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Scripts

| Command | Description |
|---|---|
| `yarn workspace @urban-wealth/web dev` | Start dev server |
| `yarn workspace @urban-wealth/web build` | Production build |
| `yarn workspace @urban-wealth/core test` | Run unit tests (44) |
| `yarn test:e2e` | Run E2E tests (20, Playwright) |
| `yarn test:all` | Run all tests (unit + E2E) |
| `yarn workspace @urban-wealth/web prisma:generate` | Generate Prisma client |
| `yarn workspace @urban-wealth/web prisma:push` | Sync schema to DB |
| `yarn workspace @urban-wealth/web prisma:seed` | Seed database |

## Pages

| Route | Description |
|---|---|
| `/` | Property listings with filters and sorting |
| `/properties/[id]` | Detail page with investment calculator |
| `/register` | Account creation with password requirements |
| `/login` | Authentication with redirect support |
| `/dashboard` | Portfolio summary and transaction history |
| `/how-it-works` | 4-step guide and FAQ |

## Testing

**64 tests** across two layers:

| Layer | Runner | Tests | What it covers |
|---|---|---|---|
| Unit | Jest | 44 | Zod validators, use-cases, mock data integrity |
| E2E | Playwright | 20 | Auth flows, property browsing, investment flow, theme toggle, dashboard |

See [`docs/TESTING.md`](docs/TESTING.md) for full test-by-test documentation.

## Security

- **Auth**: JWT access/refresh tokens in HttpOnly cookies
- **Passwords**: bcrypt (cost factor 12)
- **Rate limiting**: Sliding window (5 login attempts / 15 min)
- **CSRF**: Double-submit cookie with HMAC verification
- **Headers**: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Redirects**: Allowlist validation

## Deployment

Configured for Vercel:

```bash
# Root directory: packages/web
# Build command: prisma generate && next build
# Output directory: .next
```

Required environment variables must be set in the Vercel dashboard.

## License

MIT
