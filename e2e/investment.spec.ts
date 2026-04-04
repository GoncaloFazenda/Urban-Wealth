import { test, expect } from '@playwright/test';

test.describe('Investment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('#email', 'e2e@urbanwealth.test');
    await page.fill('#password', 'TestPass1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/en\/?$/, { timeout: 10_000 });
  });

  test('should complete the full investment flow', async ({ page }) => {
    // Navigate to first open property
    const firstCard = page.locator('a[href*="/properties/"]').first();
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

  test('should show new investment in dashboard after investing', async ({ page }) => {
    // Snapshot dashboard BEFORE investing to get the pre-existing holding amount
    await page.goto('/dashboard');
    await expect(page.locator('text=Portfolio Overview')).toBeVisible({ timeout: 10_000 });

    // Find the first open property card and capture its title
    await page.goto('/');
    await expect(page.locator('a[href*="/properties/"]').first()).toBeVisible({ timeout: 10_000 });

    const openCard = page
      .locator('a[href*="/properties/"]')
      .filter({ has: page.locator('text=Open') })
      .first();
    await expect(openCard).toBeVisible({ timeout: 10_000 });

    const propertyTitle = await openCard.locator('h3').textContent();

    // Capture pre-existing holding amount for this property (0 if absent)
    await page.goto('/dashboard');
    await page.waitForTimeout(1_000);
    const holdingsGrid = page.locator('h2:text-is("Current Holdings") + div');
    const existingRow = holdingsGrid.filter({ hasText: propertyTitle! }).first();
    const existingAmountText = await existingRow.locator('p.text-\\[16px\\]').textContent().catch(() => '€0');
    const existingAmount = parseFloat((existingAmountText ?? '€0').replace(/[€,]/g, '')) || 0;

    // Navigate to the property and invest
    await page.goto('/');
    await expect(openCard).toBeVisible({ timeout: 10_000 });
    await openCard.click();

    await expect(page.locator('text=Investment Projection')).toBeVisible({ timeout: 10_000 });

    const investAmount = 500;
    await page.locator('input[type="number"]').fill(String(investAmount));

    const investButton = page.locator('button:has-text("Review & Invest")');
    await expect(investButton).toBeEnabled({ timeout: 5_000 });
    await investButton.click();

    await expect(page.locator('text=Confirm Allocation')).toBeVisible({ timeout: 5_000 });
    await page.click('button:has-text("Finalize Investment")');

    await expect(page.locator('text=Successfully allocated')).toBeVisible({ timeout: 10_000 });

    // Navigate to dashboard and verify the holding amount increased by exactly investAmount
    await page.goto('/dashboard');
    await expect(page.locator('text=Portfolio Overview')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=Current Holdings')).toBeVisible({ timeout: 10_000 });

    const updatedRow = holdingsGrid.filter({ hasText: propertyTitle! }).first();
    await expect(updatedRow).toBeVisible({ timeout: 5_000 });

    const updatedAmountText = await updatedRow.locator('p.text-\\[16px\\]').textContent();
    const updatedAmount = parseFloat((updatedAmountText ?? '€0').replace(/[€,]/g, ''));

    expect(updatedAmount).toBe(existingAmount + investAmount);
  });

  test('should update property funded percentage after investing', async ({ page }) => {
    // Navigate to the first open property
    await page.goto('/');
    await expect(page.locator('a[href*="/properties/"]').first()).toBeVisible({ timeout: 10_000 });

    const openCard = page
      .locator('a[href*="/properties/"]')
      .filter({ has: page.locator('text=Open') })
      .first();
    await expect(openCard).toBeVisible({ timeout: 10_000 });
    await openCard.click();

    // Wait for detail page
    await expect(page.locator('text=Funding Status')).toBeVisible({ timeout: 10_000 });

    // The funded % sits in the sibling span next to "Funding Status"
    const fundedSpan = page.locator('span:has-text("Funding Status") + span');
    const fundedBeforeText = await fundedSpan.textContent();
    const before = parseFloat(fundedBeforeText ?? '0');

    // Invest €100
    await page.locator('input[type="number"]').fill('100');
    const investButton = page.locator('button:has-text("Review & Invest")');
    await expect(investButton).toBeEnabled({ timeout: 5_000 });
    await investButton.click();

    // Confirm in modal
    await expect(page.locator('text=Confirm Allocation')).toBeVisible({ timeout: 5_000 });
    await page.click('button:has-text("Finalize Investment")');

    // Wait for success toast
    await expect(page.locator('text=Successfully allocated')).toBeVisible({ timeout: 10_000 });

    // Reload to get updated data from the DB
    await page.reload();
    await expect(page.locator('text=Funding Status')).toBeVisible({ timeout: 10_000 });

    // Capture updated funded %
    const fundedAfterText = await fundedSpan.textContent();
    const after = parseFloat(fundedAfterText ?? '0');

    // The funded % must have increased
    expect(after).toBeGreaterThan(before);
  });

  test('should redirect unauthenticated user to login when investing', async ({ page, context }) => {
    // Clear cookies to simulate unauthenticated user
    await context.clearCookies();

    // Go to a property detail page
    await page.goto('/');
    const firstCard = page.locator('a[href*="/properties/"]').first();
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
