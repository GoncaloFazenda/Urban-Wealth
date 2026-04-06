import { z } from 'zod';

export const createListingSchema = z.object({
  investmentId: z.string().uuid(),
  sharesAmount: z.number().positive('Amount to sell must be positive'),
  askPrice: z.number().positive('Ask price must be positive'),
  groupId: z.string().uuid().optional(),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

const sliceSchema = z.object({
  investmentId: z.string().uuid(),
  sharesAmount: z.number().positive('Amount must be positive'),
  askPrice: z.number().positive('Ask price must be positive'),
});

// Bulk create: one or more slices sharing an optional groupId, processed atomically
export const createBulkListingSchema = z.object({
  groupId: z.string().uuid().optional(),
  slices: z.array(sliceSchema).min(1),
});

export type CreateBulkListingInput = z.infer<typeof createBulkListingSchema>;

export const purchaseListingSchema = z.object({
  listingId: z.string().uuid(),
});

export type PurchaseListingInput = z.infer<typeof purchaseListingSchema>;
