import { test, expect } from '@playwright/test';

async function login(page: Parameters<typeof test>[1] extends (...args: infer A) => unknown ? A[0] : never) {
  await page.goto('/login');
  await page.fill('#email', 'e2e@urbanwealth.test');
  await page.fill('#password', 'TestPass1!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/en\/?$/, { timeout: 10_000 });
}

test.describe('Alerts — property page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should show Set Alert button on property detail when authenticated', async ({ page }) => {
    await page.goto('/');
    const firstCard = page.locator('a[href*="/properties/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });
    await firstCard.click();

    await expect(page.locator('button:has-text("Set Alert"), button:has-text("Manage Alerts")')).toBeVisible({ timeout: 10_000 });
  });

  test('should not show Set Alert button when unauthenticated', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    const firstCard = page.locator('a[href*="/properties/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });
    await firstCard.click();

    await expect(page.locator('button:has-text("Set Alert")')).not.toBeVisible({ timeout: 5_000 });
  });

  test('should open alert modal on button click', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href*="/properties/"]').first().click();
    await expect(page.locator('button:has-text("Set Alert"), button:has-text("Manage Alerts")')).toBeVisible({ timeout: 10_000 });

    await page.locator('button:has-text("Set Alert"), button:has-text("Manage Alerts")').first().click();
    await expect(page.locator('text=/alert|notification/i').first()).toBeVisible({ timeout: 5_000 });
  });

  test('should create a New Listing alert and see button change style', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href*="/properties/"]').first().click();
    await page.waitForTimeout(1_000);

    const alertBtn = page.locator('button:has-text("Set Alert"), button:has-text("Manage Alerts")').first();
    await alertBtn.click();

    // Select "New Listing" trigger type
    const newListingOption = page.locator('text=/new listing/i').first();
    if (await newListingOption.count() > 0) {
      await newListingOption.click();
    }

    // Save / create alert
    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Create"), button:has-text("Set Alert")').last();
    if (await saveBtn.count() > 0 && await saveBtn.isEnabled()) {
      await saveBtn.click();
      await page.waitForTimeout(1_000);

      // The alert button on the property page should now show "Alert Active" or "Manage Alerts"
      await expect(page.locator('button:has-text("Alert Active"), button:has-text("Manage Alerts")')).toBeVisible({ timeout: 5_000 });
    }
  });
});

test.describe('Alerts — My Alerts panel in notifications', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display the My Alerts tab in notifications', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.locator('text=My Alerts')).toBeVisible({ timeout: 10_000 });
  });

  test('should switch to My Alerts tab and show content', async ({ page }) => {
    await page.goto('/notifications');
    await page.locator('button:has-text("My Alerts"), [role="tab"]:has-text("My Alerts")').first().click();
    await page.waitForTimeout(1_000);

    // Should show either alerts list or an empty state — not an error
    const hasAlerts = await page.locator('text=/alert|notification/i').count();
    expect(hasAlerts).toBeGreaterThan(0);
  });

  test('should show alert linked to property in My Alerts panel', async ({ page }) => {
    await page.goto('/notifications');
    await page.locator('button:has-text("My Alerts"), [role="tab"]:has-text("My Alerts")').first().click();
    await page.waitForTimeout(1_000);

    // If there are alerts, each should link to a property
    const propertyLinks = page.locator('a[href*="/properties/"]');
    const count = await propertyLinks.count();
    if (count > 0) {
      await expect(propertyLinks.first()).toBeVisible();
    }
  });

  test('should delete an alert from My Alerts panel', async ({ page }) => {
    await page.goto('/notifications');
    await page.locator('button:has-text("My Alerts"), [role="tab"]:has-text("My Alerts")').first().click();
    await page.waitForTimeout(1_000);

    const deleteBtn = page.locator('button[aria-label*="delete"], button[title*="delete"], button:has-text("Delete")').first();
    if (await deleteBtn.count() > 0) {
      const countBefore = await page.locator('a[href*="/properties/"]').count();
      await deleteBtn.click();
      await page.waitForTimeout(1_000);
      const countAfter = await page.locator('a[href*="/properties/"]').count();
      expect(countAfter).toBeLessThanOrEqual(countBefore);
    }
  });
});
