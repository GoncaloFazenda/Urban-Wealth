import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test('should redirect non-admin to login', async ({ page }) => {
    // Login as regular user
    await page.goto('/login');
    await page.fill('#email', 'e2e@urbanwealth.test');
    await page.fill('#password', 'TestPass1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/en\/?$/, { timeout: 10_000 });

    // Try to access admin - should either redirect or show access denied
    await page.goto('/admin');

    // Non-admin user should be redirected away from admin — either to homepage, login, or see an error
    const adminTitle = page.locator('text=Platform Overview');
    const homepage = page.locator('text=Invest in Legacy');
    const loginPage = page.locator('h1:has-text("Welcome back")');
    const accessDenied = page.locator('text=Access denied');

    await expect(
      homepage.or(loginPage).or(accessDenied)
    ).toBeVisible({ timeout: 10_000 });

    // Should NOT see the admin panel
    await expect(adminTitle).not.toBeVisible();
  });

  test('should redirect unauthenticated user from admin', async ({ page }) => {
    await page.goto('/admin');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});

test.describe('Admin Panel - Admin User', () => {
  // These tests verify the admin UI structure when accessible
  // They use the API directly to check admin endpoints

  test('should return 403 for unauthenticated admin API calls', async ({ request }) => {
    const res = await request.get('/api/admin/stats');
    expect(res.status()).toBe(403);
  });

  test('should return 403 for unauthenticated admin properties API', async ({ request }) => {
    const res = await request.get('/api/admin/properties');
    expect(res.status()).toBe(403);
  });

  test('should return 403 for unauthenticated admin users API', async ({ request }) => {
    const res = await request.get('/api/admin/users');
    expect(res.status()).toBe(403);
  });

  test('should promote and demote a user via admin API', async ({ request }) => {
    // 1. Login as admin
    const adminLogin = await request.post('/api/auth/login', {
      data: { email: 'admin@urbanwealth.test', password: 'AdminPass1!' },
    });
    expect(adminLogin.ok()).toBeTruthy();

    // 2. Get the list of users and find the e2e test user
    const usersRes = await request.get('/api/admin/users');
    expect(usersRes.ok()).toBeTruthy();

    const { users } = await usersRes.json();
    const testUser = users.find((u: { email: string }) => u.email === 'e2e@urbanwealth.test');
    expect(testUser).toBeTruthy();
    expect(testUser.role).toBe('user');

    // 3. Promote to admin
    const promoteRes = await request.put(`/api/admin/users/${testUser.id}`, {
      data: { role: 'admin' },
    });
    expect(promoteRes.ok()).toBeTruthy();

    const promotedData = await promoteRes.json();
    expect(promotedData.user.role).toBe('admin');

    // 4. Verify role changed via GET
    const detailRes = await request.get(`/api/admin/users/${testUser.id}`);
    const detailData = await detailRes.json();
    expect(detailData.user.role).toBe('admin');

    // 5. Demote back to user (cleanup)
    const demoteRes = await request.put(`/api/admin/users/${testUser.id}`, {
      data: { role: 'user' },
    });
    expect(demoteRes.ok()).toBeTruthy();

    const demotedData = await demoteRes.json();
    expect(demotedData.user.role).toBe('user');
  });

  test('should prevent admin from changing own role', async ({ request }) => {
    // Login as admin
    const adminLogin = await request.post('/api/auth/login', {
      data: { email: 'admin@urbanwealth.test', password: 'AdminPass1!' },
    });
    expect(adminLogin.ok()).toBeTruthy();

    // Get admin's own user ID from the users list
    const usersRes = await request.get('/api/admin/users');
    const { users } = await usersRes.json();
    const adminUser = users.find((u: { email: string }) => u.email === 'admin@urbanwealth.test');
    expect(adminUser).toBeTruthy();

    // Try to demote self — should fail
    const selfDemoteRes = await request.put(`/api/admin/users/${adminUser.id}`, {
      data: { role: 'user' },
    });
    expect(selfDemoteRes.status()).toBe(400);

    const body = await selfDemoteRes.json();
    expect(body.error).toContain('Cannot change your own role');
  });
});
