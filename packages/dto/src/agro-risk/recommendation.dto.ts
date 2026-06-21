import { z } from 'zod';
import { CommodityType, RiskLevel, RecommendationType } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';

// === Request ===
export const RecommendationRequestSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  commodity: z.nativeEnum(CommodityType),
  plantingDate: z.string().min(1, 'Planting date is required'),
});

export type RecommendationRequest = z.infer<typeof RecommendationRequestSchema>;
export class RecommendationRequestDto extends createZodDto(RecommendationRequestSchema) {}

// === Response Data ===
export const RecommendationDataSchema = z.object({
  recommendation: z.nativeEnum(RecommendationType),
  suitabilityScore: z.number().min(0).max(100),
  floodRisk: z.nativeEnum(RiskLevel),
  droughtRisk: z.nativeEnum(RiskLevel),
  estimatedYield: z.number().positive(),
});

export type RecommendationData = z.infer<typeof RecommendationDataSchema>;
export class RecommendationDataDto extends createZodDto(RecommendationDataSchema) {}
