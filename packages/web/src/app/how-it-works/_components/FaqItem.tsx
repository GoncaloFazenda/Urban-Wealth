interface FaqItemProps {
  question: string;
  answer: string;
}

export function FaqItem({ question, answer }: FaqItemProps) {
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
