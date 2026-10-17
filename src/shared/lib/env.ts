import { z } from 'zod';

const schema = z.object({
  investorPool: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
  apiUrl: z.string().default(''),
});

// O Next só injeta NEXT_PUBLIC_* quando referenciadas de forma estática.
export const env = schema.parse({
  investorPool: process.env.NEXT_PUBLIC_FEATURE_INVESTOR_POOL,
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
});
