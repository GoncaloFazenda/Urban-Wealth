import type { ReactNode } from 'react';

/** Shared prop types for components implemented on both web and native */

export interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export interface MetricProps {
  label: string;
  value: string;
  positive?: boolean;
}

export interface CalcRowProps {
  label: string;
  value: string;
  positive?: boolean;
  bold?: boolean;
}

export interface SummaryCardProps {
  label: string;
  value: string;
  positive?: boolean;
}

export interface StatusBadgeConfig {
  label: string;
  dot: string;
  text: string;
  bg: string;
}
