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
});
