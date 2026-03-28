import type { FormFieldProps } from '@urban-wealth/ui';

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-semibold text-muted uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-[12px] font-medium text-destructive-400">{error}</p>}
    </div>
  );
}
