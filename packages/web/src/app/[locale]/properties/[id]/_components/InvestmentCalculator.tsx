'use client';

import { useEffect, useState } from 'react';
import type { Property } from '@urban-wealth/core';
import { calculateInvestment } from '@urban-wealth/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { CalcRow } from './CalcRow';
import { RiskDisclaimer } from './RiskDisclaimer';

interface InvestmentCalculatorProps {
  property: Property;
  onInvest: (amount: number) => void;
}

export function InvestmentCalculator({ property, onInvest }: InvestmentCalculatorProps) {
  const [amount, setAmount] = useState('');
  const num = parseFloat(amount) || 0;
  const remaining = property.totalValue * ((100 - property.funded) / 100);
  const t = useTranslations('InvestmentCalculator');

  const projection = calculateInvestment(
    num,
    property.totalValue,
    property.funded,
    property.annualYield,
    property.projectedAppreciation
  );

  useEffect(() => {
      setAmount('')
  }, [property]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="rounded-xl border border-border bg-card p-6 shadow-card"
    >
      <h3 className="text-[18px] font-display font-bold text-foreground mb-6 tracking-tight">{t('title')}</h3>

      <div className="mb-6">
        <label className="mb-2 block text-[13px] font-semibold text-muted uppercase tracking-wider">
          {t('amountLabel')}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">€</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={0}
            max={remaining}
            className="input-field text-[18px] font-semibold py-3"
            style={{ paddingLeft: '2.25rem' }}
            placeholder={t('amountPlaceholder')}
          />
        </div>
        <p className="mt-2 text-[12px] text-muted font-medium">
          {t('availableCapacity', { amount: remaining.toLocaleString(undefined, { maximumFractionDigits: 0 }) })}
        </p>
      </div>

      <AnimatePresence>
        {num > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 space-y-3 overflow-hidden"
          >
            <CalcRow label={t('impliedOwnership')} value={`${projection.ownership.toFixed(2)}%`} />
            <CalcRow label={t('projectedAnnualIncome')} value={`€${projection.annualIncome.toFixed(0)}`} positive />
            <CalcRow label={t('projectedAppreciation')} value={`€${projection.appreciation.toFixed(0)}`} positive />
            <CalcRow label={t('platformFee')} value={`€${projection.fee.toFixed(0)}`} />
            <div className="border-t border-border pt-4 mt-4">
              <CalcRow label={t('totalAnnualReturn')} value={`€${projection.totalAnnualReturn.toFixed(0)}`} bold />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RiskDisclaimer />

      <button
        onClick={() => onInvest(num)}
        disabled={!projection.isValid || property.status !== 'open'}
        className="mt-6 w-full rounded-md bg-primary-500 px-4 py-3.5 text-[14px] font-bold text-white transition-all hover:bg-primary-400 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
      >
        {property.status !== 'open' ? t('currentlyUnavailable') : t('reviewAndInvest')}
      </button>
    </motion.div>
  );
}
