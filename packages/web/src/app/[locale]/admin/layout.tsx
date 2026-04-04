'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter, Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Admin');

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-muted-bg">
        <div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    router.push('/');
    return null;
  }

  const navItems = [
    { href: '/admin', label: t('overview'), exact: true },
    { href: '/admin/properties', label: t('properties'), exact: false },
    { href: '/admin/users', label: t('users'), exact: false },
    { href: '/admin/investments', label: t('investments'), exact: false },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex bg-muted-bg">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card p-6">
        <div className="mb-8">
          <h2 className="font-display text-[18px] font-bold text-foreground tracking-tight">
            {t('panelTitle')}
          </h2>
          <p className="text-[12px] text-muted mt-0.5">{t('panelSubtitle')}</p>
        </div>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3.5 py-2 text-[13px] font-semibold transition-all ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-muted hover:text-foreground hover:bg-surface-hover'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card px-2 py-2 flex gap-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 rounded-md py-2 text-center text-[11px] font-semibold transition-all ${
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6 sm:p-8 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
}
