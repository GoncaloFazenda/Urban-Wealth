'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <nav 
      className={`glass sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-1 shadow-sm' : 'py-2'
      }`}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="flex h-12 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary-500 font-display text-[11px] font-bold text-white transition-transform group-hover:scale-105">
              UW
            </div>
            <span className="font-display text-[16px] font-bold text-foreground tracking-tight">
              Urban Wealth
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
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

          {/* Auth & Theme */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            
            <div className="h-4 w-px bg-border mx-1"></div>

            {isLoading ? (
              <div className="h-8 w-20 rounded-md skeleton-shimmer" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-hover text-xs font-semibold text-foreground border border-border">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[13px] font-medium text-muted">
                    {user.fullName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-md px-3 py-1.5 text-[13px] font-medium text-muted transition-colors hover:text-foreground hover:bg-surface-hover"
                >
                  Log out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md px-3.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-surface-hover"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-primary-500 px-4 py-1.5 text-[13px] font-medium text-white transition-all hover:bg-primary-400 shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 text-foreground hover:bg-surface-hover rounded-md focus-ring"
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
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-1 animate-fade-in mt-2">
            <MobileLink href="/" onClick={() => setMobileOpen(false)} active={isActive('/')}>Properties</MobileLink>
            <MobileLink href="/how-it-works" onClick={() => setMobileOpen(false)} active={isActive('/how-it-works')}>How It Works</MobileLink>
            {user && <MobileLink href="/dashboard" onClick={() => setMobileOpen(false)} active={isActive('/dashboard')}>Dashboard</MobileLink>}
            <div className="pt-4 mt-4 border-t border-border space-y-1">
              {user ? (
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="w-full text-left rounded-md px-3 py-2 text-[14px] font-medium text-muted hover:text-foreground hover:bg-surface-hover"
                >
                  Log out
                </button>
              ) : (
                <>
                  <MobileLink href="/login" onClick={() => setMobileOpen(false)}>Log in</MobileLink>
                  <MobileLink href="/register" onClick={() => setMobileOpen(false)} highlight>Get Started</MobileLink>
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
      className={`rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-all ${
        active
          ? 'text-foreground bg-surface-hover'
          : 'text-muted hover:text-foreground hover:bg-surface-hover/50'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileLink({ href, onClick, active, highlight, children }: { href: string; onClick: () => void; active?: boolean; highlight?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block rounded-md px-3 py-2.5 text-[14px] font-medium transition-colors ${
        highlight 
          ? 'bg-primary-500 text-white mt-2' 
          : active 
            ? 'text-foreground bg-surface-hover'
            : 'text-muted hover:text-foreground hover:bg-surface-hover'
      }`}
    >
      {children}
    </Link>
  );
}

