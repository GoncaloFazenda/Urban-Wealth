# Urban Wealth — Test Coverage & Documentation

> **Auto-updated** — this file tracks every test in the project.

---

## Summary

| Layer | Package | Runner | Tests | Status |
|---|---|---|---|---|
| Unit | `@urban-wealth/core` | Jest | 44 | ✅ All passing |
| E2E | Root (`e2e/`) | Playwright | 20 | ✅ All passing |
| **Total** | | | **64** | ✅ |

---

## Unit Tests (`packages/core/__tests__/`)

**Runner:** `yarn workspace @urban-wealth/core test`

### `validators.test.ts` — 22 tests

| Suite | Test | Status |
|---|---|---|
| Property Validators | accepts valid property | ✅ |
| Property Validators | rejects invalid status | ✅ |
| Property Validators | rejects negative totalValue | ✅ |
| Property Validators | rejects funded > 100 | ✅ |
| Property Validators | rejects empty photoUrls | ✅ |
| Property Validators | accepts all valid statuses | ✅ |
| Property Validators | createPropertySchema omits id/createdAt | ✅ |
| User › passwordSchema | accepts strong password | ✅ |
| User › passwordSchema | rejects < 8 chars | ✅ |
| User › passwordSchema | rejects no uppercase | ✅ |
| User › passwordSchema | rejects no number | ✅ |
| User › passwordSchema | rejects no special char | ✅ |
| User › registerSchema | accepts valid registration | ✅ |
| User › registerSchema | rejects mismatched passwords | ✅ |
| User › registerSchema | rejects invalid email | ✅ |
| User › registerSchema | rejects empty full name | ✅ |
| User › loginSchema | accepts valid login | ✅ |
| User › loginSchema | rejects invalid email | ✅ |
| Investment Validators | accepts valid investment | ✅ |
| Investment Validators | rejects zero amount | ✅ |
| Investment Validators | rejects negative amount | ✅ |
| Investment Validators | rejects non-UUID propertyId | ✅ |

### `use-cases.test.ts` — 12 tests

| Suite | Test | Status |
|---|---|---|
| getProperties | returns all when no filters | ✅ |
| getProperties | filters by status | ✅ |
| getProperties | filters by location | ✅ |
| getPropertyById | returns property by ID | ✅ |
| getPropertyById | returns null for non-existent | ✅ |
| investInProperty | creates investment successfully | ✅ |
| investInProperty | throws for non-existent property | ✅ |
| investInProperty | throws for non-open property | ✅ |
| investInProperty | throws when amount exceeds remaining | ✅ |
| investInProperty | calculates financials correctly | ✅ |
| getUserPortfolio | returns empty portfolio | ✅ |
| getUserPortfolio | aggregates investments correctly | ✅ |

### `mockData.test.ts` — 10 tests

| Suite | Test | Status |
|---|---|---|
| Mock Data | has 5–10 properties | ✅ |
| Mock Data | has unique IDs | ✅ |
| Mock Data | has all three statuses | ✅ |
| Mock Data | consistent platform fee rate | ✅ |
| Mock Data | every property has ≥1 photo URL | ✅ |
| Mock Data | funded = 100% and 0 shares | ✅ |
| Mock Data | open = <100% and >0 shares | ✅ |
| Mock Data | unique locations extracted | ✅ |
| Mock Data | every property passes Zod validation | ✅ |
| Mock Data | has investment statuses | ✅ |

---

## E2E Tests (`e2e/`)

**Runner:** `yarn test:e2e` (Playwright + Chromium)

### `auth.spec.ts` — 5 tests

| Test | What it verifies | Status |
|---|---|---|
| should register a new user and redirect to homepage | Full registration flow → redirect to `/` | ✅ |
| should show validation errors for invalid registration | Empty form submission stays on `/register` | ✅ |
| should login with valid credentials | Login → redirect to `/` | ✅ |
| should show error for invalid login credentials | Wrong password → error message visible | ✅ |
| should navigate between login and register pages | Cross-links work correctly | ✅ |

### `properties.spec.ts` — 7 tests

| Test | What it verifies | Status |
|---|---|---|
| should display the homepage with hero section | Hero heading + CTA visible | ✅ |
| should display the stats section | Avg. Yield, Investors, Funded metrics visible | ✅ |
| should load and display property cards | Property grid renders with ≥1 card | ✅ |
| should filter properties by status | "Fully Funded" filter → URL updates | ✅ |
| should navigate to property detail page | Card click → detail page with key sections | ✅ |
| should display property detail with working calculator | Amount input → projections appear | ✅ |
| should navigate back to portfolio from detail page | "Back to Portfolio" → returns to `/` | ✅ |

### `investment.spec.ts` — 2 tests

| Test | What it verifies | Status |
|---|---|---|
| should complete the full investment flow | Login → property → amount → review → confirm → success toast | ✅ |
| should redirect unauthenticated user to login | Invest without auth → redirect to `/login?redirect=...` | ✅ |

### `navigation.spec.ts` — 6 tests

| Test | What it verifies | Status |
|---|---|---|
| should toggle between light and dark mode | Theme toggle changes `<html>` class | ✅ |
| should persist theme preference across navigation | Theme persists after page navigation | ✅ |
| should display all steps (How It Works) | All 4 step headings visible | ✅ |
| should display FAQ with expandable items | FAQ accordion opens on click | ✅ |
| should redirect to login if not authenticated (Dashboard) | Unauthenticated → handled gracefully | ✅ |
| should display dashboard when authenticated | Login → Dashboard → "Portfolio Overview" visible | ✅ |

---

## Commands

```bash
# Run unit tests only
yarn workspace @urban-wealth/core test

# Run E2E tests only (uses existing dev server or starts one)
yarn test:e2e

# Run everything
yarn test:all
```

## Notes

- E2E tests use `E2E_TESTING=true` env var to bypass rate limiting during test runs
- A test user (`e2e@urbanwealth.test` / `TestPass1!`) is seeded via `globalSetup` before E2E tests
- Registration tests generate unique emails with `Date.now()` to avoid collisions
- Playwright is configured to reuse an existing dev server locally (CI starts a fresh one)
