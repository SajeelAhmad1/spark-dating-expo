import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { Text } from '@/components/common/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import ProfileAvatar from '@/assets/images/profileAvatar.svg';
import { sf, sh, sr } from '@/utils/responsive';

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
  color3?: string;
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
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.orbitWrap, { width: orbitContainerSize, height: orbitContainerSize }]}>
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

        <View
          style={[
            styles.avatarRing,
            {
              width: avatarSize,
              height: avatarSize,
            },
          ]}
        >
          <ProfileAvatar width={avatarSize} height={avatarSize} />
        </View>
      </View>

      <Text
        style={[
          styles.caption,
          {
            fontFamily: 'Poppins-Regular',
            fontSize: sf(16),
            lineHeight: sf(16),
            letterSpacing: 0,
          },
        ]}
      >
        Finding people near you
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitWrap: { alignItems: 'center', justifyContent: 'center' },
  avatarRing: {
    borderRadius: 9999,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    borderWidth: sr(3),
    borderColor: '#ffffff',
  },
  caption: {
    color: '#000000',
    textAlign: 'center',
    marginTop: sh(40),
  },
});

export default SearchScreen;
