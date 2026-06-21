import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().optional(),
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const CreateUserSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.nativeEnum(UserRole).optional(),
});

export type IRegisterDto = z.infer<typeof RegisterSchema>;
export type ILoginDto = z.infer<typeof LoginSchema>;
export type ICreateUser = z.infer<typeof CreateUserSchema>;