import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { socialApi } from './api';
import { queryKeys } from '@/api/endpoints';
import { showToast } from '@/utils/toast';
import type { BlockUserRequest, SendConnectionRequest } from './schema';

// ── Block User ────────────────────────────────────────────────────────────────

export const useBlockUser = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: BlockUserRequest) => socialApi.blockUser(payload),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.social.blocks() });
      qc.invalidateQueries({ queryKey: queryKeys.discovery.profiles() });
    },

    onError: (err: any) => {
      showToast({ text1: 'Block failed', text2: err?.message ?? 'Try again' });
    },
  });
};

// ── List Blocked Users ────────────────────────────────────────────────────────

export const useBlockedUsers = (page = 1) => {
  return useQuery({
    queryKey: [...queryKeys.social.blocks(), page],
    queryFn: () => socialApi.listBlockedUsers(page),
    staleTime: 1000 * 60 * 5,
  });
};

// ── Send Connection Request ───────────────────────────────────────────────────

export const useSendConnectionRequest = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendConnectionRequest) =>
      socialApi.sendConnectionRequest(payload),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.social.connectionRequests('sent'),
      });
    },

    onError: (err: any) => {
      showToast({
        text1: 'Request failed',
        text2: err?.message ?? 'Could not send connection request',
      });
    },
  });
};

// ── List Connection Requests ──────────────────────────────────────────────────

export const useConnectionRequests = (
  direction: 'received' | 'sent',
  page = 1,
) => {
  return useQuery({
    queryKey: [...queryKeys.social.connectionRequests(direction), page],
    queryFn: () => socialApi.listConnectionRequests(direction, page),
    staleTime: 1000 * 60 * 2,
  });
};

// ── Accept Connection Request ─────────────────────────────────────────────────

export const useAcceptConnectionRequest = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) =>
      socialApi.acceptConnectionRequest(requestId),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.social.connectionRequests('received'),
      });
      showToast({ text1: "It's a match! 🎉" });
    },

    onError: (err: any) => {
      showToast({ text1: 'Failed to accept', text2: err?.message });
    },
  });
};

// ── Reject Connection Request ─────────────────────────────────────────────────

export const useRejectConnectionRequest = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) =>
      socialApi.rejectConnectionRequest(requestId),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.social.connectionRequests('received'),
      });
    },

    onError: (err: any) => {
      showToast({ text1: 'Failed to reject', text2: err?.message });
    },
  });
};
