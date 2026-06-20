## Overview

The AgriNexus monorepo uses **NestJS built-in exception classes** for server-side error handling and **manual try/catch with toast notifications** on the client side. There is no centralized exception filter or global error middleware — error handling relies on NestJS's default exception layer and framework conventions.

## Server-Side (API - NestJS)

### Exception Classes Used

The API service (`apps/api`) leverages standard NestJS HTTP exceptions:

- **`ForbiddenException`** — Used for authentication failures, duplicate emails, invalid credentials (`auth.service.ts`)
- **`NotFoundException`** — Used when a user resource is not found (`users.service.ts`)
- **`BadRequestException`** — Used in the custom `ZodValidationPipe` for validation failures (`zod.pipe.ts`)
- **`HttpException`** — Used directly in `RolesGuard` for authorization failures with custom messages and `HttpStatus.FORBIDDEN`

### Validation Pipeline

Input validation is handled through two mechanisms:

1. **Global `ValidationPipe`** — Configured in `main.ts` with `whitelist: true`, `transform: true`, and `forbidNonWhitelisted: true`. This uses class-validator decorators on DTOs.
2. **Custom `ZodValidationPipe`** — Applied per-endpoint via `@UsePipes()`. Wraps Zod schema parsing and throws `BadRequestException` on failure, attaching the raw Zod error as the `cause` property.

### Error Propagation Pattern

Services throw exceptions directly; controllers do not catch them. NestJS's default exception layer serializes them into HTTP responses. Example from `auth.service.ts`:

```typescript
try {
  const user = await this.prisma.user.create({ ... });
  return this.signToken(user.id, user.email, user.role);
} catch (error) {
  if (error?.code === 'P2002') {
    throw new ForbiddenException('Email already in use');
  }
  throw error; // Re-throws unknown errors
}
```

Key observations:
- Prisma unique constraint violations (`P2002`) are caught and mapped to `ForbiddenException`.
- Unknown errors are re-thrown without transformation, relying on NestJS defaults.
- No custom error codes or structured error envelopes are used.

### Guards and Authorization Errors

The `RolesGuard` throws `HttpException` with descriptive Indonesian messages when role checks fail:

```typescript
throw new HttpException(
  `Akses ditolak. Hak akses akun Anda (${user.role.toUpperCase()}) tidak diizinkan menggunakan endpoint ini.`,
  HttpStatus.FORBIDDEN,
);
```

### Missing Patterns

- **No `@Catch()` exception filters** — No custom exception filter classes exist anywhere in the codebase.
- **No `APP_FILTER` provider** — The `AppModule` does not register any global exception filters.
- **No error logging middleware** — Errors are not logged centrally; only the `ZodValidationPipe` logs to `console.error`.
- **No error response standardization** — Responses rely on NestJS defaults (`{ statusCode, message }`).

## Client-Side (Web - Next.js)

### Error Handling Strategy

The frontend (`apps/web`) uses manual `try/catch` blocks with the `sonner` toast library for user-facing error messages:

```typescript
try {
  const res = await fetch(`${API_URL}/auth/login`, { ... });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Login gagal");
  }
  toast.success("Login berhasil!");
  router.push("/dashboard");
} catch (error) {
  toast.error("Email atau password salah");
}
```

Key observations:
- Errors from the API are parsed from JSON responses (expecting a `message` field).
- Generic fallback messages are shown to users regardless of the specific error.
- No axios interceptors are configured in `api-client.ts` for centralized error handling.
- React Query (`react-query.ts`) has no `onError` or retry configuration beyond `staleTime`.

### Middleware-Level Protection

Next.js middleware (`apps/web/middleware.ts`) handles auth-state routing errors by redirecting unauthenticated users to `/login` and authenticated users away from auth pages. This is a preventive measure, not an error handler.

## Shared Utilities

The `packages/utils/src/async.ts` module provides a generic `retry` utility that catches and re-throws errors after exponential backoff:

```typescript
export async function retry<T>(fn: () => Promise<T>, options: { retries?: number; delayMs?: number } = {}): Promise<T>
```

This is a reusable pattern for transient error recovery but is not currently wired into any service-layer calls.

## Conventions and Rules for Developers

1. **Throw NestJS exceptions, not raw errors** — Use `ForbiddenException`, `NotFoundException`, `BadRequestException`, etc., from `@nestjs/common`.
2. **Map database errors explicitly** — Catch Prisma error codes (e.g., `P2002`) and convert them to appropriate HTTP exceptions.
3. **Use ZodValidationPipe for request body validation** — Apply via `@UsePipes(new ZodValidationPipe(Schema))` on controller methods.
4. **Do not swallow errors in services** — Either handle known cases or re-throw; let NestJS serialize the response.
5. **Frontend: parse `message` from error responses** — API errors return `{ message: string }`; extract this for user feedback.
6. **Frontend: use toast notifications for all errors** — Import `toast` from `sonner` and call `toast.error()` in catch blocks.
7. **No global exception filter exists** — If centralized error logging or response formatting is needed, create an `@Catch()` filter and register it in `AppModule`.
