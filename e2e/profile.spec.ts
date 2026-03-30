import { test, expect } from '@playwright/test';

test.describe('Profile & Account Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'e2e@urbanwealth.test');
    await page.fill('#password', 'TestPass1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/en\/?$/, { timeout: 10_000 });
  });

  test('should display profile page with settings tab', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.locator('h1')).toContainText('Account Settings');
    await expect(page.locator('button:has-text("Settings")')).toBeVisible();
    await expect(page.locator('button:has-text("Favorites")')).toBeVisible();

    // Settings tab content visible by default
    await expect(page.locator('text=Personal Information')).toBeVisible();
    await expect(page.locator('text=Change Password')).toBeVisible();
    await expect(page.locator('text=Account Details')).toBeVisible();
  });

  test('should show user info in profile form', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.locator('text=Personal Information')).toBeVisible({ timeout: 10_000 });

    const emailInput = page.locator('#email');
    await expect(emailInput).toHaveValue('e2e@urbanwealth.test');
  });

  test('should switch to favorites tab', async ({ page }) => {
    await page.goto('/profile');

    await page.click('button:has-text("Favorites")');

    // Should show empty state or favorites grid
    const emptyState = page.locator('text=No saved properties yet');
    const propertyCards = page.locator('a[href*="/properties/"]');

    // Either empty state or cards should be visible
    await expect(emptyState.or(propertyCards.first())).toBeVisible({ timeout: 10_000 });
  });

  test('should open favorites tab via URL param', async ({ page }) => {
    await page.goto('/profile?tab=favorites');

    const emptyState = page.locator('text=No saved properties yet');
    const propertyCards = page.locator('a[href*="/properties/"]');

    await expect(emptyState.or(propertyCards.first())).toBeVisible({ timeout: 10_000 });
  });

  test('should redirect unauthenticated user to login', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/profile');

    await expect(page).toHaveURL(/\/login\?redirect=/, { timeout: 10_000 });
  });
});
