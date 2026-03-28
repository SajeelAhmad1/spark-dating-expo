import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/common/Text';
import { sf, sr } from '@/utils/responsive';

export default function RememberMeToggle({
  rememberMe,
  onToggle,
}: {
  rememberMe: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.row}>
      <View
        style={[
          styles.checkbox,
          {
            width: sf(18),
            height: sf(18),
            borderRadius: sr(3),
          },
          rememberMe ? styles.checkboxOn : styles.checkboxOff,
        ]}
      >
        {rememberMe && (
          <Text style={[styles.checkmark, { fontSize: sf(11), lineHeight: sf(14) }]} weight="regular">
            ✓
          </Text>
        )}
      </View>
      <Text style={[styles.label, { fontSize: sf(14) }]} weight="medium">
        Remember me
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', columnGap: 8 },
  checkbox: {
    borderWidth: 1,
    borderColor: '#1E78F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: '#1E78F5' },
  checkboxOff: { backgroundColor: 'transparent' },
  checkmark: { color: '#FFFFFF' },
  label: { color: '#000000' },
});
