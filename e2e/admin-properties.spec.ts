import { test, expect } from '@playwright/test';

const testProperty = {
  title: 'E2E Test Villa',
  location: 'Lisbon, Portugal',
  photoUrls: ['https://example.com/photo1.jpg'],
  totalValue: 500000,
  funded: 0,
  annualYield: 6.5,
  projectedAppreciation: 3.2,
  status: 'open',
  description: 'A test property created by E2E tests. Should be cleaned up automatically.',
  availableShares: 100,
  platformFee: 0.015,
};

test.describe('Admin Property CRUD', () => {
  let propertyId: string;

  test('should create a new property', async ({ request }) => {
    // Login as admin
    const loginRes = await request.post('/api/auth/login', {
      data: { email: 'admin@urbanwealth.test', password: 'AdminPass1!' },
    });
    expect(loginRes.ok()).toBeTruthy();

    // Create property
    const createRes = await request.post('/api/admin/properties', {
      data: testProperty,
    });
    expect(createRes.status()).toBe(201);

    const body = await createRes.json();
    expect(body.property.id).toBeTruthy();
    propertyId = body.property.id;

    // Verify it appears in the list
    const listRes = await request.get('/api/admin/properties');
    const { properties } = await listRes.json();
    const created = properties.find((p: { id: string }) => p.id === propertyId);
    expect(created).toBeTruthy();
    expect(created.title).toBe('E2E Test Villa');
    expect(created.annualYield).toBe(6.5);
  });

  test('should read the created property by ID', async ({ request }) => {
    const loginRes = await request.post('/api/auth/login', {
      data: { email: 'admin@urbanwealth.test', password: 'AdminPass1!' },
    });
    expect(loginRes.ok()).toBeTruthy();

    expect(propertyId).toBeTruthy();

    const res = await request.get(`/api/admin/properties/${propertyId}`);
    expect(res.ok()).toBeTruthy();

    const { property } = await res.json();
    expect(property.title).toBe('E2E Test Villa');
    expect(property.location).toBe('Lisbon, Portugal');
    expect(property.totalValue).toBe(500000);
    expect(property.status).toBe('open');
    expect(property.platformFee).toBe(0.015);
  });

  test('should update the property', async ({ request }) => {
    const loginRes = await request.post('/api/auth/login', {
      data: { email: 'admin@urbanwealth.test', password: 'AdminPass1!' },
    });
    expect(loginRes.ok()).toBeTruthy();

    expect(propertyId).toBeTruthy();

    const updateRes = await request.put(`/api/admin/properties/${propertyId}`, {
      data: {
        ...testProperty,
        title: 'E2E Updated Villa',
        annualYield: 7.0,
        status: 'coming_soon',
      },
    });
    expect(updateRes.ok()).toBeTruthy();

    // Verify the update persisted
    const detailRes = await request.get(`/api/admin/properties/${propertyId}`);
    const { property } = await detailRes.json();
    expect(property.title).toBe('E2E Updated Villa');
    expect(property.annualYield).toBe(7.0);
    expect(property.status).toBe('coming_soon');
  });

  test('should delete the property', async ({ request }) => {
    const loginRes = await request.post('/api/auth/login', {
      data: { email: 'admin@urbanwealth.test', password: 'AdminPass1!' },
    });
    expect(loginRes.ok()).toBeTruthy();

    expect(propertyId).toBeTruthy();

    const deleteRes = await request.delete(`/api/admin/properties/${propertyId}`);
    expect(deleteRes.ok()).toBeTruthy();

    // Verify it's gone
    const detailRes = await request.get(`/api/admin/properties/${propertyId}`);
    expect(detailRes.status()).toBe(404);
  });

  test('should reject deleting a property with investments', async ({ request }) => {
    // Login as admin
    const loginRes = await request.post('/api/auth/login', {
      data: { email: 'admin@urbanwealth.test', password: 'AdminPass1!' },
    });
    expect(loginRes.ok()).toBeTruthy();

    // Find a property that has investments (any open property likely has investments from prior tests)
    const listRes = await request.get('/api/admin/properties');
    const { properties } = await listRes.json();
    const withInvestments = properties.find((p: { investmentCount: number }) => p.investmentCount > 0);

    if (!withInvestments) {
      test.skip();
      return;
    }

    const deleteRes = await request.delete(`/api/admin/properties/${withInvestments.id}`);
    expect(deleteRes.status()).toBe(409);

    const body = await deleteRes.json();
    expect(body.error).toContain('investments');
  });

  test('should reject create with invalid data', async ({ request }) => {
    const loginRes = await request.post('/api/auth/login', {
      data: { email: 'admin@urbanwealth.test', password: 'AdminPass1!' },
    });
    expect(loginRes.ok()).toBeTruthy();

    // Missing required fields
    const createRes = await request.post('/api/admin/properties', {
      data: { title: 'Incomplete' },
    });
    expect(createRes.status()).toBe(400);

    const body = await createRes.json();
    expect(body.error).toContain('Validation failed');
  });

  test('should reject non-admin from creating properties', async ({ request }) => {
    // Login as regular user
    const loginRes = await request.post('/api/auth/login', {
      data: { email: 'e2e@urbanwealth.test', password: 'TestPass1!' },
    });
    expect(loginRes.ok()).toBeTruthy();

    const createRes = await request.post('/api/admin/properties', {
      data: testProperty,
    });
    expect(createRes.status()).toBe(403);
  });
});
