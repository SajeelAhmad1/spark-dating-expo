import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/common/Text';
import { sf, sw, sh } from '@/utils/sizeMatters';

export default function SectionHeader({
  icon,
  label,
  mt,
}: {
  icon: React.ReactNode;
  label: string;
  mt?: number;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: sw(6),
        marginBottom: sh(12),
        marginTop: mt !== undefined ? sh(mt) : 0,
      }}
    >
      {icon}
      <Text
        style={{
          fontSize: sf(16), 
          fontWeight: '500',
          color: '#000000',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
