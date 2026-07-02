import { z } from 'zod';

export const ReferralStatsSchema = z.object({
  referralCode: z.string(),
  referralLink: z.string(),
  invitesSent: z.number(),
  signupsCount: z.number(),
  premiumInviteTarget: z.number(),
  premiumUnlocked: z.boolean(),
});

export type ReferralStats = z.infer<typeof ReferralStatsSchema>;

export const LaunchProgressSchema = z.object({
  current: z.number(),
  target: z.number(),
  remaining: z.number(),
  progressPercent: z.number(),
});

export type LaunchProgress = z.infer<typeof LaunchProgressSchema>;
