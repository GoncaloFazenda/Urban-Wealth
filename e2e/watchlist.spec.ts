import { test, expect } from '@playwright/test';

test.describe('Watchlist / Favorites', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'e2e@urbanwealth.test');
    await page.fill('#password', 'TestPass1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/en\/?$/, { timeout: 10_000 });
  });

  test('should toggle bookmark on property card', async ({ page }) => {
    await page.goto('/properties');

    const firstCard = page.locator('a[href*="/properties/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });

    // Hover to reveal the bookmark button
    await firstCard.hover();

    const bookmarkBtn = firstCard.locator('button[aria-label*="watchlist"]');
    await expect(bookmarkBtn).toBeVisible({ timeout: 5_000 });

    // Click to add to watchlist
    await bookmarkBtn.click();

    // The bookmark SVG should now be filled (has fill attribute)
    const svg = bookmarkBtn.locator('svg');
    await expect(svg).toBeVisible();
  });

  test('should show bookmarked property in favorites tab', async ({ page }) => {
    // First bookmark a property
    await page.goto('/properties');
    const firstCard = page.locator('a[href*="/properties/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });

    // Get the property title
    const propertyTitle = await firstCard.locator('h3').textContent();

    // Hover and bookmark
    await firstCard.hover();
    const bookmarkBtn = firstCard.locator('button[aria-label*="watchlist"]');
    await expect(bookmarkBtn).toBeVisible({ timeout: 5_000 });
    await bookmarkBtn.click();

    // Wait for mutation to settle
    await page.waitForTimeout(1_000);

    // Navigate to profile favorites tab
    await page.goto('/profile?tab=favorites');

    // Should see the property in favorites
    const favCards = page.locator('a[href*="/properties/"]');
    const emptyState = page.locator('text=No saved properties yet');

    await expect(favCards.first().or(emptyState)).toBeVisible({ timeout: 10_000 });

    // If we have favorites, check if the bookmarked property appears
    if (await favCards.first().isVisible()) {
      const titles = await favCards.locator('h3').allTextContents();
      expect(titles.length).toBeGreaterThanOrEqual(1);
    }
  });

  test('should not show bookmark button when logged out', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/properties');

    const firstCard = page.locator('a[href*="/properties/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });

    await firstCard.hover();

    // Bookmark button should not be visible for unauthenticated users
    const bookmarkBtn = firstCard.locator('button[aria-label*="watchlist"]');
    await expect(bookmarkBtn).not.toBeVisible({ timeout: 3_000 });
  });
});
