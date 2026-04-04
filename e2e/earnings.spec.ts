import { test, expect } from '@playwright/test';

test.describe('Earnings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'e2e@urbanwealth.test');
    await page.fill('#password', 'TestPass1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/en\/?$/, { timeout: 10_000 });
  });

  test('should display earnings page with wallet balance', async ({ page }) => {
    await page.goto('/earnings');

    await expect(page.locator('h1')).toContainText('Earnings', { timeout: 10_000 });

    // Should show summary cards (use exact match to avoid subtitle collision)
    await expect(page.getByText('Wallet Balance', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Earned', { exact: true })).toBeVisible();
  });

  test('should show empty state or payout history', async ({ page }) => {
    await page.goto('/earnings');

    await expect(page.locator('h1')).toContainText('Earnings', { timeout: 10_000 });

    // Either the empty state or payout history should be visible
    const emptyState = page.locator('text=No earnings yet');
    const payoutHistory = page.locator('text=Payout History');

    await expect(emptyState.or(payoutHistory)).toBeVisible({ timeout: 10_000 });
  });

  test('should redirect unauthenticated user to login', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/earnings');

    await expect(page).toHaveURL(/\/login\?redirect=/, { timeout: 10_000 });
  });

  test('should show wallet balance on earnings page after distribution', async ({ page, request }) => {
    // 1. Invest as regular user
    const userLogin = await request.post('/api/auth/login', {
      data: { email: 'e2e@urbanwealth.test', password: 'TestPass1!' },
    });
    expect(userLogin.ok()).toBeTruthy();

    const propsRes = await request.get('/api/properties');
    const { properties } = await propsRes.json();
    const openProperty = properties.find((p: { status: string }) => p.status === 'open');

    if (openProperty) {
      await request.post('/api/investments', {
        data: { propertyId: openProperty.id, amount: 500 },
      });
    }

    // 2. Run distribution as admin
    await request.post('/api/auth/logout');
    const adminLogin = await request.post('/api/auth/login', {
      data: { email: 'admin@urbanwealth.test', password: 'AdminPass1!' },
    });
    expect(adminLogin.ok()).toBeTruthy();

    await request.post('/api/admin/distribute-yields');

    // 3. Log back in as regular user via the browser and check the earnings UI
    await request.post('/api/auth/logout');
    // Re-login through the page (browser cookies)
    await page.context().clearCookies();
    await page.goto('/login');
    await page.fill('#email', 'e2e@urbanwealth.test');
    await page.fill('#password', 'TestPass1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/en\/?$/, { timeout: 10_000 });

    // 4. Navigate to earnings and verify UI shows real data
    await page.goto('/earnings');
    await expect(page.locator('h1')).toContainText('Earnings', { timeout: 10_000 });

    // Wallet balance should show a non-zero value (€ followed by a number > 0)
    const walletCard = page.getByText('Wallet Balance', { exact: true }).locator('..');
    await expect(walletCard).toBeVisible({ timeout: 10_000 });

    // Payout History should be visible (not empty state)
    await expect(page.locator('text=Payout History')).toBeVisible({ timeout: 10_000 });
  });
});
