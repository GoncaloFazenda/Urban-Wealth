import { PLATFORM_FEE_RATE } from '@urban-wealth/core';

export interface InvestmentProjection {
  ownership: number;
  annualIncome: number;
  appreciation: number;
  fee: number;
  totalAnnualReturn: number;
  isValid: boolean;
}

/**
 * Pure calculation logic for the investment calculator.
 * Platform-agnostic — usable from web (React) or native (React Native).
 */
export function calculateInvestment(
  amount: number,
  totalValue: number,
  funded: number,
  annualYield: number,
  projectedAppreciation: number
): InvestmentProjection {
  const remaining = totalValue * ((100 - funded) / 100);
  const ownership = amount > 0 ? (amount / totalValue) * 100 : 0;
  const annualIncome = totalValue * (annualYield / 100) * (ownership / 100);
  const appreciation = totalValue * (projectedAppreciation / 100) * (ownership / 100);
  const fee = amount * PLATFORM_FEE_RATE;
  const totalAnnualReturn = annualIncome + appreciation;
  const isValid = amount > 0 && amount <= remaining;

  return { ownership, annualIncome, appreciation, fee, totalAnnualReturn, isValid };
}
