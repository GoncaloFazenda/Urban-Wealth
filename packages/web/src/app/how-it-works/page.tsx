import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-12 animate-fade-in">
        <h1 className="font-display text-[28px] sm:text-[32px] font-bold text-white tracking-tight">
          How It Works
        </h1>
        <p className="mt-1.5 text-[14px] text-surface-400">
          Start investing in premium real estate in four steps.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-8 mb-16">
        <Step
          number={1}
          title="Browse properties"
          description="Explore our curated selection of European investment properties. Each listing includes full financial details, location insights, and property images."
        />
        <Step
          number={2}
          title="Choose & calculate"
          description="Select a property that fits your goals. Use the investment calculator to preview your projected ownership, annual income, appreciation, and platform fees before committing."
        />
        <Step
          number={3}
          title="Earn returns"
          description="Receive proportional rental income deposited to your account. Additionally, benefit from long-term property value appreciation."
        />
        <Step
          number={4}
          title="Track your portfolio"
          description="Monitor all investments from your dashboard. View performance metrics, transaction history, and accumulated income at a glance."
        />
      </div>

      {/* FAQ */}
      <div className="mb-12">
        <h2 className="font-display text-[20px] font-bold text-white mb-5">
          Frequently asked questions
        </h2>
        <div className="space-y-2">
          <FaqItem
            question="What is fractional real estate investing?"
            answer="It allows you to own a portion of a property rather than buying the entire asset. You invest a smaller amount and receive proportional returns from rental income and property appreciation."
          />
          <FaqItem
            question="What is the minimum investment?"
            answer="You can start with as little as €50. There's no maximum, though each property has a remaining capacity based on current funding."
          />
          <FaqItem
            question="When are returns distributed?"
            answer="Rental income is distributed monthly based on ownership percentage. Appreciation gains are realised when a property is sold or revalued."
          />
          <FaqItem
            question="What fees does Urban Wealth charge?"
            answer="A transparent 1.5% platform fee on each investment. No hidden costs. The fee is displayed in the calculator before you confirm."
          />
          <FaqItem
            question="What happens when a property is fully funded?"
            answer="It moves to 'Fully Funded' status and no longer accepts new investments. Existing investors continue receiving returns. New properties are added regularly."
          />
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/register"
          className="inline-flex rounded-md bg-primary-500 px-6 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-400"
        >
          Start investing
        </Link>
      </div>
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-4 animate-fade-in">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-surface-800 border border-white/[0.06] text-[12px] font-semibold text-surface-300">
        {number}
      </div>
      <div className="pt-0.5">
        <h3 className="text-[15px] font-semibold text-white mb-1">{title}</h3>
        <p className="text-[13px] leading-relaxed text-surface-400">{description}</p>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-lg border border-white/[0.06] bg-surface-900 overflow-hidden">
      <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-[13px] font-medium text-white hover:bg-white/[0.02] transition-colors">
        {question}
        <svg
          className="h-3.5 w-3.5 flex-shrink-0 text-surface-500 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-4 pb-3 text-[13px] leading-relaxed text-surface-400">
        {answer}
      </div>
    </details>
  );
}
