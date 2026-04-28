// screens/discovery/SearchScreen.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/components/common/Text';
import ProfileAvatar from '@/assets/images/profileAvatar.svg';
import OrbitRing from '@/components/common/OrbitRing';
import { sf, sh, sr, sw } from '@/utils/sizeMatters';
import { useLocationStore } from '@/store/locationStore';
import { useDiscoverProfiles } from '@/features/discovery/hooks';
import { BlurView } from 'expo-blur';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SearchScreen = ({ navigation }: any) => {
  const orbitContainerSize = sf(300);
  const avatarSize = sf(94);
  const { coords, isLoading } = useLocationStore();

  const { data, isPending, isError, refetch, isFetching } = useDiscoverProfiles(
    coords ? { lat: coords.lat, lng: coords.lng, limit: 10 } : null,
  );
  console.log(data?.profiles?.length, "profiles length discoveryscreen")
console.log(data, "data Searchscreen")
console.log(isError, "isError Searchscreen")
  useEffect(() => {
    if (!coords && !isLoading) {
      navigation.replace('EnableLocationScreen');
      return;
    }
    if (coords && !isPending && data !== undefined) {
      navigation.replace('DiscoveryScreen');
    }
  }, [coords, isLoading, isPending, data, navigation]);

  return (
    <View style={styles.safeArea}>
      {/* ── Orbit animation ── */}
      <View style={[styles.orbitWrap, { width: orbitContainerSize, height: orbitContainerSize }]}>
        <OrbitRing size={orbitContainerSize} duration={7000} color1='#1E78F540' color2='#FBB20240' strokeWidth={1.5} />
        <OrbitRing size={sf(245)} duration={6000} color1='#FBB20240' color2='#1E78F540' color3='#FBB20240' strokeWidth={4} delay={150} reverse />
        <OrbitRing size={sf(190)} duration={5000} color1='#1E78F540' color2='#FBB20240' color3='#1E78F540' strokeWidth={4} delay={300} />
        <OrbitRing size={sf(110)} duration={4500} color1='#1E78F540' color2='#FBB20240' color3='#1E78F540' strokeWidth={4} delay={300} reverse />
        <View style={[styles.avatarRing, { width: avatarSize, height: avatarSize }]}>
          <ProfileAvatar width={avatarSize} height={avatarSize} />
        </View>
      </View>

      <Text style={[styles.caption, { fontFamily: 'Poppins-Regular', fontSize: sf(16) }]}>
        Finding people near you
      </Text>

      {/* ── Error dialog overlay ── */}
      {isError && (
        <View style={styles.overlay}>
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.dialog}>
            <LinearGradient
              colors={['rgba(30,120,245,0.15)', 'rgba(251,178,2,0.10)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.iconWrap}>
              <AlertTriangle size={sf(32)} color='#FBB202' strokeWidth={1.8} />
            </View>
            <Text style={styles.dialogTitle}>Something went wrong</Text>
            <Text style={styles.dialogBody}>
              We couldn't find people near you.{`\n`}Please check your connection and try again.
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              disabled={isFetching}
              style={styles.retryBtn}
            >
              {isFetching
                ? <ActivityIndicator size='small' color='#FFFFFF' />
                : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: sw(8) }}>
                    <RefreshCw size={sf(16)} color='#FFFFFF' strokeWidth={2} />
                    <Text style={styles.retryText}>Try Again</Text>
                  </View>
                )
              }
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: sw(24),
  },
  dialog: {
    width: '100%',
    borderRadius: sr(24),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    paddingHorizontal: sw(24),
    paddingVertical: sh(32),
    gap: sh(10),
  },
  iconWrap: {
    width: sf(64),
    height: sf(64),
    borderRadius: 9999,
    backgroundColor: 'rgba(251,178,2,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251,178,2,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sh(4),
  },
  dialogTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: sf(18),
    color: '#FFFFFF',
    textAlign: 'center',
  },
  dialogBody: {
    fontFamily: 'Poppins-Regular',
    fontSize: sf(14),
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: sf(22),
    marginBottom: sh(8),
  },
  retryBtn: {
    marginTop: sh(4),
    height: sh(48),
    paddingHorizontal: sw(32),
    borderRadius: sr(99),
    backgroundColor: '#1E78F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: sf(15),
    color: '#FFFFFF',
  },
});
