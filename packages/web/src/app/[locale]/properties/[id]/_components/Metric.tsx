import type { MetricProps } from '@urban-wealth/ui';

export function Metric({ label, value, positive = false }: MetricProps) {
  return (
    <div className="bg-card p-5 text-center transition-colors hover:bg-surface-hover">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">{label}</p>
      <p className={`text-[20px] font-display font-bold tracking-tight ${positive ? 'text-positive-400' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  );
}
