'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ChevronDown, ExternalLink } from 'lucide-react';

interface Transaction {
  id: string;
  type?: string;
  propertyId?: string;
  propertyTitle?: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface Holding {
  propertyId: string;
  propertyTitle: string;
  amount: number;
  ownershipPercentage: number;
  status: string;
  investments: { id: string; amount: number }[];
}

interface HoldingRowProps {
  holding: Holding;
  transactions: Transaction[];
  onSell: () => void;
}

export function HoldingRow({ holding, transactions, onSell }: HoldingRowProps) {
  const t = useTranslations('Dashboard');
  const [open, setOpen] = useState(false);

  const propertyTx = transactions.filter((tx) => tx.propertyId === holding.propertyId);

  return (
    <div className={`rounded-xl border bg-card shadow-sm overflow-hidden transition-colors ${open ? 'border-primary-500/30' : 'border-border hover:border-primary-500/20'}`}>
      {/* Header row — clicking anywhere toggles the accordion */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((o) => !o)}
        className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer hover:bg-surface-hover/40 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <Link
            href={`/properties/${holding.propertyId}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-[15px] font-bold text-foreground hover:text-primary-500 transition-colors group/link"
          >
            {holding.propertyTitle}
            <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover/link:opacity-100 transition-opacity" />
          </Link>
          <p className="text-[13px] font-medium text-muted mt-0.5">
            {t('equityOwnership', { value: holding.ownershipPercentage.toFixed(2) })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[16px] font-bold text-foreground">€{holding.amount.toLocaleString()}</p>
            <p className="text-[12px] font-semibold text-primary-500 uppercase tracking-widest mt-0.5">{holding.status}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onSell(); }}
            className="rounded-md border border-border px-3 py-1.5 text-[12px] font-semibold text-muted hover:text-foreground hover:bg-surface-hover hover:border-primary-500/30 transition-all"
          >
            {t('sellPosition')}
          </button>
          <ChevronDown
            className="w-4 h-4 shrink-0 text-muted transition-transform duration-300"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>
      </div>

      {/* Animated expandable transactions */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.3s ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="border-t border-border">
            {propertyTx.length === 0 ? (
              <p className="px-5 py-4 text-[13px] text-muted italic">No transactions for this property yet.</p>
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-muted-bg">
                    <th className="px-5 py-2.5 text-left text-[11px] font-bold text-muted uppercase tracking-wider whitespace-nowrap">{t('thDate')}</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-bold text-muted uppercase tracking-wider whitespace-nowrap">{t('thType')}</th>
                    <th className="px-5 py-2.5 text-right text-[11px] font-bold text-muted uppercase tracking-wider whitespace-nowrap">{t('thAmount')}</th>
                    <th className="px-5 py-2.5 text-right text-[11px] font-bold text-muted uppercase tracking-wider whitespace-nowrap">{t('thStatus')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {propertyTx.map((tx) => (
                    <tr key={tx.id} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="px-5 py-3 text-muted font-medium whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase ${
                          tx.type === 'Sale'
                            ? 'bg-warning-400/10 text-warning-400 border border-warning-400/20'
                            : tx.type === 'Purchase'
                              ? 'bg-blue-400/10 text-blue-400 border border-blue-400/20'
                              : 'bg-muted-bg text-muted border border-border'
                        }`}>
                          {tx.type === 'Sale' ? t('typeSale') : tx.type === 'Purchase' ? t('typePurchase') : t('typeInvestment')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-foreground whitespace-nowrap">
                        €{tx.amount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase ${
                          tx.status === 'Completed'
                            ? 'bg-positive-400/10 text-positive-400 border border-positive-400/20'
                            : 'bg-warning-400/10 text-warning-400 border border-warning-400/20'
                        }`}>
                          {tx.status === 'Completed' ? t('statusCompleted') : t('statusPending')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
