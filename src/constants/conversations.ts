type ChatStatus = 'active' | 'locking' | 'locked';
import { getUserById } from '@/constants/users';

export interface Conversation {
  id: string;
  userId: string;
  lastMessage: string;
  time: string;
  timeWarning?: boolean;
  streakCount?: number;
  streakType?: 'orange' | 'gold';
  status: ChatStatus;
  isUnread?: boolean;
  hasNotifDot?: boolean;
}
export const CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    userId: '1',
    lastMessage: '📷 Sent a photo',
    time: '23h',
    streakCount: 7,
    streakType: 'orange',
    status: 'active',
    isUnread: false,
  },
  {
    id: '2',
    userId: '2',
    lastMessage: 'Hey!',
    time: '11h',
    streakCount: 101,
    streakType: 'gold',
    status: 'active',
    isUnread: true,
    hasNotifDot: true,
  },
  {
    id: '3',
    userId: '3',
    lastMessage: '📷 Sent a photo',
    time: '30 Minutes',
    timeWarning: true,
    streakType: 'gold',
    status: 'locking',
  },
  {
    id: '4',
    userId: '4',
    lastMessage: 'Send a snap to unlock',
    time: '',
    status: 'locked',
  },
];

export function getConversationUserName(conversation: Conversation): string {
  return getUserById(conversation.userId)?.name ?? 'Unknown';
}

export function getConversationUserImage(conversation: Conversation): string | undefined {
  return getUserById(conversation.userId)?.image;
}
