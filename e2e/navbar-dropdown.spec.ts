import { test, expect } from '@playwright/test';

test.describe('Navbar User Dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'e2e@urbanwealth.test');
    await page.fill('#password', 'TestPass1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/en\/?$/, { timeout: 10_000 });
  });

  test('should show dropdown on hover with correct links', async ({ page }) => {
    // Hover over the user name in the navbar
    const userButton = page.locator('nav').locator('button:has-text("Test Investor")');
    await expect(userButton).toBeVisible({ timeout: 10_000 });

    await userButton.hover();

    // Dropdown should appear with links
    const dropdown = page.locator('nav .absolute');
    await expect(dropdown).toBeVisible({ timeout: 3_000 });

    await expect(dropdown.locator('text=Earnings')).toBeVisible();
    await expect(dropdown.locator('text=Favorites')).toBeVisible();
    await expect(dropdown.locator('text=Profile')).toBeVisible();
    await expect(dropdown.locator('text=Log out')).toBeVisible();
  });

  test('should navigate to earnings from dropdown', async ({ page }) => {
    const userButton = page.locator('nav').locator('button:has-text("Test Investor")');
    await userButton.hover();

    const dropdown = page.locator('nav .absolute');
    await expect(dropdown).toBeVisible({ timeout: 3_000 });

    await dropdown.locator('a:has-text("Earnings")').click();
    await expect(page).toHaveURL(/\/earnings/, { timeout: 10_000 });
  });

  test('should navigate to favorites from dropdown', async ({ page }) => {
    const userButton = page.locator('nav').locator('button:has-text("Test Investor")');
    await userButton.hover();

    const dropdown = page.locator('nav .absolute');
    await expect(dropdown).toBeVisible({ timeout: 3_000 });

    await dropdown.locator('a:has-text("Favorites")').click();
    await expect(page).toHaveURL(/\/favorites/, { timeout: 10_000 });
  });

  test('should navigate to profile from dropdown', async ({ page }) => {
    const userButton = page.locator('nav').locator('button:has-text("Test Investor")');
    await userButton.hover();

    const dropdown = page.locator('nav .absolute');
    await expect(dropdown).toBeVisible({ timeout: 3_000 });

    await dropdown.locator('a:has-text("Profile")').click();
    await expect(page).toHaveURL(/\/profile/, { timeout: 10_000 });
  });

  test('should log out from dropdown', async ({ page }) => {
    const userButton = page.locator('nav').locator('button:has-text("Test Investor")');
    await userButton.hover();

    const dropdown = page.locator('nav .absolute');
    await expect(dropdown).toBeVisible({ timeout: 3_000 });

    await dropdown.locator('button:has-text("Log out")').click();

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
