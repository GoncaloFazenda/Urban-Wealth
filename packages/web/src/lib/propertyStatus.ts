/**
 * Shared status mapping between Prisma DB enums and core string values.
 * Single source of truth — import from here instead of defining locally.
 */

/** DB enum → core string  e.g. 'OPEN' → 'open' */
export const dbToCore: Record<string, string> = {
  OPEN: 'open',
  COMING_SOON: 'coming_soon',
  FUNDED: 'funded',
};

/** core string → DB enum  e.g. 'open' → 'OPEN' */
export const coreToDb: Record<string, string> = {
  open: 'OPEN',
  coming_soon: 'COMING_SOON',
  funded: 'FUNDED',
};
