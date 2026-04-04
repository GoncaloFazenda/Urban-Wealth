'use client';

import type { Property } from '@urban-wealth/core';
import { calculateInvestment } from '@urban-wealth/ui';
import { Modal } from '@/components/ui/Modal';
import { useTranslations } from 'next-intl';
import { RiskDisclaimer } from './RiskDisclaimer';

interface ConfirmModalProps {
  property: Property;
  amount: number;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function ConfirmModal({ property, amount, onClose, onConfirm, isSubmitting }: ConfirmModalProps) {
  const projection = calculateInvestment(
    amount,
    property.totalValue,
    property.funded,
    property.annualYield,
    property.projectedAppreciation
  );
  const t = useTranslations('ConfirmModal');

  return (
    <Modal onClose={onClose}>
      <h3 className="text-[20px] font-display font-bold text-foreground mb-6">{t('title')}</h3>

      <div className="space-y-3 mb-6 bg-muted-bg p-4 rounded-lg border border-border">
        <div className="flex justify-between items-center"><span className="text-[13px] font-medium text-muted">{t('asset')}</span><span className="text-[14px] text-foreground font-semibold max-w-[200px] text-right truncate">{property.title}</span></div>
        <div className="flex justify-between items-center"><span className="text-[13px] font-medium text-muted">{t('capital')}</span><span className="text-[15px] text-foreground font-bold">€{amount.toLocaleString()}</span></div>
        <div className="flex justify-between items-center"><span className="text-[13px] font-medium text-muted">{t('equity')}</span><span className="text-[13px] text-foreground font-semibold">{projection.ownership.toFixed(2)}%</span></div>
        <div className="flex justify-between items-center"><span className="text-[13px] font-medium text-muted">{t('estAnnualIncome')}</span><span className="text-[13px] text-positive-400 font-semibold">€{projection.annualIncome.toFixed(0)}</span></div>
        <div className="flex justify-between items-center"><span className="text-[13px] font-medium text-muted">{t('estAppreciation')}</span><span className="text-[13px] text-positive-400 font-semibold">€{projection.appreciation.toFixed(0)}</span></div>
        <div className="flex justify-between items-center pt-2 mt-2 border-t border-border"><span className="text-[13px] font-bold text-muted">{t('sourcingFee')}</span><span className="text-[13px] text-foreground font-semibold">€{projection.fee.toFixed(0)}</span></div>
      </div>

      <RiskDisclaimer />

      <div className="mt-6 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-md border border-border py-3 text-[14px] font-semibold text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
        >
          {t('cancel')}
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-primary-500 py-3 text-[14px] font-bold text-white transition-colors hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isSubmitting ? t('processing') : t('finalizeInvestment')}
        </button>
      </div>
    </Modal>
  );
}
