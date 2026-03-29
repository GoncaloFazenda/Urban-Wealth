'use client';

import type { PropertyStatus, PropertySortField } from '@urban-wealth/core';
import { useTranslations } from 'next-intl';

interface PropertyFiltersProps {
  status: PropertyStatus | 'all';
  location: string;
  sort: PropertySortField;
  locations: string[];
  onStatusChange: (status: PropertyStatus | 'all') => void;
  onLocationChange: (location: string) => void;
  onSortChange: (sort: PropertySortField) => void;
}

export function PropertyFilters({
  status,
  location,
  sort,
  locations,
  onStatusChange,
  onLocationChange,
  onSortChange,
}: PropertyFiltersProps) {
  const t = useTranslations('PropertyFilters');

  const statusOptions: Array<{ value: PropertyStatus | 'all'; label: string }> = [
    { value: 'all', label: t('allTargets') },
    { value: 'open', label: t('fundingOpen') },
    { value: 'coming_soon', label: t('comingSoon') },
    { value: 'funded', label: t('fullyFunded') },
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Status tabs */}
      <div className="flex gap-1 rounded-lg bg-muted-bg border border-border p-1 shadow-sm">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className={`rounded-md px-4 py-1.5 text-[13px] font-semibold transition-all ${
              status === option.value
                ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
                : 'text-muted hover:text-foreground hover:bg-surface-hover/50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <select
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm cursor-pointer"
        >
          <option value="">{t('allMarkets')}</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as PropertySortField)}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm cursor-pointer"
        >
          <option value="newest">{t('newlyListed')}</option>
          <option value="yield">{t('highestYield')}</option>
          <option value="appreciation">{t('topAppreciation')}</option>
          <option value="funded">{t('mostFunded')}</option>
        </select>
      </div>
    </div>
  );
}
