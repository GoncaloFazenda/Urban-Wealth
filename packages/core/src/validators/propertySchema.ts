import { z } from 'zod';

export const propertyStatusSchema = z.enum(['open', 'coming_soon', 'funded']);

export const propertySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  location: z.string().min(1).max(200),
  photoUrls: z.array(z.string().min(1)).min(1),
  totalValue: z.number().positive(),
  funded: z.number().min(0).max(100),
  annualYield: z.number().min(0).max(100),
  projectedAppreciation: z.number().min(0).max(100),
  status: propertyStatusSchema,
  description: z.string().min(1).max(5000),
  availableShares: z.number().int().min(0),
  createdAt: z.string().datetime(),
  platformFee: z.number().min(0).max(1),
});

export type PropertyInput = z.infer<typeof propertySchema>;

export const createPropertySchema = propertySchema.omit({
  id: true,
  createdAt: true,
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
