import { MATCHES } from '@/constants/matches';

export type AppUser = (typeof MATCHES)[number];

export const APP_USERS: AppUser[] = MATCHES;

export const APP_USER_BY_ID = APP_USERS.reduce<Record<string, AppUser>>((acc, user) => {
  acc[user.id] = user;
  return acc;
}, {});

export function getUserById(userId: string): AppUser | undefined {
  return APP_USER_BY_ID[userId];
}
