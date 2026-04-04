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
    const loginRes = await request.post('/api/auth/login', {
      data: { email: 'e2e@urbanwealth.test', password: 'TestPass1!' },
    });
    expect(loginRes.ok()).toBeTruthy();

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
    await request.post('/api/auth/login', {
      data: { email: 'e2e@urbanwealth.test', password: 'TestPass1!' },
    });

    const res = await request.post('/api/admin/distribute-yields');
    expect(res.status()).toBe(403);
  });

  test('should return 403 for unauthenticated admin user detail API', async ({ request }) => {
    const res = await request.get('/api/admin/users/00000000-0000-0000-0000-000000000000');
    expect([401, 403]).toContain(res.status());
  });

  test('should distribute yields and credit wallet for invested user', async ({ request }) => {
    // 1. Login as the regular test user and invest in a property
    const userLogin = await request.post('/api/auth/login', {
      data: { email: 'e2e@urbanwealth.test', password: 'TestPass1!' },
    });
    expect(userLogin.ok()).toBeTruthy();

    // Get the first open property
    const propsRes = await request.get('/api/properties');
    expect(propsRes.ok()).toBeTruthy();
    const { properties } = await propsRes.json();
    const openProperty = properties.find((p: { status: string }) => p.status === 'open');
    expect(openProperty).toBeTruthy();

    // Invest €1000
    const investRes = await request.post('/api/investments', {
      data: { propertyId: openProperty.id, amount: 1000 },
    });
    expect(investRes.ok()).toBeTruthy();

    // Check earnings before distribution
    const earningsBefore = await request.get('/api/earnings');
    const beforeData = await earningsBefore.json();
    const balanceBefore = beforeData.balance;

    // 2. Log out, then login as admin
    await request.post('/api/auth/logout');
    const adminLogin = await request.post('/api/auth/login', {
      data: { email: 'admin@urbanwealth.test', password: 'AdminPass1!' },
    });
    expect(adminLogin.ok()).toBeTruthy();

    // 3. Run yield distribution
    const distRes = await request.post('/api/admin/distribute-yields');
    expect(distRes.ok()).toBeTruthy();

    const distData = await distRes.json();
    expect(distData.investmentsProcessed).toBeGreaterThanOrEqual(1);
    expect(distData.payoutsCreated).toBeGreaterThanOrEqual(1);
    expect(distData.totalDistributed).toBeGreaterThan(0);

    // 4. Log back in as user and verify wallet was credited
    await request.post('/api/auth/logout');
    await request.post('/api/auth/login', {
      data: { email: 'e2e@urbanwealth.test', password: 'TestPass1!' },
    });

    const earningsAfter = await request.get('/api/earnings');
    const afterData = await earningsAfter.json();
    expect(afterData.balance).toBeGreaterThan(balanceBefore);
    expect(afterData.totalEarned).toBeGreaterThan(0);
    expect(afterData.history.length).toBeGreaterThanOrEqual(1);

    // 5. Run distribution again (as admin) — should skip all (no duplicates)
    await request.post('/api/auth/logout');
    await request.post('/api/auth/login', {
      data: { email: 'admin@urbanwealth.test', password: 'AdminPass1!' },
    });

    const distRes2 = await request.post('/api/admin/distribute-yields');
    expect(distRes2.ok()).toBeTruthy();

    const distData2 = await distRes2.json();
    expect(distData2.payoutsCreated).toBe(0);
    expect(distData2.skipped).toBeGreaterThanOrEqual(1);
  });
});
