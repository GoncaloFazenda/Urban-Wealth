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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {/* Status filter pills */}
        {(
          [
            { value: 'all', label: 'All' },
            { value: 'open', label: '🟢 Open' },
            { value: 'coming_soon', label: '🟡 Coming Soon' },
            { value: 'funded', label: '🔴 Funded' },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              status === option.value
                ? 'bg-primary-500/20 text-primary-300 ring-1 ring-primary-500/30'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        {/* Location dropdown */}
        <select
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="rounded-lg border border-white/10 bg-surface-800 px-3 py-2 text-sm text-white/70 outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20"
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        {/* Sort dropdown */}
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as PropertySortField)}
          className="rounded-lg border border-white/10 bg-surface-800 px-3 py-2 text-sm text-white/70 outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20"
        >
          <option value="newest">Newest First</option>
          <option value="yield">Highest Yield</option>
          <option value="appreciation">Highest Growth</option>
          <option value="funded">Most Funded</option>
        </select>
      </div>
    </div>
  );
}
