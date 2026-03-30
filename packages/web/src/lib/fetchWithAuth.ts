/**
 * Wrapper around fetch that automatically retries with a token refresh on 401.
 * Use this for any authenticated API call from the client.
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(input, { ...init, credentials: 'include' });

  if (res.status === 401) {
    // Try refreshing the access token
    const refreshRes = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshRes.ok) {
      // Retry the original request with the new token
      return fetch(input, { ...init, credentials: 'include' });
    }
  }

  return res;
}
