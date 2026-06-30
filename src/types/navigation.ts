// src/types/navigation.ts
import type { NavigatorScreenParams } from '@react-navigation/native';

// ── Tab screens ────────────────────────────────────────────────────────────────

export type TabParamList = {
  DiscoveryTab: undefined;
  InboxTab: { cameraSelectMode?: boolean } | undefined;
  ProfileTab: undefined;
};

// ── Auth navigator (unauthenticated users) ────────────────────────────────────

export type AuthStackParamList = {
  // Onboarding slides
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;

  // Pre-auth entry point (the animated LogoScreen with photo grid)
  LogoScreen: undefined;

  // Auth
  SignUpScreen: undefined;
  SignInScreen: { defaultTab?: 'phone' | 'email' } | undefined;
  ForgotPasswordScreen: undefined;
  ForgotPasswordVerifyOtpScreen: {
    identifier: string;
    isEmail: boolean;
    sessionId: string;
  };
  ResetPasswordScreen: {
    resetToken: string;
    identifier: string;
    isEmail: boolean;
  };
  PasswordUpdatedScreen: undefined;

  // Signup / profile-completion flow (reached after OTP verification)
  EmailInputScreen: undefined;
  NumberInputScreen: undefined;
  NumberVerifyScreen: undefined;
  VerificationSuccessScreen: undefined;
  ProfileSetupScreen: undefined;
  PhysicalAttributesScreen: undefined;
  InterestsScreen: undefined;
  UploadPhotosScreen: undefined;
  InviteScreen: undefined;
  WaitingScreen: undefined;
  LaunchScreen: undefined;
};

// ── App navigator (authenticated users) ──────────────────────────────────────

export type AppStackParamList = {
  // Profile completion (shown if profile is incomplete after login)
  ProfileSetupScreen: undefined;
  PhysicalAttributesScreen: undefined;
  InterestsScreen: undefined;
  UploadPhotosScreen: undefined;
  InviteScreen: undefined;
  WaitingScreen: undefined;
  LaunchScreen: undefined;

  // Location gate
  EnableLocationScreen: undefined;
  NotAvailableScreen: undefined;

  // Search / discovery loading screen
  SearchScreen: undefined;

  // Main tab navigator
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;

  // Match flow
  MatchScreen: {
    match: { id: string; name: string; image: string; age?: number };
    autoOpenCamera?: boolean;
  };

  // Chat
  RequestsScreen: undefined;
  ChatScreen: {
    conversationId?: string;
    chatUserId?: string;
    chatUserName?: string;
    chatUserImageUri?: string;
    initialLocked?: boolean;
    autoOpenCamera?: boolean;
    initialText?: string;
    initialPhotoUri?: string;
  };
  SnapViewScreen: {
    snapUri: string;
    snapType: 'photo' | 'video';
    chatUserName?: string;
    chatUserImageUri?: string;
  };

  // Profile / settings
  EditProfileScreen: undefined;
  SettingsScreen: undefined;
  BlockedUsersScreen: undefined;
  UserProfileScreen: { user: any };
};

// ── Root stack (just the two navigators) ─────────────────────────────────────

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};

// ── Legacy flat list (kept for backward compat — screens that still use
//    the old `navigation` prop typed as any will continue to work) ──────────

declare global {
  namespace ReactNavigation {
    interface RootParamList extends AuthStackParamList, AppStackParamList {}
  }
}
