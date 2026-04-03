'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { FavoritesTab } from '../profile/_components/FavoritesTab';

export default function FavoritesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations('Watchlist');

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-muted-bg">
        <div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/login?redirect=/favorites');
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-muted-bg py-12">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="animate-enter">
          <div className="mb-8">
            <h1 className="font-display text-[28px] font-bold text-foreground tracking-tight">
              {t('title')}
            </h1>
            <p className="mt-1 text-[14px] text-muted">{t('subtitle')}</p>
          </div>
          <FavoritesTab />
        </div>
      </div>
    </div>
  );
}
