export type MessageType = 'text' | 'image' | 'snap';

export type MessageSender = 'me' | 'friend';

export interface Message {
  id: string;
  type: MessageType;
  sender: MessageSender;
  text?: string;
  imageUri?: string;
  time: string;
  snapDuration?: string;
  seen?: boolean;
}

