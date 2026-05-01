import { useEffect, useRef } from 'react'
import { StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'

import OnboardingScreen1         from '@/screens/onboarding/OnboardingScreen1'
import OnboardingScreen2         from '@/screens/onboarding/OnboardingScreen2'
import OnboardingScreen3         from '@/screens/onboarding/OnboardingScreen3'
import LogoScreen                from '@/screens/onboarding/LogoScreen'
import SignUpScreen              from '@/screens/onboarding/SignUpScreen'
import InviteScreen              from '@/screens/onboarding/InviteScreen'
import WaitingScreen             from '@/screens/onboarding/WaitingScreen'
import LaunchScreen              from '@/screens/onboarding/LaunchScreen'
import SignInScreen              from '@/screens/SignInScreen'
import ProfileScreen             from '@/screens/ProfileScreen'
import EmailInputScreen          from '@/screens/onboarding/EmailInputScreen'
import NumberInputScreen         from '@/screens/onboarding/NumberInputScreen'
import NumberVerifyScreen        from '@/screens/onboarding/NumberVerifyScreen'
import VerificationSuccessScreen from '@/screens/onboarding/VerificationSuccessScreen'
import ProfileSetupScreen        from '@/screens/onboarding/ProfileSetupScreen'
import PhysicalAttributesScreen  from '@/screens/onboarding/PhysicalAttributesScreen'
import InterestsScreen           from '@/screens/onboarding/InterestsScreen'
import UploadPhotosScreen        from '@/screens/onboarding/UploadPhotosScreen'
import EnableLocationScreen      from '@/screens/EnableLocationScreen'
import NotAvailableScreen        from '@/screens/NotAvailableScreen'
import SearchScreen              from '@/screens/SearchScreen'
import DiscoveryScreen           from '@/screens/DiscoveryScreen'
import MatchScreen               from '@/screens/MatchScreen'
import RequestsScreen            from '@/screens/RequestsScreen'
import InboxScreen               from '@/screens/InboxScreen'
import ChatScreen                from '@/screens/ChatScreen'
import EditProfileScreen         from './src/screens/EditProfileScreen'
import SettingsScreen            from '@/screens/SettingsScreen'
import BlockedUsersScreen        from '@/screens/BlockedUsersScreen'
import UserProfileScreen         from '@/screens/UserProfileScreen'
import SnapViewScreen            from '@/screens/SnapViewScreen'

import { useFonts }    from 'expo-font'
import Toast           from 'react-native-toast-message'
import { toastConfig } from '@/utils/toastConfig'
import { QueryProvider } from '@/providers/QueryProvider'
import { parseChatNotification, getInitialNotification } from '@/services/fcm'

const isExpoGo = Constants.executionEnvironment === 'storeClient'

const Stack = createStackNavigator()

// ── Navigation ref — used by FCM service to navigate imperatively ─────────────
export const navigationRef = NavigationContainerRef<any>

// ── Navigate to conversation from notification data ───────────────────────────
function navigateToConversation(
  ref: React.RefObject<NavigationContainerRef<any>>,
  conversationId: string
) {
  if (!ref.current?.isReady()) return
  ref.current.navigate('ChatScreen', { conversationId })
}

export default function App() {
  const navRef = useRef<NavigationContainerRef<any>>(null)

  const [loaded, error] = useFonts({
    'Poppins-Thin':       require('./src/assets/fonts/Poppins-Thin.ttf'),
    'Poppins-ExtraLight': require('./src/assets/fonts/Poppins-ExtraLight.ttf'),
    'Poppins-Light':      require('./src/assets/fonts/Poppins-Light.ttf'),
    'Poppins-Regular':    require('./src/assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium':     require('./src/assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold':   require('./src/assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold':       require('./src/assets/fonts/Poppins-Bold.ttf'),
    'Poppins-ExtraBold':  require('./src/assets/fonts/Poppins-ExtraBold.ttf'),
    'Poppins-Black':      require('./src/assets/fonts/Poppins-Black.ttf'),
    'ZenDots-Regular':    require('./src/assets/fonts/ZenDots-Regular.ttf'),
  })

  useEffect(() => {
    // Remote push notifications are not supported in Expo Go SDK 53+
    if (isExpoGo) return

    const foregroundSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = parseChatNotification(response.notification)
      if (data?.conversationId) {
        navigateToConversation(navRef, data.conversationId)
      }
    })

    // ── Handle notification tap from BACKGROUND / TERMINATED state ────────
    // getInitialNotification returns the notification that launched the app.
    // React Query will refetch stale message history automatically on screen mount
    // (staleTime: 15s) so no manual fetch is needed here.
    getInitialNotification().then((data) => {
      if (data?.conversationId) {
        // Small delay to ensure NavigationContainer is ready
        setTimeout(() => navigateToConversation(navRef, data.conversationId), 500)
      }
    })

    return () => {
      foregroundSub.remove()
    }
  }, [])

  if (!loaded && !error) return null

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
          <QueryProvider>
            <NavigationContainer ref={navRef}>
              <Stack.Navigator
                initialRouteName="Onboarding1"
                screenOptions={{ headerShown: false }}
              >
                {/* ── Onboarding ──────────────────────────────────────── */}
                <Stack.Screen name="Onboarding1"  component={OnboardingScreen1} />
                <Stack.Screen name="Onboarding2"  component={OnboardingScreen2} />
                <Stack.Screen name="Onboarding3"  component={OnboardingScreen3} />
                <Stack.Screen name="LogoScreen"   component={LogoScreen} />

                {/* ── Auth ────────────────────────────────────────────── */}
                <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
                <Stack.Screen name="SignInScreen" component={SignInScreen} />

                {/* ── Signup flow ──────────────────────────────────────── */}
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

                {/* ── Location ─────────────────────────────────────────── */}
                <Stack.Screen name="EnableLocationScreen" component={EnableLocationScreen} />
                <Stack.Screen name="NotAvailableScreen"   component={NotAvailableScreen} />

                {/* ── Discovery ────────────────────────────────────────── */}
                <Stack.Screen name="SearchScreen"    component={SearchScreen} />
                <Stack.Screen name="DiscoveryScreen" component={DiscoveryScreen} />
                <Stack.Screen name="MatchScreen"     component={MatchScreen} />

                {/* ── Social ───────────────────────────────────────────── */}
                <Stack.Screen name="RequestsScreen" component={RequestsScreen} />
                <Stack.Screen name="InboxScreen"    component={InboxScreen} />
                <Stack.Screen name="ChatScreen"     component={ChatScreen} />
                <Stack.Screen name="SnapViewScreen" component={SnapViewScreen} />

                {/* ── Profile ──────────────────────────────────────────── */}
                <Stack.Screen name="ProfileScreen"      component={ProfileScreen} />
                <Stack.Screen name="EditProfileScreen"  component={EditProfileScreen} />
                <Stack.Screen name="SettingsScreen"     component={SettingsScreen} />
                <Stack.Screen name="BlockedUsersScreen" component={BlockedUsersScreen} />
                <Stack.Screen name="UserProfileScreen"  component={UserProfileScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </QueryProvider>

          <Toast config={toastConfig} />
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
})
