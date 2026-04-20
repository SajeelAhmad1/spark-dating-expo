import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/common/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressDots } from '@/components/ProgressDots';
import ChatIcon from '@/assets/images/chatIcon.svg';
import type { MATCHES } from '@/constants/matches';
import { sf, sr, sw, sh } from '@/utils/sizeMatters';
import { Image } from 'react-native';

type MatchItem = (typeof MATCHES)[number];

export default function DiscoveryMatchCard({
  item,
  cardWidth,
  cardHeight,
  btnOverlap,
  photoTotal,
  photoIndex,
  showProgressDots = true,
  rightChatOnPress,
}: {
  item: MatchItem;
  cardWidth: number;
  cardHeight: number;
  btnOverlap: number;
  photoTotal: number;
  photoIndex: number;
  showProgressDots?: boolean;
  rightChatOnPress?: () => void;
}) {
  const imageUri = item.images?.[photoIndex] ?? item.image;

  return (
    <View
      style={{
        width: cardWidth,
        height: cardHeight,
        marginRight: sw(12),
      }}
    >
      <View
        style={{
          flex: 1,
          borderRadius: sr(24),
          overflow: 'hidden',
        }}
      >
        <Image
          source={{ uri: imageUri }}
          style={{ width: '100%', height: '100%' }}
          resizeMode='cover'
        />

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.88)']}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingTop: sh(110),
            paddingBottom: btnOverlap + sh(18),
            paddingHorizontal: sw(12),
          }}
        >
          <View
            style={{
              backgroundColor: 'rgba(251,178,2,0.1)',
              borderWidth: 1,
              borderColor: 'rgba(251,178,2,0.5)',
              borderRadius: sr(12),
              paddingHorizontal: sw(12),
              height: 60,
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: sf(16),
                color: '#fff',
                flexShrink: 1,
              }}
              numberOfLines={1}
              ellipsizeMode='tail'
            >
              {item.name}, {item.age}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 30,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontSize: sf(13),
                  color: 'rgba(255,255,255,0.85)',
                  flex: 1,
                  flexShrink: 1,
                }}
                numberOfLines={1}
                ellipsizeMode='tail'
              >
                {item.bio || 'No bio yet'}
              </Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  rightChatOnPress?.();
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: sh(-8),
                    zIndex: 50,
                  }}
                >
                  <ChatIcon />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>

      {showProgressDots && (
        <View
          style={{
            position: 'absolute',
            top: sh(10),
            left: sw(12),
            right: sw(12),
            zIndex: 10,
          }}
        >
          <ProgressDots
            total={photoTotal}
            current={photoIndex}
          />
        </View>
      )}
    </View>
  );
}
