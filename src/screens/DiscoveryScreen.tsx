import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Heart, X, Zap } from 'lucide-react-native';
import BottomTabBar from '@/components/common/BottomTabBar';
import { sf, sr, sw, sh } from '@/utils/sizeMatters';
import { showToast } from '@/utils/toast';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useDiscoverProfiles, useSwipe } from '@/features/discovery/hooks';
import type { DiscoveryProfile } from '@/features/discovery/schema';
import { useLocationStore } from '@/store/locationStore';
import { ProgressDots } from '@/components/ProgressDots';

const { width: SW, height: SH } = Dimensions.get('window');
const CARD_WIDTH = SW;
const CARD_HEIGHT = SH;
const DISCOVERY_PAGE_LIMIT = 10;
const PREFETCH_THRESHOLD = Math.ceil(DISCOVERY_PAGE_LIMIT / 2);

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [shimmer]);
  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.75],
  });
  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { backgroundColor: '#1A1A1A', opacity }]}
    />
  );
}

// ── Interest pill ─────────────────────────────────────────────────────────────

function InterestPill({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function profileToCardItem(p: DiscoveryProfile) {
  return {
    id: p.id,
    name: `${p.firstName} ${p.lastName}`.trim(),
    age: p.age,
    bio: p.bio ?? '',
    image: p.photos[0] ?? 'https://via.placeholder.com/600',
    images: p.photos,
    interests: (p as any).interests ?? [],
  };
}

// ── Screen ────────────────────────────────────────────────────────────────────

const DiscoveryScreen = ({ navigation }: any) => {
  const { coords } = useLocationStore();

  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDiscoverProfiles(
    coords
      ? { lat: coords.lat, lng: coords.lng, limit: DISCOVERY_PAGE_LIMIT }
      : null,
  );

  const profiles = data?.profiles ?? [];
console.log(data, "data discoveryscreen");
  const [photoIndex, setPhotoIndex] = useState(0);
  const activeProfile = profiles[0];
  const activeMatch = activeProfile ? profileToCardItem(activeProfile) : null;
  const photoTotal = activeProfile?.photos.length ?? 1;

  const { mutate: swipe } = useSwipe();

  const translateX = useRef(new Animated.Value(0)).current;
  const photoFade = useRef(new Animated.Value(1)).current;
  const isSwipingRef = useRef(false);

  const rotate = translateX.interpolate({
    inputRange: [-SW, 0, SW],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    photoFade.setValue(0);
    Animated.timing(photoFade, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [activeProfile?.id, photoIndex]);

  useEffect(() => {
    setPhotoIndex(0);
  }, [activeProfile?.id]);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    if (profiles.length > PREFETCH_THRESHOLD) return;
    fetchNextPage().catch(() => {});
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, profiles.length]);

  const goToPrevPhoto = () =>
    setPhotoIndex((p) => (p - 1 + photoTotal) % photoTotal);
  const goToNextPhoto = () => setPhotoIndex((p) => (p + 1) % photoTotal);

  const handleLike = useCallback(() => {
    if (!activeProfile) return;
    swipe(
      { toUserId: activeProfile.id, action: 'like' },
      {
        onSuccess: (res) => {
          if (res.matched)
            navigation.navigate('MatchScreen', { match: activeMatch });
        },
      },
    );
  }, [activeProfile, activeMatch, swipe, navigation]);

  const handlePass = useCallback(() => {
    if (!activeProfile) return;
    swipe(
      { toUserId: activeProfile.id, action: 'swipe' },
      { onError: () => {} },
    );
  }, [activeProfile, swipe]);

  const swipeThreshold = SW * 0.25;
  const velocityThreshold = 900;

  const gestureEvent = useMemo(
    () =>
      Animated.event([{ nativeEvent: { translationX: translateX } }], {
        useNativeDriver: true,
      }),
    [translateX],
  );

  const animateSwipe = (toValue: number, onDone: () => void) => {
    isSwipingRef.current = true;
    Animated.timing(translateX, {
      toValue,
      duration: 220,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start(() => {
      isSwipingRef.current = false;
      translateX.setValue(0);
      onDone();
    });
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isPending && profiles.length === 0) {
    return (
      <View style={styles.fullScreen}>
        <SkeletonCard />
        <BottomTabBar />
      </View>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (profiles.length === 0 && !isFetchingNextPage) {
    return (
      <View
        style={[
          styles.fullScreen,
          {
            backgroundColor: '#111',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sh(12),
          },
        ]}
      >
        <Text style={{ fontSize: sf(40) }}>✨</Text>
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: sf(20),
            fontFamily: 'Poppins-SemiBold',
            textAlign: 'center',
          }}
        >
          {isError ? 'Unable to load profiles' : "You've seen everyone!"}
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            paddingHorizontal: sw(24),
            paddingVertical: sh(12),
            borderRadius: sr(99),
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontFamily: 'Poppins-SemiBold',
              fontSize: sf(15),
            }}
          >
            {isError ? 'Try Again' : 'Refresh'}
          </Text>
        </TouchableOpacity>
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <BottomTabBar />
        </View>
      </View>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  const imageUri =
    activeMatch?.images?.[photoIndex] ?? activeMatch?.image ?? '';

  return (
    <View style={styles.fullScreen}>
      {/* ── Full-screen swipeable card ──────────────────────────────── */}
      <PanGestureHandler
        onGestureEvent={gestureEvent}
        activeOffsetX={[-25, 25]}
        failOffsetY={[-15, 15]}
        onEnded={(e: any) => {
          if (isSwipingRef.current) return;
          const { translationX: dx = 0, velocityX: vx = 0 } =
            e?.nativeEvent ?? {};
          const isRight = dx > swipeThreshold || vx > velocityThreshold;
          const isLeft = dx < -swipeThreshold || vx < -velocityThreshold;
          if (!isRight && !isLeft) {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              speed: 20,
              bounciness: 10,
            }).start();
            return;
          }
          if (isRight) animateSwipe(SW, handlePass);
          if (isLeft) animateSwipe(-SW, handleLike);
        }}
      >
        <Animated.View
          style={[
            styles.fullScreen,
            { opacity: photoFade, transform: [{ translateX }, { rotate }] },
          ]}
        >
          {/* Photo */}
          <Image
            source={{ uri: imageUri }}
            style={StyleSheet.absoluteFill}
            resizeMode='cover'
          />

          {/* Photo tap zones */}
          <View
            pointerEvents='box-none'
            style={[
              StyleSheet.absoluteFill,
              { flexDirection: 'row', zIndex: 5 },
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{ flex: 1 }}
              onPress={goToPrevPhoto}
            />
            <TouchableOpacity
              activeOpacity={1}
              style={{ flex: 1 }}
              onPress={goToNextPhoto}
            />
          </View>

          {/* Progress dots — top */}
          {/* {photoTotal > 1 && (
            <View style={styles.dotsWrap}>
              <ProgressDots
                total={photoTotal}
                current={photoIndex}
              />
            </View>
          )} */}

          {/* Bottom gradient + info */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.92)']}
            style={styles.gradient}
            pointerEvents='none'
          />

          {/* Name + bio + interests */}
          <View
            style={styles.infoWrap}
            pointerEvents='none'
          >
            <Text style={styles.nameText}>
              {activeMatch?.name}, {activeMatch?.age}
            </Text>
            {!!activeMatch?.bio && (
              <Text
                style={styles.bioText}
                numberOfLines={2}
              >
                {activeMatch.bio}
              </Text>
            )}
            {(activeMatch?.interests?.length ?? 0) > 0 && (
              <View style={styles.pillsRow}>
                {activeMatch?.interests
                  .slice(0, 4)
                  .map((interest: any, i: number) => (
                    <InterestPill
                      key={i}
                      label={
                        typeof interest === 'string'
                          ? interest
                          : (interest?.name ?? '')
                      }
                    />
                  ))}
              </View>
            )}
          </View>
        </Animated.View>
      </PanGestureHandler>

      {/* ── Action buttons ─────────────────────────────────────────── */}
      <View
        style={styles.actionsRow}
        pointerEvents='box-none'
      >
        {/* Pass */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => animateSwipe(SW, handlePass)}
          style={styles.actionBtnPass}
        >
          <X
            size={sf(28)}
            color='#7D858E'
            strokeWidth={2.5}
          />
        </TouchableOpacity>

        {/* Like */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => animateSwipe(-SW, handleLike)}
          style={styles.actionBtnLike}
        >
          <Heart
            size={sf(32)}
            color='#FF4D6D'
            fill='#FF4D6D'
            strokeWidth={0}
          />
        </TouchableOpacity>
      </View>

      {/* ── Bottom tab bar ──────────────────────────────────────────── */}
      <View style={styles.tabBarWrap}>
        <BottomTabBar />
      </View>
    </View>
  );
};

export default DiscoveryScreen;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // Photo dots
  dotsWrap: {
    position: 'absolute',
    top: sh(52),
    left: sw(16),
    right: sw(16),
    zIndex: 10,
    pointerEvents: 'none',
  },

  // Gradient overlay
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SH * 0.55,
  },

  // Info block at bottom
  infoWrap: {
    position: 'absolute',
    bottom: sh(200), // sits above action buttons
    left: sw(20),
    right: sw(20),
    zIndex: 10,
  },
  nameText: { 
    fontWeight: 600,
    fontSize: sf(24),
    color: '#FFFFFF',
    lineHeight: sf(38),
    marginBottom: sh(6),
  },
  bioText: { 
    fontSize: sf(14),
    color: '#D9D9D9',
    lineHeight: sf(22),
    marginBottom: sh(12),
  },

  // Interest pills
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sw(8),
  },
  pill: { 
    height: 29,
    backgroundColor: 'rgba(234, 214, 169, 0.4)',
    borderRadius: sr(20),
    paddingHorizontal: sw(14),
    paddingVertical: sh(5),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: { 
    fontSize: sf(14),
    color: '#FFFFFF',
    lineHeight: sf(20),
  },

  // Action buttons row
  actionsRow: {
    position: 'absolute',
    bottom: sh(110), // sits above tab bar
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sw(24),
    zIndex: 20,
  },
  actionBtnPass: {
    width: sw(110),
    height: sh(64),
    borderRadius: sr(40),
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: sr(12),
    shadowOffset: { width: 0, height: sh(4) },
    elevation: 6,
  },
  actionBtnLike: {
    width: sw(110),
    height: sh(64),
    borderRadius: sr(40),
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF4D6D',
    shadowOpacity: 0.25,
    shadowRadius: sr(12),
    shadowOffset: { width: 0, height: sh(4) },
    elevation: 6,
  },

  // Tab bar wrapper (black bg strip)
  tabBarWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    zIndex: 15,
  },
});

