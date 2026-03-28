'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 sm:px-6 py-16 pb-24">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <span className="text-[12px] font-bold tracking-widest text-primary-500 uppercase mb-4 block">Process</span>
        <h1 className="font-display text-[32px] sm:text-[40px] font-bold text-foreground tracking-tight mb-4">
          How Urban Wealth Works
        </h1>
        <p className="mx-auto max-w-2xl text-[16px] leading-relaxed text-muted">
          We democratize access to institutional-grade European real estate. Start building your legacy in four simple steps.
        </p>
      </motion.div>

      {/* Steps */}
      <div className="space-y-6 mb-20 relative">
        <div className="absolute left-6 top-8 bottom-8 w-px bg-border hidden sm:block" />
        <Step
          number={1}
          title="Curated Selection"
          description="Explore our curated selection of European investment properties. Our acquisitions team strictly vets every asset, providing full financial details, location insights, and independent valuations."
          delay={0.1}
        />
        <Step
          number={2}
          title="Analyze & Allocate"
          description="Select a property that fits your strategy. Use our investment calculator to project your ownership equity, est. annual yield, and potential appreciation before committing capital."
          delay={0.2}
        />
        <Step
          number={3}
          title="Passive Income"
          description="Receive your proportional share of rental income deposited directly to your account. Simultaneously benefit from long-term capital appreciation as property values rise."
          delay={0.3}
        />
        <Step
          number={4}
          title="Portfolio Management"
          description="Monitor your investments from an intuitive dashboard. Track real-time performance metrics, view comprehensive transaction histories, and reinvest accumulated dividends."
          delay={0.4}
        />
      </div>

      {/* FAQ */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <h2 className="font-display text-[24px] font-bold text-foreground mb-6 text-center">
          Frequently asked questions
        </h2>
        <div className="space-y-3 max-w-3xl mx-auto">
          <FaqItem
            question="What is fractional real estate investing?"
            answer="Fractional investing allows you to purchase equity in a property alongside other investors, rather than funding the entire asset yourself. You receive proportional returns from rental income and property appreciation relative to your share."
          />
          <FaqItem
            question="What is the minimum capital requirement?"
            answer="You can begin investing with as little as €50. There is no maximum limit, although individual allocations are subject to the remaining funding capacity of each property."
          />
          <FaqItem
            question="When are dividends distributed?"
            answer="Rental income dividends are distributed on a monthly basis directly to your platform wallet. Capital appreciation is realized either upon the strategic sale of the asset or through periodic equity refinancing."
          />
          <FaqItem
            question="What is the fee structure?"
            answer="We charge a transparent, one-time sourcing fee of 1.5% on initially invested capital. There are no hidden management or performance fees—what you see in the calculator is what you pay."
          />
          <FaqItem
            question="What happens when an asset reaches its funding target?"
            answer="The property status updates to 'Fully Funded' and the equity offering closes. Settlement occurs shortly after, and investors begin accruing rental yield. New vetted assets are listed regularly."
          />
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="text-center bg-card border border-border rounded-2xl p-10 shadow-sm max-w-2xl mx-auto"
      >
        <h2 className="font-display text-[24px] font-bold text-foreground mb-3">Ready to begin?</h2>
        <p className="text-muted mb-8 text-[14px]">Create an account in minutes and access our exclusive portfolio.</p>
        <Link
          href="/register"
          className="inline-flex rounded-md bg-primary-500 px-8 py-3.5 text-[14px] font-bold text-white transition-all hover:bg-primary-400 hover:shadow-lg hover:-translate-y-0.5"
        >
          Start Building Your Portfolio
        </Link>
      </motion.div>
    </div>
  );
}

function Step({ number, title, description, delay }: { number: number; title: string; description: string; delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="flex gap-5 sm:gap-8 group"
    >
      <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-card border border-border shadow-sm text-[16px] font-display font-bold text-primary-500 transition-transform group-hover:scale-110">
        {number}
      </div>
      <div className="pt-2 pb-6">
        <h3 className="text-[18px] font-display font-bold text-foreground mb-2">{title}</h3>
        <p className="text-[14px] leading-relaxed text-muted max-w-2xl">{description}</p>
      </div>
    </motion.div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-[14px] font-bold text-foreground hover:bg-muted-bg transition-colors">
        {question}
        <svg
          className="h-4 w-4 flex-shrink-0 text-muted transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-6 pb-5 pt-1 text-[14px] leading-relaxed text-muted font-medium bg-card">
        {answer}
      </div>
    </details>
  );
}
