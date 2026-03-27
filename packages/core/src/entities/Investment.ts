export type InvestmentStatus = 'completed' | 'pending';

export interface Investment {
  id: string;
  userId: string;
  propertyId: string;
  amount: number;
  ownershipPercentage: number;
  estimatedAnnualIncome: number;
  estimatedAppreciationGain: number;
  platformFee: number;
  status: InvestmentStatus;
  createdAt: string;
}

export interface InvestmentWithProperty extends Investment {
  propertyTitle: string;
  propertyPhotoUrl: string;
  propertyStatus: 'open' | 'coming_soon' | 'funded';
}
