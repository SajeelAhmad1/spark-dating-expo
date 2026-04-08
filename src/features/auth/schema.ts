// src/features/auth/schema.ts

import { z } from 'zod';

// sign-up
export const SetPasswordDtoSchema = z
  .object({
    signupSessionId: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string().min(8),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone is required',
    path: ['email'], // you can also attach to form-level
  });

// sign-up start with phone
export const signupStartPhoneSchema = z.object({
  phone: z.string().min(10, 'Phone number is required'),
});

// sign-up start with email
export const signupStartEmailSchema = z.object({
  email: z.string().email(),
});

// verify otp Phone
export const VerifyOtpDtoSchema = z
  .object({
    phone: z.string().min(10).optional(),
    email: z.string().email().optional(),
    code: z.string().length(4, 'OTP must be 4 digits'),
    signupSessionId: z.string(),
  })
  .refine((data) => data.phone || data.email, {
    message: 'Either phone or email is required',
    path: ['phone'], // or ['email']
  });

// sign-in
export const LoginDtoSchema = z.object({
  identifier: z.string().min(3, 'Email or phone is required'),
  password: z.string().min(8),
});

export const loginPhoneSchema = z.object({
  phoneNumber:  z.string()
    .min(10, 'Number required!')
    .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean(),
});

export const loginEmailSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean(),
});

export type AuthSigninTab = 'phone' | 'email';

// sign-up
export type SetPasswordDto = z.infer<typeof SetPasswordDtoSchema>;

// sign-up start with phone
export type SignupStartPhoneDto = z.infer<typeof signupStartPhoneSchema>;

// sign-up start with email
export type SignupStartEmailDto = z.infer<typeof signupStartEmailSchema>;

// verify otp Phone
export type VerifyOtpPhoneDto = z.infer<typeof VerifyOtpDtoSchema>;

// sign-in
export type LoginDto = z.infer<typeof LoginDtoSchema>;

// response types

export const signupStartSchemaResponse = z.object({
  signupSessionId: z.string(),
  next: z.string(),
});

// User schema (based on your response)
export const UserSchema = z.object({
  id: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  passwordHash: z.string(),
  googleSub: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  profile: z.any().nullable(), // You can define a more specific ProfileSchema later
  interests: z.array(z.any()), // You can define a more specific InterestSchema later
});

// Complete login response schema
export const LoginResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
  next: z.enum(['complete_profile', 'home']),
});

export type SignupStartResponse = z.infer<typeof signupStartSchemaResponse>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type UserProfileSchema = z.infer<typeof UserSchema>;
