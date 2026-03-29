import { Conversation, getConversationUserName } from '@/constants/conversations';
import { InboxFilterType } from '@/types/inbox';

export function filterConversations(
  conversations: Conversation[],
  filter: InboxFilterType,
  query: string,
): Conversation[] {
  let filtered = conversations;

  if (query.trim()) {
    filtered = filtered.filter(c =>
      getConversationUserName(c).toLowerCase().includes(query.toLowerCase()),
    );
  }

  switch (filter) {
    case 'Active Streaks':
      return filtered.filter(c => c.status === 'active');
    case 'Expiring Soon':
      return filtered.filter(c => c.status === 'locking');
    case 'Locked Chats':
      return filtered.filter(c => c.status === 'locked');
    default:
      return filtered;
  }
}

