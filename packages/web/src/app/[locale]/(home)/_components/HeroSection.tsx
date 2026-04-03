'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const t = useTranslations('Hero');

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div ref={ref} className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-black">
      {/* Background Parallax */}
      <motion.div style={{ y }} className="absolute inset-[-20%_0_0_0] z-0">
        <img
          src="/heros/hero-luxury.png"
          alt="Premium Real Estate"
          className="w-full h-full object-cover object-center scale-105 mt-20"
        />
      </motion.div>
      {/* Gradient overlay — stays fixed, not affected by parallax */}
      <motion.div style={{ opacity }} className="absolute inset-0 z-[1] bg-gradient-to-t from-black via-black/40 to-black/10" />

      {/* Hero Content */}
      <div className="relative z-20 mx-auto max-w-6xl px-5 sm:px-6 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-block mb-6 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
            <span className="text-[12px] font-semibold text-white tracking-wider uppercase">
              {t('badge')}
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight mb-6 drop-shadow-lg whitespace-pre-line">
            {t('title')}
          </h1>
          <p className="mx-auto mt-4 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed font-light mb-10 drop-shadow-md">
            {t('subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#properties"
              className="w-full sm:w-auto rounded-md bg-white px-8 py-3.5 text-[15px] font-semibold text-black transition-transform hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center gap-2"
            >
              {t('cta')} <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
