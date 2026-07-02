
import { z } from 'zod';
import { ErrorMessages as ERR } from '@/constants/ErrorMessages';

export const chatMessageFormSchema = z.object({
  messageText: z
    .string()
    .max(2000, ERR.messaging.messageMax)
    .refine(s => s.trim().length > 0, ERR.messaging.messageEmpty),
});

export type ChatMessageFormValues = z.infer<typeof chatMessageFormSchema>;

export const matchCaptionFormSchema = z.object({
  inputMessage: z.string().max(500, ERR.messaging.captionMax),
});

export type MatchCaptionFormValues = z.infer<typeof matchCaptionFormSchema>;

export const inboxSearchFormSchema = z.object({
  searchQuery: z.string().max(120, ERR.search.maxLength),
});

export type InboxSearchFormValues = z.infer<typeof inboxSearchFormSchema>;

export const blockedUsersSearchFormSchema = z.object({
  search: z.string().max(120, ERR.search.maxLength),
});

export type BlockedUsersSearchFormValues = z.infer<typeof blockedUsersSearchFormSchema>;
