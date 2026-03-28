import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { sf, sr } from '@/utils/responsive';

export default function RememberMeToggle({
  rememberMe,
  onToggle,
}: {
  rememberMe: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      className="flex-row items-center gap-x-2"
    >
      <View
        style={{
          width: sf(18),
          height: sf(18),
          borderRadius: sr(3),
        }}
        className={`border border-[#1E78F5] items-center justify-center ${
          rememberMe ? 'bg-[#1E78F5]' : 'bg-transparent'
        }`}
      >
        {rememberMe && (
          <Text style={{ fontSize: sf(11), lineHeight: sf(14) }} className="text-white">
            ✓
          </Text>
        )}
      </View>
      <Text style={{ fontSize: sf(14) }} className="text-black font-medium">
        Remember me
      </Text>
    </TouchableOpacity>
  );
}

