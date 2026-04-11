import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, type JwtPayload } from './jwt';
import { AUTH_CONSTANTS } from './constants';

export interface AuthSession {
  userId: string;
  role: 'user' | 'admin';
}

/**
 * Get the current authenticated session from cookies.
 * Returns null if not authenticated or token is invalid/expired.
 */
export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(
      AUTH_CONSTANTS.COOKIE_ACCESS_TOKEN
    )?.value;

    if (!accessToken) return null;

    const payload: JwtPayload = await verifyAccessToken(accessToken);
    return {
      userId: payload.userId,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

/**
 * Extract the real client IP from request headers.
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

/**
 * Apply Set-Cookie headers from setAuthCookieHeaders / clearAuthCookieHeaders
 * onto an existing NextResponse, handling the joined-string format.
 */
export function applyCookies(
  response: NextResponse,
  cookieHeaders: Record<string, string>
): void {
  const value = cookieHeaders['Set-Cookie'];
  if (typeof value === 'string') {
    for (const cookie of value.split(', ')) {
      response.headers.append('Set-Cookie', cookie);
    }
  }
}

/**
 * Set auth cookies (access + refresh tokens).
 * All cookies are HttpOnly, Secure, SameSite=Strict.
 */
export function setAuthCookieHeaders(
  accessToken: string,
  refreshToken: string
): Record<string, string> {
  const isProduction = process.env.NODE_ENV === 'production';
  const secure = isProduction ? '; Secure' : '';

  return {
    'Set-Cookie': [
      `${AUTH_CONSTANTS.COOKIE_ACCESS_TOKEN}=${accessToken}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${AUTH_CONSTANTS.ACCESS_TOKEN_MAX_AGE}${secure}`,
      `${AUTH_CONSTANTS.COOKIE_REFRESH_TOKEN}=${refreshToken}; HttpOnly; Path=/api/auth; SameSite=Strict; Max-Age=${AUTH_CONSTANTS.REFRESH_TOKEN_MAX_AGE}${secure}`,
    ].join(', '),
  };
}

/**
 * Clear auth cookies by setting Max-Age=0.
 */
export function clearAuthCookieHeaders(): Record<string, string> {
  return {
    'Set-Cookie': [
      `${AUTH_CONSTANTS.COOKIE_ACCESS_TOKEN}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0`,
      `${AUTH_CONSTANTS.COOKIE_REFRESH_TOKEN}=; HttpOnly; Path=/api/auth; SameSite=Strict; Max-Age=0`,
    ].join(', '),
  };
}
