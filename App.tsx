import { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import Toast from 'react-native-toast-message';
import { StatusBar } from 'expo-status-bar';

import { QueryProvider } from '@/providers/QueryProvider';
import { AuthGate }      from '@/components/bootstrap/AuthGate';
import RootNavigator     from '@/navigation/RootNavigator';
import { toastConfig }   from '@/utils/toastConfig';
import { parseChatNotification, getInitialNotification } from '@/services/fcm';
import type { AppStackParamList } from '@/types/navigation';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Module-level navigation ref — usable from FCM handlers and other non-component code.
export const navigationRef = createNavigationContainerRef<AppStackParamList>();

function navigateToConversation(conversationId: string) {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate('ChatScreen', { conversationId });
}

export default function App() {
  // Becomes true once AuthGate finishes bootstrapping and hides the splash.
  const [bootstrapped, setBootstrapped] = useState(false);

  const [loaded, fontError] = useFonts({
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
  });

  useEffect(() => {
    if (isExpoGo) return;

    const foregroundSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = parseChatNotification(response.notification);
        if (data?.conversationId) {
          navigateToConversation(data.conversationId);
        }
      },
    );

    getInitialNotification().then((data) => {
      if (data?.conversationId) {
        setTimeout(() => navigateToConversation(data.conversationId), 500);
      }
    });

    return () => {
      foregroundSub.remove();
    };
  }, []);

  // Return null while fonts are loading — the native splash screen is still
  // visible (AuthGate called SplashScreen.preventAutoHideAsync at module load).
  if (!loaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: '#F7F3ED' }}
          edges={['bottom', 'left', 'right']}
        >
          <QueryProvider>
            <StatusBar style="dark" translucent={false} />

            {/*
              AuthGate runs once on mount:
                1. Reads access token + user from SecureStore
                2. Restores location into locationStore if available
                3. Calls authStore.setAuthenticated / setUnauthenticated
                4. Hides the native splash screen
                5. Calls onReady → bootstrapped = true → NavigationContainer mounts
            */}
            <AuthGate onReady={() => setBootstrapped(true)} />

            {bootstrapped && (
              <NavigationContainer ref={navigationRef}>
                <RootNavigator />
              </NavigationContainer>
            )}
          </QueryProvider>

          <Toast config={toastConfig} />
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
