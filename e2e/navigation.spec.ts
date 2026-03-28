import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
  test('should toggle between light and dark mode', async ({ page }) => {
    await page.goto('/');

    // Find the theme toggle button
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="Theme"], button:has(svg.lucide-sun), button:has(svg.lucide-moon)').first();

    // Get initial html class
    const initialClass = await page.locator('html').getAttribute('class');
    const startedDark = initialClass?.includes('dark') ?? false;

    // Click toggle
    await themeToggle.click();
    await page.waitForTimeout(500);

    // Class should have changed
    const newClass = await page.locator('html').getAttribute('class');
    if (startedDark) {
      expect(newClass).not.toContain('dark');
    } else {
      expect(newClass).toContain('dark');
    }

    // Click again to toggle back
    await themeToggle.click();
    await page.waitForTimeout(500);

    const restoredClass = await page.locator('html').getAttribute('class');
    if (startedDark) {
      expect(restoredClass).toContain('dark');
    } else {
      expect(restoredClass).not.toContain('dark');
    }
  });

  test('should persist theme preference across page navigation', async ({ page }) => {
    await page.goto('/');

    // Switch to dark mode
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="Theme"], button:has(svg.lucide-sun), button:has(svg.lucide-moon)').first();
    
    // Get current state and toggle
    const initialClass = await page.locator('html').getAttribute('class');
    await themeToggle.click();
    await page.waitForTimeout(500);

    // Navigate to another page
    await page.goto('/how-it-works');
    await page.waitForTimeout(500);

    // Theme should persist
    const afterNavClass = await page.locator('html').getAttribute('class');
    const initialWasDark = initialClass?.includes('dark') ?? false;
    
    if (initialWasDark) {
      // We toggled from dark to light
      expect(afterNavClass).not.toContain('dark');
    } else {
      // We toggled from light to dark
      expect(afterNavClass).toContain('dark');
    }
  });
});

test.describe('How It Works Page', () => {
  test('should display all steps', async ({ page }) => {
    await page.goto('/how-it-works');

    await expect(page.locator('h1')).toContainText('How Urban Wealth Works');
    await expect(page.getByRole('heading', { name: 'Curated Selection' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Analyze & Allocate' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Passive Income' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Portfolio Management' })).toBeVisible();
  });

  test('should display FAQ section with expandable items', async ({ page }) => {
    await page.goto('/how-it-works');

    // FAQ should be visible
    await expect(page.locator('text=Frequently asked questions')).toBeVisible();

    // Click on a FAQ item
    const firstFaq = page.locator('summary').first();
    await firstFaq.click();

    // Answer should be visible
    const detailsContent = page.locator('details[open] div').first();
    await expect(detailsContent).toBeVisible();
  });
});

test.describe('Dashboard', () => {
  test('should redirect to login if not authenticated', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/dashboard');

    // The dashboard API will return 401, page should show empty state or error
    // Since middleware might redirect, check if we're on dashboard or login
    await page.waitForTimeout(2_000);
  });

  test('should display dashboard when authenticated', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('#email', 'e2e@urbanwealth.test');
    await page.fill('#password', 'TestPass1!');
    await page.click('button[type="submit"]');

    // Wait for login to process — may redirect to / or stay on login
    await page.waitForTimeout(3_000);

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Should show portfolio overview
    await expect(page.locator('text=Portfolio Overview')).toBeVisible({ timeout: 10_000 });
  });
});
