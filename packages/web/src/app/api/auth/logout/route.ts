import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clearAuthCookieHeaders } from '@/lib/auth';
import { AUTH_CONSTANTS } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get(
      AUTH_CONSTANTS.COOKIE_REFRESH_TOKEN
    )?.value;

    // Invalidate refresh token server-side (add to denylist)
    if (refreshToken) {
      try {
        await prisma.refreshTokenDenylist.create({
          data: {
            token: refreshToken,
            expiresAt: new Date(
              Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_MAX_AGE * 1000
            ),
          },
        });
      } catch {
        // Token may already be denylisted — that's fine
      }
    }

    // Clear all auth cookies
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    const cookieHeaders = clearAuthCookieHeaders();
    const setCookieValue = cookieHeaders['Set-Cookie'];
    if (typeof setCookieValue === 'string') {
      for (const cookie of setCookieValue.split(', ')) {
        response.headers.append('Set-Cookie', cookie);
      }
    }

    return response;
  } catch (error) {
    console.error('Logout error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
