// src/features/profile/schema.ts
import { z } from 'zod'

export const CompleteProfileDtoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.enum(['male', 'female', 'other']),
  dob: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date',
  }),
  bio: z.string().optional(),
  height: z.number().positive('Height must be positive'),
  ethnicity: z.string().optional(),
  interests: z.array(z.string()).optional(),
  photos: z.array(z.string().url()).optional(),
})

export type CompleteProfileDto = z.infer<typeof CompleteProfileDtoSchema>


// respose schema
export const ProfileSchema = z.object({
  id: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  passwordHash: z.string(),
  googleSub: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  profile: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    dob: z.string().optional(),
    bio: z.string().optional(),
    height: z.number().optional(),
    ethnicity: z.string().optional(),
  }).nullable(),
  interests: z.array(z.string()),
})

export const CompleteProfileDtoResponseSchema = z.object({
  user: ProfileSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
  next: z.enum(['complete_profile', 'upload_photos', 'home']).optional(),
})
export type CompleteProfileDtoResponse = z.infer<typeof CompleteProfileDtoResponseSchema>

 
