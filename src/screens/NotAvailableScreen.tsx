import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Text } from '@/components/common/Text'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MapPin, Bell } from 'lucide-react-native'
import { sf, sw, sh, sr } from '@/utils/sizeMatters'
import type { ServiceArea } from '@/features/discovery/schema'

interface Props {
  nearestArea?: ServiceArea | null
  onNotifyPress?: () => void
}

const NotAvailableScreen = ({ nearestArea, onNotifyPress }: any) => {
  const areaLabel = nearestArea?.name ?? 'your area'

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Location icon circle ─────────────────────────────────────────── */}
      <View style={styles.iconWrap}>
        <View style={styles.iconCircle}>
          <MapPin size={sf(32)} color="#FFFFFF" strokeWidth={1.8} />
        </View>
      </View>

      {/* ── Heading ──────────────────────────────────────────────────────── */}
      <Text style={styles.heading}>Not Available Yet 📍</Text>
      <Text style={styles.subheading}>Your location is not supported</Text>

      {/* ── Info card ────────────────────────────────────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Spark is currently only available in
        </Text>
        <Text style={styles.areaName}>{areaLabel}</Text>
        <Text style={styles.cardBody}>
          We're working to expand to more cities soon. Stay tuned!
        </Text>
      </View>

      <View style={{ flex: 1 }} />

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onNotifyPress}
        style={styles.button}
      >
        <Bell size={sf(18)} color="#FFFFFF" strokeWidth={2} />
        <Text style={styles.buttonText}>Notify Me When Available</Text>
      </TouchableOpacity>

    </SafeAreaView>
  )
}

export default NotAvailableScreen

const styles = StyleSheet.create({
  safe: {
    flex:              1,
    backgroundColor:   '#FFFFFF',
    alignItems:        'center',
    paddingHorizontal: sw(24),
    paddingBottom:     sh(32),
  },

  // Icon
  iconWrap: {
    marginTop:    sh(80),
    marginBottom: sh(32),
  },
  iconCircle: {
    width:           sw(90),
    height:          sw(90),
    borderRadius:    sr(9999),
    backgroundColor: '#1E78F5',
    alignItems:      'center',
    justifyContent:  'center',
  },

  // Text
  heading: {
    fontFamily:   'Poppins-SemiBold',
    fontSize:     sf(22),
    color:        '#000000',
    textAlign:    'center',
    marginBottom: sh(8),
  },
  subheading: {
    fontFamily:   'Poppins-Regular',
    fontSize:     sf(14),
    color:        '#7D858E',
    textAlign:    'center',
    marginBottom: sh(32),
  },

  // Card
  card: {
    width:             '100%',
    backgroundColor:   '#EEF5FF',
    borderRadius:      sr(14),
    paddingHorizontal: sw(20),
    paddingVertical:   sh(20),
    alignItems:        'center',
    gap:               sh(6),
  },
  cardTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize:   sf(14),
    color:      '#000000',
    textAlign:  'center',
  },
  areaName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize:   sf(15),
    color:      '#1E78F5',
    textAlign:  'center',
  },
  cardBody: {
    fontFamily: 'Poppins-Regular',
    fontSize:   sf(13),
    color:      '#555555',
    textAlign:  'center',
    marginTop:  sh(4),
  },

  // Button
  button: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            sw(10),
    width:          '100%',
    height:         sh(56),
    borderRadius:   sr(999),
    backgroundColor: '#FBB202',
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize:   sf(16),
    color:      '#FFFFFF',
  },
})