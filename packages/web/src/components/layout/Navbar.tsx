'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 font-display text-sm font-bold text-white transition-transform group-hover:scale-105">
              UW
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-white hidden sm:block">
              Urban Wealth
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/">Properties</NavLink>
            <NavLink href="/how-it-works">How It Works</NavLink>
            {user && <NavLink href="/dashboard">Dashboard</NavLink>}
            {user?.role === 'admin' && (
              <NavLink href="/admin/properties">Admin</NavLink>
            )}
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="h-9 w-24 rounded-lg skeleton-shimmer" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-surface-500">
                  {user.fullName}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition-all hover:border-white/20 hover:text-white hover:bg-white/5"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary-500/20 transition-all hover:shadow-primary-500/40 hover:brightness-110"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 py-4 animate-slide-up">
            <div className="flex flex-col gap-2">
              <MobileNavLink
                href="/"
                onClick={() => setMobileMenuOpen(false)}
              >
                Properties
              </MobileNavLink>
              <MobileNavLink
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </MobileNavLink>
              {user && (
                <MobileNavLink
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </MobileNavLink>
              )}
              {user?.role === 'admin' && (
                <MobileNavLink
                  href="/admin/properties"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </MobileNavLink>
              )}
              <div className="mt-3 pt-3 border-t border-white/5">
                {user ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70"
                  >
                    Logout
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg border border-white/10 px-4 py-2.5 text-center text-sm font-medium text-white/70"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2.5 text-center text-sm font-medium text-white"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white hover:bg-white/5"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-lg px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5"
    >
      {children}
    </Link>
  );
}
