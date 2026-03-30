import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/common/Text';
import { FieldError } from '@/components/common/FieldError';
import type { AuthSigninTab } from '@/types/auth';
import { sf, sh } from '@/utils/responsive';

export default function PhoneEmailField({
  activeTab,
  value,
  onChangeText,
  onBlur,
  errorMessage,
}: {
  activeTab: AuthSigninTab;
  value: string;
  onChangeText: (v: string) => void;
  onBlur?: () => void;
  errorMessage?: string;
}) {
  return (
    <View style={styles.wrap}>
      <Text
        style={[styles.label, { fontSize: sf(18),  }]}
        weight="semibold"
      >
        {activeTab === 'phone' ? 'Phone number' : 'Email'}
      </Text>
      <TextInput
        placeholder={activeTab === 'phone' ? '0000000000' : 'example@email.com'}
        placeholderTextColor="#7D858E"
        keyboardType={activeTab === 'phone' ? 'phone-pad' : 'email-address'}
        autoCapitalize={activeTab === 'email' ? 'none' : undefined}
        autoCorrect={activeTab === 'email' ? false : undefined}
        style={[styles.input, { fontSize: sf(12), paddingVertical: sh(8) }]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
      />
      <FieldError message={errorMessage} />
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
