import { z } from 'zod';
import { CommodityType, PriceStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';

export const PriceQuerySchema = z.object({
  commodity: z.nativeEnum(CommodityType),
});

export type PriceQuery = z.infer<typeof PriceQuerySchema>;
export class PriceQueryDto extends createZodDto(PriceQuerySchema) {}

export const RegionalPriceItemSchema = z.object({
  region: z.string(),
  price: z.number().positive(),
  status: z.nativeEnum(PriceStatus),
});

export type RegionalPriceItem = z.infer<typeof RegionalPriceItemSchema>;
export class RegionalPriceItemDto extends createZodDto(RegionalPriceItemSchema) {}
