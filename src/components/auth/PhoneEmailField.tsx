import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/common/Text';
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
    <View style={styles.wrap}>
      <Text
        style={[styles.label, { fontSize: sf(18), lineHeight: sf(18), letterSpacing: 0 }]}
        weight="semibold"
      >
        {activeTab === 'phone' ? 'Phone number' : 'Email'}
      </Text>
      <TextInput
        placeholder={activeTab === 'phone' ? '0000000000' : 'example@email.com'}
        placeholderTextColor="#7D858E"
        keyboardType={activeTab === 'phone' ? 'phone-pad' : 'email-address'}
        style={[styles.input, { fontSize: sf(12), paddingVertical: sh(8) }]}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { rowGap: 8 },
  label: { color: '#000000' },
  input: {
    width: '100%',
    color: '#7D858E',
    borderBottomWidth: 1,
    borderBottomColor: '#B6B9C9',
  },
});
