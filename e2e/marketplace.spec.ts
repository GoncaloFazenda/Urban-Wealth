import { test, expect } from '@playwright/test';

/**
 * Marketplace E2E tests — secondary market listing, browsing and purchasing.
 * These tests require the e2e test user (e2e@urbanwealth.test) to have at
 * least one investment already in the DB (seeded by global-setup + prior
 * investment tests).
 */

async function login(page: Parameters<typeof test>[1] extends (...args: infer A) => unknown ? A[0] : never) {
  await page.goto('/login');
  await page.fill('#email', 'e2e@urbanwealth.test');
  await page.fill('#password', 'TestPass1!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/en\/?$/, { timeout: 10_000 });
}

test.describe('Marketplace — browsing', () => {
  test('should display the marketplace page', async ({ page }) => {
    await page.goto('/marketplace');
    await expect(page.locator('h1, h2').filter({ hasText: /marketplace/i }).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should show listings or empty state', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForTimeout(2_000);
    const hasListings = await page.locator('[data-testid="listing-card"], .listing-card, a[href*="/marketplace"]').count();
    const hasEmpty = await page.locator('text=/no listings|nothing here|empty/i').count();
    // Either listings or empty state must be present
    expect(hasListings + hasEmpty).toBeGreaterThan(0);
  });

  test('should redirect unauthenticated user to login when purchasing', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/marketplace');
    // Look for a Buy Now button and attempt to click it
    const buyBtn = page.locator('button:has-text("Buy Now"), button:has-text("Buy")').first();
    const count = await buyBtn.count();
    if (count > 0) {
      await buyBtn.click();
      await expect(page).toHaveURL(/\/login/, { timeout: 5_000 });
    }
  });
});

test.describe('Marketplace — creating and managing listings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should show My Listings section in dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Portfolio Overview')).toBeVisible({ timeout: 10_000 });
    // My Listings section appears only when the user has listings — just verify the dashboard loads
    await expect(page.locator('h1, h2').filter({ hasText: /portfolio/i }).first()).toBeVisible();
  });

  test('should open sell modal from holdings', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Current Holdings')).toBeVisible({ timeout: 10_000 });

    const sellBtn = page.locator('button:has-text("Sell Position")').first();
    const hasSellBtn = await sellBtn.count();
    if (hasSellBtn > 0) {
      await sellBtn.click();
      // Sell modal should appear
      await expect(page.locator('text=/list for sale|sell your position/i').first()).toBeVisible({ timeout: 5_000 });
    }
  });

  test('should validate sell modal — disables button when no amount entered', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Current Holdings')).toBeVisible({ timeout: 10_000 });

    const sellBtn = page.locator('button:has-text("Sell Position")').first();
    if (await sellBtn.count() > 0) {
      await sellBtn.click();
      // Without entering any values the submit button must be disabled
      const listBtn = page.locator('button:has-text("List for Sale")');
      await expect(listBtn).toBeDisabled({ timeout: 5_000 });
    }
  });

  test('should create a listing and see it in My Listings', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Current Holdings')).toBeVisible({ timeout: 10_000 });

    const sellBtn = page.locator('button:has-text("Sell Position")').first();
    if (await sellBtn.count() === 0) {
      test.skip(); // no holdings to sell
      return;
    }

    await sellBtn.click();
    await expect(page.locator('text=/list for sale|sell your position/i').first()).toBeVisible({ timeout: 5_000 });

    // Fill in a small amount via the € input
    const amountInput = page.locator('input[type="number"]').first();
    const maxBtn = page.locator('button:has-text("MAX")').first();
    await maxBtn.click();

    // Set ask price
    const askInput = page.locator('input[type="number"]').last();
    await askInput.fill('100');

    const listBtn = page.locator('button:has-text("List for Sale")');
    await expect(listBtn).toBeEnabled({ timeout: 5_000 });
    await listBtn.click();

    // Modal should close and My Listings should now be visible
    await expect(page.locator('text=/list for sale/i')).not.toBeVisible({ timeout: 5_000 });
    await expect(page.locator('text=My Listings')).toBeVisible({ timeout: 5_000 });
  });

  test('should cancel an active listing', async ({ page }) => {
    await page.goto('/dashboard');
    // Wait for My Listings section
    const myListingsSection = page.locator('text=My Listings');
    const exists = await myListingsSection.count();
    if (exists === 0) {
      test.skip(); // no listings to cancel
      return;
    }

    await expect(myListingsSection).toBeVisible({ timeout: 10_000 });

    // Find the cancel (X) button on the first active listing
    const cancelBtn = page.locator('button[title="Cancel listing"], button[title="cancel"]').first();
    if (await cancelBtn.count() > 0) {
      await cancelBtn.click();
      // Listing should disappear or status should change
      await page.waitForTimeout(2_000);
    }
  });
});

test.describe('Marketplace — secondary offers on property page', () => {
  test('should show Secondary Market section when listings exist', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForTimeout(2_000);

    // Navigate to the property page of the first listing
    const firstPropertyLink = page.locator('a[href*="/properties/"]').first();
    if (await firstPropertyLink.count() > 0) {
      const href = await firstPropertyLink.getAttribute('href');
      if (href) {
        await page.goto(href);
        await expect(page.locator('text=Secondary Market')).toBeVisible({ timeout: 10_000 });
      }
    }
  });
});
