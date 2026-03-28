import { test, expect } from '@playwright/test';

test.describe('Property Browsing', () => {
  test('should display the homepage with hero section', async ({ page }) => {
    await page.goto('/');

    // Hero should be visible
    await expect(page.locator('h1')).toContainText('Invest in Legacy');
    await expect(page.locator('text=Explore Portfolio')).toBeVisible();
  });

  test('should display the stats section', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('text=Avg. Yield')).toBeVisible();
    await expect(page.locator('text=Investors')).toBeVisible();
    await expect(page.getByText('Funded', { exact: true })).toBeVisible();
  });

  test('should load and display property cards', async ({ page }) => {
    await page.goto('/');

    // Wait for properties to load
    const propertyCards = page.locator('a[href^="/properties/"]');
    await expect(propertyCards.first()).toBeVisible({ timeout: 10_000 });

    // Should have multiple properties
    const count = await propertyCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should filter properties by status', async ({ page }) => {
    await page.goto('/');

    // Wait for properties to load first
    await expect(page.locator('a[href^="/properties/"]').first()).toBeVisible({ timeout: 10_000 });

    // Click "Fully Funded" status tab button
    await page.click('button:has-text("Fully Funded")');

    // URL should update to include status param
    await expect(page).toHaveURL(/status=funded/);
  });

  test('should navigate to property detail page', async ({ page }) => {
    await page.goto('/');

    // Wait for properties
    const firstCard = page.locator('a[href^="/properties/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });

    await firstCard.click();

    // Should be on a property detail page
    await expect(page).toHaveURL(/\/properties\/.+/);

    // Detail page should have key elements
    await expect(page.locator('text=Financial Overview')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=Investment Projection')).toBeVisible();
    await expect(page.locator('text=Funding Status')).toBeVisible();
  });

  test('should display property detail with working calculator', async ({ page }) => {
    await page.goto('/');

    // Navigate to first property
    const firstCard = page.locator('a[href^="/properties/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });
    await firstCard.click();

    // Wait for detail page
    await expect(page.locator('text=Investment Projection')).toBeVisible({ timeout: 10_000 });

    // Type an investment amount
    const amountInput = page.locator('input[type="number"]');
    await amountInput.fill('5000');

    // Calculator rows should appear
    await expect(page.locator('text=Implied Ownership')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('text=Projected Annual Income')).toBeVisible();
    await expect(page.locator('text=Total Annual Return')).toBeVisible();
  });

  test('should navigate back to portfolio from detail page', async ({ page }) => {
    await page.goto('/');

    const firstCard = page.locator('a[href^="/properties/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });
    await firstCard.click();

    await expect(page.locator('text=Back to Portfolio')).toBeVisible({ timeout: 10_000 });
    await page.click('text=Back to Portfolio');

    await expect(page).toHaveURL('/');
  });
});
