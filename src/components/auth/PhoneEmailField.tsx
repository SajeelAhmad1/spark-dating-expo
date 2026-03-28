import React from 'react';
import { Text, TextInput, View } from 'react-native';
import type { AuthSigninTab } from '@/types/auth';
import { sf, sh } from '@/utils/responsive';

export default function PhoneEmailField({
  activeTab,
  value,
  onChangeText,
}: {
  activeTab: AuthSigninTab;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View className="gap-y-2">
      <Text className="text-black font-semibold"
      style={{ fontSize: sf(18), lineHeight: sf(18), letterSpacing: 0 }}>
        {activeTab === 'phone' ? 'Phone number' : 'Email'}
      </Text>
      <TextInput
        placeholder={activeTab === 'phone' ? '0000000000' : 'example@email.com'}
        placeholderTextColor="#7D858E"
        keyboardType={activeTab === 'phone' ? 'phone-pad' : 'email-address'}
        style={{ fontSize: sf(12), paddingVertical: sh(8) }}
        className="text-[#7D858E] border-b border-[#B6B9C9]"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

