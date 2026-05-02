// src/schemas/editProfile.ts
import { z } from 'zod';
import { ErrorMessages as ERR } from '@/constants/ErrorMessages';
import BODY_TYPES from '@/constants/bodyTypes';
import ETHNICITIES from '@/constants/ethnicities';
import HEIGHTS from '@/constants/heights';
import GENDER from '@/constants/gender';

function personName(label: 'first' | 'last') {
  const req = label === 'first' ? ERR.profile.firstNameRequired : ERR.profile.lastNameRequired;
  const max = label === 'first' ? ERR.profile.firstNameMax : ERR.profile.lastNameMax;
  const inv = label === 'first' ? ERR.profile.firstNameInvalid : ERR.profile.lastNameInvalid;
  return z
    .string()
    .trim()
    .min(1, req)
    .max(50, max)
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, inv);
}

export function createEditProfileSchema() {
  return z.object({
    firstName: personName('first'),
    lastName: personName('last'),
    bio: z.string().max(500, ERR.profile.bioMax),
    gender: z.string().refine(v => (Object.values(GENDER) as string[]).includes(v), {
      message: ERR.profile.genderInvalid,
    }),
    height: z.string().optional(),
    ethnicity: z.string().optional(),
    birthday: z.coerce.date().superRefine((d, ctx) => {
      if (Number.isNaN(d.getTime())) {
        ctx.addIssue({ code: 'custom', message: ERR.profile.birthdayInvalid });
        return;
      }
      const now = new Date();
      if (d > now) {
        ctx.addIssue({ code: 'custom', message: ERR.profile.birthdayFuture });
        return;
      }
      const ageMs = now.getTime() - d.getTime();
      const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
      if (ageYears < 18) {
        ctx.addIssue({ code: 'custom', message: ERR.profile.birthdayAge });
      }
    }),
  });
}

export type EditProfileFormValues = z.infer<ReturnType<typeof createEditProfileSchema>>;
