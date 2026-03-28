import { SignJWT, jwtVerify } from 'jose';
import type { UserRole } from '@urban-wealth/core';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  iat: number;
  exp: number;
}

function getAccessSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not set');
  return new TextEncoder().encode(secret);
}

function getRefreshSecret(): Uint8Array {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(
  userId: string,
  role: UserRole
): Promise<string> {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getAccessSecret());
}

export async function signRefreshToken(
  userId: string,
  role: UserRole
): Promise<string> {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getRefreshSecret());
}

export async function verifyAccessToken(
  token: string
): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getAccessSecret());
  return payload as unknown as JwtPayload;
}

export async function verifyRefreshToken(
  token: string
): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getRefreshSecret());
  return payload as unknown as JwtPayload;
}
