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
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Text } from '@/components/common/Text';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Zap, RefreshCw } from 'lucide-react-native';
import BottomTabBar from '@/components/common/BottomTabBar';
import Logo from '@/assets/images/logo.svg';
import DiscoveryMatchCard from '@/components/discovery/DiscoveryMatchCard';
import DiscoveryActions from '@/components/discovery/DiscoveryActions';
import { sf, sr, sw, sh } from '@/utils/sizeMatters';
import { showToast } from '@/utils/toast';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useDiscoverProfiles, useSwipe } from '@/features/discovery/hooks';
import type { DiscoveryProfile } from '@/features/discovery/schema';
import * as Location from 'expo-location';
import OrbitRing from '@/components/common/OrbitRing';
import ProfileAvatar from '@/assets/images/profileAvatar.svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_H_PADDING = sw(12);
const CARD_WIDTH = SCREEN_WIDTH - CARD_H_PADDING * 2;
const CARD_HEIGHT = Math.min(SCREEN_HEIGHT * 0.6, sh(560));
const BTN_OVERLAP = sf(32);

// ── Helpers ───────────────────────────────────────────────────────────────────

function profileToCardItem(p: DiscoveryProfile) {
  return {
    id: p.id,
    name: `${p.firstName} ${p.lastName}`.trim(),
    age: p.age,
    bio: p.bio ?? '',
    image: p.photos[0] ?? 'https://via.placeholder.com/600',
    images: p.photos,
  };
}

// ── Screen ────────────────────────────────────────────────────────────────────

