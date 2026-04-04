import { FadeInView } from '@/components/ui/FadeInView';

interface StepProps {
  number: number;
  title: string;
  description: string;
  delay: number;
}

export function Step({ number, title, description, delay }: StepProps) {
  return (
    <FadeInView
      animation="slide-left"
      delay={delay}
      duration={0.5}
      className="flex gap-5 sm:gap-8 group"
    >
      <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-card border border-border shadow-sm text-[16px] font-display font-bold text-primary-500 transition-transform group-hover:scale-110">
        {number}
      </div>
      <div className="pt-2 pb-6">
        <h3 className="text-[18px] font-display font-bold text-foreground mb-2">{title}</h3>
        <p className="text-[14px] leading-relaxed text-muted max-w-2xl">{description}</p>
      </div>
    </FadeInView>
  );
}
