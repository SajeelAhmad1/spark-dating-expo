import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, View, useWindowDimensions } from 'react-native';
import OnboardingCard from './OnboardingCard';

import Profile1 from '@/assets/images/avatar1.svg';
import Profile2 from '@/assets/images/avatar2.svg';
import Profile3 from '@/assets/images/avatar3.svg';
import Profile4 from '@/assets/images/avatar4.svg';
import Profile5 from '@/assets/images/avatar5.svg';
import CenterProfile from '@/assets/images/avatar6.svg';
import LocationIcon from '@/assets/images/locationIcon.svg';
import Svg, { Circle } from 'react-native-svg';
import { sf, sr, sh } from '@/utils/sizeMatters';

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
  const ringRotation = useRef(new Animated.Value(0)).current;
  const centerEntrance = useRef(new Animated.Value(0)).current;
  const centerPulse = useRef(new Animated.Value(0)).current;
  const avatarEntrance = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0)),
  ).current;
  const pinEntrance = useRef(
    Array.from({ length: 3 }, () => new Animated.Value(0)),
  ).current;

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

  useEffect(() => {
    const ringLoop = Animated.loop(
      Animated.timing(ringRotation, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    ringRotation.setValue(0);
    ringLoop.start();

    centerEntrance.setValue(0);
    Animated.timing(centerEntrance, {
      toValue: 1,
      duration: 650,
      delay: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    avatarEntrance.forEach((anim, i) => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 720,
        delay: 110 + i * 140,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });

    pinEntrance.forEach((anim, i) => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 620,
        delay: 150 + i * 170,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    });

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(centerPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(centerPulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();

    return () => {
      ringLoop.stop();
      pulseLoop.stop();
    };
  }, [
    avatarEntrance,
    centerEntrance,
    centerPulse,
    pinEntrance,
    ringRotation,
    width,
  ]);

  const ringRotate = ringRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const centerScaleEntrance = centerEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  const centerScalePulse = centerPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04],
  });

  const centerScale = Animated.multiply(centerScaleEntrance, centerScalePulse);

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff', paddingBottom: sh(20) }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={{ width: ORBIT_D, height: ORBIT_D }}>
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: ORBIT_D,
              height: ORBIT_D,
              transform: [{ rotate: ringRotate }],
              zIndex: 1,
            }}
          >
            {/* Single outer dashed ring */}
            <Svg width={ORBIT_D} height={ORBIT_D}>
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
          </Animated.View>

          {/* Center avatar */}
          <Animated.View
            style={[
              {
              position: 'absolute',
              width: CENTER_SIZE,
              height: CENTER_SIZE,
              borderRadius: CENTER_SIZE / 2,
              top: ORBIT_R - CENTER_SIZE / 2,
              left: ORBIT_R - CENTER_SIZE / 2,
              overflow: 'hidden',
              zIndex: 10,
              },
              {
                opacity: centerEntrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
                transform: [
                  {
                    scale: centerEntrance.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.92, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <CenterProfile width={CENTER_SIZE} height={CENTER_SIZE} />
          </Animated.View>

          {/* 5 orbit avatars */}
          {AVATARS.map(({ Component, angle, size }, i) => {
            const pos = onCircle(angle, ORBIT_R, size);
            const anim = avatarEntrance[i];
            return (
              <Animated.View
                key={i}
                style={[
                  {
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
                  },
                  {
                    opacity: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                    transform: [
                      {
                        translateY: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [14, 0],
                        }),
                      },
                      {
                        scale: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.86, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Component width={size} height={size} />
              </Animated.View>
            );
          })}

          {/* 3 location pins */}
          {PINS.map((pin, i) => {
            const pos = onCircle(pin.angle, ORBIT_R, pin.size);
            const anim = pinEntrance[i];
            return (
              <Animated.View
                key={i}
                style={{
                  position: 'absolute',
                  top: pos.top - sh(14),
                  left: pos.left + 4,
                  zIndex: 8,
                  opacity: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                  transform: [
                    { rotate: `${pin.tilt ?? 0}deg` },
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.88, 1],
                      }),
                    },
                  ],
                }}
              >
                <LocationIcon width={pin.size} height={pin.size} />
              </Animated.View>
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