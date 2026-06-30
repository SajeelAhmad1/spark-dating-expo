// src/navigation/RootNavigator.tsx
import React from 'react';
import { useAuthStore, selectAuthStatus } from '@/store/authStore';
import AuthNavigator from '@/navigation/AuthNavigator';
import AppNavigator  from '@/navigation/AppNavigator';

/**
 * RootNavigator is rendered only after AuthGate has completed bootstrapping
 * (i.e. status will never be 'loading' here). It switches between the two
 * sub-navigators purely based on Zustand auth state — no SecureStore reads,
 * no navigation.replace() calls anywhere.
 */
export default function RootNavigator() {
  const status = useAuthStore(selectAuthStatus);

  if (status === 'authenticated') {
    return <AppNavigator />;
  }

  return <AuthNavigator />;
}
