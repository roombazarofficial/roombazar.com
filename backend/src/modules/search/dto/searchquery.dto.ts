import { z } from "zod";

export const searchQuerySchema = z.object({
  city: z.string().min(1),
  locality: z.union([z.string(), z.array(z.string())]).optional(),
  type: z.union([z.string(), z.array(z.string())]).optional(),
  furnishing: z.union([z.string(), z.array(z.string())]).optional(),
  by: z.union([z.string(), z.array(z.string())]).optional(),
  amenity: z.union([z.string(), z.array(z.string())]).optional(),
  minrent: z.coerce.number().int().min(0).optional(),
  maxrent: z.coerce.number().int().min(0).optional(),
  from: z.string().date().optional(),
  people: z.coerce.number().int().min(1).max(10).optional(),
  sort: z
    .enum(["relevance", "newest", "rentlow", "renthigh"])
    .default("relevance"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(24),
});

export type SearchQueryDto = z.infer<typeof searchQuerySchema>;

export function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
