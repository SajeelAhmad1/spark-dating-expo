import React, { useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '@/components/common/PrimaryButton';
import { sf } from '@/utils/responsive';
import { useZodForm } from '@/utils/form';
import { otpSchema } from '@/validations/onboarding';

const NumberVerifyScreen = ({navigation}: any) => {
  const inputs = useRef<(TextInput | null)[]>([]);

  const { watch, setValue, getValues } = useZodForm(otpSchema, {
    defaultValues: {
      digits: ['', '', '', ''],
    },
  });

  const digits = watch('digits');

  const handleChange = (text: string, index: number) => {
    const nextDigit = text.slice(-1);
    setValue(`digits.${index}` as const, nextDigit);
    if (nextDigit && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-5 pt-4 pb-6 mt-20">

        {/* ── Header ── */}
        <View className="mt-16 gap-y-2">
          <Text className="text-black  font-semibold"
          style={{ fontSize: sf(28),  }}
          >
            Verify Your Number
          </Text>
          <Text className="text-[#7D858E]  font-normal"
          style={{ fontSize: sf(15), }}
          >
            Enter the 4 digit code
          </Text>
        </View>

        {/* ── OTP Inputs ── */}
        <View className="mt-8 flex-row gap-x-4 justify-center">
          {digits.map((digit: string, index: number) => (
            <TextInput
              key={index}
            //   ref={(ref) => (inputs.current[index] = ref)}
              value={digit}
              onChangeText={(text) => handleChange(text.slice(-1), index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              className="text-black font-semibold text-center"
              style={{
                fontSize: sf(20),
                lineHeight: sf(24),
                letterSpacing: 0,
                width: sf(56),
                height: sf(56),
                borderRadius: 15,
                borderWidth: 1,
                borderColor: '#B6B9C9',
              }}
            />
          ))}
        </View>

        {/* ── Verify Button ── */}
        <View className="mt-8">
          <PrimaryButton
            title="Verify"
            onPress={() => {
              const result = otpSchema.safeParse(getValues());
              if (!result.success) {
                // eslint-disable-next-line no-console
                console.warn('OTP validation failed', result.error.flatten());
              }
              navigation.navigate('VerificationSuccessScreen');
            }}
            colors={['#1E78F5', '#FBB202']}
            variant="gradient"
            style={{ alignSelf: 'stretch' }}
            textStyle={{fontWeight: '500', fontSize: sf(20), color: '#ffffff'}}
          />
        </View>

        {/* ── Resend Code ── */}
        <TouchableOpacity className="mt-4 items-center" onPress={() => {}}>
          <Text className="text-[#1E78F5] font-medium"
          style={{ fontSize: sf(16),  }}
          >
            Resend Code
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

export default NumberVerifyScreen;
