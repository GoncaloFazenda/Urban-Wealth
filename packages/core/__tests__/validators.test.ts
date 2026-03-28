import {
  propertySchema,
  propertyStatusSchema,
  createPropertySchema,
} from '../src/validators/propertySchema';
import {
  registerSchema,
  loginSchema,
  passwordSchema,
} from '../src/validators/userSchema';
import {
  investmentSchema,
  investmentStatusSchema,
} from '../src/validators/investmentSchema';

describe('Property Validators', () => {
  const validProperty = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Test Property',
    location: 'Lisbon, Portugal',
    photoUrls: ['https://picsum.photos/seed/test/800/600'],
    totalValue: 250000,
    funded: 50,
    annualYield: 6.5,
    projectedAppreciation: 3.2,
    status: 'open' as const,
    description: 'A beautiful test property',
    availableShares: 500,
    createdAt: '2026-01-15T10:30:00.000Z',
    platformFee: 0.015,
  };

  it('should accept a valid property', () => {
    const result = propertySchema.safeParse(validProperty);
    expect(result.success).toBe(true);
  });

  it('should reject property with invalid status', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      status: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative totalValue', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      totalValue: -100,
    });
    expect(result.success).toBe(false);
  });

  it('should reject funded > 100', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      funded: 150,
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty photoUrls', () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      photoUrls: [],
    });
    expect(result.success).toBe(false);
  });

  it('should accept all valid status values', () => {
    for (const status of ['open', 'coming_soon', 'funded'] as const) {
      const result = propertyStatusSchema.safeParse(status);
      expect(result.success).toBe(true);
    }
  });

  it('createPropertySchema should omit id and createdAt', () => {
    const { id: _id, createdAt: _date, ...rest } = validProperty;
    const result = createPropertySchema.safeParse(rest);
    expect(result.success).toBe(true);
  });
});

describe('User Validators', () => {
  describe('passwordSchema', () => {
    it('should accept a strong password', () => {
      const result = passwordSchema.safeParse('MyPass1!');
      expect(result.success).toBe(true);
    });

    it('should reject password shorter than 8 chars', () => {
      const result = passwordSchema.safeParse('Ab1!');
      expect(result.success).toBe(false);
    });

    it('should reject password without uppercase', () => {
      const result = passwordSchema.safeParse('mypass1!');
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const result = passwordSchema.safeParse('MyPasss!');
      expect(result.success).toBe(false);
    });

    it('should reject password without special character', () => {
      const result = passwordSchema.safeParse('MyPass12');
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    const validRegister = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'MyPass1!',
      confirmPassword: 'MyPass1!',
    };

    it('should accept valid registration', () => {
      const result = registerSchema.safeParse(validRegister);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const result = registerSchema.safeParse({
        ...validRegister,
        confirmPassword: 'Different1!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        ...validRegister,
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty full name', () => {
      const result = registerSchema.safeParse({
        ...validRegister,
        fullName: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login', () => {
      const result = loginSchema.safeParse({
        email: 'john@example.com',
        password: 'anypass',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'invalid',
        password: 'anypass',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Investment Validators', () => {
  it('should accept valid investment', () => {
    const result = investmentSchema.safeParse({
      propertyId: '550e8400-e29b-41d4-a716-446655440000',
      amount: 5000,
    });
    expect(result.success).toBe(true);
  });

  it('should reject zero amount', () => {
    const result = investmentSchema.safeParse({
      propertyId: '550e8400-e29b-41d4-a716-446655440000',
      amount: 0,
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative amount', () => {
    const result = investmentSchema.safeParse({
      propertyId: '550e8400-e29b-41d4-a716-446655440000',
      amount: -100,
    });
    expect(result.success).toBe(false);
  });

  it('should reject non-UUID propertyId', () => {
    const result = investmentSchema.safeParse({
      propertyId: 'not-a-uuid',
      amount: 5000,
    });
    expect(result.success).toBe(false);
  });

  it('should accept valid investment statuses', () => {
    for (const status of ['completed', 'pending'] as const) {
      const result = investmentStatusSchema.safeParse(status);
      expect(result.success).toBe(true);
    }
  });
});
