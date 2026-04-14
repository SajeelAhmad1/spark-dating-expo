// src/features/auth/useGoogleSignIn.ts
import { useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useGoogleAuth } from './hooks';

// Required on Android — closes the browser tab after redirect
WebBrowser.maybeCompleteAuthSession();

// ── Client IDs (sourced from your config files) ───────────────────────────────
//
//  webClientId     → web credentials JSON     → web.client_id
//  iosClientId     → GoogleService-Info.plist → CLIENT_ID
//  androidClientId → google-services.json     → installed.client_id
//
const GOOGLE_CLIENT_IDS = {
  webClientId:
    '144133634463-h1ls3krjhf5dadg5rjvrcmbubqr6psr7.apps.googleusercontent.com',
  iosClientId:
    '144133634463-j5snf2goel77aiei2eppt7bkf15qq8rr.apps.googleusercontent.com',
  androidClientId:
    '144133634463-5u6ej3rg93g6vpauohunhshph5honfuc.apps.googleusercontent.com',
};

// ─────────────────────────────────────────────────────────────────────────────

export function useGoogleSignIn() {
  const { mutate: googleVerify, isPending } = useGoogleAuth();

  const [request, , promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CLIENT_IDS.webClientId,
    iosClientId: GOOGLE_CLIENT_IDS.iosClientId,
    androidClientId: GOOGLE_CLIENT_IDS.androidClientId,
    responseType: 'id_token',
    scopes: ['openid', 'profile', 'email'],
  });

  const signIn = useCallback(
    async (
      onSuccess: (data: {
        next: 'complete_profile' | 'home';
        profile: {
          email: string | null;
          displayName: string | null;
          givenName: string | null;
          familyName: string | null;
          picture: string | null;
        };
      }) => void,
      onError: (message: string) => void,
    ) => {
      try {
        const result = await promptAsync();

        if (result.type === 'cancel' || result.type === 'dismiss') {
          return; // user closed browser — not an error
        }

        if (result.type !== 'success') {
          onError('Google sign-in failed. Please try again.');
          return;
        }

        const idToken = result.params?.id_token;
        if (!idToken) {
          onError('Google did not return a token. Please try again.');
          return;
        }

        googleVerify(idToken, {
          onSuccess: (data) =>
            onSuccess({ next: data.next, profile: data.profile }),
          onError: (err: any) =>
            onError(err?.message ?? 'Authentication failed. Please try again.'),
        });
      } catch (err: any) {
        onError(err?.message ?? 'Something went wrong. Please try again.');
      }
    },
    [promptAsync, googleVerify],
  );

  return {
    signIn,
    isPending,
    isReady: !!request,
  };
}
