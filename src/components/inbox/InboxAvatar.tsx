import React from 'react';
import { Text, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import { sf } from '@/utils/responsive';

export default function InboxAvatar({
  isLocked,
  hasNotifDot,
}: {
  isLocked?: boolean;
  hasNotifDot?: boolean;
}) {
  return (
    <View style={{ width: 50, height: 50, marginRight: 12 }}>
      {isLocked ? (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 25,
            backgroundColor: '#222222',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Lock size={20} color="#FFFFFF" strokeWidth={2} />
        </View>
      ) : (
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: '#C8A882',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Text style={{ fontSize: sf(26) }}>👩</Text>
        </View>
      )}

      {hasNotifDot && (
        <View
          style={{
            position: 'absolute',
            top: -1,
            right: -1,
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: '#FF3B30',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: '#FFFFFF',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: sf(11), fontWeight: '700', lineHeight: sf(11) }}>
            1
          </Text>
        </View>
      )}
    </View>
  );
}

