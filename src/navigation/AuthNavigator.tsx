// src/navigation/AuthNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { AuthStackParamList } from '@/types/navigation';

import OnboardingScreen1          from '@/screens/onboarding/OnboardingScreen1';
import OnboardingScreen2          from '@/screens/onboarding/OnboardingScreen2';
import OnboardingScreen3          from '@/screens/onboarding/OnboardingScreen3';
import LogoScreen                 from '@/screens/onboarding/LogoScreen';
import SignUpScreen               from '@/screens/onboarding/SignUpScreen';
import SignInScreen               from '@/screens/SignInScreen';
import EmailInputScreen           from '@/screens/onboarding/EmailInputScreen';
import NumberInputScreen          from '@/screens/onboarding/NumberInputScreen';
import NumberVerifyScreen         from '@/screens/onboarding/NumberVerifyScreen';
import VerificationSuccessScreen  from '@/screens/onboarding/VerificationSuccessScreen';
import ProfileSetupScreen         from '@/screens/onboarding/ProfileSetupScreen';
import PhysicalAttributesScreen   from '@/screens/onboarding/PhysicalAttributesScreen';
import InterestsScreen            from '@/screens/onboarding/InterestsScreen';
import UploadPhotosScreen         from '@/screens/onboarding/UploadPhotosScreen';
import InviteScreen               from '@/screens/onboarding/InviteScreen';
import WaitingScreen              from '@/screens/onboarding/WaitingScreen';
import LaunchScreen               from '@/screens/onboarding/LaunchScreen';
import ForgotPasswordScreen           from '@/screens/auth/ForgotPasswordScreen';
import ForgotPasswordVerifyOtpScreen  from '@/screens/auth/ForgotPasswordVerifyOtpScreen';
import ResetPasswordScreen            from '@/screens/auth/ResetPasswordScreen';
import PasswordUpdatedScreen          from '@/screens/auth/PasswordUpdatedScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding1"
      screenOptions={{ headerShown: false }}
    >
      {/* ── Onboarding slides ─────────────────────────────── */}
      <Stack.Screen name="Onboarding1" component={OnboardingScreen1} />
      <Stack.Screen name="Onboarding2" component={OnboardingScreen2} />
      <Stack.Screen name="Onboarding3" component={OnboardingScreen3} />
      <Stack.Screen name="LogoScreen"  component={LogoScreen} />

      {/* ── Auth ──────────────────────────────────────────── */}
      <Stack.Screen name="SignUpScreen"                  component={SignUpScreen} />
      <Stack.Screen name="SignInScreen"                  component={SignInScreen} />
      <Stack.Screen name="ForgotPasswordScreen"          component={ForgotPasswordScreen} />
      <Stack.Screen name="ForgotPasswordVerifyOtpScreen" component={ForgotPasswordVerifyOtpScreen} />
      <Stack.Screen name="ResetPasswordScreen"           component={ResetPasswordScreen} />
      <Stack.Screen name="PasswordUpdatedScreen"         component={PasswordUpdatedScreen} />

      {/* ── Signup / profile-completion flow ──────────────── */}
      <Stack.Screen name="EmailInputScreen"          component={EmailInputScreen} />
      <Stack.Screen name="NumberInputScreen"         component={NumberInputScreen} />
      <Stack.Screen name="NumberVerifyScreen"        component={NumberVerifyScreen} />
      <Stack.Screen name="VerificationSuccessScreen" component={VerificationSuccessScreen} />
      <Stack.Screen name="ProfileSetupScreen"        component={ProfileSetupScreen} />
      <Stack.Screen name="PhysicalAttributesScreen"  component={PhysicalAttributesScreen} />
      <Stack.Screen name="InterestsScreen"           component={InterestsScreen} />
      <Stack.Screen name="UploadPhotosScreen"        component={UploadPhotosScreen} />
      <Stack.Screen name="InviteScreen"              component={InviteScreen} />
      <Stack.Screen name="WaitingScreen"             component={WaitingScreen} />
      <Stack.Screen name="LaunchScreen"              component={LaunchScreen} />
    </Stack.Navigator>
  );
}
