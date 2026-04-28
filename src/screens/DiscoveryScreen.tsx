import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react'
import {
  Animated, Dimensions, Easing, View,
  TouchableOpacity, StyleSheet,
} from 'react-native'
import { Text }        from '@/components/common/Text'
import MaskedView      from '@react-native-masked-view/masked-view'
import { LinearGradient } from 'expo-linear-gradient'
import { Settings, Zap } from 'lucide-react-native'
import BottomTabBar    from '@/components/common/BottomTabBar'
import Logo            from '@/assets/images/logo.svg'
import DiscoveryMatchCard from '@/components/discovery/DiscoveryMatchCard'
import DiscoveryActions   from '@/components/discovery/DiscoveryActions'
import { sf, sr, sw, sh } from '@/utils/sizeMatters'
import { showToast }   from '@/utils/toast'
import { PanGestureHandler } from 'react-native-gesture-handler'
import { useDiscoverProfiles, useSwipe } from '@/features/discovery/hooks'
import type { DiscoveryProfile } from '@/features/discovery/schema'
import * as Location   from 'expo-location'
import { useLocationStore } from '@/store/locationStore'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const CARD_H_PADDING = sw(12)
const CARD_WIDTH  = SCREEN_WIDTH - CARD_H_PADDING * 2
const CARD_HEIGHT = Math.min(SCREEN_HEIGHT * 0.6, sh(560))
const BTN_OVERLAP = sf(32)
const DISCOVERY_PAGE_LIMIT = 10
const PREFETCH_THRESHOLD = Math.ceil(DISCOVERY_PAGE_LIMIT / 2)

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    ).start()
  }, [shimmer])

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] })

  return (
    <View style={{ paddingHorizontal: CARD_H_PADDING, paddingBottom: BTN_OVERLAP }}>
      <Animated.View
        style={{
          width:           CARD_WIDTH,
          height:          CARD_HEIGHT,
          borderRadius:    sr(24),
          backgroundColor: 'rgba(255,255,255,0.25)',
          opacity,
          overflow:        'hidden',
        }}
      >
        {/* Simulated progress dots */}
        <View style={{ flexDirection: 'row', gap: sw(5), margin: sw(12) }}>
          {[1,2,3].map((i) => (
            <View key={i} style={{ flex: 1, height: sh(6), borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.4)' }} />
          ))}
        </View>
        {/* Bottom info strip */}
        <View style={{ position: 'absolute', bottom: sh(60), left: sw(12), right: sw(12) }}>
          <View style={{ height: sh(20), width: '50%', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.3)', marginBottom: sh(8) }} />
          <View style={{ height: sh(14), width: '70%', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)' }} />
        </View>
      </Animated.View>

      {/* Skeleton action buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: sw(20), marginTop: sh(-40) }}>
        {[sw(52), sw(64), sw(52)].map((size, i) => (
          <Animated.View
            key={i}
            style={{ width: size, height: size, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.3)', opacity }}
          />
        ))}
      </View>
    </View>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function profileToCardItem(p: DiscoveryProfile) {
  return {
    id:     p.id,
    name:   `${p.firstName} ${p.lastName}`.trim(),
    age:    p.age,
    bio:    p.bio ?? '',
    image:  p.photos[0] ?? 'https://via.placeholder.com/600',
    images: p.photos,
  }
}

// ── Screen ────────────────────────────────────────────────────────────────────

const DiscoveryScreen = ({ navigation }: any) => {
  const { coords } = useLocationStore()
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDiscoverProfiles(
    coords ? { lat: coords.lat, lng: coords.lng, limit: DISCOVERY_PAGE_LIMIT } : null
  )
  const profiles = data?.profiles ?? []
  console.log(profiles.length, "profiles length discoveryscreen")
  console.log(data, "data discoveryscreen")
  console.log(data, "profiles discoveryscreen")

  const [photoIndex, setPhotoIndex] = useState(0)
  const activeProfile = profiles[0]
  const activeMatch   = activeProfile ? profileToCardItem(activeProfile) : null
  const photoTotal    = activeProfile?.photos.length ?? 1

  const { mutate: swipe } = useSwipe()

  const translateX   = useRef(new Animated.Value(0)).current
  const photoFade    = useRef(new Animated.Value(1)).current
  const isSwipingRef = useRef(false)

  const rotate = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  })

  useEffect(() => {
    photoFade.setValue(0)
    Animated.timing(photoFade, { toValue: 1, duration: 180, useNativeDriver: true, easing: Easing.out(Easing.cubic) }).start()
  }, [activeProfile?.id, photoIndex, photoFade])

  useEffect(() => {
    setPhotoIndex(0)
  }, [activeProfile?.id])

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return
    if (profiles.length > PREFETCH_THRESHOLD) return

    fetchNextPage().catch(() => {
      // Keep swiping uninterrupted if a background prefetch fails.
    })
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, profiles.length])

  const goToPrevPhoto = () => setPhotoIndex((p) => (p - 1 + photoTotal) % photoTotal)
  const goToNextPhoto = () => setPhotoIndex((p) => (p + 1) % photoTotal)

  const handleLike = useCallback(() => {
    if (!activeProfile) return
    swipe(
      { toUserId: activeProfile.id, action: 'like' },
      {
        onSuccess: (res) => {
          if (res.matched) navigation.navigate('MatchScreen', { match: activeMatch })
        },
        onError: () => {},
      },
    )
  }, [activeProfile, activeMatch, swipe, navigation])

  const handlePass = useCallback(() => {
    if (!activeProfile) return
    swipe({ toUserId: activeProfile.id, action: 'swipe' }, { onError: () => {} })
  }, [activeProfile, swipe])

  const openChat = useCallback(() => {
    if (!activeMatch) return
    navigation.navigate('ChatScreen', {
      chatUserId:       activeMatch.id,
      chatUserName:     activeMatch.name,
      chatUserImageUri: activeMatch.image,
      initialLocked:    false,
    })
  }, [activeMatch, navigation])

  const swipeThreshold    = CARD_WIDTH * 0.25
  const velocityThreshold = 900

  const gestureEvent = useMemo(
    () => Animated.event([{ nativeEvent: { translationX: translateX } }], { useNativeDriver: true }),
    [translateX],
  )

  const animateSwipe = (toValue: number, onDone: () => void) => {
    isSwipingRef.current = true
    Animated.timing(translateX, { toValue, duration: 220, useNativeDriver: true, easing: Easing.out(Easing.cubic) })
      .start(() => { isSwipingRef.current = false; translateX.setValue(0); onDone() })
  }

  // ── Shared header ─────────────────────────────────────────────────────────
  const Header = (
    <LinearGradient
      colors={['#1E78F5', '#FBB202']}
      start={{ x: 1.5, y: 1.5 }} end={{ x: -2, y: -0.8 }}
      style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', shadowColor: '#000000', shadowOpacity: 0.032, shadowRadius: 7, shadowOffset: { width: 0, height: 2 }, elevation: 3 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: sw(20), paddingTop: sh(40), paddingBottom: sh(16) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: sw(8) }}>
          <Logo width={sf(40)} height={sf(40)} />
          <Text style={{ fontFamily: 'ZenDots-Regular', fontSize: sf(20), color: '#FFFFFF' }}>SPARK</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('SettingsScreen')}
          style={{ width: sf(36), height: sf(36), borderRadius: sr(92), backgroundColor: '#FBB20233', alignItems: 'center', justifyContent: 'center', borderColor: '#FFFFFF', borderWidth: 1 }}
        >
          <Settings size={sf(24)} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  )

  const Title = (
    <View style={{ paddingHorizontal: sw(20), marginTop: sh(16), marginBottom: sh(8) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: sh(4) }}>
        <MaskedView maskElement={<Text style={{ fontSize: sf(22), fontWeight: '600' }}>Connect Through Moments</Text>}>
          <LinearGradient colors={['#FFFFFF', '#FBB202']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={{ fontSize: sf(22), opacity: 0, fontWeight: '600' }}>Connect Through Moments</Text>
          </LinearGradient>
        </MaskedView>
        <Text style={{ fontSize: sf(24) }}>🔥</Text>
      </View>
    </View>
  )

  // ── Loading / skeleton ────────────────────────────────────────────────────
  if (isPending && profiles.length === 0) {
    return (
      <View style={{ flex: 1, paddingBottom: sh(20) }}>
        <LinearGradient colors={['#1E78F5', '#FBB202']} start={{ x: 0, y: -0.1 }} end={{ x: 2, y: 0.7 }} style={StyleSheet.absoluteFill} />
        {Header}
        {Title}
        <SkeletonCard />
        <View style={{ flex: 1 }} />
        <BottomTabBar />
      </View>
    )
  }

  // ── Empty / exhausted ────────────────────────────────────────────────────
  if (profiles.length === 0 && !isFetchingNextPage) {
    const isRetryState = isError
    return (
      <View style={{ flex: 1, paddingBottom: sh(20) }}>
        <LinearGradient colors={['#1E78F5', '#FBB202']} start={{ x: 0, y: -0.1 }} end={{ x: 2, y: 0.7 }} style={StyleSheet.absoluteFill} />
        {Header}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: sh(12) }}>
          <Text style={{ fontSize: sf(40) }}>✨</Text>
          <Text style={{ color: '#FFFFFF', fontSize: sf(20), fontFamily: 'Poppins-SemiBold', textAlign: 'center' }}>
            {isRetryState ? 'Unable to load profiles' : "You've seen everyone!"}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: sf(14), textAlign: 'center', paddingHorizontal: sw(32) }}>
            {isRetryState ? 'Please try again in a moment.' : 'Come back later for new people nearby.'}
          </Text>
          <TouchableOpacity
            onPress={() => { refetch() }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: sw(8), backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: sw(20), paddingVertical: sh(12), borderRadius: sr(99) }}
          >
            <Text style={{ color: '#FFFFFF', fontFamily: 'Poppins-SemiBold', fontSize: sf(15) }}>
              {isRetryState ? 'Try Again' : 'Load Fresh Profiles'}
            </Text>
          </TouchableOpacity>
        </View>
        <BottomTabBar />
      </View>
    )
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, paddingBottom: sh(20) }}>
      <LinearGradient colors={['#1E78F5', '#FBB202']} start={{ x: 0, y: -0.1 }} end={{ x: 2, y: 0.7 }} style={StyleSheet.absoluteFill} />
      {Header}
      {Title}

      <View style={{ paddingHorizontal: CARD_H_PADDING, paddingBottom: BTN_OVERLAP, position: 'relative' }}>
        <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
          <PanGestureHandler
            onGestureEvent={gestureEvent}
            activeOffsetX={[-25, 25]}
            failOffsetY={[-15, 15]}
            onEnded={(e: any) => {
              if (isSwipingRef.current) return
              const { translationX: dx = 0, velocityX: vx = 0 } = e?.nativeEvent ?? {}
              const isRight = dx > swipeThreshold || vx > velocityThreshold
              const isLeft  = dx < -swipeThreshold || vx < -velocityThreshold
              if (!isRight && !isLeft) {
                Animated.spring(translateX, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 10 }).start()
                return
              }
              if (isRight) animateSwipe(SCREEN_WIDTH, handlePass)
              if (isLeft)  animateSwipe(-SCREEN_WIDTH, handleLike)
            }}
          >
            <Animated.View style={{ width: '100%', height: '100%', opacity: photoFade, transform: [{ translateX }, { rotate }] }}>
              <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: sh(110), flexDirection: 'row', zIndex: 20 }}>
                <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={goToPrevPhoto} />
                <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={goToNextPhoto} />
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
          onStarPress={() => showToast({ text1: 'Starred', text2: `${activeMatch?.name} added to starred`, icon: Zap })}
          onCrossPress={() => animateSwipe(SCREEN_WIDTH, handlePass)}
        />
      </View>

      <View style={{ flex: 1 }} />
      <BottomTabBar />
    </View>
  )
}

export default DiscoveryScreen