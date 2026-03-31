'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<Pick<AuthUser, 'fullName' | 'email'>>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      // Not authenticated — that's fine
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Re-check session when user returns to the tab (access token may have expired)
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible' && user) {
        checkSession();
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkSession, user]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Login failed');
      }

      const data = await res.json();
      setUser(data.user);
    },
    []
  );

  const register = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
      confirmPassword: string
    ) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName,
          email,
          password,
          confirmPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Registration failed');
      }

      const data = await res.json();
      setUser(data.user);
    },
    []
  );

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  }, []);

  const updateUser = useCallback(
    (updates: Partial<Pick<AuthUser, 'fullName' | 'email'>>) => {
      setUser((prev) => (prev ? { ...prev, ...updates } : null));
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
