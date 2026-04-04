import { test, expect } from '@playwright/test';

test.describe('Profile & Account Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'e2e@urbanwealth.test');
    await page.fill('#password', 'TestPass1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/en\/?$/, { timeout: 10_000 });
  });

  test('should display profile page with settings sections', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.locator('h1')).toContainText('Account Settings');

    // All settings sections visible
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

  test('should redirect unauthenticated user to login', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/profile');

    await expect(page).toHaveURL(/\/login\?redirect=/, { timeout: 10_000 });
  });
});
