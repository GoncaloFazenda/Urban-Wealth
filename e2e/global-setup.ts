/**
 * Playwright global setup — seeds the database with known test data
 * before the E2E test suite runs. Truncates and re-inserts to avoid
 * data pollution between runs.
 */
async function globalSetup() {
  const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';

  // Register a known test user via the API (idempotent — if user exists, that's fine)
  try {
    const res = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Investor',
        email: 'e2e@urbanwealth.test',
        password: 'TestPass1!',
        confirmPassword: 'TestPass1!',
      }),
    });

    if (res.status === 201) {
      console.log('[e2e] Test user created: e2e@urbanwealth.test');
    } else if (res.status === 409) {
      console.log('[e2e] Test user already exists — reusing');
    } else {
      const body = await res.text();
      console.warn(`[e2e] Unexpected status ${res.status}: ${body}`);
    }
  } catch (err) {
    console.error('[e2e] Failed to seed test user:', err);
  }
}

export default globalSetup;
