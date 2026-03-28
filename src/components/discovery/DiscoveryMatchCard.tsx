import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressDots } from '@/components/ProgressDots';
import ChatIcon from '@/assets/images/chatIcon.svg';
import type { MATCHES } from '@/constants/matches';
import { sf, sr, sw, sh } from '@/utils/responsive';

type MatchItem = (typeof MATCHES)[number];

export default function DiscoveryMatchCard({
  item,
  cardWidth,
  cardHeight,
  btnOverlap,
  total,
  currentIndex,
  showProgressDots = true,
  rightChatOnPress,
}: {
  item: MatchItem;
  cardWidth: number;
  cardHeight: number;
  btnOverlap: number;
  total: number;
  currentIndex: number;
  showProgressDots?: boolean;
  rightChatOnPress?: () => void;
}) {
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
          source={{ uri: item.image }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
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
              backgroundColor: 'rgba(251,178,2,0.2)',
              borderWidth: sf(2),
              borderColor: 'rgba(251,178,2,0.2)',
              borderRadius: sr(14),
              paddingHorizontal: sw(12),
              paddingVertical: sh(10),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flex: 1, marginRight: sw(10) }}>
              <Text
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: sf(18),
                  color: '#fff',
                  lineHeight: sf(22),
                }}
              >
                {item.name}, {item.age}
              </Text>
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontSize: sf(12),
                  color: 'rgba(255,255,255,0.85)',
                  marginTop: sh(2),
                }}
                numberOfLines={1}
              >
                {item.bio}
              </Text>
            </View>

            <TouchableOpacity onPress={rightChatOnPress}>
              <ChatIcon width={sf(36)} height={sf(36)} />
            </TouchableOpacity>
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
          <ProgressDots total={total} current={currentIndex} />
        </View>
      )}
    </View>
  );
}

