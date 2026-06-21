import { z } from 'zod';
import { RiskLevel } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';

export const DashboardQuerySchema = z.object({
  location: z.string().min(1, 'Location is required'),
});

export type DashboardQuery = z.infer<typeof DashboardQuerySchema>;
export class DashboardQueryDto extends createZodDto(DashboardQuerySchema) {}

export const DashboardDataSchema = z.object({
  ndviScore: z.number().min(0).max(1),
  temperature: z.number(),
  rainfall: z.number().nonnegative(),
  floodRisk: z.nativeEnum(RiskLevel),
  droughtRisk: z.nativeEnum(RiskLevel),
});

export type DashboardData = z.infer<typeof DashboardDataSchema>;
export class DashboardDataDto extends createZodDto(DashboardDataSchema) {}
