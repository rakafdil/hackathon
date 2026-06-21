/**
 * Auth DTOs – Zod-first, Swagger-ready.
 *
 * These DTOs wrap the shared Zod schemas from `@repo/dto` using nestjs-zod's
 * `createZodDto()`. This gives us:
 *   1. Automatic Swagger/OpenAPI schema generation (no manual @ApiProperty)
 *   2. Runtime validation via the global `ZodValidationPipe` from nestjs-zod
 *   3. Single source of truth – the Zod schema in `@repo/dto`
 *
 * PATTERN: When adding new DTOs, always:
 *   - Define the Zod schema in `packages/dto/src/` first
 *   - Create a `createZodDto(schema)` wrapper here for Swagger integration
 */
import { createZodDto } from 'nestjs-zod';
import { RegisterSchema, LoginSchema } from '@repo/dto';

// ── Register DTO ──────────────────────────────────────────────────────────────
// Swagger will auto-generate: { email: string, password: string, fullName?: string }
export class RegisterDto extends createZodDto(RegisterSchema) {}

// ── Login DTO ─────────────────────────────────────────────────────────────────
// Swagger will auto-generate: { email: string, password: string }
export class LoginDto extends createZodDto(LoginSchema) {}
