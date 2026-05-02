import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { tokenStore } from '@/api/client';
import Logo from '@/assets/images/logo.svg';
import { Text } from '@/components/common/Text';
import { sf, sw, sh } from '@/utils/sizeMatters';

const SPLASH_DELAY_MS = 1400;

const LogoScreen = ({ navigation }: any) => {
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const [token, user] = await Promise.all([
        tokenStore.getAccess(),
        tokenStore.getUser(),
      ]);

      // Honour minimum splash visibility
      await new Promise<void>((r) => setTimeout(r, SPLASH_DELAY_MS));

      if (cancelled) return;

      if (token) {
        if (!user?.profile) {
          navigation.replace('ProfileSetupScreen');
        } else if (user?.location?.lat && user?.location?.lng) {
          navigation.replace('SearchScreen');
        } else {
          navigation.replace('EnableLocationScreen');
        }
      } else {
        navigation.replace('SignInScreen');
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [navigation]);

  return (
    <LinearGradient
      colors={['#1E78F5', '#FBB202']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      {/* Logo icon */}
      <View>
        <Logo
          width={sf(88)}
          height={sf(88)}
        />
      </View>

      {/* App name */}
      <Text style={styles.appName}>SPARK</Text>

      {/* Tagline */}
      <Text style={styles.tagline}>
        Real connections start with a moment, not a message.
      </Text>
    </LinearGradient>
  );
};

export default LogoScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sw(40),
  },

  appName: {
    fontFamily: 'ZenDots-Regular',
    fontSize: sf(32),
    color: '#FFFFFF',
    // letterSpacing: 4,
    marginBottom: sh(20),
  },

  tagline: {
    fontFamily: 'Poppins-Regular',
    fontSize: sf(15),
    color: 'rgba(34, 34, 34, 1)',
    textAlign: 'center',
    // lineHeight: sf(24),
  },
});
