import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 text-xs font-bold text-white">
                UW
              </div>
              <span className="font-display text-lg font-semibold text-white">
                Urban Wealth
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-white/40">
              Fractional real estate investment made accessible. Invest in
              premium European properties starting from €50.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/30">
              Platform
            </h4>
            <ul className="space-y-2">
              <FooterLink href="/">Browse Properties</FooterLink>
              <FooterLink href="/how-it-works">How It Works</FooterLink>
              <FooterLink href="/register">Get Started</FooterLink>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/30">
              Legal
            </h4>
            <ul className="space-y-2">
              <FooterLink href="#">Terms of Service</FooterLink>
              <FooterLink href="#">Privacy Policy</FooterLink>
              <FooterLink href="#">Risk Disclosure</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/30">
              Contact
            </h4>
            <ul className="space-y-2">
              <FooterLink href="#">Support</FooterLink>
              <FooterLink href="#">hello@urbanwealth.io</FooterLink>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Urban Wealth. This is a
            simulated platform — no real investments are made.
          </p>
          <p className="text-xs text-white/20">
            Built with Next.js, Tailwind CSS & Prisma
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-white/40 transition-colors hover:text-white/70"
      >
        {children}
      </Link>
    </li>
  );
}
