'use client';

import { useTranslations } from 'next-intl';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  const t = useTranslations('ErrorState');

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive-400/[0.08]">
        <svg className="h-5 w-5 text-destructive-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h3 className="mb-1 text-[15px] font-semibold text-white">{title ?? t('defaultTitle')}</h3>
      <p className="mb-5 max-w-sm text-[13px] text-surface-500">{message ?? t('defaultMessage')}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md bg-white/[0.06] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/[0.10]"
        >
          {t('tryAgain')}
        </button>
      )}
    </div>
  );
}
