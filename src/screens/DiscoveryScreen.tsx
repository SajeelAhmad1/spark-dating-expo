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
          {photoTotal > 1 && (
            <View style={styles.dotsWrap}>
              <ProgressDots
                total={photoTotal}
                current={photoIndex}
              />
            </View>
          )}

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
                {activeMatch.interests
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
    bottom: sh(160), // sits above action buttons
    left: sw(20),
    right: sw(20),
    zIndex: 10,
  },
  nameText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: sf(32),
    color: '#FFFFFF',
    lineHeight: sf(38),
    marginBottom: sh(6),
  },
  bioText: {
    fontFamily: 'Poppins-Regular',
    fontSize: sf(15),
    color: 'rgba(255,255,255,0.85)',
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
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: sr(999),
    paddingHorizontal: sw(14),
    paddingVertical: sh(5),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  pillText: {
    fontFamily: 'Poppins-Regular',
    fontSize: sf(13),
    color: '#FFFFFF',
  },

  // Action buttons row
  actionsRow: {
    position: 'absolute',
    bottom: sh(88), // sits above tab bar
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

//this is old code do not use

// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from 'react';
// import {
//   Animated,
//   Dimensions,
//   Easing,
//   View,
//   TouchableOpacity,
//   StyleSheet,
// } from 'react-native';
// import { Text } from '@/components/common/Text';
// import MaskedView from '@react-native-masked-view/masked-view';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Settings, Zap } from 'lucide-react-native';
// import BottomTabBar from '@/components/common/BottomTabBar';
// import Logo from '@/assets/images/logo.svg';
// import DiscoveryMatchCard from '@/components/discovery/DiscoveryMatchCard';
// import DiscoveryActions from '@/components/discovery/DiscoveryActions';
// import { sf, sr, sw, sh } from '@/utils/sizeMatters';
// import { showToast } from '@/utils/toast';
// import { PanGestureHandler } from 'react-native-gesture-handler';
// import { useDiscoverProfiles, useSwipe } from '@/features/discovery/hooks';
// import type { DiscoveryProfile } from '@/features/discovery/schema';
// import * as Location from 'expo-location';
// import { useLocationStore } from '@/store/locationStore';

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// const CARD_H_PADDING = sw(12);
// const CARD_WIDTH = SCREEN_WIDTH - CARD_H_PADDING * 2;
// const CARD_HEIGHT = Math.min(SCREEN_HEIGHT * 0.6, sh(560));
// const BTN_OVERLAP = sf(32);
// const DISCOVERY_PAGE_LIMIT = 10;
// const PREFETCH_THRESHOLD = Math.ceil(DISCOVERY_PAGE_LIMIT / 2);

// // ── Skeleton card ─────────────────────────────────────────────────────────────

// function SkeletonCard() {
//   const shimmer = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(shimmer, {
//           toValue: 1,
//           duration: 900,
//           useNativeDriver: true,
//         }),
//         Animated.timing(shimmer, {
//           toValue: 0,
//           duration: 900,
//           useNativeDriver: true,
//         }),
//       ]),
//     ).start();
//   }, [shimmer]);

//   const opacity = shimmer.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0.4, 0.8],
//   });

//   return (
//     <View
//       style={{ paddingHorizontal: CARD_H_PADDING, paddingBottom: BTN_OVERLAP }}
//     >
//       <Animated.View
//         style={{
//           width: CARD_WIDTH,
//           height: CARD_HEIGHT,
//           borderRadius: sr(24),
//           backgroundColor: 'rgba(255,255,255,0.25)',
//           opacity,
//           overflow: 'hidden',
//         }}
//       >
//         {/* Simulated progress dots */}
//         <View style={{ flexDirection: 'row', gap: sw(5), margin: sw(12) }}>
//           {[1, 2, 3].map((i) => (
//             <View
//               key={i}
//               style={{
//                 flex: 1,
//                 height: sh(6),
//                 borderRadius: 999,
//                 backgroundColor: 'rgba(255,255,255,0.4)',
//               }}
//             />
//           ))}
//         </View>
//         {/* Bottom info strip */}
//         <View
//           style={{
//             position: 'absolute',
//             bottom: sh(60),
//             left: sw(12),
//             right: sw(12),
//           }}
//         >
//           <View
//             style={{
//               height: sh(20),
//               width: '50%',
//               borderRadius: 8,
//               backgroundColor: 'rgba(255,255,255,0.3)',
//               marginBottom: sh(8),
//             }}
//           />
//           <View
//             style={{
//               height: sh(14),
//               width: '70%',
//               borderRadius: 8,
//               backgroundColor: 'rgba(255,255,255,0.2)',
//             }}
//           />
//         </View>
//       </Animated.View>

//       {/* Skeleton action buttons */}
//       <View
//         style={{
//           flexDirection: 'row',
//           justifyContent: 'center',
//           alignItems: 'center',
//           gap: sw(20),
//           marginTop: sh(-40),
//         }}
//       >
//         {[sw(52), sw(64), sw(52)].map((size, i) => (
//           <Animated.View
//             key={i}
//             style={{
//               width: size,
//               height: size,
//               borderRadius: 999,
//               backgroundColor: 'rgba(255,255,255,0.3)',
//               opacity,
//             }}
//           />
//         ))}
//       </View>
//     </View>
//   );
// }

// // ── Helpers ───────────────────────────────────────────────────────────────────

// function profileToCardItem(p: DiscoveryProfile) {
//   return {
//     id: p.id,
//     name: `${p.firstName} ${p.lastName}`.trim(),
//     age: p.age,
//     bio: p.bio ?? '',
//     image: p.photos[0] ?? 'https://via.placeholder.com/600',
//     images: p.photos,
//   };
// }

// // ── Screen ────────────────────────────────────────────────────────────────────

// const DiscoveryScreen = ({ navigation }: any) => {
//   const { coords } = useLocationStore();
//   const {
//     data,
//     isPending,
//     isError,
//     refetch,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//   } = useDiscoverProfiles(
//     coords
//       ? { lat: coords.lat, lng: coords.lng, limit: DISCOVERY_PAGE_LIMIT }
//       : null,
//   );
//   const profiles = data?.profiles ?? [];
//   console.log(profiles.length, 'profiles length discoveryscreen');
//   console.log(data, 'data discoveryscreen');
//   console.log(data, 'profiles discoveryscreen');

//   const [photoIndex, setPhotoIndex] = useState(0);
//   const activeProfile = profiles[0];
//   const activeMatch = activeProfile ? profileToCardItem(activeProfile) : null;
//   const photoTotal = activeProfile?.photos.length ?? 1;

//   const { mutate: swipe } = useSwipe();

//   const translateX = useRef(new Animated.Value(0)).current;
//   const photoFade = useRef(new Animated.Value(1)).current;
//   const isSwipingRef = useRef(false);

//   const rotate = translateX.interpolate({
//     inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
//     outputRange: ['-8deg', '0deg', '8deg'],
//     extrapolate: 'clamp',
//   });

//   useEffect(() => {
//     photoFade.setValue(0);
//     Animated.timing(photoFade, {
//       toValue: 1,
//       duration: 180,
//       useNativeDriver: true,
//       easing: Easing.out(Easing.cubic),
//     }).start();
//   }, [activeProfile?.id, photoIndex, photoFade]);

//   useEffect(() => {
//     setPhotoIndex(0);
//   }, [activeProfile?.id]);

//   useEffect(() => {
//     if (!hasNextPage || isFetchingNextPage) return;
//     if (profiles.length > PREFETCH_THRESHOLD) return;

//     fetchNextPage().catch(() => {
//       // Keep swiping uninterrupted if a background prefetch fails.
//     });
//   }, [fetchNextPage, hasNextPage, isFetchingNextPage, profiles.length]);

//   const goToPrevPhoto = () =>
//     setPhotoIndex((p) => (p - 1 + photoTotal) % photoTotal);
//   const goToNextPhoto = () => setPhotoIndex((p) => (p + 1) % photoTotal);

//   const handleLike = useCallback(() => {
//     if (!activeProfile) return;
//     swipe(
//       { toUserId: activeProfile.id, action: 'like' },
//       {
//         onSuccess: (res) => {
//           if (res.matched)
//             navigation.navigate('MatchScreen', { match: activeMatch });
//         },
//         onError: () => {},
//       },
//     );
//   }, [activeProfile, activeMatch, swipe, navigation]);

//   const handlePass = useCallback(() => {
//     if (!activeProfile) return;
//     swipe(
//       { toUserId: activeProfile.id, action: 'swipe' },
//       { onError: () => {} },
//     );
//   }, [activeProfile, swipe]);

//   const openChat = useCallback(() => {
//     if (!activeMatch) return;
//     navigation.navigate('ChatScreen', {
//       chatUserId: activeMatch.id,
//       chatUserName: activeMatch.name,
//       chatUserImageUri: activeMatch.image,
//       initialLocked: false,
//     });
//   }, [activeMatch, navigation]);

//   const swipeThreshold = CARD_WIDTH * 0.25;
//   const velocityThreshold = 900;

//   const gestureEvent = useMemo(
//     () =>
//       Animated.event([{ nativeEvent: { translationX: translateX } }], {
//         useNativeDriver: true,
//       }),
//     [translateX],
//   );

//   const animateSwipe = (toValue: number, onDone: () => void) => {
//     isSwipingRef.current = true;
//     Animated.timing(translateX, {
//       toValue,
//       duration: 220,
//       useNativeDriver: true,
//       easing: Easing.out(Easing.cubic),
//     }).start(() => {
//       isSwipingRef.current = false;
//       translateX.setValue(0);
//       onDone();
//     });
//   };

//   // ── Shared header ─────────────────────────────────────────────────────────
//   const Header = (
//     <LinearGradient
//       colors={['#CEB98F', '#EAD6A9']}
//       start={{ x: 1.5, y: 1.5 }}
//       end={{ x: -2, y: -0.8 }}
//       style={{
//         borderBottomWidth: 1,
//         borderBottomColor: 'rgba(255,255,255,0.2)',
//         shadowColor: '#000000',
//         shadowOpacity: 0.032,
//         shadowRadius: 7,
//         shadowOffset: { width: 0, height: 2 },
//         elevation: 3,
//       }}
//     >
//       <View
//         style={{
//           flexDirection: 'row',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           paddingHorizontal: sw(20),
//           paddingTop: sh(40),
//           paddingBottom: sh(16),
//         }}
//       >
//         <View
//           style={{ flexDirection: 'row', alignItems: 'center', gap: sw(8) }}
//         >
//           <Logo
//             width={sf(40)}
//             height={sf(40)}
//           />
//           <Text
//             style={{
//               fontFamily: 'ZenDots-Regular',
//               fontSize: sf(20),
//               color: '#FFFFFF',
//             }}
//           >
//             SPARK
//           </Text>
//         </View>
//         <TouchableOpacity
//           onPress={() => navigation.navigate('SettingsScreen')}
//           style={{
//             width: sf(36),
//             height: sf(36),
//             borderRadius: sr(92),
//             backgroundColor: '#EAD6A933',
//             alignItems: 'center',
//             justifyContent: 'center',
//             borderColor: '#FFFFFF',
//             borderWidth: 1,
//           }}
//         >
//           <Settings
//             size={sf(24)}
//             color='#FFFFFF'
//           />
//         </TouchableOpacity>
//       </View>
//     </LinearGradient>
//   );

//   const Title = (
//     <View
//       style={{
//         paddingHorizontal: sw(20),
//         marginTop: sh(16),
//         marginBottom: sh(8),
//       }}
//     >
//       <View
//         style={{
//           flexDirection: 'row',
//           alignItems: 'center',
//           gap: 4,
//           marginBottom: sh(4),
//         }}
//       >
//         <MaskedView
//           maskElement={
//             <Text style={{ fontSize: sf(22), fontWeight: '600' }}>
//               Connect Through Moments
//             </Text>
//           }
//         >
//           <LinearGradient
//             colors={['#FFFFFF', '#EAD6A9']}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 0 }}
//           >
//             <Text style={{ fontSize: sf(22), opacity: 0, fontWeight: '600' }}>
//               Connect Through Moments
//             </Text>
//           </LinearGradient>
//         </MaskedView>
//         <Text style={{ fontSize: sf(24) }}>🔥</Text>
//       </View>
//     </View>
//   );

//   // ── Loading / skeleton ────────────────────────────────────────────────────
//   if (isPending && profiles.length === 0) {
//     return (
//       <View style={{ flex: 1, paddingBottom: sh(20) }}>
//         <LinearGradient
//           colors={['#CEB98F', '#EAD6A9']}
//           start={{ x: 0, y: -0.1 }}
//           end={{ x: 2, y: 0.7 }}
//           style={StyleSheet.absoluteFill}
//         />
//         {Header}
//         {Title}
//         <SkeletonCard />
//         <View style={{ flex: 1 }} />
//         <BottomTabBar />
//       </View>
//     );
//   }

//   // ── Empty / exhausted ────────────────────────────────────────────────────
//   if (profiles.length === 0 && !isFetchingNextPage) {
//     const isRetryState = isError;
//     return (
//       <View style={{ flex: 1, paddingBottom: sh(20) }}>
//         <LinearGradient
//           colors={['#CEB98F', '#EAD6A9']}
//           start={{ x: 0, y: -0.1 }}
//           end={{ x: 2, y: 0.7 }}
//           style={StyleSheet.absoluteFill}
//         />
//         {Header}
//         <View
//           style={{
//             flex: 1,
//             alignItems: 'center',
//             justifyContent: 'center',
//             gap: sh(12),
//           }}
//         >
//           <Text style={{ fontSize: sf(40) }}>✨</Text>
//           <Text
//             style={{
//               color: '#FFFFFF',
//               fontSize: sf(20),
//               fontFamily: 'Poppins-SemiBold',
//               textAlign: 'center',
//             }}
//           >
//             {isRetryState ? 'Unable to load profiles' : "You've seen everyone!"}
//           </Text>
//           <Text
//             style={{
//               color: 'rgba(255,255,255,0.8)',
//               fontSize: sf(14),
//               textAlign: 'center',
//               paddingHorizontal: sw(32),
//             }}
//           >
//             {isRetryState
//               ? 'Please try again in a moment.'
//               : 'Come back later for new people nearby.'}
//           </Text>
//           <TouchableOpacity
//             onPress={() => {
//               refetch();
//             }}
//             style={{
//               flexDirection: 'row',
//               alignItems: 'center',
//               gap: sw(8),
//               backgroundColor: 'rgba(255,255,255,0.2)',
//               paddingHorizontal: sw(20),
//               paddingVertical: sh(12),
//               borderRadius: sr(99),
//             }}
//           >
//             <Text
//               style={{
//                 color: '#FFFFFF',
//                 fontFamily: 'Poppins-SemiBold',
//                 fontSize: sf(15),
//               }}
//             >
//               {isRetryState ? 'Try Again' : 'Load Fresh Profiles'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//         <BottomTabBar />
//       </View>
//     );
//   }

//   // ── Main ──────────────────────────────────────────────────────────────────
//   return (
//     <View
//       style={{ flex: 1, backgroundColor: '#F7F3ED', paddingBottom: sh(20) }}
//     >
//       <LinearGradient
//         colors={['#CEB98F', '#EAD6A9']}
//         start={{ x: 0, y: -0.1 }}
//         end={{ x: 2, y: 0.7 }}
//         style={StyleSheet.absoluteFill}
//       />
//       {Header}
//       {Title}

//       <View
//         style={{
//           paddingHorizontal: CARD_H_PADDING,
//           paddingBottom: BTN_OVERLAP,
//           position: 'relative',
//         }}
//       >
//         <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
//           <PanGestureHandler
//             onGestureEvent={gestureEvent}
//             activeOffsetX={[-25, 25]}
//             failOffsetY={[-15, 15]}
//             onEnded={(e: any) => {
//               if (isSwipingRef.current) return;
//               const { translationX: dx = 0, velocityX: vx = 0 } =
//                 e?.nativeEvent ?? {};
//               const isRight = dx > swipeThreshold || vx > velocityThreshold;
//               const isLeft = dx < -swipeThreshold || vx < -velocityThreshold;
//               if (!isRight && !isLeft) {
//                 Animated.spring(translateX, {
//                   toValue: 0,
//                   useNativeDriver: true,
//                   speed: 20,
//                   bounciness: 10,
//                 }).start();
//                 return;
//               }
//               if (isRight) animateSwipe(SCREEN_WIDTH, handlePass);
//               if (isLeft) animateSwipe(-SCREEN_WIDTH, handleLike);
//             }}
//           >
//             <Animated.View
//               style={{
//                 width: '100%',
//                 height: '100%',
//                 opacity: photoFade,
//                 transform: [{ translateX }, { rotate }],
//               }}
//             >
//               <View
//                 pointerEvents='box-none'
//                 style={{
//                   position: 'absolute',
//                   top: 0,
//                   left: 0,
//                   right: 0,
//                   bottom: sh(110),
//                   flexDirection: 'row',
//                   zIndex: 20,
//                 }}
//               >
//                 <TouchableOpacity
//                   activeOpacity={1}
//                   style={{ flex: 1 }}
//                   onPress={goToPrevPhoto}
//                 />
//                 <TouchableOpacity
//                   activeOpacity={1}
//                   style={{ flex: 1 }}
//                   onPress={goToNextPhoto}
//                 />
//               </View>

//               {activeMatch && (
//                 <DiscoveryMatchCard
//                   item={activeMatch}
//                   cardWidth={CARD_WIDTH}
//                   cardHeight={CARD_HEIGHT}
//                   btnOverlap={BTN_OVERLAP}
//                   photoTotal={photoTotal}
//                   photoIndex={photoIndex}
//                   rightChatOnPress={openChat}
//                 />
//               )}
//             </Animated.View>
//           </PanGestureHandler>
//         </View>

//         <DiscoveryActions
//           onLikePress={() => animateSwipe(-SCREEN_WIDTH, handleLike)}
//           onStarPress={() =>
//             showToast({
//               text1: 'Starred',
//               text2: `${activeMatch?.name} added to starred`,
//               icon: Zap,
//             })
//           }
//           onCrossPress={() => animateSwipe(SCREEN_WIDTH, handlePass)}
//         />
//       </View>

//       <View style={{ flex: 1 }} />
//       <BottomTabBar />
//     </View>
//   );
// };

// export default DiscoveryScreen;
