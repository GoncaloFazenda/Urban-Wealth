import { calculateInvestment } from '../src/hooks/useInvestmentCalculator';
import { PLATFORM_FEE_RATE } from '@urban-wealth/core';

describe('calculateInvestment', () => {
  const property = {
    totalValue: 500_000,
    funded: 40,      // 60% remaining → €300,000 available
    annualYield: 6,
    projectedAppreciation: 3,
  };

  it('returns isValid=true for an amount within available capacity', () => {
    const result = calculateInvestment(
      10_000,
      property.totalValue,
      property.funded,
      property.annualYield,
      property.projectedAppreciation,
    );
    expect(result.isValid).toBe(true);
  });

  it('returns isValid=false for zero amount', () => {
    const result = calculateInvestment(0, property.totalValue, property.funded, property.annualYield, property.projectedAppreciation);
    expect(result.isValid).toBe(false);
  });

  it('returns isValid=false when amount exceeds remaining capacity', () => {
    // Available = 500_000 * 0.60 = 300_000
    const result = calculateInvestment(
      300_001,
      property.totalValue,
      property.funded,
      property.annualYield,
      property.projectedAppreciation,
    );
    expect(result.isValid).toBe(false);
  });

  it('returns isValid=true for an amount exactly equal to remaining capacity', () => {
    const available = property.totalValue * ((100 - property.funded) / 100);
    const result = calculateInvestment(
      available,
      property.totalValue,
      property.funded,
      property.annualYield,
      property.projectedAppreciation,
    );
    expect(result.isValid).toBe(true);
  });

  it('calculates ownership percentage correctly', () => {
    const amount = 50_000;
    const result = calculateInvestment(amount, property.totalValue, property.funded, property.annualYield, property.projectedAppreciation);
    // 50_000 / 500_000 * 100 = 10%
    expect(result.ownership).toBeCloseTo(10, 5);
  });

  it('calculates annual income correctly', () => {
    const amount = 50_000;
    const result = calculateInvestment(amount, property.totalValue, property.funded, property.annualYield, property.projectedAppreciation);
    // totalValue * yield% * ownership% = 500_000 * 0.06 * 0.10 = 3_000
    expect(result.annualIncome).toBeCloseTo(3_000, 2);
  });

  it('calculates appreciation correctly', () => {
    const amount = 50_000;
    const result = calculateInvestment(amount, property.totalValue, property.funded, property.annualYield, property.projectedAppreciation);
    // 500_000 * 0.03 * 0.10 = 1_500
    expect(result.appreciation).toBeCloseTo(1_500, 2);
  });

  it('calculates platform fee correctly', () => {
    const amount = 10_000;
    const result = calculateInvestment(amount, property.totalValue, property.funded, property.annualYield, property.projectedAppreciation);
    expect(result.fee).toBeCloseTo(amount * PLATFORM_FEE_RATE, 5);
  });

  it('calculates totalAnnualReturn as annualIncome + appreciation', () => {
    const amount = 50_000;
    const result = calculateInvestment(amount, property.totalValue, property.funded, property.annualYield, property.projectedAppreciation);
    expect(result.totalAnnualReturn).toBeCloseTo(result.annualIncome + result.appreciation, 5);
  });

  it('returns zero ownership and zero income for zero amount', () => {
    const result = calculateInvestment(0, property.totalValue, property.funded, property.annualYield, property.projectedAppreciation);
    expect(result.ownership).toBe(0);
    expect(result.annualIncome).toBe(0);
    expect(result.appreciation).toBe(0);
  });

  it('handles a fully funded property (0% available)', () => {
    // funded=100 → remaining=0 → any amount > 0 is invalid
    const result = calculateInvestment(100, property.totalValue, 100, property.annualYield, property.projectedAppreciation);
    expect(result.isValid).toBe(false);
  });

  it('handles a completely unfunded property', () => {
    const available = property.totalValue;
    const result = calculateInvestment(available, property.totalValue, 0, property.annualYield, property.projectedAppreciation);
    expect(result.isValid).toBe(true);
    expect(result.ownership).toBeCloseTo(100, 5);
  });
});
