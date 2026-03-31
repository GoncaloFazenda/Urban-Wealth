'use client';

import { useRef, useEffect, useState, type ReactNode, type CSSProperties } from 'react';

interface FadeInViewProps {
  children: ReactNode;
  className?: string;
  /** Animation style: 'slide-up' (default), 'scale', or 'slide-left' */
  animation?: 'slide-up' | 'scale' | 'slide-left';
  /** Delay in seconds before animation starts */
  delay?: number;
  /** Duration in seconds (default 0.6) */
  duration?: number;
  /** Bottom margin for viewport trigger (default '-50px') */
  margin?: string;
  style?: CSSProperties;
}

export function FadeInView({
  children,
  className = '',
  animation = 'slide-up',
  delay = 0,
  duration = 0.6,
  margin = '-50px',
  style,
}: FadeInViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: `0px 0px ${margin} 0px` }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [margin]);

  const animationClass = isVisible
    ? animation === 'scale'
      ? 'animate-scale-in'
      : animation === 'slide-left'
        ? 'animate-slide-in-left'
        : 'animate-enter'
    : '';

  return (
    <div
      ref={ref}
      className={`${className} ${animationClass}`}
      style={{
        ...style,
        opacity: isVisible ? undefined : 0,
        animationDelay: delay ? `${delay}s` : undefined,
        animationDuration: `${duration}s`,
      }}
    >
      {children}
    </div>
  );
}
