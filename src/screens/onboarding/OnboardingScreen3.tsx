import React from 'react';
import { View, useWindowDimensions, Image } from 'react-native';
import { sf, sw, sh } from '@/utils/responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import OnboardingCard from './OnboardingCard';
import CameraIcon from '@/assets/images/cameraIcon.svg';

export default function Onboarding3({ navigation }: any) {
  const { width, height } = useWindowDimensions();

  const imgWidth = Math.round(width * 0.55);
  const imgHeight = Math.round(imgWidth * 2);
  const illustrationHeight = height * 0.58;

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
        <View
          style={{
            position: 'absolute',
            left: -(imgWidth * 0.01),
            top: illustrationHeight * 0.6 - imgHeight * 0.65,
          }}
        >
          <Image
            source={require('@/assets/images/chatLocked.png')}
            style={{ width: imgWidth, height: imgHeight }}
          />
        </View>

        {/* Camera icon */}
        <View
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
          }}
        >
          <CameraIcon width={sf(56)} height={sf(56)} />
        </View>

        <View
          style={{
            position: 'absolute',
            right: -(imgWidth * 0.01),
            top: illustrationHeight * 0.5 - imgHeight * 0.38,
          }}
        >
          <Image
            source={require('@/assets/images/chat.png')}
            style={{ width: imgWidth, height: imgHeight }}
          />
        </View>
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
