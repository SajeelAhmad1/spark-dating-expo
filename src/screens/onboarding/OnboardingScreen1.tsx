import React, { useMemo } from 'react';
import { View, SafeAreaView, useWindowDimensions } from 'react-native';
import OnboardingCard from './OnboardingCard';

import Profile1 from '@/assets/images/avatar1.svg';
import Profile2 from '@/assets/images/avatar2.svg';
import Profile3 from '@/assets/images/avatar3.svg';
import Profile4 from '@/assets/images/avatar4.svg';
import Profile5 from '@/assets/images/avatar5.svg';
import CenterProfile from '@/assets/images/avatar6.svg';
import LocationIcon from '@/assets/images/locationIcon.svg';
import Svg, { Circle } from 'react-native-svg';
import { sf, sr, sh } from '@/utils/responsive';

// ─── Geometry ──────────────────────────────────────────────────────────────
const STROKE_WIDTH = sf(2);
const DASH_LENGTH = sf(12);
const GAP_LENGTH = sf(13);

const toRad = (deg: number) => (deg * Math.PI) / 180;

const onCircle = (angleDeg: number, radius: number, size: number) => ({
  left: radius + radius * Math.cos(toRad(angleDeg)) - size / 2,
  top: radius + radius * Math.sin(toRad(angleDeg)) - size / 2,
});

const OnboardingScreen1 = ({ navigation }: any) => {
  const { width } = useWindowDimensions();

  const { ORBIT_D, ORBIT_R, RINGS, CENTER_SIZE, AVATARS, PINS } = useMemo(() => {
    const orbitD = width * 0.78;
    const orbitR = orbitD / 2;

    return {
      ORBIT_D: orbitD,
      ORBIT_R: orbitR,
      RINGS: [
        { d: orbitD * 0.55, color: 'rgba(30, 120, 245, 0.1)' },
        { d: orbitD * 0.45, color: 'rgba(30, 120, 245, 0.15)' },
        { d: orbitD * 0.35, color: 'rgba(30, 120, 245, 0.2)' },
      ],
      CENTER_SIZE: sf(62),
      AVATARS: [
        { Component: Profile1, angle: -150, size: sf(68) },
        { Component: Profile2, angle: -55, size: sf(52) },
        { Component: Profile3, angle: 0, size: sf(62) },
        { Component: Profile5, angle: 58, size: sf(68) },
        { Component: Profile4, angle: 140, size: sf(56) },
      ] as { Component: any; angle: number; size: number }[],
      PINS: [
        { size: sf(24), angle: -95, tilt: 0 },
        { size: sf(24), angle: -22, tilt: 20 },
        { size: sf(24), angle: 105, tilt: 0 },
      ],
    };
  }, [width]);

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={{ width: ORBIT_D, height: ORBIT_D }}>

          {/* Single outer dashed ring */}
          <Svg
            width={ORBIT_D}
            height={ORBIT_D}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <Circle
              cx={ORBIT_R}
              cy={ORBIT_R}
              r={ORBIT_R - STROKE_WIDTH / 2}
              stroke="#7D858E"
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={`${DASH_LENGTH}, ${GAP_LENGTH}`}
              fill="none"
            />
          </Svg>

          {/* 3 solid filled rings */}
          {RINGS.map((ring, i) => {
            const size = Math.max(ring.d, 4);
            return (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: ring.color,
                  top: ORBIT_R - size / 2,
                  left: ORBIT_R - size / 2,
                }}
              />
            );
          })}

          {/* Center avatar */}
          <View
            style={{
              position: 'absolute',
              width: CENTER_SIZE,
              height: CENTER_SIZE,
              borderRadius: CENTER_SIZE / 2,
              top: ORBIT_R - CENTER_SIZE / 2,
              left: ORBIT_R - CENTER_SIZE / 2,
              overflow: 'hidden',
              zIndex: 10,
            }}
          >
            <CenterProfile width={CENTER_SIZE} height={CENTER_SIZE} />
          </View>

          {/* 5 orbit avatars */}
          {AVATARS.map(({ Component, angle, size }, i) => {
            const pos = onCircle(angle, ORBIT_R, size);
            return (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  top: pos.top,
                  left: pos.left,
                  overflow: 'hidden',
                  borderWidth: sf(1),
                  borderColor: '#FBB202',
                  elevation: 6,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: sh(2) },
                  shadowOpacity: 0.15,
                  shadowRadius: sr(4),
                  zIndex: 5,
                }}
              >
                <Component width={size} height={size} />
              </View>
            );
          })}

          {/* 3 location pins */}
          {PINS.map((pin, i) => {
            const pos = onCircle(pin.angle, ORBIT_R, pin.size);
            return (
              <LocationIcon
                key={i}
                width={pin.size}
                height={pin.size}
                style={{
                  position: 'absolute',
                  top: pos.top - sh(12),
                  left: pos.left,
                  zIndex: 8,
                  transform: [{ rotate: `${pin.tilt ?? 0}deg` }],
                }}
              />
            );
          })}

        </View>
      </View>

      <OnboardingCard
        title="Find Your Match"
        subtitle="Swipe through profiles and connect with people who interest you in real-time."
        activeDot={0}
        buttonLabel="Next"
        onPress={() => navigation.navigate('Onboarding2')}
      />
    </View>
  );
};

export default OnboardingScreen1;