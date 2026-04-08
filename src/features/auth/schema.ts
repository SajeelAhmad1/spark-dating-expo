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
export const VerifyOtpPhoneDtoSchema = z.object({
  phone: z.string().min(10),
  code: z.string().length(4, 'OTP must be 4 digits'),
  signupSessionId: z.string(),
});

// sign-in
export const LoginDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

// sign-up
export type SetPasswordDto = z.infer<typeof SetPasswordDtoSchema>;

// sign-up start with phone
export type SignupStartPhoneDto = z.infer<typeof signupStartPhoneSchema>;

// sign-up start with email
export type SignupStartEmailDto = z.infer<typeof signupStartEmailSchema>;

// verify otp Phone
export type VerifyOtpPhoneDto = z.infer<typeof VerifyOtpPhoneDtoSchema>;

// sign-in
export type LoginDto = z.infer<typeof LoginDtoSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;



// response types
 
export const signupStartSchemaResponse = z.object({
  signupSessionId: z.string(),
  next: z.string(),
});

export type SignupStartResponse = z.infer<typeof signupStartSchemaResponse>;
