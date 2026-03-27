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
      <div className="flex gap-1 rounded-lg bg-surface-900 border border-white/[0.06] p-0.5">
        {(
          [
            { value: 'all', label: 'All' },
            { value: 'open', label: 'Open' },
            { value: 'coming_soon', label: 'Coming Soon' },
            { value: 'funded', label: 'Funded' },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-all ${
              status === option.value
                ? 'bg-white/[0.08] text-white shadow-sm'
                : 'text-surface-400 hover:text-surface-300'
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
          className="rounded-md border border-white/[0.08] bg-surface-900 px-3 py-1.5 text-[12px] text-surface-300 outline-none focus:border-primary-500/40 transition-colors"
        >
          <option value="">All locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as PropertySortField)}
          className="rounded-md border border-white/[0.08] bg-surface-900 px-3 py-1.5 text-[12px] text-surface-300 outline-none focus:border-primary-500/40 transition-colors"
        >
          <option value="newest">Newest</option>
          <option value="yield">Highest yield</option>
          <option value="appreciation">Highest growth</option>
          <option value="funded">Most funded</option>
        </select>
      </div>
    </div>
  );
}
