import { z } from 'zod';
import { CommodityType } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';

export const AIChatRequestSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  location: z.string().optional(),
  commodity: z.nativeEnum(CommodityType).optional(),
});

export type AIChatRequest = z.infer<typeof AIChatRequestSchema>;
export class AIChatRequestDto extends createZodDto(AIChatRequestSchema) {}

export const AIChatDataSchema = z.object({
  answer: z.string(),
});

export type AIChatData = z.infer<typeof AIChatDataSchema>;
export class AIChatDataDto extends createZodDto(AIChatDataSchema) {}
