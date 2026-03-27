import type { Investment } from '../entities/Investment.js';
import type { IPropertyRepository } from '../repositories/IPropertyRepository.js';
import type { IInvestmentRepository } from '../repositories/IInvestmentRepository.js';
import { investmentSchema } from '../validators/investmentSchema.js';
import { PLATFORM_FEE_RATE } from '../mockData.js';

export interface InvestInPropertyInput {
  userId: string;
  propertyId: string;
  amount: number;
}

export interface InvestInPropertyResult {
  investment: Investment;
  ownershipPercentage: number;
  estimatedAnnualIncome: number;
  estimatedAppreciationGain: number;
  platformFee: number;
}

export class InvestmentError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'InvestmentError';
  }
}

export async function investInProperty(
  propertyRepo: IPropertyRepository,
  investmentRepo: IInvestmentRepository,
  input: InvestInPropertyInput
): Promise<InvestInPropertyResult> {
  // Validate input
  const validated = investmentSchema.parse({
    propertyId: input.propertyId,
    amount: input.amount,
  });

  // Fetch property
  const property = await propertyRepo.findById(validated.propertyId);
  if (!property) {
    throw new InvestmentError('Property not found', 'PROPERTY_NOT_FOUND');
  }

  // Check property status
  if (property.status !== 'open') {
    throw new InvestmentError(
      'This property is not currently open for investment',
      'PROPERTY_NOT_OPEN'
    );
  }

  // Check if investment amount exceeds remaining value
  const remainingValue =
    property.totalValue * ((100 - property.funded) / 100);
  if (validated.amount > remainingValue) {
    throw new InvestmentError(
      'Investment amount exceeds remaining available value',
      'AMOUNT_EXCEEDS_REMAINING'
    );
  }

  // Calculate financials
  const ownershipPercentage =
    (validated.amount / property.totalValue) * 100;
  const estimatedAnnualIncome =
    property.totalValue *
    (property.annualYield / 100) *
    (ownershipPercentage / 100);
  const estimatedAppreciationGain =
    property.totalValue *
    (property.projectedAppreciation / 100) *
    (ownershipPercentage / 100);
  const platformFee = validated.amount * PLATFORM_FEE_RATE;

  // Create investment
  const investment = await investmentRepo.create({
    userId: input.userId,
    propertyId: validated.propertyId,
    amount: validated.amount,
    ownershipPercentage,
    estimatedAnnualIncome,
    estimatedAppreciationGain,
    platformFee,
    status: 'completed',
  });

  // Update property funded percentage
  const additionalPercentage =
    (validated.amount / property.totalValue) * 100;
  await propertyRepo.updateFunded(
    validated.propertyId,
    additionalPercentage
  );

  return {
    investment,
    ownershipPercentage,
    estimatedAnnualIncome,
    estimatedAppreciationGain,
    platformFee,
  };
}
