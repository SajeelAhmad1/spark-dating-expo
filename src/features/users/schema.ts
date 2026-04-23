import { z } from 'zod'

export const PublicUserSchema = z.object({
  id:        z.string(),
  profile: z.object({
    firstName: z.string().nullable().optional(),
    lastName:  z.string().nullable().optional(),
    gender:    z.string().nullable().optional(),
    dob:       z.string().nullable().optional(),
    bio:       z.string().nullable().optional(),
    height:    z.number().nullable().optional(),
    ethnicity: z.string().nullable().optional(),
    photos:    z.array(z.string()),
  }).nullable().optional(),
  interests: z.array(z.object({
    interest: z.object({ id: z.string(), name: z.string() }),
  })).optional(),
})

export const GetUserByIdResponseSchema = z.object({
  user: PublicUserSchema,
})

export type PublicUser             = z.infer<typeof PublicUserSchema>
export type GetUserByIdResponse    = z.infer<typeof GetUserByIdResponseSchema>