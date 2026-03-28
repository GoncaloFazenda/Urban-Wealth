import type { Property } from '../../src/entities/Property';
import type { IPropertyRepository, PropertyFilters, PropertySortField } from '../../src/repositories/IPropertyRepository';
import type { IInvestmentRepository } from '../../src/repositories/IInvestmentRepository';
import type { Investment, InvestmentWithProperty } from '../../src/entities/Investment';
import { getProperties } from '../../src/use-cases/getProperties';
import { getPropertyById } from '../../src/use-cases/getPropertyById';
import { investInProperty, InvestmentError } from '../../src/use-cases/investInProperty';
import { getUserPortfolio } from '../../src/use-cases/getUserPortfolio';
import { mockProperties } from '../../src/mockData';

// Mock property repository
function createMockPropertyRepo(
  properties: Property[] = mockProperties
): IPropertyRepository {
  return {
    findAll: async (
      filters?: PropertyFilters,
      _sort?: PropertySortField
    ) => {
      let result = [...properties];
      if (filters?.status) {
        result = result.filter((p) => p.status === filters.status);
      }
      if (filters?.location) {
        result = result.filter((p) => p.location === filters.location);
      }
      return result;
    },
    findById: async (id: string) =>
      properties.find((p) => p.id === id) ?? null,
    create: async (data) => ({
      ...data,
      id: 'new-id',
      createdAt: new Date().toISOString(),
    }),
    update: async (id, data) => {
      const prop = properties.find((p) => p.id === id);
      if (!prop) throw new Error('Not found');
      return { ...prop, ...data };
    },
    updateFunded: async (id, additionalPercentage) => {
      const prop = properties.find((p) => p.id === id);
      if (!prop) throw new Error('Not found');
      return { ...prop, funded: prop.funded + additionalPercentage };
    },
  };
}

function createMockInvestmentRepo(): IInvestmentRepository {
  const investments: Investment[] = [];

  return {
    create: async (data) => {
      const investment: Investment = {
        ...data,
        id: `inv-${investments.length + 1}`,
        createdAt: new Date().toISOString(),
      };
      investments.push(investment);
      return investment;
    },
    findByUserId: async (userId: string) => {
      return investments
        .filter((i) => i.userId === userId)
        .map((i): InvestmentWithProperty => ({
          ...i,
          propertyTitle: 'Test Property',
          propertyPhotoUrl: 'https://picsum.photos/seed/test/800/600',
          propertyStatus: 'open',
        }));
    },
    findByPropertyId: async (propertyId: string) =>
      investments.filter((i) => i.propertyId === propertyId),
    getTotalInvestedByUser: async (userId: string) =>
      investments
        .filter((i) => i.userId === userId)
        .reduce((sum, i) => sum + i.amount, 0),
  };
}

describe('getProperties', () => {
  it('should return all properties when no filters are applied', async () => {
    const repo = createMockPropertyRepo();
    const result = await getProperties(repo);
    expect(result.properties.length).toBe(mockProperties.length);
    expect(result.total).toBe(mockProperties.length);
  });

  it('should filter properties by status', async () => {
    const repo = createMockPropertyRepo();
    const result = await getProperties(repo, { status: 'open' });
    for (const prop of result.properties) {
      expect(prop.status).toBe('open');
    }
    expect(result.total).toBeGreaterThan(0);
  });

  it('should filter properties by location', async () => {
    const repo = createMockPropertyRepo();
    const result = await getProperties(repo, {
      location: 'Lisbon, Portugal',
    });
    for (const prop of result.properties) {
      expect(prop.location).toBe('Lisbon, Portugal');
    }
  });
});

describe('getPropertyById', () => {
  it('should return a property by its ID', async () => {
    const repo = createMockPropertyRepo();
    const firstProperty = mockProperties[0]!;
    const result = await getPropertyById(repo, firstProperty.id);
    expect(result).toBeDefined();
    expect(result?.id).toBe(firstProperty.id);
    expect(result?.title).toBe(firstProperty.title);
  });

  it('should return null for non-existent ID', async () => {
    const repo = createMockPropertyRepo();
    const result = await getPropertyById(
      repo,
      '00000000-0000-0000-0000-000000000000'
    );
    expect(result).toBeNull();
  });
});

