import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import { Conversation } from '@/constants/conversations';
import CameraButton from '@/components/inbox/CameraButton';
import InboxAvatar from '@/components/inbox/InboxAvatar';
import StreakBadge from '@/components/inbox/StreakBadge';
import { sf } from '@/utils/responsive';

export default function ConversationItem({ item }: { item: Conversation }) {
  const isLocked = item.status === 'locked';

  return (
    <View
      style={{
        borderRadius: 16,
        marginBottom: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.09,
        shadowRadius: 1,
        elevation: 1,
        backgroundColor: '#FFFFFF',
      }}
    >
      <TouchableOpacity
        activeOpacity={0.75}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: item.isUnread ? 'rgba(251,178,2,0.07)' : '#FFFFFF',
        }}
      >
        <InboxAvatar isLocked={isLocked} hasNotifDot={item.hasNotifDot} />

        <View style={{ flex: 1, minWidth: 0 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginBottom: 3,
            }}
          >
            <Text
              style={{
                fontSize: sf(16),
                lineHeight: sf(16),
                fontWeight: '600',
                color: '#000000',
              }}
            >
              {item.name}
            </Text>

            {!isLocked && (
              <StreakBadge count={item.streakCount} type={item.streakType} />
            )}
          </View>

          <Text
            numberOfLines={1}
            style={{
              fontSize: sf(13),
              lineHeight: sf(13),
              fontWeight: item.isUnread ? '600' : '400',
              color: item.isUnread ? '#000000' : '#555555',
              marginBottom: 3,
            }}
          >
            {item.lastMessage}
          </Text>

          {item.time ? (
            <Text
              style={{
                fontSize: sf(11),
                lineHeight: sf(11),
                fontWeight: '500',
                color: item.timeWarning ? '#FF3B30' : '#7D858E',
              }}
            >
              ⏱ {item.time}
            </Text>
          ) : null}
        </View>

        {isLocked ? (
          <View
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={22} color="#7D858E" strokeWidth={1.8} />
          </View>
        ) : (
          <CameraButton />
        )}
      </TouchableOpacity>
    </View>
  );
}

