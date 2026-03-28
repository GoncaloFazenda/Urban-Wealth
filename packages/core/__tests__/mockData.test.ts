import { mockProperties, mockLocations, PLATFORM_FEE_RATE } from '../src/mockData';
import { propertySchema } from '../src/validators/propertySchema';

describe('Mock Data', () => {
  it('should have between 5 and 10 properties', () => {
    expect(mockProperties.length).toBeGreaterThanOrEqual(5);
    expect(mockProperties.length).toBeLessThanOrEqual(10);
  });

  it('should have unique IDs', () => {
    const ids = mockProperties.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have all three statuses represented', () => {
    const statuses = new Set(mockProperties.map((p) => p.status));
    expect(statuses.has('open')).toBe(true);
    expect(statuses.has('coming_soon')).toBe(true);
    expect(statuses.has('funded')).toBe(true);
  });

  it('should have a consistent platform fee rate', () => {
    expect(PLATFORM_FEE_RATE).toBe(0.015);
    for (const prop of mockProperties) {
      expect(prop.platformFee).toBe(PLATFORM_FEE_RATE);
    }
  });

  it('every property should have at least 1 photo URL', () => {
    for (const prop of mockProperties) {
      expect(prop.photoUrls.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('funded properties should have 100% funded and 0 available shares', () => {
    const funded = mockProperties.filter((p) => p.status === 'funded');
    for (const prop of funded) {
      expect(prop.funded).toBe(100);
      expect(prop.availableShares).toBe(0);
    }
  });

  it('open properties should have funded < 100% and available shares > 0', () => {
    const open = mockProperties.filter((p) => p.status === 'open');
    for (const prop of open) {
      expect(prop.funded).toBeLessThan(100);
      expect(prop.availableShares).toBeGreaterThan(0);
    }
  });

  it('should extract unique locations', () => {
    expect(mockLocations.length).toBeGreaterThan(0);
    const uniqueCheck = new Set(mockLocations);
    expect(uniqueCheck.size).toBe(mockLocations.length);
  });

  it('every property should pass Zod schema validation', () => {
    for (const prop of mockProperties) {
      const result = propertySchema.safeParse(prop);
      expect(result.success).toBe(true);
    }
  });
});
