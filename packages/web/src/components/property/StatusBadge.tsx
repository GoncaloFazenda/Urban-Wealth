'use client';

import type { Property } from '@urban-wealth/core';
import { useTranslations } from 'next-intl';

export function StatusBadge({ status }: { status: Property['status'] }) {
  const t = useTranslations('StatusBadge');

  const STATUS_CONFIG: Record<Property['status'], { label: string; dot: string; text: string; bg: string }> = {
    open: { label: t('open'), dot: 'bg-positive-400', text: 'text-positive-400', bg: 'bg-positive-400/10' },
    coming_soon: { label: t('comingSoon'), dot: 'bg-warning-400', text: 'text-warning-400', bg: 'bg-warning-400/10' },
    funded: { label: t('fullyFunded'), dot: 'bg-muted', text: 'text-muted', bg: 'bg-muted-bg' },
  };

  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold tracking-widest uppercase ${c.bg} ${c.text} border border-border/50`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
