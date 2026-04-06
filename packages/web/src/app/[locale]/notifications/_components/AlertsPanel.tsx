'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useTranslations } from 'next-intl';
import { Bell, Trash2, ToggleLeft, ToggleRight, Edit2, Check, X, ExternalLink } from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface Alert {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyYield: number;
  propertyLocation: string;
  triggerType: 'NEW_LISTING' | 'YIELD_ABOVE' | 'LISTING_PRICE_BELOW';
  conditionValue: number | null;
  active: boolean;
  createdAt: string;
}

function TriggerLabel({
  triggerType,
  conditionValue,
  t,
}: {
  triggerType: Alert['triggerType'];
  conditionValue: number | null;
  t: ReturnType<typeof useTranslations<'AlertsPanel'>>;
}) {
  if (triggerType === 'NEW_LISTING') return <span>{t('triggerNewListing')}</span>;
  if (triggerType === 'YIELD_ABOVE')
    return (
      <span>
        {t('triggerYieldAbove')} <strong className="text-foreground">{conditionValue}%</strong>
      </span>
    );
  return (
    <span>
      {t('triggerPriceBelow')} <strong className="text-foreground">€{conditionValue?.toLocaleString()}</strong>
    </span>
  );
}

function EditableCondition({
  alert,
  onSave,
  onCancel,
  t,
}: {
  alert: Alert;
  onSave: (value: number) => void;
  onCancel: () => void;
  t: ReturnType<typeof useTranslations<'AlertsPanel'>>;
}) {
  const [value, setValue] = useState(String(alert.conditionValue ?? ''));

  const label =
    alert.triggerType === 'YIELD_ABOVE' ? t('yieldThreshold') : t('priceThreshold');

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-[12px] text-muted">{label}:</span>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-24 rounded-md border border-border bg-muted-bg px-2 py-1 text-[13px] font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500"
        min={0}
        step={alert.triggerType === 'YIELD_ABOVE' ? 0.1 : 100}
      />
      <button
        onClick={() => {
          const n = parseFloat(value);
          if (!isNaN(n) && n > 0) onSave(n);
        }}
        className="p-1 rounded text-positive-400 hover:bg-positive-400/10 transition-colors"
        aria-label="Save"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onCancel}
        className="p-1 rounded text-muted hover:bg-surface-hover transition-colors"
        aria-label="Cancel"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function AlertRow({ alert, t }: { alert: Alert; t: ReturnType<typeof useTranslations<'AlertsPanel'>> }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const hasCondition =
    alert.triggerType === 'YIELD_ABOVE' || alert.triggerType === 'LISTING_PRICE_BELOW';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await fetchWithAuth(`/api/alerts/${alert.id}`, { method: 'DELETE' });
      await queryClient.invalidateQueries({ queryKey: ['my-alerts'] });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await fetchWithAuth(`/api/alerts/${alert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !alert.active }),
      });
      await queryClient.invalidateQueries({ queryKey: ['my-alerts'] });
    } finally {
      setIsToggling(false);
    }
  };

  const handleSaveCondition = async (value: number) => {
    await fetchWithAuth(`/api/alerts/${alert.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conditionValue: value }),
    });
    await queryClient.invalidateQueries({ queryKey: ['my-alerts'] });
    setEditing(false);
  };

  return (
    <div
      className={`rounded-xl border px-4 py-3.5 transition-all ${
        alert.active
          ? 'border-border bg-card'
          : 'border-border/50 bg-muted-bg opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Indicator dot */}
        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${alert.active ? 'bg-primary-500' : 'bg-border'}`} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/properties/${alert.propertyId}`}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-foreground hover:text-primary-500 transition-colors truncate"
          >
            {alert.propertyTitle}
            <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
          </Link>
          <p className="text-[12px] text-muted">{alert.propertyLocation}</p>
          <p className="text-[13px] text-muted mt-1">
            <TriggerLabel triggerType={alert.triggerType} conditionValue={alert.conditionValue} t={t} />
          </p>
          {editing && hasCondition ? (
            <EditableCondition
              alert={alert}
              onSave={handleSaveCondition}
              onCancel={() => setEditing(false)}
              t={t}
            />
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {hasCondition && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
              title={t('edit')}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-hover transition-colors disabled:opacity-40"
            title={alert.active ? t('pause') : t('resume')}
          >
            {alert.active ? (
              <ToggleRight className="w-4 h-4 text-primary-500" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-md text-muted hover:text-destructive-400 hover:bg-destructive-400/10 transition-colors disabled:opacity-40"
            title={t('delete')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AlertsPanel() {
  const t = useTranslations('AlertsPanel');

  const { data, isLoading, isError } = useQuery<{ alerts: Alert[] }>({
    queryKey: ['my-alerts'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/alerts');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[72px] rounded-xl border border-border bg-card skeleton-shimmer" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-[14px] text-muted text-center py-8">{t('errorTitle')}</p>
    );
  }

  const alerts = data?.alerts ?? [];
  const activeCount = alerts.filter((a) => a.active).length;

  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center shadow-card">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 border border-primary-500/20">
          <Bell className="h-7 w-7 text-primary-500" />
        </div>
        <h3 className="font-display text-[20px] font-bold text-foreground mb-2">{t('emptyTitle')}</h3>
        <p className="text-[14px] text-muted max-w-md mx-auto leading-relaxed">{t('emptyMessage')}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-muted">
          {t('summary', { total: alerts.length, active: activeCount })}
        </p>
      </div>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <AlertRow key={alert.id} alert={alert} t={t} />
        ))}
      </div>
    </div>
  );
}
