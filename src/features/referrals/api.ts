import { apiGet, apiPost } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import {
  LaunchProgress,
  LaunchProgressSchema,
  ReferralStats,
  ReferralStatsSchema,
} from './schema';

export const referralsApi = {
  getStats: async (): Promise<ReferralStats> => {
    const raw = await apiGet<ReferralStats>(ENDPOINTS.REFERRALS.STATS);
    return ReferralStatsSchema.parse(raw);
  },

  recordShare: async (): Promise<ReferralStats> => {
    const raw = await apiPost<ReferralStats>(ENDPOINTS.REFERRALS.SHARE);
    return ReferralStatsSchema.parse(raw);
  },

  getLaunchProgress: async (): Promise<LaunchProgress> => {
    const raw = await apiGet<LaunchProgress>(ENDPOINTS.REFERRALS.LAUNCH_PROGRESS);
    return LaunchProgressSchema.parse(raw);
  },
};
