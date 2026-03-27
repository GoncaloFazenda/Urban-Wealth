import { NextRequest, NextResponse } from 'next/server';
import { AUTH_CONSTANTS, REDIRECT_ALLOWLIST } from '@/lib/constants';

// Paths that require authentication
const PROTECTED_PATHS = ['/dashboard', '/admin'];
const ADMIN_PATHS = ['/admin'];
const AUTH_PAGES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ===== Security Headers =====
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set(
    'Referrer-Policy',
    'strict-origin-when-cross-origin'
  );
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' https://picsum.photos https://*.picsum.photos data: blob:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  // ===== Auth Guards =====
  const accessToken = request.cookies.get(
    AUTH_CONSTANTS.COOKIE_ACCESS_TOKEN
  )?.value;

  const isProtected = PROTECTED_PATHS.some((p) =>
    pathname.startsWith(p)
  );
  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // Redirect unauthenticated users from protected pages
  if (isProtected && !accessToken) {
    // Validate redirect param against allowlist
    const redirectTo = pathname;
    const isAllowed = REDIRECT_ALLOWLIST.some(
      (allowed) =>
        redirectTo === allowed || redirectTo.startsWith(`${allowed}/`)
    );
    const safeRedirect = isAllowed ? redirectTo : '/';

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', safeRedirect);
    return NextResponse.redirect(loginUrl);
  }

  // Skip API routes from further middleware processing
  if (pathname.startsWith('/api/')) {
    return response;
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
