// src/features/auth/useGoogleSignIn.ts
import { useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useGoogleAuth } from './hooks';

// Required on Android — closes the browser tab after redirect
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_IDS = {
  webClientId:
    '144133634463-h1ls3krjhf5dadg5rjvrcmbubqr6psr7.apps.googleusercontent.com',
  iosClientId:
    '144133634463-j5snf2goel77aiei2eppt7bkf15qq8rr.apps.googleusercontent.com',
  androidClientId:
    '144133634463-5u6ej3rg93g6vpauohunhshph5honfuc.apps.googleusercontent.com',
};

/** Google-accepted redirect URI for native OAuth (reverse client ID scheme). */
function googleNativeRedirectUri(clientId: string) {
  const id = clientId.replace('.apps.googleusercontent.com', '');
  return `com.googleusercontent.apps.${id}:/oauth2redirect`;
}

// ─────────────────────────────────────────────────────────────────────────────

export function useGoogleSignIn() {
  const { mutate: googleVerify, isPending } = useGoogleAuth();

  const redirectUriOptions = useMemo(() => {
    if (Platform.OS === 'android') {
      return {
        native: googleNativeRedirectUri(GOOGLE_CLIENT_IDS.androidClientId),
      };
    }
    if (Platform.OS === 'ios') {
      return {
        native: googleNativeRedirectUri(GOOGLE_CLIENT_IDS.iosClientId),
      };
    }
    return {};
  }, []);

  const [request, , promptAsync] = Google.useAuthRequest(
    {
      webClientId: GOOGLE_CLIENT_IDS.webClientId,
      iosClientId: GOOGLE_CLIENT_IDS.iosClientId,
      androidClientId: GOOGLE_CLIENT_IDS.androidClientId,
      responseType: 'code',
      scopes: ['openid', 'profile', 'email'],
    },
    redirectUriOptions,
  );

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

        const idToken =
          result.authentication?.idToken ??
          result.params?.id_token;
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
