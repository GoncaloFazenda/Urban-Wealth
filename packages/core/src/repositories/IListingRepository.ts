import type { Listing, ListingWithDetails, ListingStatus } from '../entities/Listing';

export interface ListingFilters {
  propertyId?: string;
  minPrice?: number;
  maxPrice?: number;
}

export type ListingSortField = 'newest' | 'price_asc' | 'price_desc';

export interface IListingRepository {
  create(listing: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>): Promise<Listing>;
  findById(id: string): Promise<ListingWithDetails | null>;
  findActive(
    filters?: ListingFilters,
    sort?: ListingSortField
  ): Promise<ListingWithDetails[]>;
  findActiveByUser(userId: string): Promise<ListingWithDetails[]>;
  findByUser(userId: string): Promise<ListingWithDetails[]>;
  updateStatus(id: string, status: ListingStatus): Promise<Listing>;
  getActiveListingsTotalForInvestment(investmentId: string): Promise<number>;
}
