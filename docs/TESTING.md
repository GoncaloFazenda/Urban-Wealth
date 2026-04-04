# Urban Wealth — Test Coverage & Documentation

> **Auto-updated** — this file tracks every test in the project.

---

## Summary

| Layer | Package | Runner | Tests | Status |
|---|---|---|---|---|
| Unit | `@urban-wealth/core` | Jest | 44 | ✅ All passing |
| E2E | Root (`e2e/`) | Playwright | 79 | ✅ All passing |
| **Total** | | | **123** | ✅ |

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

### `investment.spec.ts` — 4 tests

| Test | What it verifies | Status |
|---|---|---|
| should complete the full investment flow | Login → property → amount → review → confirm → success toast | ✅ |
| should show new investment in dashboard after investing | Invest → dashboard holding amount increases | ✅ |
| should update property funded percentage after investing | Funded % increases after investment | ✅ |
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

### `properties-listing.spec.ts` — 6 tests

| Test | What it verifies | Status |
|---|---|---|
| should display the properties listing page | `/properties` shows heading + property cards | ✅ |
| should show pagination controls | Prev/Next buttons visible | ✅ |
| should filter properties by status on listing page | Status filter updates URL | ✅ |
| should sort properties | Sort by yield updates URL | ✅ |
| should navigate from homepage to properties listing | "View All Properties" link works | ✅ |
| should navigate to property detail from listing | Card click → detail page | ✅ |

### `profile.spec.ts` — 5 tests

| Test | What it verifies | Status |
|---|---|---|
| should display profile page with settings sections | Header, Personal Info, Change Password, Account Details visible | ✅ |
| should show user info in profile form | Email pre-filled correctly | ✅ |
| should update profile name and show success message | Change name → success toast → persists on reload | ✅ |
| should change password and login with new password | Change password → logout → login with new password works | ✅ |
| should redirect unauthenticated user to login | No auth → redirect to `/login?redirect=...` | ✅ |

### `watchlist.spec.ts` — 3 tests

| Test | What it verifies | Status |
|---|---|---|
| should toggle bookmark on property card | Bookmark button appears on hover, click toggles | ✅ |
| should show bookmarked property in favorites page | Bookmarked property appears on `/favorites` | ✅ |
| should not show bookmark button when logged out | Unauthenticated users don't see bookmark | ✅ |

### `admin.spec.ts` — 7 tests

| Test | What it verifies | Status |
|---|---|---|
| should redirect non-admin to login | Regular user redirected away, admin panel not visible | ✅ |
| should redirect unauthenticated user from admin | No auth → redirect to `/login` | ✅ |
| should return 403 for unauthenticated admin stats API | `GET /api/admin/stats` → 403 | ✅ |
| should return 403 for unauthenticated admin properties API | `GET /api/admin/properties` → 403 | ✅ |
| should return 403 for unauthenticated admin users API | `GET /api/admin/users` → 403 | ✅ |
| should promote and demote a user via admin API | Admin promotes user → verifies → demotes back | ✅ |
| should prevent admin from changing own role | Self-demote → 400 "Cannot change your own role" | ✅ |

### `dashboard-analytics.spec.ts` — 5 tests

| Test | What it verifies | Status |
|---|---|---|
| should show onboarding card when user has no investments | Fresh user sees empty state with 3-step guide | ✅ |
| should show summary cards including appreciation | 4 summary cards (invested, properties, income, appreciation) | ✅ |
| should display analytics charts when user has investments | Allocation, Yield, Growth charts visible | ✅ |
| should display transaction history table | Table with Date, Asset, Amount, Status columns | ✅ |
| should make holdings clickable to property detail | Holding link navigates to property page | ✅ |

### `earnings.spec.ts` — 4 tests

| Test | What it verifies | Status |
|---|---|---|
| should display earnings page with wallet balance | Heading, Wallet Balance, Total Earned cards visible | ✅ |
| should show empty state or payout history | Empty state or Payout History section visible | ✅ |
| should redirect unauthenticated user to login | No auth → redirect to `/login?redirect=...` | ✅ |
| should show wallet balance on earnings page after distribution | Invest → distribute → earnings page shows Payout History | ✅ |

### `favorites.spec.ts` — 4 tests

| Test | What it verifies | Status |
|---|---|---|
| should display favorites page with title | Standalone `/favorites` shows heading | ✅ |
| should show empty state or saved properties | Empty state or property cards visible | ✅ |
| should redirect unauthenticated user to login | No auth → redirect to `/login?redirect=...` | ✅ |
| should show bookmarked property on favorites page | Bookmark on `/properties` → appears on `/favorites` | ✅ |

### `navbar-dropdown.spec.ts` — 5 tests

| Test | What it verifies | Status |
|---|---|---|
| should show dropdown on hover with correct links | Hover username → Earnings, Favorites, Profile, Log out visible | ✅ |
| should navigate to earnings from dropdown | Click Earnings → `/earnings` | ✅ |
| should navigate to favorites from dropdown | Click Favorites → `/favorites` | ✅ |
| should navigate to profile from dropdown | Click Profile → `/profile` | ✅ |
| should log out from dropdown | Click Log out → `/login` | ✅ |

### `yield-distribution.spec.ts` — 6 tests

| Test | What it verifies | Status |
|---|---|---|
| should return 403 for unauthenticated distribution request | `POST /api/admin/distribute-yields` → 403 | ✅ |
| should return 401 for unauthenticated earnings API | `GET /api/earnings` → 401 | ✅ |
| should return earnings data for authenticated user | Login → earnings API returns balance, totalEarned, history | ✅ |
| should return 403 for non-admin distribution request | Regular user → `POST /api/admin/distribute-yields` → 403 | ✅ |
| should return 403 for unauthenticated admin user detail API | `GET /api/admin/users/:id` → 401/403 | ✅ |
| should distribute yields and credit wallet for invested user | Invest → admin distributes → wallet credited, duplicates skipped | ✅ |

### `investment-guards.spec.ts` — 4 tests

| Test | What it verifies | Status |
|---|---|---|
| should reject investment exceeding remaining capacity | Amount > remaining value → 400 "exceeds" | ✅ |
| should reject investment on a coming_soon property | Coming Soon property → 400 "not currently open" | ✅ |
| should reject investment on a fully funded property | Fully Funded property → 400 "not currently open" | ✅ |
| should reject investment on a non-existent property | Fake UUID → 404 "not found" | ✅ |

### `admin-properties.spec.ts` — 7 tests

| Test | What it verifies | Status |
|---|---|---|
| should create a new property | Admin POST → 201, property appears in list | ✅ |
| should read the created property by ID | Admin GET → correct title, location, value, fee | ✅ |
| should update the property | Admin PUT → title, yield, status changed and persisted | ✅ |
| should delete the property | Admin DELETE → 200, GET returns 404 | ✅ |
| should reject deleting a property with investments | Property with investments → 409 | ✅ |
| should reject create with invalid data | Missing fields → 400 "Validation failed" | ✅ |
| should reject non-admin from creating properties | Regular user POST → 403 | ✅ |

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
- Two test users are seeded: `e2e@urbanwealth.test` / `TestPass1!` (regular user) and `admin@urbanwealth.test` / `AdminPass1!` (admin user)
- Registration tests generate unique emails with `Date.now()` to avoid collisions
- Playwright is configured to reuse an existing dev server locally (CI starts a fresh one)
- The admin test user is created in `prisma/seed.ts` and used for distribution and admin-level API tests
- Profile tests restore original values after modification to avoid polluting other tests
