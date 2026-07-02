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
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Heart,
  X,
  RefreshCw,
  AlertTriangle,
  Clock,
} from 'lucide-react-native';
import { sf, sr, sw, sh } from '@/utils/sizeMatters';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useDiscoverProfiles, useSwipe } from '@/features/discovery/hooks';
import type { DiscoveryProfile } from '@/features/discovery/schema';
import { useLocationStore } from '@/store/locationStore';
import { BlurView } from 'expo-blur';

const { width: SW, height: SH } = Dimensions.get('window');
const DISCOVERY_PAGE_LIMIT = 10;
const PREFETCH_THRESHOLD = Math.ceil(DISCOVERY_PAGE_LIMIT / 2);

// ── Countdown timer hook ──────────────────────────────────────────────────────

function useCountdown(resetsAt: string | null | undefined) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!resetsAt) return;
    const tick = () => {
      const diff = new Date(resetsAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('00:00:00'); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setTimeLeft(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resetsAt]);

  return timeLeft;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    ).start();
  }, [shimmer]);
  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });
  return <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#1A1A1A', opacity }]} />;
}

// ── Interest pill ─────────────────────────────────────────────────────────────

function InterestPill({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

// ── Daily limit dialog ────────────────────────────────────────────────────────

function DailyLimitDialog({ resetsAt }: { resetsAt: string }) {
  const timeLeft = useCountdown(resetsAt);
  return (
    <View style={[styles.fullScreen, { backgroundColor: '#F7F3ED' }]}>
      <View style={styles.overlay}>
        <BlurView intensity={60} tint='dark' style={StyleSheet.absoluteFill} />
        <View style={styles.dialog}>
          <LinearGradient
            colors={['rgba(251,178,2,0.18)', 'rgba(206,185,143,0.12)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.iconWrap}>
            <Clock size={sf(32)} color='#CEB98F' strokeWidth={1.8} />
          </View>
          <Text style={styles.dialogTitle}>Daily limit reached</Text>
          <Text style={styles.dialogBody}>
            You've seen all 20 profiles for today.{'\n'}New profiles arrive in:
          </Text>
          <View style={styles.timerBox}>
            <Text style={styles.timerText}>{timeLeft}</Text>
          </View>
        </View>
      </View>
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
    isFetching,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDiscoverProfiles(
    coords ? { lat: coords.lat, lng: coords.lng, limit: DISCOVERY_PAGE_LIMIT } : null,
  );

  const profiles = data?.profiles ?? [];
  const quota = data?.quota ?? null;

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

  useEffect(() => { setPhotoIndex(0); }, [activeProfile?.id]);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    if (profiles.length > PREFETCH_THRESHOLD) return;
    fetchNextPage().catch(() => {});
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, profiles.length]);

  const goToPrevPhoto = () => setPhotoIndex((p) => (p - 1 + photoTotal) % photoTotal);
  const goToNextPhoto = () => setPhotoIndex((p) => (p + 1) % photoTotal);

  const handleLike = useCallback(() => {
    if (!activeProfile) return;
    swipe(
      { toUserId: activeProfile.id, action: 'like' },
      { onSuccess: (res) => { if (res.matched) navigation.navigate('MatchScreen', { match: activeMatch }); } },
    );
  }, [activeProfile, activeMatch, swipe, navigation]);

  const handlePass = useCallback(() => {
    if (!activeProfile) return;
    swipe({ toUserId: activeProfile.id, action: 'swipe' }, { onError: () => {} });
  }, [activeProfile, swipe]);

  const swipeThreshold = SW * 0.25;
  const velocityThreshold = 900;

  const gestureEvent = useMemo(
    () => Animated.event([{ nativeEvent: { translationX: translateX } }], { useNativeDriver: true }),
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
    return <View style={styles.fullScreen}><SkeletonCard /></View>;
  }

  // ── Daily limit reached ───────────────────────────────────────────────────
  if (quota && quota.remaining === 0 && profiles.length === 0) {
    return <DailyLimitDialog resetsAt={quota.resetsAt} />;
  }

  // ── Empty / error ─────────────────────────────────────────────────────────
  if (profiles.length === 0 && !isFetchingNextPage) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: '#F7F3ED' }]}>
        <View style={styles.overlay}>
          <BlurView intensity={60} tint='dark' style={StyleSheet.absoluteFill} />
          <View style={styles.dialog}>
            <LinearGradient
              colors={['rgba(30,120,245,0.15)', 'rgba(251,178,2,0.10)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.iconWrap}>
              <AlertTriangle size={sf(32)} color='#0B0B0B' strokeWidth={1.8} />
            </View>
            <Text style={styles.dialogTitle}>
              {isError ? 'Unable to load profiles' : "You've seen everyone!"}
            </Text>
            <TouchableOpacity onPress={() => refetch()} disabled={isFetching} style={styles.retryBtn}>
              {isFetching ? (
                <ActivityIndicator size='small' color='#0B0B0B' />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: sw(8) }}>
                  <RefreshCw size={sf(16)} color='#0B0B0B' strokeWidth={2} />
                  <Text style={styles.retryText}>Try Again</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  const imageUri = activeMatch?.images?.[photoIndex] ?? activeMatch?.image ?? '';

  return (
    <View style={styles.fullScreen}>
      <PanGestureHandler
        onGestureEvent={gestureEvent}
        activeOffsetX={[-25, 25]}
        failOffsetY={[-15, 15]}
        onEnded={(e: any) => {
          if (isSwipingRef.current) return;
          const { translationX: dx = 0, velocityX: vx = 0 } = e?.nativeEvent ?? {};
          const isRight = dx > swipeThreshold || vx > velocityThreshold;
          const isLeft = dx < -swipeThreshold || vx < -velocityThreshold;
          if (!isRight && !isLeft) {
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 10 }).start();
            return;
          }
          if (isRight) animateSwipe(SW, handleLike);
          if (isLeft) animateSwipe(-SW, handlePass);
        }}
      >
        <Animated.View style={[styles.fullScreen, { opacity: photoFade, transform: [{ translateX }, { rotate }] }]}>
          <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode='cover' />

          <View pointerEvents='box-none' style={[StyleSheet.absoluteFill, { flexDirection: 'row', zIndex: 5 }]}>
            <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={goToPrevPhoto} />
            <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={goToNextPhoto} />
          </View>

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.92)']}
            style={styles.gradient}
            pointerEvents='none'
          />

          <View style={styles.infoWrap} pointerEvents='none'>
            <Text style={styles.nameText}>{activeMatch?.name}{activeMatch?.age != null ? `, ${activeMatch.age}` : ''}</Text>
            {!!activeMatch?.bio && (
              <Text style={styles.bioText} numberOfLines={2}>{activeMatch.bio}</Text>
            )}
            {(activeMatch?.interests?.length ?? 0) > 0 && (
              <View style={styles.pillsRow}>
                {activeMatch?.interests.slice(0, 4).map((interest: any, i: number) => (
                  <InterestPill key={i} label={typeof interest === 'string' ? interest : (interest?.name ?? '')} />
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </PanGestureHandler>

      {/* Quota badge */}
      {quota && quota.remaining > 0 && (
        <View style={styles.quotaBadge} pointerEvents='none'>
          <Clock size={sf(12)} color='#FFFFFF' strokeWidth={2} />
          <Text style={styles.quotaText}>{quota.remaining} left today</Text>
        </View>
      )}

      <View style={styles.actionsRow} pointerEvents='box-none'>
        <TouchableOpacity activeOpacity={0.9} onPress={() => animateSwipe(SW, handlePass)} style={styles.actionBtnPass}>
          <X size={sf(28)} color='#7D858E' strokeWidth={2.5} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.9} onPress={() => animateSwipe(-SW, handleLike)} style={styles.actionBtnLike}>
          <Heart size={sf(32)} color='#FF4D6D' fill='#FF4D6D' strokeWidth={0} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DiscoveryScreen;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: '#000000' },

  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: SH * 0.55 },

  infoWrap: { position: 'absolute', bottom: sh(110), left: sw(20), right: sw(20), zIndex: 10 },
  nameText: { fontWeight: '600', fontSize: sf(24), color: '#FFFFFF', lineHeight: sf(38), marginBottom: sh(6) },
  bioText: { fontSize: sf(14), color: '#D9D9D9', lineHeight: sf(22), marginBottom: sh(12) },

  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: sw(8) },
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
  pillText: { fontSize: sf(14), color: '#FFFFFF', lineHeight: sf(20) },

  actionsRow: {
    position: 'absolute',
    bottom: sh(20),
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sw(24),
    zIndex: 20,
  },
  actionBtnPass: {
    width: sw(110), height: sh(64), borderRadius: sr(40),
    backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: sr(12), shadowOffset: { width: 0, height: sh(4) }, elevation: 6,
  },
  actionBtnLike: {
    width: sw(110), height: sh(64), borderRadius: sr(40),
    backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF4D6D', shadowOpacity: 0.25, shadowRadius: sr(12), shadowOffset: { width: 0, height: sh(4) }, elevation: 6,
  },

  quotaBadge: {
    position: 'absolute',
    top: sh(52),
    right: sw(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(4),
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: sr(20),
    paddingHorizontal: sw(10),
    paddingVertical: sh(4),
    zIndex: 20,
  },
  quotaText: { fontSize: sf(12), color: '#FFFFFF', fontFamily: 'Poppins-Medium' },

  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: sw(24) },
  dialog: {
    width: '100%', borderRadius: sr(24), overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', paddingHorizontal: sw(24), paddingVertical: sh(32), gap: sh(10),
  },
  iconWrap: {
    width: sf(64), height: sf(64), borderRadius: 9999,
    backgroundColor: 'rgba(251,178,2,0.15)', borderWidth: 1, borderColor: 'rgba(251,178,2,0.4)',
    alignItems: 'center', justifyContent: 'center', marginBottom: sh(4),
  },
  dialogTitle: { fontFamily: 'Poppins-SemiBold', fontSize: sf(18), color: '#0B0B0B', textAlign: 'center' },
  dialogBody: { fontFamily: 'Poppins-Regular', fontSize: sf(14), color: 'rgba(11,11,11,0.7)', textAlign: 'center', lineHeight: sf(22) },

  timerBox: {
    backgroundColor: '#0B0B0B', borderRadius: sr(12),
    paddingHorizontal: sw(24), paddingVertical: sh(12), marginTop: sh(4),
  },
  timerText: { fontFamily: 'Poppins-SemiBold', fontSize: sf(28), color: '#CEB98F', letterSpacing: 2 },

  retryBtn: {
    marginTop: sh(4), height: sh(48), paddingHorizontal: sw(32),
    borderRadius: sr(99), backgroundColor: '#CEB98F', alignItems: 'center', justifyContent: 'center',
  },
  retryText: { fontFamily: 'Poppins-SemiBold', fontSize: sf(15), color: '#0B0B0B' },
});
