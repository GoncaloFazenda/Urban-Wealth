import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Urban Wealth — Fractional Real Estate Investment',
  description:
    'Invest in premium European real estate starting from €50. Earn rental yield and property appreciation with fractional ownership.',
  keywords: [
    'real estate',
    'fractional investment',
    'property',
    'rental yield',
    'passive income',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface-900 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
