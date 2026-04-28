import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { tokenStore } from '@/api/client';
import Logo from '@/assets/images/logo.svg';
import { sf } from '@/utils/sizeMatters';

const SPLASH_DELAY_MS = 1400;

const LogoScreen = ({ navigation }: any) => {
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const token = await tokenStore.getAccess();
      const user = await tokenStore.getUser();
  console.log(user, "user logo")
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
    <View style={styles.root}>
      <Logo
        width={sf(100)}
        height={sf(100)}
      />
    </View>
  );
};

export default LogoScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
