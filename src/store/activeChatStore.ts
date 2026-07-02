import { create } from 'zustand';

interface ActiveChatStore {
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
}

export const useActiveChatStore = create<ActiveChatStore>((set) => ({
  activeConversationId: null,
  setActiveConversationId: (id) => set({ activeConversationId: id }),
}));

export const getActiveConversationId = () =>
  useActiveChatStore.getState().activeConversationId;
