import type { Property, PropertyStatus } from '../entities/Property.js';

export interface PropertyFilters {
  status?: PropertyStatus;
  location?: string;
  minYield?: number;
  maxYield?: number;
}

export type PropertySortField =
  | 'newest'
  | 'yield'
  | 'appreciation'
  | 'funded';

export interface IPropertyRepository {
  findAll(
    filters?: PropertyFilters,
    sort?: PropertySortField
  ): Promise<Property[]>;
  findById(id: string): Promise<Property | null>;
  create(property: Omit<Property, 'id' | 'createdAt'>): Promise<Property>;
  update(id: string, data: Partial<Property>): Promise<Property>;
  updateFunded(id: string, additionalPercentage: number): Promise<Property>;
}
