'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useTranslations } from 'next-intl';

export function AccountInfo() {
  const { user } = useAuth();
  const t = useTranslations('Profile');

  if (!user) return null;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-[18px] font-bold text-foreground tracking-tight">
        {t('accountDetails')}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-muted-bg p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1">
            {t('accountRole')}
          </p>
          <p className="text-[14px] font-semibold text-foreground capitalize">{user.role}</p>
        </div>
        <div className="rounded-lg border border-border bg-muted-bg p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1">
            {t('accountId')}
          </p>
          <p className="text-[13px] font-mono text-foreground truncate">{user.id}</p>
        </div>
      </div>
    </div>
  );
}
