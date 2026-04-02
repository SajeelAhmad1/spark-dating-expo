import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, View, useWindowDimensions } from 'react-native';
import { Text } from '@/components/common/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import OnboardingCard from './OnboardingCard';
import CameraIcon from '@/assets/images/cameraIcon.svg';
import { sf, sw, sh } from '@/utils/sizeMatters';

export default function Onboarding2({ navigation }: any) {
  const { width, height } = useWindowDimensions();

  const imgWidth = Math.round(width * 0.55);
  const imgHeight = Math.round(imgWidth * 2);
  const illustrationHeight = height * 0.58;

  const upperEntrance = useRef(new Animated.Value(0)).current;
  const lowerEntrance = useRef(new Animated.Value(0)).current;
  const cameraEntrance = useRef(new Animated.Value(0)).current;
  const cameraPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(upperEntrance, {
        toValue: 1,
        duration: 700,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(lowerEntrance, {
        toValue: 1,
        duration: 700,
        delay: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cameraEntrance, {
        toValue: 1,
        duration: 650,
        delay: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cameraPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cameraPulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();

    return () => loop.stop();
  }, [upperEntrance, lowerEntrance, cameraEntrance, cameraPulse]);

  const upperOpacity = upperEntrance.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const upperTranslateY = upperEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });
  const lowerOpacity = lowerEntrance.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const lowerTranslateY = lowerEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0],
  });

  const cameraOpacity = cameraEntrance.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const cameraScaleEntrance = cameraEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });
  const cameraScalePulse = cameraPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  return (
    <View
      style={{ flex: 1, backgroundColor: '#ffffff', paddingBottom: sh(20)  }}
    >
      {/* ── Illustration area ── */}
      <View
        style={{
          flex: 1,
          height: illustrationHeight,
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            left: -(imgWidth * 0.01),
            top: illustrationHeight * 0.6 - imgHeight * 0.65,
            opacity: upperOpacity,
            transform: [{ translateY: upperTranslateY }],
          }}
        >
          <Image
            source={require('@/assets/images/streakImage1.png')}
            style={{ width: imgWidth, height: imgHeight }}
          />
        </Animated.View>

        {/* 🔥 upper */}
        <Text
          style={{
            position: 'absolute',
            fontSize: sf(22),
            zIndex: 20,
            top: illustrationHeight * 0.5 - 130,
            left: width * 0.35,
          }}
        >
          🔥
        </Text>

        {/* Camera icon */}
        <Animated.View
          style={{
            position: 'absolute',
            top: illustrationHeight * 0.5 - sh(20),
            left: width / 2 - sw(36),
            zIndex: 30,
            width: sw(72),
            height: sw(72),
            borderRadius: sw(36),
            backgroundColor: '#E8F0FF',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#4A80F0',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: sf(16),
            elevation: 8,
            opacity: cameraOpacity,
            transform: [{ scale: cameraScaleEntrance }, { scale: cameraScalePulse }],
          }}
        >
          <CameraIcon width={sf(56)} height={sf(56)} />
        </Animated.View>

        {/* 🔥 lower */}
        <Text
          style={{
            position: 'absolute',
            fontSize: sf(22),
            zIndex: 20,
            top: illustrationHeight * 0.45 + 150,
            left: width * 0.58,
          }}
        >
          🔥
        </Text>

        <Animated.View
          style={{
            position: 'absolute',
            right: -(imgWidth * 0.01),
            top: illustrationHeight * 0.5 - imgHeight * 0.38,
            opacity: lowerOpacity,
            transform: [{ translateY: lowerTranslateY }],
          }}
        >
          <Image
            source={require('@/assets/images/streakImage2.png')}
            style={{ width: imgWidth, height: imgHeight }}
          />
        </Animated.View>
      </View>

      {/* ── Bottom card ── */}
      <OnboardingCard
        title="Build Streaks 🔥"
        subtitle="Break the ice with a photo. It's the spark that starts every conversation."
        activeDot={1}
        buttonLabel="Next"
        onPress={() => navigation.navigate('Onboarding3')}
      />
    </View>
  );
}
