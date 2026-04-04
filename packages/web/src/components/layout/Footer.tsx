'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="border-t border-border mt-auto bg-card text-card-foreground">
      {/* Newsletter Strip */}
      <div className="border-b border-border bg-muted-bg">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-md">
            <h3 className="text-[18px] font-display font-bold text-foreground tracking-tight mb-2">
              {t('newsletterTitle')}
            </h3>
            <p className="text-[14px] text-muted leading-relaxed">
              {t('newsletterDescription')}
            </p>
          </div>
          <div className="flex w-full md:w-auto max-w-md gap-2">
            <input
              type="email"
              placeholder={t('emailPlaceholder')}
              className="input-field max-w-[280px]"
            />
            <button className="rounded-md bg-foreground px-4 py-2 text-[14px] font-medium text-background transition-transform hover:scale-105 active:scale-95 shadow-sm whitespace-nowrap">
              {t('subscribe')}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:pr-4">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-[0.4rem] bg-card border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className="h-[18px] w-[18px] text-primary-500 transition-transform duration-300 group-hover:-translate-y-0.5"
                >
                  <path d="M12 3v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M8 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 21V12h4v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 21v-5h4v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 21h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-display text-[17px] font-bold text-foreground tracking-tight transition-colors group-hover:text-primary-500">
                Urban Wealth
              </span>
            </Link>
            <p className="text-[13px] leading-relaxed text-muted">
              {t('brandDescription')}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted">
              {t('platform')}
            </h4>
            <ul className="space-y-3">
              <FooterLink href="/">{t('browseProperties')}</FooterLink>
              <FooterLink href="/how-it-works">{t('howItWorks')}</FooterLink>
              <FooterLink href="/register">{t('getStarted')}</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted">
              {t('legal')}
            </h4>
            <ul className="space-y-3">
              <FooterLink href="#">{t('termsOfService')}</FooterLink>
              <FooterLink href="#">{t('privacyPolicy')}</FooterLink>
              <FooterLink href="#">{t('riskDisclosure')}</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted">
              {t('contact')}
            </h4>
            <ul className="space-y-3">
              <FooterLink href="#">{t('supportCentre')}</FooterLink>
              <FooterLink href="#">hello@urbanwealth.io</FooterLink>
              <li className="pt-2 flex gap-4">
                <div className="h-4 w-4 rounded-sm bg-border hover:bg-muted transition-colors cursor-pointer" />
                <div className="h-4 w-4 rounded-sm bg-border hover:bg-muted transition-colors cursor-pointer" />
                <div className="h-4 w-4 rounded-sm bg-border hover:bg-muted transition-colors cursor-pointer" />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-muted text-center md:text-left">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-4 text-[11px] text-muted">
            <span>Next.js</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>Tailwind</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>Prisma</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-[13px] text-muted transition-colors hover:text-foreground">
        {children}
      </Link>
    </li>
  );
}
