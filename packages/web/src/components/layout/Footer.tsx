import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto bg-card text-card-foreground">
      {/* Newsletter Strip */}
      <div className="border-b border-border bg-muted-bg">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-md">
            <h3 className="text-[18px] font-display font-bold text-foreground tracking-tight mb-2">
              Join the inner circle
            </h3>
            <p className="text-[14px] text-muted leading-relaxed">
              Get early access to exclusive European real estate opportunities before they open to the public.
            </p>
          </div>
          <div className="flex w-full md:w-auto max-w-md gap-2">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="input-field max-w-[280px]"
            />
            <button className="rounded-md bg-foreground px-4 py-2 text-[14px] font-medium text-background transition-transform hover:scale-105 active:scale-95 shadow-sm whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:pr-4">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary-500 font-display text-[11px] font-bold text-white transition-transform group-hover:scale-105">
                UW
              </div>
              <span className="font-display text-[16px] font-bold text-foreground tracking-tight">
                Urban Wealth
              </span>
            </Link>
            <p className="text-[13px] leading-relaxed text-muted">
              Fractional investment in premium European real estate. Starting from €50, giving everyone access to high-yield property markets.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted">
              Platform
            </h4>
            <ul className="space-y-3">
              <FooterLink href="/">Browse Properties</FooterLink>
              <FooterLink href="/how-it-works">How It Works</FooterLink>
              <FooterLink href="/register">Get Started</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted">
              Legal
            </h4>
            <ul className="space-y-3">
              <FooterLink href="#">Terms of Service</FooterLink>
              <FooterLink href="#">Privacy Policy</FooterLink>
              <FooterLink href="#">Risk Disclosure</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted">
              Contact
            </h4>
            <ul className="space-y-3">
              <FooterLink href="#">Support Centre</FooterLink>
              <FooterLink href="#">hello@urbanwealth.io</FooterLink>
              <li className="pt-2 flex gap-4">
                {/* Social placeholders */}
                <div className="h-4 w-4 rounded-sm bg-border hover:bg-muted transition-colors cursor-pointer" />
                <div className="h-4 w-4 rounded-sm bg-border hover:bg-muted transition-colors cursor-pointer" />
                <div className="h-4 w-4 rounded-sm bg-border hover:bg-muted transition-colors cursor-pointer" />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-muted text-center md:text-left">
            © {new Date().getFullYear()} Urban Wealth. Simulated platform — no real investments.
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
