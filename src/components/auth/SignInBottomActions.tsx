import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '@/components/common/PrimaryButton';
import { sf, sh } from '@/utils/responsive';

export default function SignInBottomActions({
  onLogin,
}: {
  onLogin: () => void;
}) {
  return (
    <>
      <View className="gap-y-4 items-center" style={{ marginTop: sh(12) }}>
        <PrimaryButton
          title="Login"
          onPress={onLogin}
          colors={['#1E78F5', '#FBB202']}
          variant="gradient"
          style={{ alignSelf: 'stretch' }}
          textStyle={{fontSize: sf(20), fontWeight: '500'}}
        />

        <Text className="text-black font-medium"
        style={{ fontSize: sf(16),}}
        >
          Don't have an account?{' '}
          <Text className="text-[#1E78F5] font-medium">Sign Up</Text>
        </Text>
      </View>

      <View className="flex-1 justify-end items-center">
        <TouchableOpacity onPress={() => {}}>
          <Text style={{  }} className="text-[#7D858E]">
            Need Help?
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

