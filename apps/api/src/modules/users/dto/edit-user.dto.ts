/**
 * EditUser DTO – Zod-first, Swagger-ready.
 *
 * Wraps the shared `EditUserSchema` from `@repo/dto` for Swagger integration.
 */
import { createZodDto } from 'nestjs-zod';
import { EditUserSchema } from '@repo/dto';

export class EditUserDto extends createZodDto(EditUserSchema) {}