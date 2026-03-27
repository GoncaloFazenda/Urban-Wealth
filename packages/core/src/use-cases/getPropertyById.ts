import type { Property } from '../entities/Property.js';
import type { IPropertyRepository } from '../repositories/IPropertyRepository.js';

export async function getPropertyById(
  repo: IPropertyRepository,
  id: string
): Promise<Property | null> {
  return repo.findById(id);
}
