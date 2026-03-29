'use client';

import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Step } from './_components/Step';
import { FaqItem } from './_components/FaqItem';

export default function HowItWorksPage() {
  const t = useTranslations('HowItWorks');

  return (
    <div className="mx-auto max-w-4xl px-5 sm:px-6 py-16 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <span className="text-[12px] font-bold tracking-widest text-primary-500 uppercase mb-4 block">{t('sectionLabel')}</span>
        <h1 className="font-display text-[32px] sm:text-[40px] font-bold text-foreground tracking-tight mb-4">
          {t('title')}
        </h1>
        <p className="mx-auto max-w-2xl text-[16px] leading-relaxed text-muted">
          {t('subtitle')}
        </p>
      </motion.div>

      {/* Steps */}
      <div className="space-y-6 mb-20 relative">
        <div className="absolute left-6 top-8 bottom-8 w-px bg-border hidden sm:block" />
        <Step number={1} title={t('step1Title')} description={t('step1Description')} delay={0.1} />
        <Step number={2} title={t('step2Title')} description={t('step2Description')} delay={0.2} />
        <Step number={3} title={t('step3Title')} description={t('step3Description')} delay={0.3} />
        <Step number={4} title={t('step4Title')} description={t('step4Description')} delay={0.4} />
      </div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <h2 className="font-display text-[24px] font-bold text-foreground mb-6 text-center">
          {t('faqTitle')}
        </h2>
        <div className="space-y-3 max-w-3xl mx-auto">
          <FaqItem question={t('faq1Question')} answer={t('faq1Answer')} />
          <FaqItem question={t('faq2Question')} answer={t('faq2Answer')} />
          <FaqItem question={t('faq3Question')} answer={t('faq3Answer')} />
          <FaqItem question={t('faq4Question')} answer={t('faq4Answer')} />
          <FaqItem question={t('faq5Question')} answer={t('faq5Answer')} />
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="text-center bg-card border border-border rounded-2xl p-10 shadow-sm max-w-2xl mx-auto"
      >
        <h2 className="font-display text-[24px] font-bold text-foreground mb-3">{t('ctaTitle')}</h2>
        <p className="text-muted mb-8 text-[14px]">{t('ctaSubtitle')}</p>
        <Link
          href="/register"
          className="inline-flex rounded-md bg-primary-500 px-8 py-3.5 text-[14px] font-bold text-white transition-all hover:bg-primary-400 hover:shadow-lg hover:-translate-y-0.5"
        >
          {t('ctaButton')}
        </Link>
      </motion.div>
    </div>
  );
}
