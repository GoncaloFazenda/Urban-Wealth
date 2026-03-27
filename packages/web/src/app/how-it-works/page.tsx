export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-16 text-center animate-fade-in">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="gradient-text">How It Works</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/50">
          Start investing in premium real estate in four simple steps
        </p>
      </div>

      {/* Steps */}
      <div className="relative mb-20">
        {/* Connecting line */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary-500/50 via-accent-500/50 to-gold-400/50 hidden sm:block" />

        <div className="space-y-12">
          <Step
            number={1}
            title="Browse"
            description="Explore our curated selection of premium European properties. Each listing includes detailed financials, location insights, and professional photos."
            icon="🏠"
            color="from-primary-500 to-primary-600"
          />
          <Step
            number={2}
            title="Choose"
            description="Pick a property that matches your investment goals. Use our calculator to preview your projected returns, ownership percentage, and platform fee before committing."
            icon="📊"
            color="from-accent-500 to-accent-600"
          />
          <Step
            number={3}
            title="Earn"
            description="Receive your share of the property's rental yield deposited directly to your account. Plus, benefit from property value appreciation over time."
            icon="💰"
            color="from-gold-400 to-gold-500"
          />
          <Step
            number={4}
            title="Track"
            description="Monitor your entire portfolio from your personal dashboard. View investment performance, transaction history, and accumulated income at a glance."
            icon="📈"
            color="from-primary-400 to-accent-400"
          />
        </div>
      </div>

      {/* FAQ */}
      <div className="animate-slide-up">
        <h2 className="mb-8 text-center font-display text-3xl font-bold text-white">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <FaqItem
            question="What is fractional real estate investing?"
            answer="Fractional real estate investing allows you to own a portion of a property rather than the entire asset. You invest a smaller amount and receive proportional returns from rental income and property appreciation."
          />
          <FaqItem
            question="Is there a minimum investment?"
            answer="You can start investing with as little as €50. There's no maximum limit, though each property has a remaining available amount based on how much has already been funded."
          />
          <FaqItem
            question="When do I get paid?"
            answer="Rental income is distributed monthly based on your ownership percentage. Appreciation gains are realized when a property is sold or revalued annually."
          />
          <FaqItem
            question="What fees does Urban Wealth charge?"
            answer="We charge a transparent 1.5% platform fee on each investment. There are no hidden fees. The fee is clearly displayed in the investment calculator before you confirm."
          />
          <FaqItem
            question="What happens if a property is fully funded?"
            answer="Once a property reaches 100% funding, it is marked as 'Funded' and no longer accepts new investments. Existing investors continue to receive their returns. We regularly add new properties to the platform."
          />
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <a
          href="/register"
          className="inline-flex rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary-500/20 transition-all hover:shadow-primary-500/40 hover:brightness-110"
        >
          Start Investing Today
        </a>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  description,
  icon,
  color,
}: {
  number: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="flex gap-6 items-start animate-slide-up" style={{ animationDelay: `${number * 100}ms` }}>
      <div
        className={`relative z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-2xl shadow-lg`}
      >
        {icon}
      </div>
      <div className="pt-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white/30">
            Step {number}
          </span>
        </div>
        <h3 className="mb-2 font-display text-xl font-bold text-white">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-white/50 max-w-md">
          {description}
        </p>
      </div>
    </div>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group rounded-xl border border-white/5 bg-surface-800 overflow-hidden">
      <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-medium text-white hover:bg-white/[0.02] transition-colors">
        {question}
        <svg
          className="h-4 w-4 flex-shrink-0 text-white/30 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </summary>
      <div className="px-6 pb-4 text-sm leading-relaxed text-white/50">
        {answer}
      </div>
    </details>
  );
}
