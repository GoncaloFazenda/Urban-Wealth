'use client';

import { motion } from 'framer-motion';

interface StepProps {
  number: number;
  title: string;
  description: string;
  delay: number;
}

export function Step({ number, title, description, delay }: StepProps) {
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
