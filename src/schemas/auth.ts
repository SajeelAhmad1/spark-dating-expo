import { z } from 'zod';
import { ErrorMessages as ERR } from '@/constants/ErrorMessages';
import type { AuthSigninTab } from '@/types/auth';

export const passwordSchema = z
  .string()
  .min(1, ERR.auth.passwordRequired)
  .min(8, ERR.auth.passwordMin)
  .max(128, ERR.auth.passwordMax);

export const emailSchema = z
  .string()
  .min(1, ERR.auth.emailRequired)
  .email(ERR.auth.emailInvalid);

/** National number only (digits after removing spaces). */
export const phoneNumberSchema = z
  .string()
  .transform(s => s.replace(/\s/g, ''))
  .superRefine((digits, ctx) => {
    if (!digits.length) {
      ctx.addIssue({ code: 'custom', message: ERR.auth.phoneRequired });
      return;
    }
    if (!/^\d{8,15}$/.test(digits)) {
      ctx.addIssue({ code: 'custom', message: ERR.auth.phoneInvalid });
    }
  });

export const rememberMeSchema = z.boolean();

/** Sign-in: validates phone OR email based on active tab. */
export function createSignInSchema(tab: AuthSigninTab) {
  return z
    .object({
      phoneNumber: z.string(),
      email: z.string(),
      password: passwordSchema,
      rememberMe: rememberMeSchema,
    })
    .superRefine((data, ctx) => {
      if (tab === 'phone') {
        const r = phoneNumberSchema.safeParse(data.phoneNumber);
        if (!r.success) {
          for (const issue of r.error.issues) {
            ctx.addIssue({
              code: 'custom',
              message: issue.message,
              path: ['phoneNumber'],
            });
          }
        }
      } else {
        const r = emailSchema.safeParse(data.email);
        if (!r.success) {
          for (const issue of r.error.issues) {
            ctx.addIssue({
              code: 'custom',
              message: issue.message,
              path: ['email'],
            });
          }
        }
      }
    });
}

export type SignInFormValues = z.infer<ReturnType<typeof createSignInSchema>>;
