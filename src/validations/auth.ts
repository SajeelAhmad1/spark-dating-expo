import { z } from 'zod';

export const phoneNumberSchema = z.string().min(1);
export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(1);
export const rememberMeSchema = z.boolean();

export const signInSchema = z.object({
  phoneNumber: phoneNumberSchema,
  email: emailSchema,
  password: passwordSchema,
  rememberMe: rememberMeSchema,
});

export type SignInFormValues = z.infer<typeof signInSchema>;

