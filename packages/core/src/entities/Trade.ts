export type TradeStatus = 'completed' | 'pending';

export interface Trade {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  propertyId: string;
  amount: number;
  platformFee: number;
  status: TradeStatus;
  createdAt: string;
}

export interface TradeWithDetails extends Trade {
  propertyTitle: string;
  counterpartyName: string;
}
