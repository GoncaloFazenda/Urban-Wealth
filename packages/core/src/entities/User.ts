export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
}
