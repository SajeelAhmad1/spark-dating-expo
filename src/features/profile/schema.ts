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