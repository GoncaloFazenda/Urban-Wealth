'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslations } from 'next-intl';

interface AllocationItem {
  name: string;
  value: number;
}

const COLORS = [
  'var(--color-primary-500)',
  'var(--color-positive-400)',
  'var(--color-warning-400)',
  '#6366f1',
  '#ec4899',
  '#14b8a6',
  '#f59e0b',
  '#8b5cf6',
];

export function AllocationChart({ data }: { data: AllocationItem[] }) {
  const t = useTranslations('Dashboard');
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-[15px] font-display font-bold text-foreground mb-4">
        {t('allocationTitle')}
      </h3>
      <div className="flex items-center gap-6">
        <div className="w-40 h-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                dataKey="value"
                strokeWidth={2}
                stroke="var(--color-card)"
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `€${Number(value).toLocaleString()}`}
                contentStyle={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: COLORS[index % COLORS.length] }}
                />
                <span className="text-[12px] font-medium text-muted truncate">{item.name}</span>
              </div>
              <span className="text-[12px] font-bold text-foreground shrink-0">
                {total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
