import type { CalcRowProps } from '@urban-wealth/ui';

export function CalcRow({ label, value, positive = false, bold = false }: CalcRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[13px] ${bold ? 'font-bold text-foreground' : 'font-medium text-muted'}`}>{label}</span>
      <span className={`text-[13px] font-semibold ${bold ? 'text-foreground text-[16px]' : positive ? 'text-positive-400' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  );
}
