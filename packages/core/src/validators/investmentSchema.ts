import { z } from 'zod';

export const investmentSchema = z.object({
  propertyId: z.string().uuid(),
  amount: z.number().positive('Investment amount must be positive'),
});

export type InvestmentInput = z.infer<typeof investmentSchema>;

export const investmentStatusSchema = z.enum(['completed', 'pending']);
