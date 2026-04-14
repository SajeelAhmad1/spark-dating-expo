// screens/discovery/SearchScreen.tsx
import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from '@/components/common/Text'
import { SafeAreaView } from 'react-native-safe-area-context'
import ProfileAvatar from '@/assets/images/profileAvatar.svg'
import OrbitRing from '@/components/common/OrbitRing'
import { sf, sh, sr } from '@/utils/sizeMatters'
import * as Location from 'expo-location'
import { useUpdateLocation } from '@/features/discovery/hooks'

const SearchScreen = ({ navigation }: any) => {
  const orbitContainerSize = sf(300)
  const avatarSize         = sf(94)
  const { mutateAsync: updateLocation } = useUpdateLocation()

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
        if (cancelled) return
        await updateLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      } catch {
        // Non-fatal — DiscoveryScreen will re-fetch coords itself
      } finally {
        if (!cancelled) {
          setTimeout(() => {
            if (!cancelled) navigation.replace('DiscoveryScreen')
          }, 3000)
        }
      }
    }

    run()
    return () => { cancelled = true }
  }, [navigation, updateLocation])

  return (
    <View style={styles.safeArea}>
      <View
        style={[
          styles.orbitWrap,
          { width: orbitContainerSize, height: orbitContainerSize },
        ]}
      >
        <OrbitRing size={orbitContainerSize} duration={7000} color1="#1E78F540" color2="#FBB20240" strokeWidth={1.5} />
        <OrbitRing size={sf(245)} duration={6000} color1="#FBB20240" color2="#1E78F540" color3="#FBB20240" strokeWidth={4} delay={150} reverse />
        <OrbitRing size={sf(190)} duration={5000} color1="#1E78F540" color2="#FBB20240" color3="#1E78F540" strokeWidth={4} delay={300} />
        <OrbitRing size={sf(110)} duration={4500} color1="#1E78F540" color2="#FBB20240" color3="#1E78F540" strokeWidth={4} delay={300} reverse />

        <View style={[styles.avatarRing, { width: avatarSize, height: avatarSize }]}>
          <ProfileAvatar width={avatarSize} height={avatarSize} />
        </View>
      </View>

      <Text
        style={[
          styles.caption,
          { fontFamily: 'Poppins-Regular', fontSize: sf(16) },
        ]}
      >
        Finding people near you
      </Text>
    </View>
  )
}

export default SearchScreen

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
})