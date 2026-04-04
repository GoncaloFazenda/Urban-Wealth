import { test, expect } from '@playwright/test';

test.describe('Dashboard Empty States & Analytics', () => {
  test('should show onboarding card when user has no investments', async ({ page }) => {
    // Register a fresh user with no investments
    const freshEmail = `e2e-empty-${Date.now()}@urbanwealth.test`;
    await page.goto('/register');
    await page.fill('#fullName', 'Empty Dashboard User');
    await page.fill('#email', freshEmail);
    await page.fill('#password', 'TestPass1!');
    await page.fill('#confirmPassword', 'TestPass1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/en\/?$/, { timeout: 10_000 });

    // Go to dashboard
    await page.goto('/dashboard');

    // Should see the empty state onboarding card
    await expect(page.locator('text=No investments yet')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=Browse Portfolio')).toBeVisible();
    await expect(page.locator('text=How It Works')).toBeVisible();

    // Should see the 3-step guide
    await expect(page.locator('text=Browse properties')).toBeVisible();
    await expect(page.locator('text=Invest from EUR50')).toBeVisible();
    await expect(page.locator('text=Earn passive income')).toBeVisible();
  });

  test('should show summary cards including appreciation', async ({ page }) => {
    // Login as test user who has investments
    await page.goto('/login');
    await page.fill('#email', 'e2e@urbanwealth.test');
    await page.fill('#password', 'TestPass1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/en\/?$/, { timeout: 10_000 });

    await page.goto('/dashboard');
    await expect(page.locator('text=Portfolio Overview')).toBeVisible({ timeout: 10_000 });

    // Should see all 4 summary cards
    await expect(page.locator('text=Total Invested')).toBeVisible();
    await expect(page.locator('text=Active Properties')).toBeVisible();
    await expect(page.locator('text=Est. Annual Income')).toBeVisible();
    await expect(page.locator('text=Est. Appreciation')).toBeVisible();
  });

  test('should display analytics charts when user has investments', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'e2e@urbanwealth.test');
    await page.fill('#password', 'TestPass1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/en\/?$/, { timeout: 10_000 });

    await page.goto('/dashboard');
    await expect(page.locator('text=Portfolio Overview')).toBeVisible({ timeout: 10_000 });

    // If user has holdings, analytics section should appear
    const holdings = page.locator('text=Current Holdings');
    if (await holdings.isVisible({ timeout: 5_000 })) {
      // Analytics section
      await expect(page.locator('text=Portfolio Analytics')).toBeVisible({ timeout: 5_000 });

      // Chart titles
      await expect(page.locator('text=Asset Allocation')).toBeVisible();
      await expect(page.locator('text=Yield Comparison')).toBeVisible();
      await expect(page.locator('text=Portfolio Growth')).toBeVisible();
    }
  });

  test('should display transaction history table', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'e2e@urbanwealth.test');
    await page.fill('#password', 'TestPass1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/en\/?$/, { timeout: 10_000 });

    await page.goto('/dashboard');
    await expect(page.locator('text=Portfolio Overview')).toBeVisible({ timeout: 10_000 });

    const holdings = page.locator('text=Current Holdings');
    if (await holdings.isVisible({ timeout: 5_000 })) {
      await expect(page.locator('text=Transaction History')).toBeVisible();

      // Table headers
      await expect(page.locator('th:has-text("Date")')).toBeVisible();
      await expect(page.locator('th:has-text("Asset")')).toBeVisible();
      await expect(page.locator('th:has-text("Amount")')).toBeVisible();
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
    }
  });

  test('should make holdings clickable to property detail', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'e2e@urbanwealth.test');
    await page.fill('#password', 'TestPass1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/en\/?$/, { timeout: 10_000 });

    await page.goto('/dashboard');
    await expect(page.locator('text=Portfolio Overview')).toBeVisible({ timeout: 10_000 });

    const holdingLink = page.locator('a[href*="/properties/"]').first();
    if (await holdingLink.isVisible({ timeout: 5_000 })) {
      await holdingLink.click();
      await expect(page).toHaveURL(/\/properties\/.+/);
    }
  });
});
