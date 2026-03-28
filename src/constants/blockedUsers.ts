export type BlockedUser = {
  id: string;
  name: string;
  age: number;
  blockedDate: string;
  avatar: string;
};

const DUMMY_URI =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80';
  
export const BLOCKED_USERS: BlockedUser[] = [
  { id: '1', name: 'Maria', age: 35, blockedDate: 'Oct 12, 2023', avatar: DUMMY_URI },
  { id: '2', name: 'Jenny', age: 35, blockedDate: 'Sep 12, 2023', avatar: DUMMY_URI },
  { id: '3', name: 'Maria', age: 35, blockedDate: 'Oct 12, 2023', avatar: DUMMY_URI },
];
