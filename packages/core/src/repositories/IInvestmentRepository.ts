import type { Investment, InvestmentWithProperty } from '../entities/Investment.js';

export interface IInvestmentRepository {
  create(
    investment: Omit<Investment, 'id' | 'createdAt'>
  ): Promise<Investment>;
  findByUserId(userId: string): Promise<InvestmentWithProperty[]>;
  findByPropertyId(propertyId: string): Promise<Investment[]>;
  getTotalInvestedByUser(userId: string): Promise<number>;
}
