import React from 'react';
import { View, useWindowDimensions, Image } from 'react-native';
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
        <View
          style={{
            position: 'absolute',
            left: -(imgWidth * 0.01),
            top: illustrationHeight * 0.6 - imgHeight * 0.65,
          }}
        >
          <Image
            source={require('@/assets/images/streakImage1.png')}
            style={{ width: imgWidth, height: imgHeight }}
          />
        </View>

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
        <View
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
          }}
        >
          <CameraIcon width={sf(56)} height={sf(56)} />
        </View>

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

        <View
          style={{
            position: 'absolute',
            right: -(imgWidth * 0.01),
            top: illustrationHeight * 0.5 - imgHeight * 0.38,
          }}
        >
          <Image
            source={require('@/assets/images/streakImage2.png')}
            style={{ width: imgWidth, height: imgHeight }}
          />
        </View>
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
