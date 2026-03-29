'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ProfileForm } from './_components/ProfileForm';
import { PasswordForm } from './_components/PasswordForm';
import { AccountInfo } from './_components/AccountInfo';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations('Profile');

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
      <div className="mx-auto max-w-2xl px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-10">
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

          {/* Sections */}
          <div className="space-y-8">
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
        </motion.div>
      </div>
    </div>
  );
}
