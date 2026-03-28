import React from 'react';
import { Text, View } from 'react-native';

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
        gap: 6,
        marginBottom: 12,
        marginTop: mt ?? 0,
      }}
    >
      {icon}
      <Text
        style={{
          fontSize: 16,
          lineHeight: 16,
          fontWeight: '500',
          color: '#000000',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

