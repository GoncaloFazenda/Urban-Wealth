'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-500 font-display text-[11px] font-bold text-white">
              UW
            </div>
            <span className="font-display text-[15px] font-semibold text-white tracking-tight">
              Urban Wealth
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            <NavLink href="/" active={isActive('/')}>
              Properties
            </NavLink>
            <NavLink href="/how-it-works" active={isActive('/how-it-works')}>
              How It Works
            </NavLink>
            {user && (
              <NavLink href="/dashboard" active={isActive('/dashboard')}>
                Dashboard
              </NavLink>
            )}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-2">
            {isLoading ? (
              <div className="h-8 w-20 rounded-md skeleton-shimmer" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-700 text-xs font-medium text-surface-300">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[13px] text-surface-400">
                    {user.fullName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-md px-3 py-1.5 text-[13px] text-surface-400 transition-colors hover:text-white hover:bg-white/[0.04]"
                >
                  Log out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md px-3.5 py-1.5 text-[13px] font-medium text-surface-300 transition-colors hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-primary-500 px-3.5 py-1.5 text-[13px] font-medium text-white transition-all hover:bg-primary-400"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 text-surface-400 hover:text-white"
            aria-label="Menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/[0.06] py-3 space-y-1 animate-fade-in">
            <MobileLink href="/" onClick={() => setMobileOpen(false)}>Properties</MobileLink>
            <MobileLink href="/how-it-works" onClick={() => setMobileOpen(false)}>How It Works</MobileLink>
            {user && <MobileLink href="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</MobileLink>}
            <div className="pt-3 mt-3 border-t border-white/[0.06] space-y-1">
              {user ? (
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="w-full text-left rounded-md px-3 py-2 text-[13px] text-surface-400 hover:text-white hover:bg-white/[0.04]"
                >
                  Log out
                </button>
              ) : (
                <>
                  <MobileLink href="/login" onClick={() => setMobileOpen(false)}>Log in</MobileLink>
                  <MobileLink href="/register" onClick={() => setMobileOpen(false)}>Get Started</MobileLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
        active
          ? 'text-white bg-white/[0.06]'
          : 'text-surface-400 hover:text-white hover:bg-white/[0.04]'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-md px-3 py-2 text-[13px] text-surface-400 hover:text-white hover:bg-white/[0.04]"
    >
      {children}
    </Link>
  );
}
