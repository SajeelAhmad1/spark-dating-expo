import { z } from 'zod';

export const onboardingPhoneSchema = z.string().min(1);
export const onboardingPhoneFormSchema = z.object({
  phoneNumber: onboardingPhoneSchema,
});
export type OnboardingPhoneFormValues = z.infer<typeof onboardingPhoneFormSchema>;

const otpDigitSchema = z
  .string()
  .max(1)
  .regex(/^\d?$/, 'OTP digit must be a number');

export const otpSchema = z.object({
  digits: z.tuple([otpDigitSchema, otpDigitSchema, otpDigitSchema, otpDigitSchema]),
});
export type OtpFormValues = z.infer<typeof otpSchema>;

// Profile setup is parameterized because its allowed sets come from screen constants.
export function createProfileSetupSchema(opts: {
  genders: readonly string[];
  days: readonly string[];
  months: readonly string[];
  years: readonly string[];
}) {
  const { genders, days, months, years } = opts;
  return z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    gender: z.string().refine(v => genders.includes(v)),
    day: z.string().refine(v => days.includes(v)),
    month: z.string().refine(v => months.includes(v)),
    year: z.string().refine(v => years.includes(v)),
    bio: z.string(),
  });
}

