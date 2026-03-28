import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
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
    <View
      style={{ marginTop: sh(24), gap: sw(24) }}
      className="flex-row"
    >
      <TouchableOpacity
        onPress={() => onTabChange('phone')}
        style={{ gap: sh(4), paddingBottom: sh(4) }}
      >
        <Text
          style={{ fontSize: sf(16) }}
          className={activeTab === 'phone' ? 'text-[#FBB202]' : 'text-[#7D858E]'}
        >
          Phone number
        </Text>
        {activeTab === 'phone' && (
          <View
            style={{ height: sh(2), borderRadius: sr(999) }}
            className="bg-[#FBB202]"
          />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onTabChange('email')}
        style={{ gap: sh(4), paddingBottom: sh(4) }}
      >
        <Text
          style={{ fontSize: sf(16) }}
          className={activeTab === 'email' ? 'text-[#FBB202]' : 'text-[#7D858E]'}
        >
          Email
        </Text>
        {activeTab === 'email' && (
          <View
            style={{ height: sh(2), borderRadius: sr(999) }}
            className="bg-[#FBB202]"
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

