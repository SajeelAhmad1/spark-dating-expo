// src/navigation/RootNavigator.tsx
import React, { useRef } from 'react';
import { useAuthStore, selectAuthStatus } from '@/store/authStore';
import AuthNavigator from '@/navigation/AuthNavigator';
import AppNavigator  from '@/navigation/AppNavigator';

export default function RootNavigator() {
  const status = useAuthStore(selectAuthStatus);
  const wasAuthenticated = useRef(false);

  if (status === 'authenticated') {
    wasAuthenticated.current = true;
    return <AppNavigator />;
  }

  const initialRoute = wasAuthenticated.current ? 'SignInScreen' : 'Onboarding1';
  return <AuthNavigator initialRoute={initialRoute} />;
}
