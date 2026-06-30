// src/components/bootstrap/AuthGate.tsx
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { tokenStore } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';

// Keep the splash screen visible until we're done bootstrapping.
// This is called once at module load time so the splash never flickers.
SplashScreen.preventAutoHideAsync();

export function AuthGate({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const [token, user] = await Promise.all([
          tokenStore.getAccess(),
          tokenStore.getUser(),
        ]);

        if (cancelled) return;

        if (token && user) {
          // Restore location into Zustand so screens never redirect unnecessarily
          if (user.location?.lat && user.location?.lng) {
            useLocationStore.getState().setCoords({
              lat: user.location.lat,
              lng: user.location.lng,
            });
          }
          useAuthStore.getState().setAuthenticated(token, user);
        } else {
          useAuthStore.getState().setUnauthenticated();
        }
      } catch {
        // If SecureStore fails for any reason, treat as logged-out
        if (!cancelled) {
          useAuthStore.getState().setUnauthenticated();
        }
      } finally {
        if (!cancelled) {
          // Hide splash only after auth + location state is fully restored
          await SplashScreen.hideAsync();
          onReady();
        }
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  // Renders nothing — it's a pure side-effect component
  return null;
}
