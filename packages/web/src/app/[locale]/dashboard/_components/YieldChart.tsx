'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslations } from 'next-intl';

interface YieldItem {
  name: string;
  invested: number;
  annualIncome: number;
  yieldPercent: number;
}

export function YieldChart({ data }: { data: YieldItem[] }) {
  const t = useTranslations('Dashboard');

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-[15px] font-display font-bold text-foreground mb-4">
        {t('yieldTitle')}
      </h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: 'var(--color-muted)' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              tickFormatter={(v: string) => v.length > 12 ? `${v.slice(0, 12)}...` : v}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
              width={40}
            />
            <Tooltip
              formatter={(value, name) => [
                name === 'yieldPercent' ? `${value}%` : `€${Number(value).toLocaleString()}`,
                name === 'yieldPercent' ? t('yieldLabel') : t('incomeLabel'),
              ]}
              contentStyle={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
              }}
            />
            <Bar
              dataKey="yieldPercent"
              fill="var(--color-positive-400)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
