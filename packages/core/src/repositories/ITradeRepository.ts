import type { Trade, TradeWithDetails } from '../entities/Trade';

export interface ITradeRepository {
  create(trade: Omit<Trade, 'id' | 'createdAt'>): Promise<Trade>;
  findByBuyer(userId: string): Promise<TradeWithDetails[]>;
  findBySeller(userId: string): Promise<TradeWithDetails[]>;
}
