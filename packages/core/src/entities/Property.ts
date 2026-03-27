export type PropertyStatus = 'open' | 'coming_soon' | 'funded';

export interface Property {
  id: string;
  title: string;
  location: string;
  photoUrls: string[];
  totalValue: number;
  funded: number;
  annualYield: number;
  projectedAppreciation: number;
  status: PropertyStatus;
  description: string;
  availableShares: number;
  createdAt: string;
  platformFee: number;
}
