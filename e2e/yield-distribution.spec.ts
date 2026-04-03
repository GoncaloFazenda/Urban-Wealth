import { test, expect } from '@playwright/test';

test.describe('Yield Distribution API', () => {
  test('should return 403 for unauthenticated distribution request', async ({ request }) => {
    const res = await request.post('/api/admin/distribute-yields');
    expect(res.status()).toBe(403);
  });

  test('should return 401 for unauthenticated earnings API', async ({ request }) => {
    const res = await request.get('/api/earnings');
    expect(res.status()).toBe(401);
  });

  test('should return earnings data for authenticated user', async ({ request }) => {
    // Login first to get auth cookies
    const loginRes = await request.post('/api/auth/login', {
      data: { email: 'e2e@urbanwealth.test', password: 'TestPass1!' },
    });
    expect(loginRes.ok()).toBeTruthy();

    // Now fetch earnings (cookies are automatically sent by Playwright request context)
    const earningsRes = await request.get('/api/earnings');
    expect(earningsRes.ok()).toBeTruthy();

    const data = await earningsRes.json();
    expect(data).toHaveProperty('balance');
    expect(data).toHaveProperty('totalEarned');
    expect(data).toHaveProperty('history');
    expect(typeof data.balance).toBe('number');
    expect(typeof data.totalEarned).toBe('number');
    expect(Array.isArray(data.history)).toBe(true);
  });

  test('should return 403 for non-admin distribution request', async ({ request }) => {
    // Login as regular user
    await request.post('/api/auth/login', {
      data: { email: 'e2e@urbanwealth.test', password: 'TestPass1!' },
    });

    const res = await request.post('/api/admin/distribute-yields');
    expect(res.status()).toBe(403);
  });

  test('should return 403 for unauthenticated admin user detail API', async ({ request }) => {
    const res = await request.get('/api/admin/users/00000000-0000-0000-0000-000000000000');
    // 401 or 403 depending on auth check order
    expect([401, 403]).toContain(res.status());
  });
});
