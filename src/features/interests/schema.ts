// src/features/interests/schema.ts
import { z } from 'zod';

// ─── Catalog ───────────────────────────────────────────────────────────────────

export const InterestSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const InterestsCatalogResponseSchema = z.object({
  status: z.literal('success'),
  data: z.array(InterestSchema),
});

// ─── Types ─────────────────────────────────────────────────────────────────────

export type Interest = z.infer<typeof InterestSchema>;
export type InterestsCatalogResponse = z.infer<typeof InterestsCatalogResponseSchema>;