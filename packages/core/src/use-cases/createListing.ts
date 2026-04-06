import type { Listing } from '../entities/Listing';
import type { IListingRepository } from '../repositories/IListingRepository';
import type { IInvestmentRepository } from '../repositories/IInvestmentRepository';
import { createListingSchema } from '../validators/listingSchema';

export interface CreateListingInput {
  userId: string;
  investmentId: string;
  sharesAmount: number;
  askPrice: number;
}

export class ListingError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'ListingError';
  }
}

export async function createListing(
  listingRepo: IListingRepository,
  investmentRepo: IInvestmentRepository,
  input: CreateListingInput
): Promise<Listing> {
  // Validate input
  const validated = createListingSchema.parse({
    investmentId: input.investmentId,
    sharesAmount: input.sharesAmount,
    askPrice: input.askPrice,
  });

  // Fetch the investment to verify ownership
  const investments = await investmentRepo.findByUserId(input.userId);
  const investment = investments.find((i) => i.id === validated.investmentId);

  if (!investment) {
    throw new ListingError(
      'Investment not found or you do not own it',
      'INVESTMENT_NOT_FOUND'
    );
  }

  if (investment.status === 'sold') {
    throw new ListingError(
      'This investment has already been fully sold',
      'INVESTMENT_SOLD'
    );
  }

  // Check available position: investment amount minus amount already in active listings
  const activeListingsTotal =
    await listingRepo.getActiveListingsTotalForInvestment(validated.investmentId);
  const availableAmount = investment.amount - activeListingsTotal;

  if (validated.sharesAmount > availableAmount) {
    throw new ListingError(
      `Cannot list more than your available position (€${availableAmount.toLocaleString()} available)`,
      'EXCEEDS_AVAILABLE_POSITION'
    );
  }

  // Calculate derived fields
  // ownershipPct: what % of the property this slice represents
  // We rely on the investmentRepo returning propertyTitle etc. via InvestmentWithProperty,
  // but the actual totalValue is needed. We compute it from the investment's ratio.
  const ownershipPct =
    (validated.sharesAmount / investment.amount) * investment.ownershipPercentage;
  const pricePerPercent = validated.askPrice / ownershipPct;

  return listingRepo.create({
    sellerId: input.userId,
    investmentId: validated.investmentId,
    propertyId: investment.propertyId,
    sharesAmount: validated.sharesAmount,
    ownershipPct,
    askPrice: validated.askPrice,
    pricePerPercent,
    status: 'active',
  });
}
