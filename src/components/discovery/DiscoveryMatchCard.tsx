// src/components/discovery/DiscoveryMatchCard.tsx
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/common/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressDots } from '@/components/ProgressDots';
import ChatIcon from '@/assets/images/chatIcon.svg';
import { sf, sr, sw, sh } from '@/utils/sizeMatters';
import { Image } from 'react-native';
import { mapInterestLabels } from '@/utils/mapUserProfile';

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
  item: any;
  cardWidth: number;
  cardHeight: number;
  btnOverlap: number;
  photoTotal: number;
  photoIndex: number;
  showProgressDots?: boolean;
  rightChatOnPress?: () => void;
}) {
  const imageUri = item.images?.[photoIndex] ?? item.image;
  const interestLabels = mapInterestLabels(item.interests);

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
              minHeight: sh(60),
              paddingVertical: sh(8),
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: sw(8),
              }}
            >
              <Text
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: sf(16),
                  color: '#fff',
                  maxWidth: sw(300),
                  flexShrink: 1,
                }}
                numberOfLines={1}
                ellipsizeMode='tail'
              >
                {item.name},
              </Text>
              <Text
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: sf(16),
                  color: '#fff',
                }}
              >
                {item.age}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: sh(4),
              }}
            >
              <View
                style={{
                  flex: 1,
                  minWidth: 0,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: sw(8),
                  marginRight: sw(8),
                }}
              >
                {interestLabels.length > 0 ? (
                  interestLabels.slice(0, 2).map((interest, index) => (
                    <Text
                      key={index}
                      style={{
                        fontFamily: 'Poppins-Regular',
                        fontSize: sf(13),
                        color: 'rgba(255,255,255,0.85)',
                        flexShrink: 1,
                      }}
                      numberOfLines={1}
                      ellipsizeMode='tail'
                    >
                      {interest}
                    </Text>
                  ))
                ) : (
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
                    No Interests
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  rightChatOnPress?.();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ flexShrink: 0 }}
              >
                <View
                  style={{
                    width: sw(24),
                    height: sh(24),
                    alignItems: 'center',
                    justifyContent: 'center',
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
