import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/jwt';
import { setAuthCookieHeaders } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { AUTH_CONSTANTS } from '@/lib/constants';

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rateLimitResult = checkRateLimit(`refresh:${ip}`, {
      maxRequests: AUTH_CONSTANTS.RATE_LIMIT_REFRESH_MAX,
      windowMs: AUTH_CONSTANTS.RATE_LIMIT_REFRESH_WINDOW_MS,
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Get refresh token from cookie
    const refreshToken = request.cookies.get(
      AUTH_CONSTANTS.COOKIE_REFRESH_TOKEN
    )?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      );
    }

    // Check if token is in denylist
    const isDenied = await prisma.refreshTokenDenylist.findUnique({
      where: { token: refreshToken },
    });

    if (isDenied) {
      return NextResponse.json(
        { error: 'Token has been revoked' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Rotate: denylist old refresh token
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
      // Already denylisted — continue
    }

    // Issue new tokens
    const role = user.role === 'ADMIN' ? 'admin' as const : 'user' as const;
    const newAccessToken = await signAccessToken(user.id, role);
    const newRefreshToken = await signRefreshToken(user.id, role);

    const response = NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role,
      },
    });

    // Set new auth cookies
    const cookieHeaders = setAuthCookieHeaders(
      newAccessToken,
      newRefreshToken
    );
    const setCookieValue = cookieHeaders['Set-Cookie'];
    if (typeof setCookieValue === 'string') {
      for (const cookie of setCookieValue.split(', ')) {
        response.headers.append('Set-Cookie', cookie);
      }
    }

    return response;
  } catch (error) {
    console.error('Refresh error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Invalid or expired refresh token' },
      { status: 401 }
    );
  }
}
