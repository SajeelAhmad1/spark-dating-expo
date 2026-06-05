import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { tokenStore } from '@/api/client';
import Logo from '@/assets/images/logo.svg';
import { Text } from '@/components/common/Text';
import { sf, sw, sh } from '@/utils/sizeMatters';
import PrimaryButton from '@/components/common/PrimaryButton';

const SPLASH_DELAY_MS = 1400;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensio
// ── 4 columns of images ───────────────────────────────────────────────────────
const COLUMN_IMAGES: string[][] = [
  [
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&q=80',
    'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=300&q=80',
    'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=300&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=300&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&q=80',
    'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=300&q=80',
    'https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&q=80',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=300&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
  ],
];

const CARD_WIDTH  = sw(105);
const CARD_HEIGHT = sh(150);
const CARD_GAP    = sh(10);
const CARD_RADIUS = sf(16);
const COLUMN_TILT = -12;

// ── AnimatedColumn ────────────────────────────────────────────────────────────
// Uses recursive .start() callback instead of Animated.loop to avoid
// the jump/stuck glitch at loop boundary.

interface AnimatedColumnProps {
  images: string[];
  direction: 'up' | 'down';
  xOffset: number;
  speed?: number;
}

const AnimatedColumn: React.FC<AnimatedColumnProps> = ({
  images,
  direction,
  xOffset,
  speed = 13000,
}) => {
  const ITEM_H  = CARD_HEIGHT + CARD_GAP;
  const TOTAL_H = ITEM_H * images.length;

  // down: translate from 0 → TOTAL_H then snap back to 0
  // up:   translate from 0 → -TOTAL_H then snap back to 0
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;

    const toValue = direction === 'down' ? TOTAL_H : -TOTAL_H;

    const run = () => {
      if (cancelled) return;
      translateY.setValue(0);
      Animated.timing(translateY, {
        toValue,
        duration: speed,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && !cancelled) run();
      });
    };

    run();
    return () => {
      cancelled = true;
      translateY.stopAnimation();
    };
  }, []);

  // Triple so there is always content visible above and below during scroll
  const tripled = [...images, ...images, ...images];

  return (
    <Animated.View
      style={[
        styles.column,
        { transform: [{ translateY }, { translateX: xOffset }] },
      ]}
    >
      {tripled.map((uri, idx) => (
        <View key={idx} style={styles.card}>
          <Image source={{ uri }} style={styles.cardImage} resizeMode="cover" />
        </View>
      ))}
    </Animated.View>
  );
};

// ── LogoScreen ────────────────────────────────────────────────────────────────
const LogoScreen = ({ navigation }: any) => {
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const [token, user] = await Promise.all([
        tokenStore.getAccess(),
        tokenStore.getUser(),
      ]);

      await new Promise<void>((r) => setTimeout(r, SPLASH_DELAY_MS));
      console.log(user, 'user logoscreen');
      if (cancelled) return;
    };

    bootstrap();
    return () => { cancelled = true; };
  }, [navigation]);

  // 4 columns spread across screen width
  const colSpacing = sw(112);
  const col0X = -colSpacing * 1.5;
  const col1X = -colSpacing * 0.5;
  const col2X =  colSpacing * 0.5;
  const col3X =  colSpacing * 1.5;

  return (
    <View style={styles.root}>
      {/* ── Scrolling photo grid ── */}
      <View style={styles.photoArea} pointerEvents="none">
        <View style={styles.columnsWrapper}>
          {/* col 1: down */}
          <AnimatedColumn images={COLUMN_IMAGES[0]} direction="down" xOffset={col0X} speed={13000} />
          {/* col 2: up */}
          <AnimatedColumn images={COLUMN_IMAGES[1]} direction="up"   xOffset={col1X} speed={15000} />
          {/* col 3: down */}
          <AnimatedColumn images={COLUMN_IMAGES[2]} direction="down" xOffset={col2X} speed={11000} />
          {/* col 4: up */}
          <AnimatedColumn images={COLUMN_IMAGES[3]} direction="up"   xOffset={col3X} speed={14000} />
        </View>
      </View>

      {/* ── Gradient fade into black ── */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)', '#000000']}
        style={styles.fadeOverlay}
        pointerEvents="none"
      />

      {/* ── Bottom content ── */}
      <View style={styles.bottomContent}>
        <View style={styles.logoContainer}>
          <Logo width={sf(88)} height={sf(88)} />
        </View>

        <Text style={styles.appName}>Spark</Text>

        <Text style={styles.tagline}>
          The first move is not a message anymore,{'\n'}it's a moment
        </Text>

        <View style={styles.buttonWrapper}>
          <PrimaryButton
            title="Next"
            onPress={() => navigation.navigate('EnableLocationScreen')}
            textStyle={{ fontSize: sf(18) }}
          />
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.alreadyLogin}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SignInScreen')}
            activeOpacity={0.7}
          >
            <Text style={styles.alreadyLoginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LogoScreen;

// ── Styles ────────────────────────────────────────────────────────────────────
const PHOTO_AREA_HEIGHT = SCREEN_HEIGHT * 0.62;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },

  photoArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: PHOTO_AREA_HEIGHT,
    overflow: 'hidden',
  },
  columnsWrapper: {
    position: 'absolute',
    top: -SCREEN_HEIGHT * 0.1,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    transform: [{ rotate: `${COLUMN_TILT}deg` }],
  },
  column: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: CARD_RADIUS,
    marginBottom: CARD_GAP,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },

  fadeOverlay: {
    position: 'absolute',
    top: PHOTO_AREA_HEIGHT * 0.4,
    left: 0,
    right: 0,
    height: PHOTO_AREA_HEIGHT * 0.7,
  },

  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: sh(40),
    paddingHorizontal: sw(40),
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: sh(16),
  },
  appName: {
    fontWeight: '600',
    fontSize: sf(40),
    color: '#FFFFFF',
    marginBottom: sh(12),
  },
  tagline: {
    fontFamily: 'Poppins-Regular',
    fontSize: sf(15),
    color: '#D9D9D9',
    textAlign: 'center',
    lineHeight: sf(22),
    marginBottom: sh(4),
  },
  buttonWrapper: {
    width: '100%',
    marginVertical: sh(28),
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alreadyLogin: {
    fontFamily: 'Poppins-Regular',
    fontSize: sf(16),
    color: '#FFFFFF',
  },
  alreadyLoginLink: {
    fontFamily: 'Poppins-Regular',
    fontWeight: '500',
    fontSize: sf(16),
    color: '#CEB98F',
    textDecorationLine: 'underline',
  },
});
  justifyContent: 'center',
  },
  alreadyLogin: {
    fontFamily: 'Poppins-Regular',
    fontSize: sf(16),
    color: '#FFFFFF',
  },
  alreadyLoginLink: {
    fontFamily: 'Poppins-Regular',
    fontWeight: '500',
    fontSize: sf(16),
    color: '#CEB98F',
    textDecorationLine: 'underline',
  },
});'center',
  },
  alreadyLogin: {
    fontFamily: 'Poppins-Regular',
    fontSize: sf(16),
    color: '#FFFFFF',
  },
  alreadyLoginLink: {
    fontFamily: 'Poppins-Regular',
    fontWeight: '500',
    fontSize: sf(16),
    color: '#CEB98F',
    textDecorationLine: 'underline',
  },
});