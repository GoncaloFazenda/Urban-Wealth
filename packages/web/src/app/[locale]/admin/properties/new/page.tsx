'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { PropertyForm } from '@/components/admin/PropertyForm';

export default function NewPropertyPage() {
  const t = useTranslations('Admin');

  return (
    <div className="max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="font-display text-[28px] font-bold text-foreground tracking-tight">
          {t('newPropertyTitle')}
        </h1>
        <p className="mt-1 text-[14px] text-muted">{t('newPropertySubtitle')}</p>
      </motion.div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
        <PropertyForm mode="create" />
      </div>
    </div>
  );
}