describe('investInProperty', () => {
  const openProperty = mockProperties.find(
    (p) => p.status === 'open'
  )!;

  it('should create an investment successfully', async () => {
    const propertyRepo = createMockPropertyRepo();
    const investmentRepo = createMockInvestmentRepo();

    const result = await investInProperty(propertyRepo, investmentRepo, {
      userId: 'user-1',
      propertyId: openProperty.id,
      amount: 10000,
    });

    expect(result.investment).toBeDefined();
    expect(result.investment.amount).toBe(10000);
    expect(result.ownershipPercentage).toBeCloseTo(
      (10000 / openProperty.totalValue) * 100
    );
    expect(result.platformFee).toBeCloseTo(10000 * 0.015);
    expect(result.estimatedAnnualIncome).toBeGreaterThan(0);
    expect(result.estimatedAppreciationGain).toBeGreaterThan(0);
  });

  it('should throw for non-existent property', async () => {
    const propertyRepo = createMockPropertyRepo();
    const investmentRepo = createMockInvestmentRepo();

    await expect(
      investInProperty(propertyRepo, investmentRepo, {
        userId: 'user-1',
        propertyId: '00000000-0000-0000-0000-000000000000',
        amount: 10000,
      })
    ).rejects.toThrow(InvestmentError);
  });

  it('should throw for non-open property', async () => {
    const fundedProperty = mockProperties.find(
      (p) => p.status === 'funded'
    )!;
    const propertyRepo = createMockPropertyRepo();
    const investmentRepo = createMockInvestmentRepo();

    await expect(
      investInProperty(propertyRepo, investmentRepo, {
        userId: 'user-1',
        propertyId: fundedProperty.id,
        amount: 10000,
      })
    ).rejects.toThrow('not currently open');
  });

  it('should throw when amount exceeds remaining value', async () => {
    const propertyRepo = createMockPropertyRepo();
    const investmentRepo = createMockInvestmentRepo();
    const remaining =
      openProperty.totalValue * ((100 - openProperty.funded) / 100);

    await expect(
      investInProperty(propertyRepo, investmentRepo, {
        userId: 'user-1',
        propertyId: openProperty.id,
        amount: remaining + 1,
      })
    ).rejects.toThrow('exceeds remaining');
  });

  it('should calculate financials correctly', async () => {
    const propertyRepo = createMockPropertyRepo();
    const investmentRepo = createMockInvestmentRepo();
    const amount = 5000;

    const result = await investInProperty(propertyRepo, investmentRepo, {
      userId: 'user-1',
      propertyId: openProperty.id,
      amount,
    });

    const expectedOwnership = (amount / openProperty.totalValue) * 100;
    const expectedIncome =
      openProperty.totalValue *
      (openProperty.annualYield / 100) *
      (expectedOwnership / 100);
    const expectedAppreciation =
      openProperty.totalValue *
      (openProperty.projectedAppreciation / 100) *
      (expectedOwnership / 100);

    expect(result.ownershipPercentage).toBeCloseTo(expectedOwnership);
    expect(result.estimatedAnnualIncome).toBeCloseTo(expectedIncome);
    expect(result.estimatedAppreciationGain).toBeCloseTo(
      expectedAppreciation
    );
    expect(result.platformFee).toBeCloseTo(amount * 0.015);
  });
});

describe('getUserPortfolio', () => {
  it('should return empty portfolio for user with no investments', async () => {
    const investmentRepo = createMockInvestmentRepo();
    const result = await getUserPortfolio(investmentRepo, 'user-1');

    expect(result.totalInvested).toBe(0);
    expect(result.totalProperties).toBe(0);
    expect(result.estimatedAnnualIncome).toBe(0);
    expect(result.investments).toHaveLength(0);
  });

  it('should aggregate investments correctly', async () => {
    const propertyRepo = createMockPropertyRepo();
    const investmentRepo = createMockInvestmentRepo();
    const openProperty = mockProperties.find(
      (p) => p.status === 'open'
    )!;

    // Create two investments
    await investInProperty(propertyRepo, investmentRepo, {
      userId: 'user-1',
      propertyId: openProperty.id,
      amount: 5000,
    });
    await investInProperty(propertyRepo, investmentRepo, {
      userId: 'user-1',
      propertyId: openProperty.id,
      amount: 3000,
    });

    const portfolio = await getUserPortfolio(investmentRepo, 'user-1');
    expect(portfolio.totalInvested).toBe(8000);
    expect(portfolio.investments).toHaveLength(2);
    expect(portfolio.estimatedAnnualIncome).toBeGreaterThan(0);
  });
});
