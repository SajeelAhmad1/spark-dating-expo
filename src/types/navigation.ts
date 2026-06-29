import type { NavigatorScreenParams } from '@react-navigation/native';

// ── Tab screens ───────────────────────────────────────────────────────────────

export type TabParamList = {
  DiscoveryTab: undefined;
  InboxTab: { cameraSelectMode?: boolean } | undefined;
  ProfileTab: undefined;
};

// ── Root stack ────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  // Tab group
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;

  // Onboarding
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
  LogoScreen: undefined;

  // Auth
  SignUpScreen: undefined;
  SignInScreen: undefined;
  ForgotPasswordScreen: undefined;
  ForgotPasswordVerifyOtpScreen: { identifier: string; isEmail: boolean; sessionId: string };
  ResetPasswordScreen: { resetToken: string; identifier: string; isEmail: boolean };
  PasswordUpdatedScreen: undefined;

  // Signup flow
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

  // Location
  EnableLocationScreen: undefined;
  NotAvailableScreen: undefined;

  // App screens
  SearchScreen: undefined;
  DiscoveryScreen: undefined;
  MatchScreen: { match: { id: string; name: string; image: string; age?: number }; autoOpenCamera?: boolean };
  RequestsScreen: undefined;
  InboxScreen: { cameraSelectMode?: boolean } | undefined;
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
  SnapViewScreen: { snapUri: string; snapType: 'photo' | 'video'; chatUserName?: string; chatUserImageUri?: string };
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  SettingsScreen: undefined;
  BlockedUsersScreen: undefined;
  UserProfileScreen: { user: any };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
