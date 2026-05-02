import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Text } from '@/components/common/Text';
import CustomToggle from '@/components/location/CustomToggle';
import LocationIcon from '@/components/location/LocationIcon';
import { sf, sw, sh, sr } from '@/utils/sizeMatters';
import * as Location from 'expo-location';
import {
  useCheckAvailability,
  useUpdateLocation,
} from '@/features/discovery/hooks';
import NotAvailableScreen from '@/screens/NotAvailableScreen';
import type { ServiceArea } from '@/features/discovery/schema';
import { useLocationStore } from '@/store/locationStore';

// ── Types ─────────────────────────────────────────────────────────────────────

// undefined  = not checked yet  (show the enable toggle)
// null       = unsupported, no area info from API
// ServiceArea = unsupported, API returned nearest area
type UnavailableState = ServiceArea | null | undefined;

// ── Screen ────────────────────────────────────────────────────────────────────

const EnableLocationScreen = ({ navigation }: any) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [unavailableArea, setUnavailableArea] =
    useState<UnavailableState>(undefined);
  const {
    coords,
    fetchLocation,
    isLoading: locationLoading,
  } = useLocationStore();

  const { mutateAsync: checkAvailability } = useCheckAvailability();
  const { mutateAsync: updateLocation } = useUpdateLocation();

  // ── Show not-available screen when area is explicitly set ──────────────────
  if (unavailableArea !== undefined) {
    return (
      <NotAvailableScreen
        nearestArea={unavailableArea}
        onNotifyPress={() => {
          Alert.alert(
            "We'll notify you!",
            "You'll be the first to know when Spark arrives in your area.",
          );
        }}
      />
    );
  }

  // ── Toggle handler ─────────────────────────────────────────────────────────
  const handleToggle = async (val: boolean) => {
    if (!val || locationLoading) return;

    setIsEnabled(true);
    setIsLoading(true);

    try {
      // ✅ Fetch location (stores in global store)
      await fetchLocation();

      // Get from store
      const { coords } = useLocationStore.getState();
      // console.log(coords, "Enablescreen coords")
      if (!coords) {
        Alert.alert('Error', 'Could not get location');
        return;
      }

      // Check availability
      const availability = await checkAvailability(coords);

      if (!availability.isSupported) {
        setUnavailableArea(availability.area ?? null);
        return;
      }

      // Update backend
      await updateLocation(coords);

      navigation.navigate('SearchScreen');
    } catch (err: any) {
      setIsEnabled(false);
      Alert.alert(
        'Something went wrong',
        err?.message ?? 'Could not determine your location. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.safeArea}>
      {/* ── Center illustration ──────────────────────────────────────────── */}
      <View style={styles.centerBlock}>
        <LocationIcon />

        <Text
          style={[
            styles.heading,
            { fontFamily: 'Poppins-SemiBold', fontSize: sf(24) },
          ]}
        >
          Connect with people nearby
        </Text>

        <Text
          style={[
            styles.body,
            {
              fontFamily: 'Poppins-Regular',
              fontSize: sf(16),
              color: '#B6B9C9',
            },
          ]}
        >
          You need to enable your location to use the Spark app
        </Text>
      </View>

      {/* ── Bottom toggle card ───────────────────────────────────────────── */}
      <View style={styles.bottomCard}>
        <View style={styles.bottomTextCol}>
          <Text
            style={{
              fontFamily: 'Poppins-SemiBold',
              fontSize: sf(16),
              color: '#000000',
            }}
          >
            Enable Location
          </Text>
          <Text
            style={[
              styles.bottomSub,
              {
                fontFamily: 'Poppins-Regular',
                fontSize: sf(13),
                color: '#555555',
              },
            ]}
          >
            Your location is only used to find people nearby
          </Text>
        </View>

        {(locationLoading || isLoading) ? (
          <ActivityIndicator color='#1E78F5' />
        ) : (
          <CustomToggle
            value={isEnabled}
            onValueChange={handleToggle}
          />
        )}
      </View>
    </View>
  );
};

export default EnableLocationScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingBottom: sh(20),
  },
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sw(32),
    rowGap: sh(20),
  },
  heading: {
    color: '#000000',
    textAlign: 'center',
    marginTop: sh(8),
  },
  body: {
    textAlign: 'center',
  },
  bottomCard: {
    marginHorizontal: sw(24),
    backgroundColor: '#F9FAFB',
    borderRadius: sr(16),
    paddingHorizontal: sw(20),
    paddingVertical: sh(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomTextCol: { flex: 1 },
  bottomSub: { marginTop: sh(4) },
});
