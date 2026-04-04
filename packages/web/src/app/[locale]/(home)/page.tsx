import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { HeroSection } from './_components/HeroSection';
import { StatsSection } from './_components/StatsSection';
import { PropertiesLoader } from './_components/PropertiesLoader';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="w-full">
      <HeroSection />
      <StatsSection />
      <Suspense
        fallback={
          <div className="h-96 w-full flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
          </div>
        }
      >
        <PropertiesLoader />
      </Suspense>
    </div>
  );
}
