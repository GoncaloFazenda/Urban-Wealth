'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface MotionDivProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
}

export function MotionDiv({ children, ...props }: MotionDivProps) {
  return <motion.div {...props}>{children}</motion.div>;
}
