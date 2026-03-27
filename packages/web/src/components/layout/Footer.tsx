import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-auto">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-500 text-[10px] font-bold text-white">
                UW
              </div>
              <span className="font-display text-sm font-semibold text-white tracking-tight">
                Urban Wealth
              </span>
            </Link>
            <p className="mt-3 text-[13px] leading-relaxed text-surface-500">
              Fractional real estate investment. Invest in premium European properties starting from €50.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-surface-500">
              Platform
            </h4>
            <ul className="space-y-2">
              <FooterLink href="/">Browse Properties</FooterLink>
              <FooterLink href="/how-it-works">How It Works</FooterLink>
              <FooterLink href="/register">Get Started</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-surface-500">
              Legal
            </h4>
            <ul className="space-y-2">
              <FooterLink href="#">Terms of Service</FooterLink>
              <FooterLink href="#">Privacy Policy</FooterLink>
              <FooterLink href="#">Risk Disclosure</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-surface-500">
              Contact
            </h4>
            <ul className="space-y-2">
              <FooterLink href="#">Support Centre</FooterLink>
              <FooterLink href="#">hello@urbanwealth.io</FooterLink>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-surface-600">
            © {new Date().getFullYear()} Urban Wealth. Simulated platform — no real investments.
          </p>
          <p className="text-[11px] text-surface-600">
            Next.js · Tailwind · Prisma
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-[13px] text-surface-500 transition-colors hover:text-surface-300">
        {children}
      </Link>
    </li>
  );
}
