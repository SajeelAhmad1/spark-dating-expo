import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import LogoIcon from '@/assets/images/logo.svg';

interface Props {
  /** When true the splash fades out and calls onFadeComplete when done */
  hiding: boolean;
  onFadeComplete: () => void;
}

export function SplashScreenView({ hiding, onFadeComplete }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!hiding) return;
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onFadeComplete();
    });
  }, [hiding]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.logoWrap}>
        <LogoIcon width={110} height={110} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F7F3ED',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  logoWrap: {
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },
});
