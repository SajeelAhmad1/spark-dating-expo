// src/navigation/AppNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { AppStackParamList } from '@/types/navigation';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';

import TabNavigator           from '@/navigation/TabNavigator';
import SearchScreen           from '@/screens/SearchScreen';
import MatchScreen            from '@/screens/MatchScreen';
import RequestsScreen         from '@/screens/RequestsScreen';
import ChatScreen             from '@/screens/ChatScreen';
import SnapViewScreen         from '@/screens/SnapViewScreen';
import EditProfileScreen      from '@/screens/EditProfileScreen';
import SettingsScreen         from '@/screens/SettingsScreen';
import BlockedUsersScreen     from '@/screens/BlockedUsersScreen';
import UserProfileScreen      from '@/screens/UserProfileScreen';
import EnableLocationScreen   from '@/screens/EnableLocationScreen';
import NotAvailableScreen     from '@/screens/NotAvailableScreen';
import ProfileSetupScreen     from '@/screens/onboarding/ProfileSetupScreen';
import PhysicalAttributesScreen from '@/screens/onboarding/PhysicalAttributesScreen';
import InterestsScreen        from '@/screens/onboarding/InterestsScreen';
import UploadPhotosScreen     from '@/screens/onboarding/UploadPhotosScreen';
import InviteScreen           from '@/screens/onboarding/InviteScreen';
import WaitingScreen          from '@/screens/onboarding/WaitingScreen';
import LaunchScreen           from '@/screens/onboarding/LaunchScreen';

const Stack = createStackNavigator<AppStackParamList>();

function getInitialRoute(
  user: ReturnType<typeof useAuthStore.getState>['user'],
  hasLocation: boolean,
): keyof AppStackParamList {
  if (!user?.profile) return 'ProfileSetupScreen';
  if (!hasLocation) return 'EnableLocationScreen';
  return 'SearchScreen';
}

export default function AppNavigator() {
  const user = useAuthStore((s) => s.user);
  const coords = useLocationStore((s) => s.coords);

  const initialRoute = getInitialRoute(user, !!coords);

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      {/* ── Profile completion (if profile is missing after login) ── */}
      <Stack.Screen name="ProfileSetupScreen"       component={ProfileSetupScreen} />
      <Stack.Screen name="PhysicalAttributesScreen" component={PhysicalAttributesScreen} />
      <Stack.Screen name="InterestsScreen"          component={InterestsScreen} />
      <Stack.Screen name="UploadPhotosScreen"       component={UploadPhotosScreen} />
      <Stack.Screen name="InviteScreen"             component={InviteScreen} />
      <Stack.Screen name="WaitingScreen"            component={WaitingScreen} />
      <Stack.Screen name="LaunchScreen"             component={LaunchScreen} />

      {/* ── Location gate ─────────────────────────────────────────── */}
      <Stack.Screen name="EnableLocationScreen" component={EnableLocationScreen} />
      <Stack.Screen name="NotAvailableScreen"   component={NotAvailableScreen} />

      {/* ── Discovery loading ─────────────────────────────────────── */}
      <Stack.Screen name="SearchScreen" component={SearchScreen} />

      {/* ── Main tab navigator ────────────────────────────────────── */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      {/* ── Match ─────────────────────────────────────────────────── */}
      <Stack.Screen name="MatchScreen" component={MatchScreen} />

      {/* ── Chat ──────────────────────────────────────────────────── */}
      <Stack.Screen name="RequestsScreen" component={RequestsScreen} />
      <Stack.Screen name="ChatScreen"     component={ChatScreen} />
      <Stack.Screen name="SnapViewScreen" component={SnapViewScreen} />

      {/* ── Profile / settings ────────────────────────────────────── */}
      <Stack.Screen name="EditProfileScreen"  component={EditProfileScreen} />
      <Stack.Screen name="SettingsScreen"     component={SettingsScreen} />
      <Stack.Screen name="BlockedUsersScreen" component={BlockedUsersScreen} />
      <Stack.Screen name="UserProfileScreen"  component={UserProfileScreen} />
    </Stack.Navigator>
  );
}
