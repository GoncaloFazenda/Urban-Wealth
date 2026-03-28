import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { registerSchema } from '@urban-wealth/core';
import { prisma } from '@/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { setAuthCookieHeaders } from '@/lib/auth';
import { AUTH_CONSTANTS } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { fullName, email, password } = parsed.data;

    // Check for existing user — generic message to prevent user enumeration
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password with bcrypt
    const passwordHash = await hash(
      password,
      AUTH_CONSTANTS.BCRYPT_COST_FACTOR
    );

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        email: email.toLowerCase(),
        passwordHash,
        role: 'USER',
      },
    });

    // Auto-login: issue JWT tokens
    const accessToken = await signAccessToken(user.id, 'user');
    const refreshToken = await signRefreshToken(user.id, 'user');

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: 'user',
        },
      },
      { status: 201 }
    );

    // Set HttpOnly, Secure, SameSite=Strict cookies
    const cookieHeaders = setAuthCookieHeaders(accessToken, refreshToken);
    const setCookieValue = cookieHeaders['Set-Cookie'];
    if (typeof setCookieValue === 'string') {
      for (const cookie of setCookieValue.split(', ')) {
        response.headers.append('Set-Cookie', cookie);
      }
    }

    return response;
  } catch (error) {
    console.error('Registration error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
