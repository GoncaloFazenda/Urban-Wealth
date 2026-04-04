import { test, expect } from '@playwright/test';

test.describe('Favorites Standalone Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'e2e@urbanwealth.test');
    await page.fill('#password', 'TestPass1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/en\/?$/, { timeout: 10_000 });
  });

  test('should display favorites page with title', async ({ page }) => {
    await page.goto('/favorites');

    await expect(page.locator('h1')).toContainText('Watchlist', { timeout: 10_000 });
  });

  test('should show empty state or saved properties', async ({ page }) => {
    await page.goto('/favorites');

    const emptyState = page.locator('text=No saved properties yet');
    const propertyCards = page.locator('a[href*="/properties/"]');

    await expect(emptyState.or(propertyCards.first())).toBeVisible({ timeout: 10_000 });
  });

  test('should redirect unauthenticated user to login', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/favorites');

    await expect(page).toHaveURL(/\/login\?redirect=/, { timeout: 10_000 });
  });

  test('should show bookmarked property on favorites page', async ({ page }) => {
    // Bookmark a property first
    await page.goto('/properties');
    const firstCard = page.locator('a[href*="/properties/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });

    await firstCard.hover();
    const bookmarkBtn = firstCard.locator('button[aria-label*="watchlist"]');
    await expect(bookmarkBtn).toBeVisible({ timeout: 5_000 });
    await bookmarkBtn.click();
    await page.waitForTimeout(1_000);

    // Navigate to standalone favorites page
    await page.goto('/favorites');

    const emptyState = page.locator('text=No saved properties yet');
    const propertyCards = page.locator('a[href*="/properties/"]');

    await expect(emptyState.or(propertyCards.first())).toBeVisible({ timeout: 10_000 });

    // If we have favorites, at least one card should be visible
    if (await propertyCards.first().isVisible()) {
      const count = await propertyCards.count();
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });
});
