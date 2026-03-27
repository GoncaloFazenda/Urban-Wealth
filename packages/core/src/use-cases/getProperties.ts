import type { Property } from '../entities/Property';
import type {
  IPropertyRepository,
  PropertyFilters,
  PropertySortField,
} from '../repositories/IPropertyRepository';

export interface GetPropertiesResult {
  properties: Property[];
  total: number;
}

export async function getProperties(
  repo: IPropertyRepository,
  filters?: PropertyFilters,
  sort?: PropertySortField
): Promise<GetPropertiesResult> {
  const properties = await repo.findAll(filters, sort);
  return { properties, total: properties.length };
}
