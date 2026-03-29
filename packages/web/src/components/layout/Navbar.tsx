'use client';

import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { routing } from '@/i18n/routing';

export function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Navbar');
  const locale = useLocale();
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

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as 'en' | 'pt' });
  };

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
            <div className="relative flex h-8 w-8 items-center justify-center rounded-[0.4rem] bg-card border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                className="h-[18px] w-[18px] text-primary-500 transition-transform duration-300 group-hover:-translate-y-0.5"
              >
                {/* Minimalist Skyscraper + Arrow Line Art */}
                <path d="M12 3v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 21V12h4v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 21v-5h4v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 21h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-display text-[17px] font-bold text-foreground tracking-tight transition-colors group-hover:text-primary-500">
              Urban Wealth
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/properties" active={isActive('/properties')}>
              {t('properties')}
            </NavLink>
            <NavLink href="/how-it-works" active={isActive('/how-it-works')}>
              {t('howItWorks')}
            </NavLink>
            {user && (
              <NavLink href="/dashboard" active={isActive('/dashboard')}>
                {t('dashboard')}
              </NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink href="/admin" active={isActive('/admin')}>
                Admin
              </NavLink>
            )}
          </div>

          {/* Auth, Theme & Language */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {/* Language Switcher */}
            <div className="flex items-center rounded-md border border-border overflow-hidden text-[12px] font-semibold">
              {routing.locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => switchLocale(loc)}
                  className={`px-2.5 py-1 transition-colors ${
                    locale === loc
                      ? 'bg-primary-500 text-white'
                      : 'text-muted hover:text-foreground hover:bg-surface-hover'
                  }`}
                >
                  {loc.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-border mx-1"></div>

            {isLoading ? (
              <div className="h-8 w-20 rounded-md skeleton-shimmer" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-surface-hover"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-hover text-xs font-semibold text-foreground border border-border">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[13px] font-medium text-muted">
                    {user.fullName}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-md px-3 py-1.5 w-18 text-[13px] font-medium text-muted transition-colors hover:text-foreground hover:bg-surface-hover"
                >
                  {t('logOut')}
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md px-3.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-surface-hover"
                >
                  {t('logIn')}
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-primary-500 px-4 py-1.5 text-[13px] font-medium text-white transition-all hover:bg-primary-400 shadow-sm"
                >
                  {t('getStarted')}
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
              aria-label={t('menu')}
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
            <MobileLink href="/properties" onClick={() => setMobileOpen(false)} active={isActive('/properties')}>{t('properties')}</MobileLink>
            <MobileLink href="/how-it-works" onClick={() => setMobileOpen(false)} active={isActive('/how-it-works')}>{t('howItWorks')}</MobileLink>
            {user && <MobileLink href="/dashboard" onClick={() => setMobileOpen(false)} active={isActive('/dashboard')}>{t('dashboard')}</MobileLink>}
            {user?.role === 'admin' && <MobileLink href="/admin" onClick={() => setMobileOpen(false)} active={isActive('/admin')}>Admin</MobileLink>}

            {/* Mobile Language Switcher */}
            <div className="flex gap-1 px-3 py-2">
              {routing.locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => { switchLocale(loc); setMobileOpen(false); }}
                  className={`rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                    locale === loc
                      ? 'bg-primary-500 text-white'
                      : 'text-muted hover:text-foreground hover:bg-surface-hover'
                  }`}
                >
                  {loc.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="pt-4 mt-4 border-t border-border space-y-1">
              {user ? (
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="w-full text-left rounded-md px-3 py-2 text-[14px] font-medium text-muted hover:text-foreground hover:bg-surface-hover"
                >
                  {t('logOut')}
                </button>
              ) : (
                <>
                  <MobileLink href="/login" onClick={() => setMobileOpen(false)}>{t('logIn')}</MobileLink>
                  <MobileLink href="/register" onClick={() => setMobileOpen(false)} highlight>{t('getStarted')}</MobileLink>
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
