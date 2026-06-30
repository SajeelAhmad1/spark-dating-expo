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
import Logo from '@/assets/images/logo.svg';
import { Text } from '@/components/common/Text';
import { sf, sw, sh } from '@/utils/sizeMatters';
import PrimaryButton from '@/components/common/PrimaryButton';
import { StatusBar } from 'expo-status-bar';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Placeholder images (replace with your actual assets) ───────────────────
// Using high-quality portrait-style placeholder images
const COLUMN_IMAGES: string[][] = [
  [
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&q=80',
    'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=300&q=80',
    'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=300&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80',
    'https://images.unsplash.com/photo-1534614971-6be99a7a3ffd?w=300&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80',
    'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=300&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=300&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&q=80',
    'https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&q=80',
    'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=300&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&q=80',
    'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=300&q=80',
    'https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&q=80',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
    'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=300&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=300&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
    'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=300&q=80',
    'https://images.unsplash.com/photo-1534614971-6be99a7a3ffd?w=300&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80',
    'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=300&q=80',
    'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=300&q=80',
  ],
];

// Card dimensions
const CARD_WIDTH = sw(110);
const CARD_HEIGHT = sh(155);
const CARD_GAP = sh(12);
const CARD_RADIUS = sf(16);
const COLUMN_TILT = 16; // degrees – matches the screenshot diagonal

// Total height of one full column of cards (used for seamless looping)
const SINGLE_LOOP_HEIGHT = (CARD_HEIGHT + CARD_GAP) * COLUMN_IMAGES[0].length;

// ─── AnimatedColumn ──────────────────────────────────────────────────────────
interface AnimatedColumnProps {
  images: string[];
  direction: 'up' | 'down';
  /** horizontal offset of this column */
  xOffset: number;
}

const AnimatedColumn: React.FC<AnimatedColumnProps> = ({
  images,
  direction,
  xOffset,
}) => {
  // down: start at 0, animate to -SINGLE_LOOP_HEIGHT (strip slides down, resets seamlessly)
  // up:   start at -SINGLE_LOOP_HEIGHT, animate to 0 (strip slides up, resets seamlessly)
  const fromValue = direction === 'down' ? 0 : -SINGLE_LOOP_HEIGHT;
  const toValue = direction === 'down' ? -SINGLE_LOOP_HEIGHT : 0;

  const translateY = useRef(new Animated.Value(fromValue)).current;

  useEffect(() => {
    translateY.setValue(fromValue);

    const loop = Animated.loop(
      Animated.timing(translateY, {
        toValue,
        duration: 50000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    loop.start();
    return () => loop.stop();
  }, []);

  // Triple the images so there's always content visible above, in-view, and below
  const tripled = [...images, ...images, ...images];

  return (
    <Animated.View
      style={[
        styles.column,
        {
          transform: [{ translateY }, { translateX: xOffset }],
        },
      ]}
    >
      {tripled.map((uri, idx) => (
        <View
          key={idx}
          style={styles.card}
        >
          <Image
            source={{ uri }}
            style={styles.cardImage}
            resizeMode='cover'
          />
        </View>
      ))}
    </Animated.View>
  );
};

// ─── LogoScreen ──────────────────────────────────────────────────────────────
// Pure presentation screen — all auth decisions are made by AuthGate at startup.
const LogoScreen = ({ navigation }: any) => {
  // Four columns evenly spread across the screen
  const colSpacing = sw(118);
  const col0X = -colSpacing * 1.5;
  const col1X = -colSpacing * 0.5;
  const col2X = colSpacing * 0.5;
  const col3X = colSpacing * 1.5;

  return (
    <>
      <StatusBar
        style='light'
        translucent={false}
      />
      <View style={styles.root}>
        {/* ── Dark background ── */}
        <View style={StyleSheet.absoluteFill} />

        {/* ── Scrolling photo grid (top ~60% of screen) ── */}
        <View
          style={styles.photoArea}
          pointerEvents='none'
        >
          {/* Rotate all columns together to achieve the diagonal look */}
          <View style={styles.columnsWrapper}>
            <AnimatedColumn
              images={COLUMN_IMAGES[0]}
              direction='down'
              xOffset={col0X}
            />
            <AnimatedColumn
              images={COLUMN_IMAGES[1]}
              direction='up'
              xOffset={col1X}
            />
            <AnimatedColumn
              images={COLUMN_IMAGES[2]}
              direction='down'
              xOffset={col2X}
            />
            <AnimatedColumn
              images={COLUMN_IMAGES[3]}
              direction='up'
              xOffset={col3X}
            />
          </View>
        </View>

        {/* ── Gradient fade from photo area into black ── */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)', '#000000']}
          style={styles.fadeOverlay}
          pointerEvents='none'
        />

        {/* ── Bottom content ── */}
        <View style={styles.bottomContent}>
          {/* Logo icon */}
          <View style={styles.logoContainer}>
            <Logo
              width={sf(88)}
              height={sf(88)}
            />
          </View>

          {/* App name */}
          <Text style={styles.appName}>Spark</Text>

          {/* Tagline */}
          <Text style={styles.tagline}>
            The first move is not a message anymore,{'\n'}it's a moment
          </Text>

          {/* CTA button */}
          <View style={styles.buttonWrapper}>
            <PrimaryButton
              title='Next'
              onPress={() => navigation.navigate('SignUpScreen')}
              textStyle={{ fontSize: sf(18) }}
            />
          </View>

          {/* Login link */}
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
    </>
  );
};

export default LogoScreen;

// ─── Styles ──────────────────────────────────────────────────────────────────
const PHOTO_AREA_HEIGHT = SCREEN_HEIGHT * 0.62;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // ── Photo grid ──
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
    top: -SCREEN_HEIGHT * 0.08, // pull up slightly so cards fill the viewport edge-to-edge
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    transform: [{ rotate: `${COLUMN_TILT}deg` }],
    // Extra horizontal overflow is clipped by photoArea
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

  // ── Gradient overlay ──
  fadeOverlay: {
    position: 'absolute',
    top: PHOTO_AREA_HEIGHT * 0.45,
    left: 0,
    right: 0,
    height: PHOTO_AREA_HEIGHT * 0.65,
  },

  // ── Bottom content ──
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
