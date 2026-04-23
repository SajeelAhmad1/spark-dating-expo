import React from 'react'
import { Image, View } from 'react-native'
import { Text } from '@/components/common/Text'
import { sf } from '@/utils/sizeMatters'

export default function PhotoStack({
  screenWidth,
  photoWidth,
  photoHeight,
  containerHeight,
  myPhotoUri,
  matchPhotoUri,
}: {
  screenWidth:     number
  photoWidth:      number
  photoHeight:     number
  containerHeight: number
  myPhotoUri?:     string | null
  matchPhotoUri?:  string | null
}) {
  const fallbackMy    = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80'
  const fallbackMatch = 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80'

  return (
    <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: '70%', height: containerHeight }}>

        {/* Match photo — right, rotated +10° */}
        <View
          style={{
            position:        'absolute',
            right:           0,
            width:           photoWidth,
            height:          photoHeight,
            borderRadius:    18,
            transform:       [{ rotate: '10deg' }],
            elevation:       3,
            shadowColor:     '#000',
            shadowOffset:    { width: 2, height: 4 },
            shadowOpacity:   0.18,
            shadowRadius:    6,
            overflow:        'hidden',
            backgroundColor: '#ddd',
          }}
        >
          <Image
            source={{ uri: matchPhotoUri || fallbackMatch }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>

        {/* My photo — left, rotated −10° */}
        <View
          style={{
            position:        'absolute',
            left:            0,
            top:             100,
            width:           photoWidth,
            height:          photoHeight,
            borderRadius:    18,
            transform:       [{ rotate: '-10deg' }],
            elevation:       8,
            shadowColor:     '#000',
            shadowOffset:    { width: -2, height: 4 },
            shadowOpacity:   0.18,
            shadowRadius:    6,
            overflow:        'hidden',
            backgroundColor: '#ddd',
          }}
        >
          <Image
            source={{ uri: myPhotoUri || fallbackMy }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>

        {/* Heart top */}
        <View style={{ position: 'absolute', top: -30, left: 0, right: 0, alignItems: 'center', zIndex: 20, transform: [{ rotate: '10deg' }] }}>
          <View style={{ width: 50, height: 50, borderRadius: 30, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: sf(24) }}>❤️</Text>
          </View>
        </View>

        {/* Heart bottom */}
        <View style={{ position: 'absolute', bottom: -10, left: screenWidth * 0.02, zIndex: 20 }}>
          <View style={{ width: 50, height: 50, borderRadius: 30, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-10deg' }] }}>
            <Text style={{ fontSize: sf(24) }}>❤️</Text>
          </View>
        </View>
      </View>
    </View>
  )
}