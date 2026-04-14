import React, { useState } from 'react'
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { Text } from '@/components/common/Text'
import CustomToggle from '@/components/location/CustomToggle'
import LocationIcon from '@/components/location/LocationIcon'
import { sf, sw, sh, sr } from '@/utils/sizeMatters'
import * as Location from 'expo-location'
import { useCheckAvailability, useUpdateLocation } from '@/features/discovery/hooks'
import NotAvailableScreen from '@/screens/NotAvailableScreen'
import type { ServiceArea } from '@/features/discovery/schema'

// ── Types ─────────────────────────────────────────────────────────────────────

// undefined  = not checked yet  (show the enable toggle)
// null       = unsupported, no area info from API
// ServiceArea = unsupported, API returned nearest area
type UnavailableState = ServiceArea | null | undefined

// ── Screen ────────────────────────────────────────────────────────────────────

const EnableLocationScreen = ({ navigation }: any) => {
  const [isEnabled,       setIsEnabled]       = useState(false)
  const [isLoading,       setIsLoading]       = useState(false)
  const [unavailableArea, setUnavailableArea] = useState<UnavailableState>(undefined)

  const { mutateAsync: checkAvailability } = useCheckAvailability()
  const { mutateAsync: updateLocation }    = useUpdateLocation()

  // ── Show not-available screen when area is explicitly set ──────────────────
  if (unavailableArea !== undefined) {
    return (
      <NotAvailableScreen
        nearestArea={unavailableArea}
        onNotifyPress={() => {
          Alert.alert(
            "We'll notify you!",
            "You'll be the first to know when Spark arrives in your area.",
          )
        }}
      />
    )
  }

  // ── Toggle handler ─────────────────────────────────────────────────────────
  const handleToggle = async (val: boolean) => {
    if (!val || isLoading) return

    setIsEnabled(true)
    setIsLoading(true)

    try {
      // 1 ── Request OS permission
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow location access in your device settings to continue.',
        )
        setIsEnabled(false)
        setIsLoading(false)
        return
      }

      // 2 ── Get device coordinates
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      // console.log(position, "position")  
      const { latitude: lat, longitude: lng } = position.coords
      
      // 3 ── Check if coordinates are in a supported area
      const availability = await checkAvailability({ lat, lng })
      // console.log(availability, "availability")
  
      if (!availability.isSupported) {
        setUnavailableArea(availability.area ?? null)
        setIsEnabled(false)
        setIsLoading(false)
        return
      }

      // 4 ── Persist location to backend
      await updateLocation({ lat, lng })

      // 5 ── Proceed
      navigation.navigate('SearchScreen')

    } catch (err: any) {
      Alert.alert(
        'Something went wrong',
        err?.message ?? 'Could not determine your location. Please try again.',
      )
      setIsEnabled(false)
    } finally {
      setIsLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.safeArea}>

      {/* ── Center illustration ──────────────────────────────────────────── */}
      <View style={styles.centerBlock}>
        <LocationIcon />

        <Text style={[styles.heading, { fontFamily: 'Poppins-SemiBold', fontSize: sf(24) }]}>
          Enable Location
        </Text>

        <Text style={[styles.body, { fontFamily: 'Poppins-Regular', fontSize: sf(16), color: '#B6B9C9' }]}>
          You need to enable location to be able to use the Spark app
        </Text>
      </View>

      {/* ── Bottom toggle card ───────────────────────────────────────────── */}
      <View style={styles.bottomCard}>
        <View style={styles.bottomTextCol}>
          <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: sf(16), color: '#000000' }}>
            Enable Location
          </Text>
          <Text style={[styles.bottomSub, { fontFamily: 'Poppins-Regular', fontSize: sf(13), color: '#555555' }]}>
            Find people near you and get better matches
          </Text>
        </View>

        {isLoading
          ? <ActivityIndicator color="#1E78F5" />
          : <CustomToggle value={isEnabled} onValueChange={handleToggle} />
        }
      </View>

    </View>
  )
}

export default EnableLocationScreen

const styles = StyleSheet.create({
  safeArea: {
    flex:            1,
    backgroundColor: '#FFFFFF',
    justifyContent:  'space-between',
    paddingBottom:   sh(20),
  },
  centerBlock: {
    flex:              1,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: sw(32),
    rowGap:            sh(20),
  },
  heading: {
    color:     '#000000',
    textAlign: 'center',
    marginTop: sh(8),
  },
  body: {
    textAlign: 'center',
  },
  bottomCard: {
    marginHorizontal:  sw(24),
    backgroundColor:   '#F9FAFB',
    borderRadius:      sr(16),
    paddingHorizontal: sw(20),
    paddingVertical:   sh(16),
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
  },
  bottomTextCol: { flex: 1 },
  bottomSub:     { marginTop: sh(4) },
})