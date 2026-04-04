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

  test('should update profile name and show success message', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('text=Personal Information')).toBeVisible({ timeout: 10_000 });

    const nameInput = page.locator('#fullName');
    const originalName = await nameInput.inputValue();

    // Change name
    await nameInput.clear();
    await nameInput.fill('Updated Investor');

    // Submit the profile form (the one inside the Personal Information section)
    const saveButton = page.locator('button:has-text("Save Changes")');
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Success message should appear
    await expect(page.locator('text=Profile updated successfully')).toBeVisible({ timeout: 10_000 });

    // Reload and verify the name persisted
    await page.reload();
    await expect(page.locator('#fullName')).toHaveValue('Updated Investor', { timeout: 10_000 });

    // Restore original name
    await page.locator('#fullName').clear();
    await page.locator('#fullName').fill(originalName);
    await saveButton.click();
    await expect(page.locator('text=Profile updated successfully')).toBeVisible({ timeout: 10_000 });
  });

  test('should change password and login with new password', async ({ page, request }) => {
    const newPassword = 'NewPass2!';
    const originalPassword = 'TestPass1!';

    await page.goto('/profile');
    await expect(page.locator('text=Change Password')).toBeVisible({ timeout: 10_000 });

    // Fill change password form
    await page.locator('#currentPassword').fill(originalPassword);
    await page.locator('#newPassword').fill(newPassword);
    await page.locator('#confirmNewPassword').fill(newPassword);

    const updateButton = page.locator('button:has-text("Update Password")');
    await updateButton.click();

    // Success message
    await expect(page.locator('text=Password changed successfully')).toBeVisible({ timeout: 10_000 });

    // Verify: log out and log back in with new password
    await page.goto('/login');
    // Clear cookies to force fresh login
    await page.context().clearCookies();
    await page.goto('/login');
    await page.fill('#email', 'e2e@urbanwealth.test');
    await page.fill('#password', newPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/en\/?$/, { timeout: 10_000 });

    // Restore original password via API
    const loginRes = await request.post('/api/auth/login', {
      data: { email: 'e2e@urbanwealth.test', password: newPassword },
    });
    expect(loginRes.ok()).toBeTruthy();

    const restoreRes = await request.put('/api/profile/password', {
      data: {
        currentPassword: newPassword,
        newPassword: originalPassword,
        confirmNewPassword: originalPassword,
      },
    });
    expect(restoreRes.ok()).toBeTruthy();
  });

  test('should redirect unauthenticated user to login', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/profile');

    await expect(page).toHaveURL(/\/login\?redirect=/, { timeout: 10_000 });
  });
});
