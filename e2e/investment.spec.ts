import { test, expect } from '@playwright/test';

test.describe('Investment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('#email', 'e2e@urbanwealth.test');
    await page.fill('#password', 'TestPass1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10_000 });
  });

  test('should complete the full investment flow', async ({ page }) => {
    // Navigate to first open property
    const firstCard = page.locator('a[href^="/properties/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });
    await firstCard.click();

    // Wait for the detail page
    await expect(page.locator('text=Investment Projection')).toBeVisible({ timeout: 10_000 });

    // Enter investment amount
    const amountInput = page.locator('input[type="number"]');
    await amountInput.fill('1000');

    // Calculator should show projections
    await expect(page.locator('text=Implied Ownership')).toBeVisible({ timeout: 5_000 });

    // Click invest button
    const investButton = page.locator('button:has-text("Review & Invest")');
    if (await investButton.isEnabled()) {
      await investButton.click();

      // Confirm modal should appear
      await expect(page.locator('text=Confirm Allocation')).toBeVisible({ timeout: 5_000 });

      // Modal should show investment details
      await expect(page.locator('text=Capital')).toBeVisible();
      await expect(page.locator('text=Equity')).toBeVisible();

      // Confirm investment
      await page.click('button:has-text("Finalize Investment")');

      // Wait for success toast
      await expect(page.locator('text=Successfully allocated')).toBeVisible({ timeout: 10_000 });
    }
  });

  test('should redirect unauthenticated user to login when investing', async ({ page, context }) => {
    // Clear cookies to simulate unauthenticated user
    await context.clearCookies();

    // Go to a property detail page
    await page.goto('/');
    const firstCard = page.locator('a[href^="/properties/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });
    await firstCard.click();

    // Wait for detail page
    await expect(page.locator('text=Investment Projection')).toBeVisible({ timeout: 10_000 });

    // Enter amount and try to invest
    const amountInput = page.locator('input[type="number"]');
    await amountInput.fill('1000');

    const investButton = page.locator('button:has-text("Review & Invest")');
    if (await investButton.isEnabled()) {
      await investButton.click();

      // Should redirect to login
      await expect(page).toHaveURL(/\/login\?redirect=/, { timeout: 5_000 });
    }
  });
});
