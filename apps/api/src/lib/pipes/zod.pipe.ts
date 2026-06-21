import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { fromZodError } from 'zod-validation-error';

/**
 * Generic Zod validation pipe that works with both Zod v3 and v4 schemas.
 *
 * Used as an **inline** pipe (`new ZodValidationPipe(schema)`) for endpoints
 * that consume raw Zod schemas from `@repo/dto` (which targets Zod v3).
 *
 * For `createZodDto()`-based DTOs, the global `ZodValidationPipe` from
 * `nestjs-zod` handles validation automatically — no inline pipe needed.
 *
 * NOTE: The `schema` parameter is typed as `any` to bridge the Zod v3/v4
 * type gap. At runtime, both versions expose `.safeParse()` identically.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: any) { }

    transform(value: unknown, metadata: ArgumentMetadata) {
        // Only validate body, query, and param — skip 'custom' (e.g. @Req())
        if (metadata.type !== 'body' && metadata.type !== 'query' && metadata.type !== 'param') {
            return value;
        }

        const result = this.schema.safeParse(value);
        if (!result.success) {
            const errorMessage = fromZodError(result.error).message;
            throw new BadRequestException(errorMessage);
        }
        return result.data;
    }
}
