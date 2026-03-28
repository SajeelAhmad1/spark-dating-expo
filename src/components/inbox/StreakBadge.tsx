import React from 'react';
import { Text, View } from 'react-native';
import { sf, sr } from '@/utils/responsive';

export default function StreakBadge({
  count,
  type,
}: {
  count?: number;
  type?: 'orange' | 'gold';
}) {
  if (!type) return null;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: sr(22),
        backgroundColor: 'rgba(251,178,2,0.4)',
        borderWidth: 0.6,
        borderColor: '#DC9B00',
        gap: 2,
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 8,
        paddingRight: 8,
      }}
    >
      <Text style={{ fontSize: sf(8), lineHeight: sf(14) }}>🔥</Text>

      <Text style={{ fontSize: sf(13), color: '#DC9B00', fontWeight: '600' }}>
        {count ? count : '⏳'}
      </Text>
    </View>
  );
}

