import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/endpoints';
import { referralsApi } from './api';

export const useReferralStats = () =>
  useQuery({
    queryKey: queryKeys.referrals.stats(),
    queryFn: () => referralsApi.getStats(),
  });

export const useLaunchProgress = () =>
  useQuery({
    queryKey: queryKeys.referrals.launchProgress(),
    queryFn: () => referralsApi.getLaunchProgress(),
  });

export const useRecordReferralShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => referralsApi.recordShare(),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.referrals.stats(), data);
    },
  });
};
