'use client';

import type { PropertyStatus, PropertySortField } from '@urban-wealth/core';

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
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Status tabs */}
      <div className="flex gap-1 rounded-lg bg-muted-bg border border-border p-1 shadow-sm">
        {(
          [
            { value: 'all', label: 'All Targets' },
            { value: 'open', label: 'Funding Open' },
            { value: 'coming_soon', label: 'Coming Soon' },
            { value: 'funded', label: 'Fully Funded' },
          ] as const
        ).map((option) => (
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
          <option value="">All markets</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as PropertySortField)}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm cursor-pointer"
        >
          <option value="newest">Newly Listed</option>
          <option value="yield">Highest Yield</option>
          <option value="appreciation">Top Appreciation</option>
          <option value="funded">Most Funded</option>
        </select>
      </div>
    </div>
  );
}