const DiscoveryScreen = ({ navigation }: any) => {
  // ── Location + profiles ────────────────────────────────────────────────────
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const orbitContainerSize = sf(300);
  const avatarSize = sf(94);
  useEffect(() => {
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      .then((pos) =>
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      )
      .catch(() => setCoords(null));
  }, []);

  const discoverPayload = coords
    ? { lat: coords.lat, lng: coords.lng, limit: 20 }
    : null;
  console.log(discoverPayload, 'discoverPayload');
  const { data, isPending, isError, refetch, isFetching } =
    useDiscoverProfiles(discoverPayload);

  console.log(data, 'data discovery screen');
  console.log(isError, 'isError discovery screen');
  console.log(isPending, 'isPending discovery screen');
  console.log(isFetching, 'isFetching discovery screen');

  const profiles = data?.profiles ?? [];
  const appliedFilter = data?.appliedFilter ?? null;

  // ── Card state ─────────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Reset card index when new profiles arrive
  useEffect(() => {
    setCurrentIndex(0);
    setPhotoIndex(0);
  }, [profiles.length]);

  const activeProfile = profiles[Math.min(currentIndex, profiles.length - 1)];
  const activeMatch = activeProfile ? profileToCardItem(activeProfile) : null;
  const photoTotal = activeProfile?.photos.length ?? 1;

  // ── Swipe mutation ─────────────────────────────────────────────────────────
  const { mutate: swipe } = useSwipe();

  // ── Animations ────────────────────────────────────────────────────────────
  const translateX = useRef(new Animated.Value(0)).current;
  const photoFade = useRef(new Animated.Value(1)).current;
  const isSwipingRef = useRef(false);

  const rotate = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    photoFade.setValue(0);
    Animated.timing(photoFade, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [currentIndex, photoIndex]);

  // ── Card navigation ────────────────────────────────────────────────────────
  const goToNextUser = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, profiles.length - 1));
    setPhotoIndex(0);
  }, [profiles.length]);

  const goToPrevPhoto = () =>
    setPhotoIndex((p) => (p - 1 + photoTotal) % photoTotal);
  const goToNextPhoto = () => setPhotoIndex((p) => (p + 1) % photoTotal);

  // ── Swipe actions ──────────────────────────────────────────────────────────
  const handleLike = useCallback(() => {
    if (!activeProfile) return;

    swipe(
      { toUserId: activeProfile.id, action: 'like' },
      {
        onSuccess: (res) => {
          console.log(res, 'res swip discovery screen');
          if (res.matched) {
            navigation.navigate('MatchScreen', { match: activeMatch });
          } else {
            goToNextUser();
          }
        },
        onError: () => {
          showToast({
            text1: 'Something went wrong',
            text2: 'Could not record your like',
          });
          goToNextUser();
        },
      },
    );
  }, [activeProfile, activeMatch, swipe, goToNextUser, navigation]);

  const handlePass = useCallback(() => {
    if (!activeProfile) return;

    swipe(
      { toUserId: activeProfile.id, action: 'swipe' },
      {
        onSuccess: goToNextUser,
        onError: goToNextUser, // still advance on error
      },
    );
  }, [activeProfile, swipe, goToNextUser]);

  const openChat = useCallback(() => {
    if (!activeMatch) return;
    navigation.navigate('ChatScreen', {
      chatUserId: activeMatch.id,
      chatUserName: activeMatch.name,
      chatUserImageUri: activeMatch.image,
      initialLocked: false,
    });
  }, [activeMatch, navigation]);

  // ── Gesture ────────────────────────────────────────────────────────────────
  const swipeThreshold = CARD_WIDTH * 0.25;
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

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, paddingBottom: sh(20) }}>
      <LinearGradient
        colors={['#1E78F5', '#FBB202']}
        start={{ x: 0, y: -0.1 }}
        end={{ x: 2, y: 0.7 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <LinearGradient
        colors={['#1E78F5', '#FBB202']}
        start={{ x: 1.5, y: 1.5 }}
        end={{ x: -2, y: -0.8 }}
        style={{
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.2)',
          shadowColor: '#000000',
          shadowOpacity: 0.032,
          shadowRadius: 7,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: sw(20),
            paddingTop: sh(40),
            paddingBottom: sh(16),
          }}
        >
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: sw(8) }}
          >
            <Logo
              width={sf(40)}
              height={sf(40)}
            />
            <Text
              style={{
                fontFamily: 'ZenDots-Regular',
                fontSize: sf(20),
                color: '#FFFFFF',
              }}
            >
              SPARK
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('SettingsScreen')}
            style={{
              width: sf(36),
              height: sf(36),
              borderRadius: sr(92),
              backgroundColor: '#FBB20233',
              alignItems: 'center',
              justifyContent: 'center',
              borderColor: '#FFFFFF',
              borderWidth: 1,
            }}
          >
            <Settings
              size={sf(24)}
              color='#FFFFFF'
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ── Title + filter info ──────────────────────────────────────────────── */}
      <View
        style={{
          paddingHorizontal: sw(20),
          marginTop: sh(16),
          marginBottom: sh(8),
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginBottom: sh(4),
          }}
        >
          <MaskedView
            maskElement={
              <Text style={{ fontSize: sf(22), fontWeight: '600' }}>
                Connect Through Moments
              </Text>
            }
          >
            <LinearGradient
              colors={['#FFFFFF', '#FBB202']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={{ fontSize: sf(22), opacity: 0, fontWeight: '600' }}>
                Connect Through Moments
              </Text>
            </LinearGradient>
          </MaskedView>
          <Text style={{ fontSize: sf(24) }}>🔥</Text>
        </View>

        {/* Applied filter pill */}
        {/* {appliedFilter && (
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: sw(6) }}
          >
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.18)',
                borderRadius: sr(99),
                paddingHorizontal: sw(10),
                paddingVertical: sh(3),
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontFamily: 'Poppins-Regular',
                  fontSize: sf(11),
                }}
              >
                {appliedFilter.minAge}–{appliedFilter.maxAge} yrs ·{' '}
                {appliedFilter.maxDistanceKm} km · {profiles.length} nearby
              </Text>
            </View>
            {isFetching && (
              <ActivityIndicator
                size='small'
                color='#FFFFFF'
              />
            )}
          </View>
        )} */}
      </View>

      {/* ── Card + actions ───────────────────────────────────────────────────── */}
      <View
        style={{
          paddingHorizontal: CARD_H_PADDING,
          paddingBottom: BTN_OVERLAP,
          position: 'relative',
        }}
      >
        <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
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
              if (isRight) animateSwipe(SCREEN_WIDTH, handlePass);
              if (isLeft) animateSwipe(-SCREEN_WIDTH, handleLike);
            }}
          >
            <Animated.View
              style={{
                width: '100%',
                height: '100%',
                opacity: photoFade,
                transform: [{ translateX }, { rotate }],
              }}
            >
              <View
                pointerEvents='box-none'
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: sh(110),
                  flexDirection: 'row',
                  zIndex: 20,
                }}
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

              {activeMatch && (
                <DiscoveryMatchCard
                  item={activeMatch}
                  cardWidth={CARD_WIDTH}
                  cardHeight={CARD_HEIGHT}
                  btnOverlap={BTN_OVERLAP}
                  photoTotal={photoTotal}
                  photoIndex={photoIndex}
                  rightChatOnPress={openChat}
                />
              )}
            </Animated.View>
          </PanGestureHandler>
        </View>

        <DiscoveryActions
          onLikePress={() => animateSwipe(-SCREEN_WIDTH, handleLike)}
          onStarPress={() =>
            showToast({
              text1: 'Starred',
              text2: `${activeMatch?.name} added to starred`,
              icon: Zap,
            })
          }
          onCrossPress={() => animateSwipe(SCREEN_WIDTH, handlePass)}
        />
      </View>

      <View style={{ flex: 1 }} />
      <BottomTabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
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

export default DiscoveryScreen;
