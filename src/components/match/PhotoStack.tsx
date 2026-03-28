import { sf } from '@/utils/responsive';
import React from 'react';
import { Image, Text, View } from 'react-native';

export default function PhotoStack({
  screenWidth,
  photoWidth,
  photoHeight,
  containerHeight,
}: {
  screenWidth: number;
  photoWidth: number;
  photoHeight: number;
  containerHeight: number;
}) {
  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: '70%',
          height: containerHeight,
        }}
      >
        <View
          style={{
            position: 'absolute',
            right: screenWidth * 0.0,
            width: photoWidth,
            height: photoHeight,
            borderRadius: 18,
            transform: [{ rotate: '10deg' }],
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 2, height: 4 },
            shadowOpacity: 0.18,
            shadowRadius: 6,
            overflow: 'hidden',
            backgroundColor: '#ddd',
          }}
        >
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80',
            }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>

        <View
          style={{
            position: 'absolute',
            left: screenWidth * 0.0,
            top: 100,
            width: photoWidth,
            height: photoHeight,
            borderRadius: 18,
            transform: [{ rotate: '-10deg' }],
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: -2, height: 4 },
            shadowOpacity: 0.18,
            shadowRadius: 6,
            overflow: 'hidden',
            backgroundColor: '#ddd',
          }}
        >
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80',
            }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>

        <View
          style={{
            position: 'absolute',
            top: -30,
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 20,
            transform: [{ rotate: '10deg' }],
          }}
        >
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 30,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: sf(24) }}>❤️</Text>
          </View>
        </View>

        <View
          style={{
            position: 'absolute',
            bottom: -10,
            left: screenWidth * 0.02,
            zIndex: 20,
          }}
        >
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 30,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ rotate: '-10deg' }],
            }}
          >
            <Text style={{ fontSize: sf(24) }}>❤️</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

