import { Link } from '@/i18n/navigation';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: { label: string; href: string };
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      {icon ?? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted-bg border border-border">
          <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      <h3 className="mb-1 text-[15px] font-semibold text-foreground">{title}</h3>
      <p className="mb-5 max-w-sm text-[13px] text-muted">{message}</p>
      {action && (
        <Link
          href={action.href}
          className="rounded-md bg-primary-500 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-primary-400"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
