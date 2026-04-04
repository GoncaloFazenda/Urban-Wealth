import { test, expect } from '@playwright/test';

test.describe('Investment API Guards', () => {
  test('should reject investment exceeding remaining capacity', async ({ request }) => {
    // Login as regular user
    const loginRes = await request.post('/api/auth/login', {
      data: { email: 'e2e@urbanwealth.test', password: 'TestPass1!' },
    });
    expect(loginRes.ok()).toBeTruthy();

    // Find an open property
    const propsRes = await request.get('/api/properties');
    const { properties } = await propsRes.json();
    const openProperty = properties.find((p: { status: string }) => p.status === 'open');
    expect(openProperty).toBeTruthy();

    // Calculate remaining capacity from the property's funded %
    const remainingValue = openProperty.totalValue * ((100 - openProperty.funded) / 100);

    // Try to invest more than the remaining capacity
    const overAmount = Math.ceil(remainingValue) + 10_000;
    const investRes = await request.post('/api/investments', {
      data: { propertyId: openProperty.id, amount: overAmount },
    });

    expect(investRes.status()).toBe(400);
    const body = await investRes.json();
    expect(body.error).toContain('exceeds');
  });

  test('should reject investment on a coming_soon property', async ({ request }) => {
    // Login as regular user
    const loginRes = await request.post('/api/auth/login', {
      data: { email: 'e2e@urbanwealth.test', password: 'TestPass1!' },
    });
    expect(loginRes.ok()).toBeTruthy();

    // Find a coming_soon property
    const propsRes = await request.get('/api/properties');
    const { properties } = await propsRes.json();
    const comingSoonProperty = properties.find((p: { status: string }) => p.status === 'coming_soon');

    if (!comingSoonProperty) {
      // No coming_soon property in seed data — skip gracefully
      test.skip();
      return;
    }

    const investRes = await request.post('/api/investments', {
      data: { propertyId: comingSoonProperty.id, amount: 100 },
    });

    expect(investRes.status()).toBe(400);
    const body = await investRes.json();
    expect(body.error).toContain('not currently open');
  });

  test('should reject investment on a fully funded property', async ({ request }) => {
    // Login as regular user
    const loginRes = await request.post('/api/auth/login', {
      data: { email: 'e2e@urbanwealth.test', password: 'TestPass1!' },
    });
    expect(loginRes.ok()).toBeTruthy();

    // Find a funded property
    const propsRes = await request.get('/api/properties');
    const { properties } = await propsRes.json();
    const fundedProperty = properties.find((p: { status: string }) => p.status === 'funded');

    if (!fundedProperty) {
      test.skip();
      return;
    }

    const investRes = await request.post('/api/investments', {
      data: { propertyId: fundedProperty.id, amount: 100 },
    });

    expect(investRes.status()).toBe(400);
    const body = await investRes.json();
    expect(body.error).toContain('not currently open');
  });

  test('should reject investment on a non-existent property', async ({ request }) => {
    const loginRes = await request.post('/api/auth/login', {
      data: { email: 'e2e@urbanwealth.test', password: 'TestPass1!' },
    });
    expect(loginRes.ok()).toBeTruthy();

    const investRes = await request.post('/api/investments', {
      data: { propertyId: '00000000-0000-0000-0000-000000000000', amount: 100 },
    });

    expect(investRes.status()).toBe(404);
    const body = await investRes.json();
    expect(body.error).toContain('not found');
  });
});
