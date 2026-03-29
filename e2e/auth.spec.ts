import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  const uniqueEmail = `e2e-${Date.now()}@urbanwealth.test`;

  test('should register a new user and redirect to homepage', async ({ page }) => {
    await page.goto('/register');

    await expect(page.locator('h1')).toContainText('Create an account');

    await page.fill('#fullName', 'Playwright Tester');
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', 'TestPass1!');
    await page.fill('#confirmPassword', 'TestPass1!');

    await page.click('button[type="submit"]');

    // Should redirect to homepage after successful registration
    await expect(page).toHaveURL(/\/en\/?$/, { timeout: 10_000 });
  });

  test('should show validation errors for invalid registration', async ({ page }) => {
    await page.goto('/register');

    // Submit empty form
    await page.click('button[type="submit"]');

    // Should stay on register page
    await expect(page).toHaveURL(/\/register/);
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('h1')).toContainText('Welcome back');

    await page.fill('#email', 'e2e@urbanwealth.test');
    await page.fill('#password', 'TestPass1!');

    await page.click('button[type="submit"]');

    // Should redirect to homepage
    await expect(page).toHaveURL(/\/en\/?$/, { timeout: 10_000 });
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#email', 'nonexistent@test.com');
    await page.fill('#password', 'WrongPass1!');

    await page.click('button[type="submit"]');

    // Should show error message and stay on login page
    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 5_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('should navigate between login and register pages', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Create an account');
    await expect(page).toHaveURL(/\/register/);

    await page.click('text=Log in here');
    await expect(page).toHaveURL(/\/login/);
  });
});
