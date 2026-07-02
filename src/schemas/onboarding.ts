import { z } from 'zod';
import { parsePhoneNumber, isValidPhoneNumber  } from 'libphonenumber-js/max';
import type { CountryCode } from 'libphonenumber-js';
import { ErrorMessages as ERR } from '@/constants/ErrorMessages';

export const onboardingPhoneFormSchema = z
  .object({
    phoneNumber: z.string().transform(s => s.replace(/\s/g, '')),
    countryCode: z.string().length(2, ERR.onboarding.phoneNationalInvalid),
  })
  .superRefine((data, ctx) => {
    if (!data.phoneNumber.length) {
      ctx.addIssue({
        code: 'custom',
        message: ERR.onboarding.phoneNationalRequired,
        path: ['phoneNumber'],
      });
      return;
    }
      const country = data.countryCode.toUpperCase() as CountryCode;

      // ✅ First check: is it valid format + possible number for this country
      const valid = isValidPhoneNumber(data.phoneNumber, country);
      if (!valid) {
        ctx.addIssue({
          code: 'custom',
          message: ERR.onboarding.phoneNationalInvalid,
          path: ['phoneNumber'],
        });
        return;
      }

      // ✅ Second check: parse and verify type is not UNKNOWN (libphonenumber-js/max only)
      const pn = parsePhoneNumber(data.phoneNumber, country);
      if (!pn?.isValid() || pn.getType() === undefined) {
        ctx.addIssue({
          code: 'custom',
          message: ERR.onboarding.phoneNationalInvalid,
          path: ['phoneNumber'],
        });
      }
  });

export type OnboardingPhoneFormValues = z.infer<typeof onboardingPhoneFormSchema>;

const otpDigitSchema = z
  .string()
  .length(1, ERR.auth.otpDigit)
  .regex(/^\d$/, ERR.auth.otpDigit);

export const otpFormSchema = z.object({
  d0: otpDigitSchema,
  d1: otpDigitSchema,
  d2: otpDigitSchema,
  d3: otpDigitSchema,
});

export type OtpFormValues = z.infer<typeof otpFormSchema>;

const name = (label: 'first' | 'last') => {
  const req = label === 'first' ? ERR.profile.firstNameRequired : ERR.profile.lastNameRequired;
  const max = label === 'first' ? ERR.profile.firstNameMax : ERR.profile.lastNameMax;
  const inv = label === 'first' ? ERR.profile.firstNameInvalid : ERR.profile.lastNameInvalid;
  return z
    .string()
    .trim()
    .min(1, req)
    .max(50, max)
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, inv);
};

export function createProfileSetupSchema(opts: {
  genders: readonly string[];
  days: readonly string[];
  months: readonly string[];
  years: readonly string[];
}) {
  const { genders, days, months, years } = opts;
  return z.object({
    firstName: name('first'),
    lastName: name('last'),
    gender: z
      .string()
      .refine(v => genders.includes(v), { message: ERR.profile.genderInvalid }),
    day: z.string().refine(v => days.includes(v), { message: ERR.profile.dayInvalid }),
    month: z.string().refine(v => months.includes(v), { message: ERR.profile.monthInvalid }),
    year: z.string().refine(v => years.includes(v), { message: ERR.profile.yearInvalid }),
    height: z.string().optional(),
    ethnicity: z.string().optional(),
    bio: z.string().max(500, ERR.profile.bioMax),
  });
}

export const physicalAttributesSchema = z.object({
  height: z.string().optional(),
  bodyType: z.string().optional(),
  ethnicity: z.string().optional(),
});

export type PhysicalAttributesFormValues = z.infer<typeof physicalAttributesSchema>;

export const interestsSelectionSchema = z
  .array(z.string())
  .min(3, ERR.interests.min)
  .max(5, ERR.interests.max);

export const uploadPhotosFilledSchema = z.object({
  filledCount: z
    .number()
    .int()
    .min(2, ERR.upload.minPhotos),
});
