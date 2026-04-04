import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { PropertiesGridLoader } from './_components/PropertiesGridLoader';

export default async function PropertiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <PropertiesGridLoader />
    </Suspense>
  );
}
