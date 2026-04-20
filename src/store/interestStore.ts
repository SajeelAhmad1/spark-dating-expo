// store/interestStore.ts
import { create } from 'zustand';
import type { Interest } from '@/features/interests/schema';

interface InterestState {
  interests: Interest[];
  setInterests: (interests: Interest[]) => void;
  clearInterests: () => void;
}

export const useInterestStore = create<InterestState>()((set) => ({
  interests: [],
  
  setInterests: (interests) => set({ interests }),
  
  clearInterests: () => set({ interests: [] }),
}));