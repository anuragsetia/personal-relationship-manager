import { z } from 'zod';

// All date fields are ISO strings (YYYY-MM-DD) as returned by the AI.
// Convert to unix ms when writing to the DB.
export const ExtractionResultSchema = z.object({
  name: z.string().optional(),
  provider: z.string().optional(),
  category: z.enum(['account', 'insurance', 'subscription']).optional(),
  accountNumber: z.string().optional(),
  website: z.string().optional(),
  startDate: z.string().optional(),
  renewalDate: z.string().optional(),
  expiryDate: z.string().optional(),
  cost: z.number().optional(),
  costCurrency: z.string().optional(),
  costFrequency: z.enum(['monthly', 'annual', 'one-time']).optional(),
  notes: z.string().optional(),
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
