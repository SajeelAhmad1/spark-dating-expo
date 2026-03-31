import { create } from 'zustand';
import type { BottomTab } from '@/types/bottomTabs';

interface TabStore {
  activeTab: BottomTab;
  setActiveTab: (tab: BottomTab) => void;
}

export const useTabStore = create<TabStore>((set) => ({
  activeTab: 'Home',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
