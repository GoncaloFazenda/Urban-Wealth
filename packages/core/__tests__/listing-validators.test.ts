import {
  createListingSchema,
  createBulkListingSchema,
  purchaseListingSchema,
} from '../src/validators/listingSchema';

const validUUID = '550e8400-e29b-41d4-a716-446655440000';
const anotherUUID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

describe('createListingSchema', () => {
  const valid = {
    investmentId: validUUID,
    sharesAmount: 1000,
    askPrice: 1100,
  };

  it('accepts a valid listing', () => {
    expect(createListingSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts a valid listing with optional groupId', () => {
    const result = createListingSchema.safeParse({ ...valid, groupId: anotherUUID });
    expect(result.success).toBe(true);
  });

  it('rejects non-UUID investmentId', () => {
    const result = createListingSchema.safeParse({ ...valid, investmentId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects zero sharesAmount', () => {
    const result = createListingSchema.safeParse({ ...valid, sharesAmount: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative sharesAmount', () => {
    const result = createListingSchema.safeParse({ ...valid, sharesAmount: -500 });
    expect(result.success).toBe(false);
  });

  it('rejects zero askPrice', () => {
    const result = createListingSchema.safeParse({ ...valid, askPrice: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative askPrice', () => {
    const result = createListingSchema.safeParse({ ...valid, askPrice: -100 });
    expect(result.success).toBe(false);
  });

  it('rejects non-UUID groupId', () => {
    const result = createListingSchema.safeParse({ ...valid, groupId: 'bad-id' });
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    expect(createListingSchema.safeParse({}).success).toBe(false);
    expect(createListingSchema.safeParse({ investmentId: validUUID }).success).toBe(false);
  });
});

describe('createBulkListingSchema', () => {
  const validSlice = {
    investmentId: validUUID,
    sharesAmount: 500,
    askPrice: 550,
  };

  it('accepts a single slice without groupId', () => {
    const result = createBulkListingSchema.safeParse({ slices: [validSlice] });
    expect(result.success).toBe(true);
  });

  it('accepts multiple slices with groupId', () => {
    const result = createBulkListingSchema.safeParse({
      groupId: anotherUUID,
      slices: [validSlice, { ...validSlice, investmentId: anotherUUID }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty slices array', () => {
    const result = createBulkListingSchema.safeParse({ slices: [] });
    expect(result.success).toBe(false);
  });

  it('rejects missing slices field', () => {
    const result = createBulkListingSchema.safeParse({ groupId: anotherUUID });
    expect(result.success).toBe(false);
  });

  it('rejects a slice with invalid investmentId', () => {
    const result = createBulkListingSchema.safeParse({
      slices: [{ ...validSlice, investmentId: 'bad' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a slice with zero sharesAmount', () => {
    const result = createBulkListingSchema.safeParse({
      slices: [{ ...validSlice, sharesAmount: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a slice with negative askPrice', () => {
    const result = createBulkListingSchema.safeParse({
      slices: [{ ...validSlice, askPrice: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-UUID groupId', () => {
    const result = createBulkListingSchema.safeParse({
      groupId: 'not-a-uuid',
      slices: [validSlice],
    });
    expect(result.success).toBe(false);
  });
});

describe('purchaseListingSchema', () => {
  it('accepts a valid listingId UUID', () => {
    const result = purchaseListingSchema.safeParse({ listingId: validUUID });
    expect(result.success).toBe(true);
  });

  it('rejects non-UUID listingId', () => {
    const result = purchaseListingSchema.safeParse({ listingId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects missing listingId', () => {
    const result = purchaseListingSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
