import type { Property } from '../entities/Property';
import type { IPropertyRepository } from '../repositories/IPropertyRepository';

export async function getPropertyById(
  repo: IPropertyRepository,
  id: string
): Promise<Property | null> {
  return repo.findById(id);
}
