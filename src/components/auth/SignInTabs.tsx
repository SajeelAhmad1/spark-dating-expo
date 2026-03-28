import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/common/Text';
import type { AuthSigninTab } from '@/types/auth';
import { sf, sh, sr, sw } from '@/utils/responsive';

export default function SignInTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: AuthSigninTab;
  onTabChange: (t: AuthSigninTab) => void;
}) {
  return (
    <View style={[styles.row, { marginTop: sh(24), columnGap: sw(24) }]}>
      <TouchableOpacity
        onPress={() => onTabChange('phone')}
        style={{ rowGap: sh(4), paddingBottom: sh(4) }}
      >
        <Text
          style={[
            { fontSize: sf(16) },
            activeTab === 'phone' ? styles.tabLabelActive : styles.tabLabelInactive,
          ]}
        >
          Phone number
        </Text>
        {activeTab === 'phone' && (
          <View style={[styles.underline, { height: sh(2), borderRadius: sr(999) }]} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onTabChange('email')}
        style={{ rowGap: sh(4), paddingBottom: sh(4) }}
      >
        <Text
          style={[
            { fontSize: sf(16) },
            activeTab === 'email' ? styles.tabLabelActive : styles.tabLabelInactive,
          ]}
        >
          Email
        </Text>
        {activeTab === 'email' && (
          <View style={[styles.underline, { height: sh(2), borderRadius: sr(999) }]} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  tabLabelActive: { color: '#FBB202' },
  tabLabelInactive: { color: '#7D858E' },
  underline: { backgroundColor: '#FBB202' },
});
