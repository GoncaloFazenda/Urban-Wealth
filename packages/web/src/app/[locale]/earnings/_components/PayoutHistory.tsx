'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';

interface PayoutMonth {
  month: string;
  total: number;
  properties: Array<{ title: string; location: string; amount: number }>;
}

export function PayoutHistory({ history }: { history: PayoutMonth[] }) {
  const t = useTranslations('Earnings');

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center shadow-card">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 border border-primary-500/20">
          <svg className="h-7 w-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-display text-[20px] font-bold text-foreground mb-2">
          {t('emptyTitle')}
        </h3>
        <p className="text-[14px] text-muted max-w-md mx-auto leading-relaxed">
          {t('emptyMessage')}
        </p>
      </div>
    );
  }

  return (
    <div className="animate-enter-sm-delay-2">
      <h2 className="text-[18px] font-display font-bold text-foreground mb-4">
        {t('historyTitle')}
      </h2>
      <div className="space-y-3">
        {history.map((month) => (
          <MonthRow key={month.month} month={month} />
        ))}
      </div>
    </div>
  );
}

function MonthRow({ month }: { month: PayoutMonth }) {
  const [expanded, setExpanded] = useState(false);

  const formattedMonth = new Date(month.month + '-01').toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-hover/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-positive-400/10 border border-positive-400/20">
            <span className="text-[12px] font-bold text-positive-400">
              {month.month.slice(5)}
            </span>
          </div>
          <div className="text-left">
            <p className="text-[14px] font-semibold text-foreground">{formattedMonth}</p>
            <p className="text-[12px] text-muted">
              {month.properties.length} {month.properties.length === 1 ? 'property' : 'properties'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[16px] font-bold text-positive-400">
            +€{month.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-5 py-3 bg-muted-bg/50">
          {month.properties.map((prop, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2.5 border-b border-border last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-foreground truncate">{prop.title}</p>
                <p className="text-[11px] text-muted truncate">{prop.location}</p>
              </div>
              <span className="text-[13px] font-semibold text-positive-400">
                +€{prop.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
