'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

type TriggerType = 'NEW_LISTING' | 'YIELD_ABOVE' | 'LISTING_PRICE_BELOW';

interface AlertItem {
  id: string;
  propertyId: string;
  triggerType: TriggerType;
  conditionValue: number | null;
  active: boolean;
  createdAt: string;
}

interface AlertModalProps {
  propertyId: string;
  propertyTitle: string;
  currentYield: number;
  onClose: () => void;
}

export function AlertModal({ propertyId, propertyTitle, currentYield, onClose }: AlertModalProps) {
  const t = useTranslations('Alerts');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [triggerType, setTriggerType] = useState<TriggerType>('NEW_LISTING');
  const [conditionValue, setConditionValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load existing alerts for this property
  const { data } = useQuery<{ alerts: AlertItem[] }>({
    queryKey: ['alerts', propertyId],
    queryFn: async () => {
      const res = await fetchWithAuth(`/api/alerts?propertyId=${propertyId}`);
      if (!res.ok) return { alerts: [] };
      return res.json();
    },
    enabled: !!user,
  });

  const existingAlerts = data?.alerts ?? [];

  // Pre-fill condition value if editing an existing alert
  useEffect(() => {
    const existing = existingAlerts.find((a) => a.triggerType === triggerType);
    if (existing && existing.conditionValue !== null) {
      setConditionValue(existing.conditionValue.toString());
    } else {
      setConditionValue('');
    }
  }, [triggerType, existingAlerts]);

  const needsCondition = triggerType === 'YIELD_ABOVE' || triggerType === 'LISTING_PRICE_BELOW';
  const value = parseFloat(conditionValue) || 0;
  const canSubmit = !loading && (!needsCondition || value > 0);

  const handleCreate = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetchWithAuth('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          triggerType,
          ...(needsCondition ? { conditionValue: value } : {}),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Failed to create alert');
      }
      const result = await res.json();
      setSuccess(result.updated ? t('alertUpdated') : t('alertCreated'));
      await queryClient.invalidateQueries({ queryKey: ['alerts', propertyId] });
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (alertId: string) => {
    try {
      await fetchWithAuth(`/api/alerts/${alertId}`, { method: 'DELETE' });
      await queryClient.invalidateQueries({ queryKey: ['alerts', propertyId] });
    } catch {
      // silently fail
    }
  };

  const hasExistingForType = existingAlerts.some((a) => a.triggerType === triggerType);

  const triggers: { type: TriggerType; icon: string; label: string; desc: string }[] = [
    {
      type: 'NEW_LISTING',
      icon: '🏷️',
      label: t('triggerNewListing'),
      desc: t('triggerNewListingDesc'),
    },
    {
      type: 'YIELD_ABOVE',
      icon: '📈',
      label: t('triggerYieldAbove'),
      desc: t('triggerYieldAboveDesc', { current: currentYield.toString() }),
    },
    {
      type: 'LISTING_PRICE_BELOW',
      icon: '💰',
      label: t('triggerPriceBelow'),
      desc: t('triggerPriceBelowDesc'),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-modal p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-[20px] font-bold text-foreground mb-1">
          {t('title')}
        </h2>
        <p className="text-[13px] text-muted mb-5">{propertyTitle}</p>

        {/* Active alerts */}
        {existingAlerts.length > 0 && (
          <div className="mb-5">
            <p className="text-[12px] font-bold text-muted uppercase tracking-wider mb-2">{t('activeAlerts')}</p>
            <div className="space-y-2">
              {existingAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between rounded-lg border border-border bg-muted-bg px-4 py-2.5">
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">
                      {alert.triggerType === 'NEW_LISTING' && `${t('triggerNewListing')}`}
                      {alert.triggerType === 'YIELD_ABOVE' && `${t('triggerYieldAbove')}: >${alert.conditionValue}%`}
                      {alert.triggerType === 'LISTING_PRICE_BELOW' && `${t('triggerPriceBelow')}: <€${alert.conditionValue?.toLocaleString()}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="text-[12px] font-semibold text-red-500 hover:text-red-400 transition-colors"
                  >
                    {t('remove')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trigger type selection */}
        <p className="text-[12px] font-bold text-muted uppercase tracking-wider mb-2">{t('selectTrigger')}</p>
        <div className="space-y-2 mb-5">
          {triggers.map((tr) => (
            <button
              key={tr.type}
              onClick={() => setTriggerType(tr.type)}
              className={`w-full text-left rounded-lg border px-4 py-3 transition-all ${
                triggerType === tr.type
                  ? 'border-primary-500/40 bg-primary-500/5'
                  : 'border-border hover:border-border hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{tr.icon}</span>
                <div>
                  <p className="text-[14px] font-semibold text-foreground">{tr.label}</p>
                  <p className="text-[12px] text-muted mt-0.5">{tr.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Condition value input */}
        {needsCondition && (
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-foreground mb-1.5">
              {triggerType === 'YIELD_ABOVE' ? t('yieldThreshold') : t('priceThreshold')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-muted font-semibold">
                {triggerType === 'YIELD_ABOVE' ? '%' : '€'}
              </span>
              <input
                type="number"
                value={conditionValue}
                onChange={(e) => setConditionValue(e.target.value)}
                placeholder={triggerType === 'YIELD_ABOVE' ? currentYield.toString() : '0'}
                step="0.01"
                className="w-full rounded-md border border-border bg-card pl-8 pr-3 py-2 text-[14px] text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
            </div>
            {triggerType === 'YIELD_ABOVE' && (
              <p className="text-[12px] text-muted mt-1">
                {t('currentYield', { value: currentYield.toString() })}
              </p>
            )}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-positive-400/10 border border-positive-400/20 px-4 py-3 mb-4 text-[13px] text-positive-400 font-medium">
            {success}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 mb-4 text-[13px] text-red-500 font-medium">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-md border border-border py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-hover"
          >
            {t('close')}
          </button>
          <button
            onClick={handleCreate}
            disabled={!canSubmit}
            className="flex-1 rounded-md bg-primary-500 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? t('saving') : hasExistingForType ? t('updateAlert') : t('createAlert')}
          </button>
        </div>
      </div>
    </div>
  );
}
