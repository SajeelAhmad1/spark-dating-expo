// src/features/auth/useGoogleSignIn.ts
import { useCallback } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useGoogleAuth } from './hooks';
import type { GoogleAuthResponse } from './schema';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  offlineAccess: false,
});

type OnSuccess = (data: Pick<GoogleAuthResponse, 'next' | 'profile'>) => void;
type OnError = (message: string) => void;

export function useGoogleSignIn() {
  const { mutate: googleVerify, isPending } = useGoogleAuth();

  const signIn = useCallback(
    async (onSuccess: OnSuccess, onError: OnError) => {
      try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const response = await GoogleSignin.signIn();

        console.log('Google Response:');
console.log(JSON.stringify(response, null, 2));

console.log('Web Client:', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
// console.log('Android Client:', process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID);
// console.log('iOS Client:', process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);

        if (response.type === 'cancelled') return;

        const idToken = response.data?.idToken;
        if (!idToken) {
          onError('Google did not return a token. Please try again.');
          return;
        }

        googleVerify(idToken, {
          onSuccess: (data) => onSuccess({ next: data.next, profile: data.profile }),
          onError: (err: any) =>
            onError(err?.message ?? 'Authentication failed. Please try again.'),
        });
      } catch (err: any) {
        if (err.code === statusCodes.IN_PROGRESS) return;
        if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          onError('Google Play Services not available.');
        } else {
          onError(err?.message ?? 'Something went wrong. Please try again.');
        }
      }
    },
    [googleVerify],
  );

  return { signIn, isPending, isReady: true };
}
