'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProfileForm } from './_components/ProfileForm';
import { PasswordForm } from './_components/PasswordForm';
import { AccountInfo } from './_components/AccountInfo';
import { FavoritesTab } from './_components/FavoritesTab';

type Tab = 'settings' | 'favorites';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations('Profile');
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'favorites' ? 'favorites' : 'settings';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-muted-bg">
        <div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/login?redirect=/profile');
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-muted-bg py-12">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="animate-enter">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-hover text-xl font-bold text-foreground border border-border">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="font-display text-[28px] font-bold text-foreground tracking-tight">
                  {t('title')}
                </h1>
                <p className="text-[14px] text-muted">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border mb-8">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2.5 text-[14px] font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === 'settings'
                  ? 'border-primary-500 text-foreground'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              {t('settingsTab')}
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-2.5 text-[14px] font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === 'favorites'
                  ? 'border-primary-500 text-foreground'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              {t('favoritesTab')}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'settings' ? (
            <div className="max-w-2xl space-y-8">
              <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
                <ProfileForm />
              </section>

              <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
                <PasswordForm />
              </section>

              <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
                <AccountInfo />
              </section>
            </div>
          ) : (
            <FavoritesTab />
          )}
        </div>
      </div>
    </div>
  );
}
