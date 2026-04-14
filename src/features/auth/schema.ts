// src/features/auth/schema.ts
import { z } from 'zod';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export type AuthSigninTab = 'phone' | 'email';

// ─── Phone validation ─────────────────────────────────────────────────────────

const phoneRegex = /^\+?[0-9]{7,15}$/;

// ─── Sign-in (form schemas) ───────────────────────────────────────────────────

export const loginPhoneSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .min(7, 'Phone number is required')
    .transform((v) => v.replace(/[\s\-()]/g, ''))
    .pipe(z.string().regex(phoneRegex, 'Invalid phone number')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean(),
});

export const loginEmailSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean(),
});

// ─── Login API DTO ────────────────────────────────────────────────────────────

export const LoginDtoSchema = z.object({
  identifier: z.string().min(3, 'Email or phone is required'),
  password: z.string().min(8),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;

// ─── Sign-up ──────────────────────────────────────────────────────────────────

export const signupStartPhoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s\-()]/g, ''))
    .pipe(z.string().regex(phoneRegex, 'Invalid phone number')),
});

export const signupStartEmailSchema = z.object({
  email: z.string().email('Invalid email'),
});

export const VerifyOtpDtoSchema = z
  .object({
    phone: z.string().min(7).optional(),
    email: z.string().email().optional(),
    code: z.string().length(4, 'OTP must be 4 digits'),
    signupSessionId: z.string(),
  })
  .refine((data) => data.phone || data.email, {
    message: 'Either phone or email is required',
    path: ['phone'],
  });

export const SetPasswordDtoSchema = z
  .object({
    signupSessionId: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string().min(8),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone is required',
    path: ['email'],
  });

// ─── Google Auth ──────────────────────────────────────────────────────────────

export const GoogleVerifyDtoSchema = z.object({
  idToken: z.string().min(50),
});

export const GoogleProfileSchema = z.object({
  email: z.string().nullable(),
  displayName: z.string().nullable(),
  givenName: z.string().nullable(),
  familyName: z.string().nullable(),
  picture: z.string().nullable(),
});

export const GoogleAuthResponseSchema = z.object({
  user: z.any(),
  accessToken: z.string(),
  refreshToken: z.string(),
  next: z.enum(['complete_profile', 'home']),
  profile: GoogleProfileSchema,
});

// ─── Response schemas ─────────────────────────────────────────────────────────

export const signupStartSchemaResponse = z.object({
  signupSessionId: z.string(),
  next: z.string(),
});

export const UserSchema = z.object({
  id: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  passwordHash: z.string(),
  googleSub: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  profile: z.any().nullable(),
  interests: z.array(z.any()),
});

export const LoginResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
  next: z.enum(['complete_profile', 'home']),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type SetPasswordDto = z.infer<typeof SetPasswordDtoSchema>;
export type SignupStartPhoneDto = z.infer<typeof signupStartPhoneSchema>;
export type SignupStartEmailDto = z.infer<typeof signupStartEmailSchema>;
export type VerifyOtpPhoneDto = z.infer<typeof VerifyOtpDtoSchema>;
export type SignupStartResponse = z.infer<typeof signupStartSchemaResponse>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type GoogleVerifyDto = z.infer<typeof GoogleVerifyDtoSchema>;
export type GoogleAuthResponse = z.infer<typeof GoogleAuthResponseSchema>;
export type GoogleProfile = z.infer<typeof GoogleProfileSchema>;
