import React, { useEffect, useMemo, useRef } from 'react';
import { View, Animated, Easing, useWindowDimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { sf, sr, sh } from '@/utils/sizeMatters';

const STROKE_WIDTH = sf(2);
const DASH_LENGTH  = sf(12);
const GAP_LENGTH   = sf(13);

const toRad = (deg: number) => (deg * Math.PI) / 180;

const onCircle = (angleDeg: number, radius: number, size: number) => ({
  left: radius + radius * Math.cos(toRad(angleDeg)) - size / 2,
  top:  radius + radius * Math.sin(toRad(angleDeg)) - size / 2,
});

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

interface Props {
  CenterProfile: any;
  AVATARS: { Component: any; angle: number; size: number }[];
  PINS: { size: number; angle: number; tilt?: number }[];
  LocationIcon: any;
  style?: any;
}

const OrbitAvatarAnimation = ({ CenterProfile, AVATARS, PINS, LocationIcon, style }: Props) => {
  const { width } = useWindowDimensions();

  const { ORBIT_D, ORBIT_R, RINGS, CENTER_SIZE } = useMemo(() => {
    const orbitD = width * 0.78;
    const orbitR = orbitD / 2;

    return {
      ORBIT_D: orbitD,
      ORBIT_R: orbitR,
      RINGS: [
        { d: orbitD * 0.35, color: 'rgba(30, 120, 245, 0.2)' },
        { d: orbitD * 0.45, color: 'rgba(30, 120, 245, 0.15)' },
        { d: orbitD * 0.55, color: 'rgba(30, 120, 245, 0.1)' },
      ],
      CENTER_SIZE: sf(62),
    };
  }, [width]);

  // ✅ FIXED smooth rotation (no jump)
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1, // 🔥 key fix
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { resetBeforeIteration: false } // 🔥 prevents jump
    ).start();
  }, []);

  const rotateDeg = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const counterRotateDeg = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  // ── Ring animations ──
  const ringAnims = useRef(RINGS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const FADE_IN_DURATION = 600;
    const STAGGER_DELAY    = 350;
    const LOOP_PAUSE       = 900;

    const buildSequence = () => {
      const resets = ringAnims.map(a =>
        Animated.timing(a, { toValue: 0, duration: 0, useNativeDriver: true })
      );

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
    <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, style]}>
      <View style={{ width: ORBIT_D, height: ORBIT_D }}>

        {/* Rings */}
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
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                }],
              }}
            />
          );
        })}

        {/* Center */}
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

        {/* Outer Ring */}
        <AnimatedSvg
          width={ORBIT_D}
          height={ORBIT_D}
          style={{
            position: 'absolute',
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

        {/* Rotating Layer */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: ORBIT_D,
            height: ORBIT_D,
            transform: [{ rotate: rotateDeg }],
          }}
        >
          {/* Avatars */}
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
                  transform: [{ rotate: counterRotateDeg }],
                }}
              >
                <Component width={size} height={size} />
              </Animated.View>
            );
          })}

          {/* Pins */}
          {PINS.map((pin, i) => {
            const pos = onCircle(pin.angle, ORBIT_R, pin.size);
            return (
              <Animated.View
                key={`pin-${i}`}
                style={{
                  position: 'absolute',
                  width: pin.size,
                  height: pin.size,
                  top: pos.top - sh(12),
                  left: pos.left,
                  zIndex: 8,
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
  );
};

export default OrbitAvatarAnimation;