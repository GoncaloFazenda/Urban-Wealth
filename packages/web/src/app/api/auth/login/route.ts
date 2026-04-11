import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { loginSchema } from '@urban-wealth/core';
import { prisma } from '@/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { setAuthCookieHeaders, getClientIp, applyCookies } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { AUTH_CONSTANTS } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = getClientIp(request);
    const rateLimitResult = checkRateLimit(`login:${ip}`, {
      maxRequests: AUTH_CONSTANTS.RATE_LIMIT_LOGIN_MAX,
      windowMs: AUTH_CONSTANTS.RATE_LIMIT_LOGIN_WINDOW_MS,
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((rateLimitResult.retryAfterMs ?? 0) / 1000)
            ),
          },
        }
      );
    }

    const body = await request.json();

    // Validate input
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Find user — generic message to prevent user enumeration
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Map Prisma role enum to lowercase
    const role = user.role === 'ADMIN' ? 'admin' as const : 'user' as const;

    // Issue tokens
    const accessToken = await signAccessToken(user.id, role);
    const refreshToken = await signRefreshToken(user.id, role);

    const response = NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role,
      },
    });

    applyCookies(response, setAuthCookieHeaders(accessToken, refreshToken));

    return response;
  } catch (error) {
    console.error('Login error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
