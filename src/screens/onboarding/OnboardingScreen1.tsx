import React, { useMemo, useEffect, useRef } from 'react';
import { View, useWindowDimensions, Animated, Easing } from 'react-native';
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

// ─── Geometry ───────────────────────────────────────────────────────────────
const STROKE_WIDTH = sf(2);
const DASH_LENGTH  = sf(12);
const GAP_LENGTH   = sf(13);

const toRad = (deg: number) => (deg * Math.PI) / 180;

const onCircle = (angleDeg: number, radius: number, size: number) => ({
  left: radius + radius * Math.cos(toRad(angleDeg)) - size / 2,
  top:  radius + radius * Math.sin(toRad(angleDeg)) - size / 2,
});

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

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
      // ⚠️ Order: innermost first → outermost last (in → out pulse order)
      RINGS: [
        { d: orbitD * 0.35, color: 'rgba(30, 120, 245, 0.2)'  }, // index 0 — innermost, fires 1st
        { d: orbitD * 0.45, color: 'rgba(30, 120, 245, 0.15)' }, // index 1 — middle,    fires 2nd
        { d: orbitD * 0.55, color: 'rgba(30, 120, 245, 0.1)'  }, // index 2 — outermost, fires 3rd
      ],
      CENTER_SIZE: sf(62),
      AVATARS: [
        { Component: Profile1, angle: -150, size: sf(68) },
        { Component: Profile2, angle: -55,  size: sf(52) },
        { Component: Profile3, angle: 0,    size: sf(62) },
        { Component: Profile5, angle: 58,   size: sf(68) },
        { Component: Profile4, angle: 140,  size: sf(56) },
      ] as { Component: any; angle: number; size: number }[],
      PINS: [
        { size: sf(24), angle: -95, tilt: 0  },
        { size: sf(24), angle: -22, tilt: 20 },
        { size: sf(24), angle: 105, tilt: 0  },
      ],
    };
  }, [width]);

  // ── 1. Shared rotation value — drives outer ring + all avatars + pins ─────
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 360,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotateDeg = rotateAnim.interpolate({
    inputRange:  [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  // Counter-rotation keeps each avatar/pin face upright while it orbits
  const counterRotateDeg = rotateAnim.interpolate({
    inputRange:  [0, 360],
    outputRange: ['0deg', '-360deg'],
  });

  // ── 2. Inner wave rings — pulse from CENTER outward (in → out) ────────────
  const ringAnims = useRef(RINGS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const FADE_IN_DURATION = 600;  // ms each ring takes to fully appear
    const STAGGER_DELAY    = 350;  // ms gap between each ring firing
    const LOOP_PAUSE       = 900;  // ms pause before the whole sequence repeats

    const buildSequence = () => {
      // Reset all rings instantly to invisible
      const resets = ringAnims.map(a =>
        Animated.timing(a, { toValue: 0, duration: 0, useNativeDriver: true })
      );

      // Each ring fades+scales in, staggered by index (0=inner fires first)
      const reveals = ringAnims.map((a, i) =>
        Animated.sequence([
          Animated.delay(i * STAGGER_DELAY),
          Animated.timing(a, {
            toValue: 1,
            duration: FADE_IN_DURATION,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      );

      return Animated.sequence([
        Animated.parallel(resets),
        Animated.parallel(reveals),
        Animated.delay(LOOP_PAUSE),
      ]);
    };

    Animated.loop(buildSequence()).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff', paddingBottom: sh(20) }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: ORBIT_D, height: ORBIT_D }}>

          {/* ── Inner wave rings — pulse in → out ── */}
          {RINGS.map((ring, i) => {
            const size = Math.max(ring.d, 4);
            return (
              <Animated.View
                key={`ring-${i}`}
                style={{
                  position: 'absolute',
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: ring.color,
                  top:  ORBIT_R - size / 2,
                  left: ORBIT_R - size / 2,
                  opacity: ringAnims[i],
                  transform: [{
                    scale: ringAnims[i].interpolate({
                      inputRange:  [0, 1],
                      outputRange: [0.5, 1], // grows outward from center
                    }),
                  }],
                }}
              />
            );
          })}

          {/* ── Center avatar — static, always on top ── */}
          <View
            style={{
              position: 'absolute',
              width: CENTER_SIZE,
              height: CENTER_SIZE,
              borderRadius: CENTER_SIZE / 2,
              top:  ORBIT_R - CENTER_SIZE / 2,
              left: ORBIT_R - CENTER_SIZE / 2,
              overflow: 'hidden',
              zIndex: 10,
            }}
          >
            <CenterProfile width={CENTER_SIZE} height={CENTER_SIZE} />
          </View>

          {/* ── Outer dashed ring — rotates continuously ── */}
          <AnimatedSvg
            width={ORBIT_D}
            height={ORBIT_D}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: [{ rotate: rotateDeg }],
            }}
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
          </AnimatedSvg>

          {/*
            ── Rotating layer for avatars + pins ──
            Rotates at the same speed as the outer ring so everything
            moves together. Counter-rotate each child to keep it upright.
          */}
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: ORBIT_D,
              height: ORBIT_D,
              transform: [{ rotate: rotateDeg }],
            }}
          >
            {/* ── 5 orbit avatars ── */}
            {AVATARS.map(({ Component, angle, size }, i) => {
              const pos = onCircle(angle, ORBIT_R, size);
              return (
                <Animated.View
                  key={`avatar-${i}`}
                  style={{
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    top:  pos.top,
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
                    transform: [{ rotate: counterRotateDeg }],
                  }}
                >
                  <Component width={size} height={size} />
                </Animated.View>
              );
            })}

            {/* ── 3 location pins ── */}
            {PINS.map((pin, i) => {
              const pos = onCircle(pin.angle, ORBIT_R, pin.size);
              return (
                <Animated.View
                  key={`pin-${i}`}
                  style={{
                    position: 'absolute',
                    width: pin.size,
                    height: pin.size,
                    top:  pos.top - sh(12),
                    left: pos.left,
                    zIndex: 8,
                    // counter-rotate to stay upright, then apply the pin's own tilt
                    transform: [
                      { rotate: counterRotateDeg },
                      { rotate: `${pin.tilt ?? 0}deg` },
                    ],
                  }}
                >
                  <LocationIcon width={pin.size} height={pin.size} />
                </Animated.View>
              );
            })}
          </Animated.View>

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