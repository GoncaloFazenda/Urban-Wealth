import type { SummaryCardProps } from '@urban-wealth/ui';

export function SummaryCard({ label, value, positive = false }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <p className="text-[12px] font-bold uppercase tracking-wider text-muted mb-2">{label}</p>
      <p className={`text-[28px] font-display font-bold tracking-tight ${positive ? 'text-positive-400' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  );
}
