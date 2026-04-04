'use client';

import { useTranslations } from 'next-intl';

export function RiskDisclaimer() {
  const t = useTranslations('RiskDisclaimer');

  return (
    <div className="rounded-md border border-warning-400/20 bg-warning-400/5 px-4 py-3 mt-4">
      <p className="text-[12px] leading-relaxed text-muted">
        <span className="font-semibold text-warning-400">{t('label')}</span>{' '}
        {t('text')}
      </p>
    </div>
  );
}
