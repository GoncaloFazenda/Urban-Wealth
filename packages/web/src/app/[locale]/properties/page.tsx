'use client';

import { Suspense } from 'react';
import { PropertiesGrid } from './_components/PropertiesGrid';

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <PropertiesGrid />
    </Suspense>
  );
}
