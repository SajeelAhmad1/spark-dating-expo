import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Heart, Star, X } from 'lucide-react-native';
import { sf, sr, sw, sh } from '@/utils/responsive';

export default function DiscoveryActions({ onLikePress }: { onLikePress: () => void }) {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sw(20),
        zIndex: 10,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          width: sf(52),
          height: sf(52),
          borderRadius: sr(28),
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: sr(8),
          shadowOffset: { width: 0, height: sh(3) },
          elevation: 5,
        }}
      >
        <X size={sf(24)} color="#7D858E" strokeWidth={2.5} />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onLikePress}
        style={{
          width: sf(64),
          height: sf(64),
          borderRadius: sr(32),
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#FF4D6D',
          shadowOpacity: 0.4,
          shadowRadius: sr(10),
          shadowOffset: { width: 0, height: sh(4) },
          elevation: 8,
        }}
      >
        <Heart size={sf(32)} color="#FF4D6D" fill="#FF4D6D" strokeWidth={0} />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          width: sf(52),
          height: sf(52),
          borderRadius: sr(28),
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: sr(8),
          shadowOffset: { width: 0, height: sh(3) },
          elevation: 5,
        }}
      >
        <Star size={sf(24)} color="#FBB202" fill="#FBB202" strokeWidth={0} />
      </TouchableOpacity>
    </View>
  );
}

