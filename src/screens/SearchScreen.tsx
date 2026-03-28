import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import ProfileAvatar from '@/assets/images/profileAvatar.svg';
import { sf } from '@/utils/responsive';

// ── Orbit Ring ─────────────────────────────────────────────
const OrbitRing = ({
  size,
  duration,
  color1,
  color2,
  color3,
  strokeWidth = 1.5,
  delay = 0,
  reverse = false,
}: {
  size: number;
  duration: number;
  color1: string;
  color2: string;
  color3?: string; // optional
  strokeWidth?: number;
  delay?: number;
  reverse?: boolean;
}) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [duration, delay, rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: reverse ? ['360deg', '0deg'] : ['0deg', '360deg'],
  });

  const r = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * r;

  // Dynamically adjust arc math based on 2 or 3 arcs
  const arcCount = color3 ? 3 : 2;
  const arc = circumference * 0.22;
  const gap = (circumference - arc * arcCount) / arcCount;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        transform: [{ rotate }],
      }}
    >
      <Svg width={size} height={size}>
        {/* Arc 1 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color1}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arc} ${circumference - arc}`}
          strokeDashoffset={0}
          strokeLinecap="round"
        />
        {/* Arc 2 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color2}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arc} ${circumference - arc}`}
          strokeDashoffset={-(arc + gap)}
          strokeLinecap="round"
        />
        {/* Arc 3 — only if color3 provided */}
        {color3 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color3}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arc} ${circumference - arc}`}
            strokeDashoffset={-(arc * 2 + gap * 2)}
            strokeLinecap="round"
          />
        )}
      </Svg>
    </Animated.View>
  );
};

// ── Screen ─────────────────────────────────────────────────
const SearchScreen = ({ navigation }: any) => {
  const orbitContainerSize = sf(300);
  const avatarSize = sf(94);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('DiscoveryScreen');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      {/* Orbit container */}
      <View
        className="items-center justify-center"
        style={{ width: orbitContainerSize, height: orbitContainerSize }}
      >
        <OrbitRing
          size={orbitContainerSize}
          duration={7000}
          color1="#1E78F540"
          color2="#FBB20240"
          strokeWidth={1.5}
          delay={0}
        />
        <OrbitRing
          size={sf(245)}
          duration={6000}
          color1="#FBB20240"
          color2="#1E78F540"
          color3="#FBB20240"
          strokeWidth={4}
          delay={150}
          reverse
        />
        <OrbitRing
          size={sf(190)}
          duration={5000}
          color1="#1E78F540"
          color2="#FBB20240"
          color3="#1E78F540"
          strokeWidth={4}
          delay={300}
        />
        <OrbitRing
          size={sf(110)}
          duration={4500}
          color1="#1E78F540"
          color2="#FBB20240"
          color3="#1E78F540"
          strokeWidth={4}
          delay={300}
          reverse
        />

        {/* Center Avatar */}
        <View
          className="rounded-full overflow-hidden bg-gray-100"
          style={{
            width: avatarSize,
            height: avatarSize,
            borderWidth: 3,
            borderColor: '#ffffff',
          }}
        >
          <ProfileAvatar width={avatarSize} height={avatarSize} />
        </View>
      </View>

      {/* Label */}
      <Text
        className="text-black text-center mt-10"
        style={{
          fontFamily: 'Poppins-Regular',
          fontSize: sf(16),
          lineHeight: sf(16),
          letterSpacing: 0,
        }}
      >
        Finding people near you
      </Text>
    </SafeAreaView>
  );
};

export default SearchScreen;
