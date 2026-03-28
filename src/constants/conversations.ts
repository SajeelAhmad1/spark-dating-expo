type ChatStatus = 'active' | 'locking' | 'locked';

export interface Conversation {
  id: string;
  name: string;
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
    name: 'Maria',
    lastMessage: '📷 Sent a photo',
    time: '23h',
    streakCount: 7,
    streakType: 'orange',
    status: 'active',
    isUnread: false,
  },
  {
    id: '2',
    name: 'Maria',
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
    name: 'Maria',
    lastMessage: '📷 Sent a photo',
    time: '30 Minutes',
    timeWarning: true,
    streakType: 'gold',
    status: 'locking',
  },
  {
    id: '4',
    name: 'Maria',
    lastMessage: 'Send a snap to unlock',
    time: '',
    status: 'locked',
  },
];
