'use client';

import { useState } from 'react';

interface FaqItemProps {
  question: string;
  answer: string;
}

export function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-xl border bg-card overflow-hidden shadow-sm transition-colors ${open ? 'border-primary-500/30' : 'border-border'}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between px-6 py-4 text-left text-[14px] font-bold text-foreground hover:bg-muted-bg transition-colors"
      >
        {question}
        <svg
          className="h-4 w-4 shrink-0 text-muted transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.3s ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="px-6 pb-5 pt-1 text-[14px] leading-relaxed text-muted font-medium">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}
