// src/navigation/RootNavigator.tsx
import React from 'react';
import { useAuthStore, selectAuthStatus } from '@/store/authStore';
import AuthNavigator from '@/navigation/AuthNavigator';
import AppNavigator  from '@/navigation/AppNavigator';

let wasAuthenticated = false;

export default function RootNavigator() {
  const status = useAuthStore(selectAuthStatus);

  if (status === 'authenticated') {
    wasAuthenticated = true;
    return <AppNavigator />;
  }

  const initialRoute = wasAuthenticated ? 'SignInScreen' : 'Onboarding1';
  return <AuthNavigator initialRoute={initialRoute} />;
}
