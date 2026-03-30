'use client';

import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslations } from 'next-intl';

interface TimelineItem {
  month: string;
  total: number;
}

export function TimelineChart({ data }: { data: TimelineItem[] }) {
  const t = useTranslations('Dashboard');

  if (data.length < 2) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-[15px] font-display font-bold text-foreground mb-4">
        {t('timelineTitle')}
      </h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary-500)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-primary-500)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: string) => {
                const parts = v.split('-');
                const m = parts[1] ?? '';
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return months[parseInt(m, 10) - 1] ?? v;
              }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`}
              width={50}
            />
            <Tooltip
              formatter={(value) => [`€${Number(value).toLocaleString()}`, t('totalInvested')]}
              contentStyle={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
              }}
              labelFormatter={(label) => {
                const parts = String(label).split('-');
                const y = parts[0] ?? '';
                const m = parts[1] ?? '';
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return `${months[parseInt(m, 10) - 1]} ${y}`;
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--color-primary-500)"
              strokeWidth={2}
              fill="url(#portfolioGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
