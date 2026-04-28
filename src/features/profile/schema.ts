// src/features/profile/schema.ts
import { z } from 'zod';

// ─── Complete Profile ──────────────────────────────────────────────────────────

export const CompleteProfileDtoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.enum(['male', 'female', 'other']),
  dob: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date' }),
  bio: z.string().optional(),
  height: z.number().positive('Height must be positive').optional(),
  ethnicity: z.string().optional(),
  interests: z.array(z.string()).optional(),
  photos: z.array(z.string().url()).optional(),
});

export type CompleteProfileDto = z.infer<typeof CompleteProfileDtoSchema>;

// ─── Edit Profile ──────────────────────────────────────────────────────────────
// All fields are optional — only send what changed (PATCH semantics).

export const EditProfileDtoSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dob: z.string().optional(),
  bio: z.string().optional(),
  height: z.number().positive().optional(),
  ethnicity: z.string().optional(),
  interests: z.array(z.string()).min(3).max(5).optional(),
  photos: z.array(z.string().url()).optional(),
});

export type EditProfileDto = z.infer<typeof EditProfileDtoSchema>;

// ─── Shared sub-schemas ────────────────────────────────────────────────────────

export const ProfileDataSchema = z.object({
  id: z.string(),
  userId: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dob: z.string().optional(),
  bio: z.string().nullable(),
  height: z.number().nullable(),
  ethnicity: z.string().nullable(),
  photos: z.array(z.string()),
});

export const InterestItemSchema = z.object({
  interestId: z.string(),
  interest: z.object({ id: z.string(), name: z.string() }),
});

export const UserSchema = z.object({
  id: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  googleSub: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  profile: ProfileDataSchema.nullable(),
  interests: z.array(InterestItemSchema),
  location: z.any().nullable(),
  matchesCount: z.number().optional().nullable(),
  streakCount: z.number().optional().nullable(),
});

export type User = z.infer<typeof UserSchema>;
export type ProfileData = z.infer<typeof ProfileDataSchema>;

// ─── Response schemas ──────────────────────────────────────────────────────────

export const CompleteProfileResponseSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    user: UserSchema,
    next: z.enum(['complete_profile', 'upload_photos', 'home']).optional(),
  }),
});

export const EditProfileResponseSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    user: UserSchema,
  }),
});

export const MeResponseSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    user: UserSchema,
  }),
});

export type CompleteProfileResponse = z.infer<
  typeof CompleteProfileResponseSchema
>;
export type EditProfileResponse = z.infer<typeof EditProfileResponseSchema>;
export type MeResponse = z.infer<typeof MeResponseSchema>;
