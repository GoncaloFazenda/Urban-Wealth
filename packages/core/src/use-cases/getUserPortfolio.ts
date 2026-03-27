import type { InvestmentWithProperty } from '../entities/Investment.js';
import type { IInvestmentRepository } from '../repositories/IInvestmentRepository.js';

export interface PortfolioSummary {
  totalInvested: number;
  totalProperties: number;
  estimatedAnnualIncome: number;
  investments: InvestmentWithProperty[];
}

export async function getUserPortfolio(
  investmentRepo: IInvestmentRepository,
  userId: string
): Promise<PortfolioSummary> {
  const investments = await investmentRepo.findByUserId(userId);
  const totalInvested = await investmentRepo.getTotalInvestedByUser(userId);

  const uniquePropertyIds = new Set(investments.map((i) => i.propertyId));
  const estimatedAnnualIncome = investments.reduce(
    (sum, inv) => sum + inv.estimatedAnnualIncome,
    0
  );

  return {
    totalInvested,
    totalProperties: uniquePropertyIds.size,
    estimatedAnnualIncome,
    investments,
  };
}
