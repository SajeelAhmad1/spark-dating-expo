import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Heart, X }  from 'lucide-react-native'
import { sf, sr, sw, sh } from '@/utils/sizeMatters'

export default function DiscoveryActions({
  onLikePress,
  onCrossPress,
  onStarPress,   // kept for API compatibility, unused visually
}: {
  onLikePress:  () => void
  onCrossPress: () => void
  onStarPress?: () => void
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sw(24) }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onCrossPress}
        style={{ width: sw(110), height: sh(64), borderRadius: sr(40), backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: sr(12), shadowOffset: { width: 0, height: sh(4) }, elevation: 6 }}
      >
        <X size={sf(28)} color="#7D858E" strokeWidth={2.5} />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onLikePress}
        style={{ width: sw(110), height: sh(64), borderRadius: sr(40), backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center', shadowColor: '#FF4D6D', shadowOpacity: 0.25, shadowRadius: sr(12), shadowOffset: { width: 0, height: sh(4) }, elevation: 6 }}
      >
        <Heart size={sf(32)} color="#FF4D6D" fill="#FF4D6D" strokeWidth={0} />
      </TouchableOpacity>
    </View>
  )
}