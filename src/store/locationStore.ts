// store/locationStore.ts
import { create } from 'zustand';
import * as Location from 'expo-location';

interface LocationState {
  coords: { lat: number; lng: number } | null;
  isLoading: boolean;
  error: string | null;
  fetchLocation: () => Promise<void>;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  coords: null,
  isLoading: false,
  error: null,

  fetchLocation: async () => {
    const { coords, isLoading } = get();
    
    // Already have location? Skip
    if (coords) return;
    if (isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        set({ error: 'Permission denied', isLoading: false });
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      set({
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to get location', isLoading: false });
    }
  },

  clearLocation: () => set({ coords: null, isLoading: false, error: null }),
}));