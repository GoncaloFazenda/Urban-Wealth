import { z } from 'zod';

export const createListingSchema = z.object({
  investmentId: z.string().uuid(),
  sharesAmount: z.number().positive('Amount to sell must be positive'),
  askPrice: z.number().positive('Ask price must be positive'),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

export const purchaseListingSchema = z.object({
  listingId: z.string().uuid(),
});

export type PurchaseListingInput = z.infer<typeof purchaseListingSchema>;
