/**
 * Wrapper around fetch that automatically retries with a token refresh on 401.
 * Use this for any authenticated API call from the client.
 *
 * If the refresh token is also expired/invalid, dispatches 'auth:session-expired'
 * so AuthProvider can clear state without creating a concurrent-refresh race.
 */

// Deduplicate concurrent refresh attempts: reuse the in-flight promise.
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
    .then((r) => r.ok)
    .finally(() => { refreshPromise = null; });
  return refreshPromise;
}

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(input, { ...init, credentials: 'include' });

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return fetch(input, { ...init, credentials: 'include' });
    }
    // Refresh token expired — notify AuthProvider to clear user state
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:session-expired'));
    }
  }

  return res;
}
