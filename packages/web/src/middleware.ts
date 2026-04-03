import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';
import { AUTH_CONSTANTS, REDIRECT_ALLOWLIST } from '@/lib/constants';

// Paths that require authentication (without locale prefix)
const PROTECTED_PATHS = ['/dashboard', '/admin', '/profile', '/earnings', '/favorites'];
const AUTH_PAGES = ['/login', '/register'];

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes entirely — no locale prefix, no auth redirect
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }

  // Strip locale prefix to get the "logical" path for auth checks
  const localePattern = new RegExp(`^/(${routing.locales.join('|')})(/|$)`);
  const logicalPath = pathname.replace(localePattern, '/').replace(/\/+$/, '') || '/';

  let accessToken = request.cookies.get(AUTH_CONSTANTS.COOKIE_ACCESS_TOKEN)?.value;
  const refreshToken = request.cookies.get(AUTH_CONSTANTS.COOKIE_REFRESH_TOKEN)?.value;

  const isProtected = PROTECTED_PATHS.some(
    (p) => logicalPath === p || logicalPath.startsWith(`${p}/`)
  );
  const isAuthPage = AUTH_PAGES.some(
    (p) => logicalPath === p || logicalPath.startsWith(`${p}/`)
  );

  // If accessing a protected page with no access token but a valid refresh token,
  // try to refresh before redirecting to login
  if (isProtected && !accessToken && refreshToken) {
    try {
      const refreshUrl = new URL('/api/auth/refresh', request.url);
      const refreshRes = await fetch(refreshUrl.toString(), {
        method: 'POST',
        headers: { Cookie: `${AUTH_CONSTANTS.COOKIE_REFRESH_TOKEN}=${refreshToken}` },
      });

      if (refreshRes.ok) {
        // Extract the new cookies from the refresh response
        const setCookies = refreshRes.headers.getSetCookie();
        const response = intlMiddleware(request);
        addSecurityHeaders(response);
        for (const cookie of setCookies) {
          response.headers.append('Set-Cookie', cookie);
        }
        return response;
      }
    } catch {
      // Refresh failed — fall through to login redirect
    }
  }

  // Redirect unauthenticated users from protected pages
  if (isProtected && !accessToken) {
    const redirectTo = logicalPath;
    const isAllowed = REDIRECT_ALLOWLIST.some(
      (allowed) => redirectTo === allowed || redirectTo.startsWith(`${allowed}/`)
    );
    const safeRedirect = isAllowed ? redirectTo : '/';

    // Determine the locale from the URL for the redirect
    const localeMatch = pathname.match(localePattern);
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', safeRedirect);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && accessToken) {
    const localeMatch = pathname.match(localePattern);
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Run next-intl middleware for locale detection/routing
  const response = intlMiddleware(request);
  addSecurityHeaders(response);
  return response;
}

function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      "img-src 'self' https://picsum.photos https://*.picsum.photos data: blob:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
  );
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
