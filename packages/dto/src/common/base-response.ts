import { z } from 'zod';

/**
 * Generic wrapper for all API responses.
 * Usage: `BaseApiResponseSchema(DashboardDataSchema)` → `{ success, data, message }`
 */
export function BaseApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    message: z.string().optional(),
  });
}

export type BaseApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};
