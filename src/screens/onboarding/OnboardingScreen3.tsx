import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, View, useWindowDimensions } from 'react-native';
import { sf, sw, sh } from '@/utils/sizeMatters'; 
import OnboardingCard from './OnboardingCard';
import CameraIcon from '@/assets/images/cameraIcon.svg';

export default function Onboarding3({ navigation }: any) {
  const { width, height } = useWindowDimensions();

  const imgWidth = Math.round(width * 0.55);
  const imgHeight = Math.round(imgWidth * 2);
  const illustrationHeight = height * 0.58;

  const leftEntrance = useRef(new Animated.Value(0)).current;
  const rightEntrance = useRef(new Animated.Value(0)).current;
  const cameraEntrance = useRef(new Animated.Value(0)).current;
  const cameraPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(leftEntrance, {
        toValue: 1,
        duration: 700,
        delay: 110,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rightEntrance, {
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
          duration: 950,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cameraPulse, {
          toValue: 0,
          duration: 950,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();

    return () => loop.stop();
  }, [cameraEntrance, cameraPulse, leftEntrance, rightEntrance]);

  const leftOpacity = leftEntrance.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const leftTranslateY = leftEntrance.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const rightOpacity = rightEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const rightTranslateY = rightEntrance.interpolate({
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
      style={{ flex: 1, backgroundColor: '#ffffff', paddingBottom: sh(20) }}
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
            opacity: leftOpacity,
            transform: [{ translateY: leftTranslateY }],
          }}
        >
          <Image
            source={require('@/assets/images/chatLocked.png')}
            style={{ width: imgWidth, height: imgHeight }}
          />
        </Animated.View>

        {/* Camera icon */}
        <Animated.View
          style={{
            position: 'absolute',
            top: illustrationHeight * 0.5 - 20,
            left: width / 2 - 36,
            zIndex: 30,
            width: 72,
            height: 72,
            borderRadius: 36,
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

        <Animated.View
          style={{
            position: 'absolute',
            right: -(imgWidth * 0.01),
            top: illustrationHeight * 0.5 - imgHeight * 0.38,
            opacity: rightOpacity,
            transform: [{ translateY: rightTranslateY }],
          }}
        >
          <Image
            source={require('@/assets/images/chat.png')}
            style={{ width: imgWidth, height: imgHeight }}
          />
        </Animated.View>
      </View>

      {/* ── Bottom card ── */}
      <OnboardingCard
        title="Keep your streak alive every 24 hours"
        subtitle="Keep your connection alive with daily snaps. The longer your streak, the stronger your bond."
        activeDot={2}
        buttonLabel="Next"
        onPress={() => navigation.navigate('LogoScreen')}
      />
    </View>
  );
}
