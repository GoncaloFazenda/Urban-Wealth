import { randomBytes, createHmac } from 'crypto';
import { AUTH_CONSTANTS } from './constants';

const CSRF_SECRET = process.env.JWT_ACCESS_SECRET ?? 'csrf-dev-secret';

/**
 * Generate a CSRF token using the double-submit cookie pattern.
 * Returns both the token (for the cookie) and a signed version (for the form).
 */
export function generateCsrfToken(): {
  token: string;
  signedToken: string;
} {
  const token = randomBytes(32).toString('hex');
  const signedToken = createHmac('sha256', CSRF_SECRET)
    .update(token)
    .digest('hex');

  return { token, signedToken };
}

/**
 * Validate a CSRF token against its signed counterpart.
 */
export function validateCsrfToken(
  cookieToken: string | undefined,
  headerToken: string | undefined
): boolean {
  if (!cookieToken || !headerToken) return false;

  const expectedSigned = createHmac('sha256', CSRF_SECRET)
    .update(cookieToken)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  if (expectedSigned.length !== headerToken.length) return false;

  let result = 0;
  for (let i = 0; i < expectedSigned.length; i++) {
    result |= expectedSigned.charCodeAt(i) ^ headerToken.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Get CSRF cookie header string.
 */
export function getCsrfCookieHeader(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const secure = isProduction ? '; Secure' : '';
  return `${AUTH_CONSTANTS.COOKIE_CSRF_TOKEN}=${token}; Path=/; SameSite=Strict; Max-Age=${AUTH_CONSTANTS.ACCESS_TOKEN_MAX_AGE}${secure}`;
}
