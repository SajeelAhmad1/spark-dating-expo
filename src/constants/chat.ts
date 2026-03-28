import { Message } from '@/types/chat';

export const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    type: 'image',
    sender: 'friend',
    imageUri:
      'https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?w=300',
    time: '',
  },
  {
    id: '2',
    type: 'text',
    sender: 'friend',
    text: 'Hello! Nice to meet you 😊',
    time: '10:05 AM',
  },
  {
    id: '3',
    type: 'text',
    sender: 'me',
    text: 'Hi Maria! Nice to meet you too!',
    time: '10:05 AM',
    seen: true,
  },
  {
    id: '4',
    type: 'snap',
    sender: 'friend',
    text: 'Tap to view snap',
    time: '10:05 AM',
    snapDuration: '20s',
  },
  {
    id: '5',
    type: 'snap',
    sender: 'me',
    text: 'Photo',
    time: '10:05 AM',
    seen: true,
  },
];

