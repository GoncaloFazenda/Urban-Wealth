export const AUTH_CONSTANTS = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  ACCESS_TOKEN_MAX_AGE: 15 * 60, // 15 minutes in seconds
  REFRESH_TOKEN_MAX_AGE: 7 * 24 * 60 * 60, // 7 days in seconds
  BCRYPT_COST_FACTOR: 12,
  PLATFORM_FEE_RATE: 0.015,
  RATE_LIMIT_LOGIN_MAX: 5,
  RATE_LIMIT_LOGIN_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_REFRESH_MAX: 60,
  RATE_LIMIT_REFRESH_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_INVEST_MAX: 10,
  RATE_LIMIT_INVEST_WINDOW_MS: 15 * 60 * 1000,
  COOKIE_ACCESS_TOKEN: 'access_token',
  COOKIE_REFRESH_TOKEN: 'refresh_token_v2',
  COOKIE_CSRF_TOKEN: 'csrf_token',
} as const;

export const REDIRECT_ALLOWLIST = [
  '/',
  '/dashboard',
  '/properties',
  '/how-it-works',
  '/profile',
  '/earnings',
  '/favorites',
  '/marketplace',
  '/notifications',
] as const;

export function getSafeRedirect(value: string | null): string {
  if (!value) return '/';
  const path = value.split('?')[0] ?? '/';
  return REDIRECT_ALLOWLIST.some(
    (allowed) => path === allowed || path.startsWith(`${allowed}/`)
  )
    ? value
    : '/';
}
