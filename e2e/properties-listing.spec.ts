import { test, expect } from '@playwright/test';

test.describe('Properties Listing Page', () => {
  test('should display the properties listing page', async ({ page }) => {
    await page.goto('/properties');

    await expect(page.locator('h1')).toContainText('Investment Properties');

    // Should have property cards
    const propertyCards = page.locator('a[href*="/properties/"]');
    await expect(propertyCards.first()).toBeVisible({ timeout: 10_000 });
  });

  test('should show pagination controls when enough properties', async ({ page }) => {
    await page.goto('/properties');

    // Wait for properties to load
    await expect(page.locator('a[href*="/properties/"]').first()).toBeVisible({ timeout: 10_000 });

    // Check for pagination buttons (Previous / Next) or page numbers
    const prevButton = page.locator('button:has-text("Previous")');
    const nextButton = page.locator('button:has-text("Next")');

    // At minimum the pagination area should exist
    // (if there are fewer than 9 properties, pagination buttons may be disabled)
    await expect(prevButton.or(nextButton)).toBeVisible({ timeout: 5_000 });
  });

  test('should filter properties by status on listing page', async ({ page }) => {
    await page.goto('/properties');

    await expect(page.locator('a[href*="/properties/"]').first()).toBeVisible({ timeout: 10_000 });

    // Click a status filter
    await page.click('button:has-text("Fully Funded")');

    await expect(page).toHaveURL(/status=funded/);
  });

  test('should sort properties', async ({ page }) => {
    await page.goto('/properties');

    await expect(page.locator('a[href*="/properties/"]').first()).toBeVisible({ timeout: 10_000 });

    // Click "Highest Yield" sort option
    const yieldSort = page.locator('button:has-text("Highest Yield")');
    if (await yieldSort.isVisible()) {
      await yieldSort.click();
      await expect(page).toHaveURL(/sort=yield/);
    }
  });

  test('should navigate from homepage to properties listing', async ({ page }) => {
    await page.goto('/');

    // Click "View All Properties" link
    const viewAll = page.locator('text=View All Properties');
    await expect(viewAll).toBeVisible({ timeout: 10_000 });
    await viewAll.click();

    await expect(page).toHaveURL(/\/properties/);
    await expect(page.locator('h1')).toContainText('Investment Properties');
  });

  test('should navigate to property detail from listing', async ({ page }) => {
    await page.goto('/properties');

    const firstCard = page.locator('a[href*="/properties/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });
    await firstCard.click();

    await expect(page).toHaveURL(/\/properties\/.+/);
    await expect(page.locator('text=Financial Overview')).toBeVisible({ timeout: 10_000 });
  });
});
