import { useState, useEffect, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import Toast from 'react-native-toast-message';
import { StatusBar } from 'expo-status-bar';

import { QueryProvider } from '@/providers/QueryProvider';
import { AuthGate } from '@/components/bootstrap/AuthGate';
import { ChatRealtimeProvider } from '@/components/chat/ChatRealtimeProvider';
import RootNavigator from '@/navigation/RootNavigator';
import { toastConfig } from '@/utils/toastConfig';
import {
  parseChatNotification,
  getInitialNotification,
  type ChatNotificationData,
} from '@/services/fcm';
import type { AppStackParamList } from '@/types/navigation';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

export const navigationRef = createNavigationContainerRef<AppStackParamList>();

let pendingChatNav: ChatNotificationData | null = null;

function navigateToChat(data: ChatNotificationData) {
  const params = {
    conversationId: data.conversationId,
    chatUserId: data.senderId,
    chatUserName: data.senderName,
    chatUserImageUri: data.senderPhotoUrl,
  };
  if (!navigationRef.isReady()) {
    pendingChatNav = data;
    return;
  }
  navigationRef.navigate('ChatScreen', params);
  pendingChatNav = null;
}

function flushPendingChatNav() {
  if (pendingChatNav) navigateToChat(pendingChatNav);
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [appReady, setAppReady]   = useState(false);

  const [fontsLoaded, fontError] = useFonts({
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

  const fontsReady = fontsLoaded || !!fontError;

  // Hide native splash once fonts + auth are both ready
  useEffect(() => {
    if (!fontsReady || !authReady) return;
    SplashScreen.hideAsync().finally(() => setAppReady(true));
  }, [fontsReady, authReady]);

  // ── Notification handling ──────────────────────────────────────────────────
  const handleNotificationTap = useCallback(
    (data: ChatNotificationData) => {
      if (!appReady) {
        pendingChatNav = data;
        return;
      }
      const tryNav = (attempt = 0) => {
        if (navigationRef.isReady()) {
          navigateToChat(data);
        } else if (attempt < 10) {
          setTimeout(() => tryNav(attempt + 1), 300);
        } else {
          pendingChatNav = data;
        }
      };
      tryNav();
    },
    [appReady],
  );

  useEffect(() => {
    if (isExpoGo) return;
    const foregroundSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = parseChatNotification(response.notification);
        if (data?.conversationId) handleNotificationTap(data);
      },
    );
    getInitialNotification().then((data) => {
      if (data?.conversationId) handleNotificationTap(data);
    });
    return () => { foregroundSub.remove(); };
  }, [handleNotificationTap]);

  useEffect(() => {
    if (appReady) flushPendingChatNav();
  }, [appReady]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: '#F7F3ED' }}
          edges={['bottom', 'left', 'right']}
        >
          <QueryProvider>
            <StatusBar style='dark' translucent={false} />

            {/* Auth bootstrap — always mounted so it runs immediately */}
            <AuthGate onReady={() => setAuthReady(true)} />

            {/* App content — only rendered once both fonts + auth are ready */}
            {appReady && (
              <NavigationContainer ref={navigationRef} onReady={flushPendingChatNav}>
                <ChatRealtimeProvider />
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
