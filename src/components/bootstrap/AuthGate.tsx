// src/components/bootstrap/AuthGate.tsx
import { useEffect } from 'react';
import { tokenStore } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';

// NOTE: SplashScreen.preventAutoHideAsync() is called in index.ts (module load).
// NOTE: SplashScreen.hideAsync() is called in App.tsx after BOTH fonts AND auth
//       are ready, so there is never a white flash between the two phases.

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
        if (!cancelled) {
          useAuthStore.getState().setUnauthenticated();
        }
      } finally {
        if (!cancelled) {
          onReady();
        }
      }
    };

    bootstrap();
    return () => { cancelled = true; };
  }, []);

  return null;
}
