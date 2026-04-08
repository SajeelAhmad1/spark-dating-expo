// src/features/user/schema.ts
import { z } from 'zod'; 

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  avatarUrl: z.string().url().nullable().optional(),
  role: z.enum(['admin', 'member', 'viewer']),
  createdAt: z.string().datetime(),
});

const UpdateUserDtoSchema = UserSchema.pick({
  name: true,
  email: true,
}).partial();

export type User = z.infer<typeof UserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserDtoSchema>;