'use client';

import { useTranslations } from 'next-intl';
import { PropertyForm } from '@/components/admin/PropertyForm';

export default function NewPropertyPage() {
  const t = useTranslations('Admin');

  return (
    <div className="max-w-3xl">
      <div className="mb-8 animate-enter-sm">
        <h1 className="font-display text-[28px] font-bold text-foreground tracking-tight">
          {t('newPropertyTitle')}
        </h1>
        <p className="mt-1 text-[14px] text-muted">{t('newPropertySubtitle')}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
        <PropertyForm mode="create" />
      </div>
    </div>
  );
}
