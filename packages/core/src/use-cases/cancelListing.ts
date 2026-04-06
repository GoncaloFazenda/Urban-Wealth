import type { IListingRepository } from '../repositories/IListingRepository';

export class CancelListingError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'CancelListingError';
  }
}

export async function cancelListing(
  listingRepo: IListingRepository,
  listingId: string,
  userId: string
): Promise<void> {
  const listing = await listingRepo.findById(listingId);

  if (!listing) {
    throw new CancelListingError('Listing not found', 'LISTING_NOT_FOUND');
  }

  if (listing.sellerId !== userId) {
    throw new CancelListingError(
      'You can only cancel your own listings',
      'NOT_OWNER'
    );
  }

  if (listing.status !== 'active') {
    throw new CancelListingError(
      'Only active listings can be cancelled',
      'LISTING_NOT_ACTIVE'
    );
  }

  await listingRepo.updateStatus(listingId, 'cancelled');
}
