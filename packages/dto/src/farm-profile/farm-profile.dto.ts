import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateFarmProfileSchema = z.object({
  farmName: z.string().optional(),
  landArea: z.number().positive('Land area must be positive'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  regionId: z.string().uuid('Invalid region ID format'),
});

export type CreateFarmProfile = z.infer<typeof CreateFarmProfileSchema>;
export class CreateFarmProfileDto extends createZodDto(CreateFarmProfileSchema) {}
