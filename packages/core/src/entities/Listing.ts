export type ListingStatus = 'active' | 'sold' | 'cancelled';

export interface Listing {
  id: string;
  sellerId: string;
  investmentId: string;
  propertyId: string;
  sharesAmount: number;
  ownershipPct: number;
  askPrice: number;
  pricePerPercent: number;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ListingWithDetails extends Listing {
  propertyTitle: string;
  propertyPhotoUrl: string;
  propertyLocation: string;
  propertyTotalValue: number;
  propertyAnnualYield: number;
  sellerName: string;
}
