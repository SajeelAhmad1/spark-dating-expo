import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CountryPicker } from 'react-native-country-codes-picker';
import PrimaryButton from '@/components/common/PrimaryButton';
import { sf } from '@/utils/responsive';
import { useZodForm } from '@/utils/form';
import {
  onboardingPhoneSchema,
  onboardingPhoneFormSchema,
} from '@/validations/onboarding';

const NumberEnterScreen = ({ navigation }: any) => {
  const [show, setShow] = useState(false);

  // ✅ Store full country object
  const [country, setCountry] = useState({
    flag: '🇳🇱',
    dial_code: '+31',
  });

  const { watch, setValue, getValues } = useZodForm(onboardingPhoneFormSchema, {
    defaultValues: {
      phoneNumber: '',
    },
  });

  const phoneNumber = watch('phoneNumber');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-5 pt-4 mt-20 pb-6">
        {/* ── Header ── */}
        <View className="mt-16 gap-y-2">
          <Text
            className="text-black    font-semibold"
            style={{ fontSize: sf(28) }}
          >
            My mobile number
          </Text>
          <Text
            className="text-[#7D858E]  font-normal   "
            style={{ fontSize: sf(15) }}
          >
            Your streak is waiting 🔥
          </Text>
        </View>

        {/* ── Phone Input ── */}
        <View className="mt-8 flex-row items-center border border-[#E8EAED] rounded-xl px-4 py-3 gap-x-3">
          {/* Country Selector */}
          <TouchableOpacity
            className="flex-row items-center gap-x-1"
            onPress={() => setShow(true)}
          >
            <Text className="" style={{ fontSize: sf(20) }}>
              {country.flag}
            </Text>
            <Text className="text-black" style={{ fontSize: sf(16) }}>
              {country.dial_code}
            </Text>
            <ChevronDown size={16} color="#000000" />
          </TouchableOpacity>

          {/* Divider */}
          <View className="w-[1px] h-5 bg-[#E8EAED]" />

          {/* Number Input */}
          <TextInput
            placeholder="300 1234567"
            placeholderTextColor="black"
            keyboardType="phone-pad"
            value={phoneNumber}
            className="flex-1 text-black  font-medium"
            style={{ fontSize: sf(16) }}
            onChangeText={v => setValue('phoneNumber', v)}
          />
        </View>

        {/* ── Helper Text ── */}
        <Text
          className="text-[#7D858E] font-normal    mt-4"
          style={{ fontSize: sf(15) }}
        >
          We'll text you a code to verify you're really you. Message and data
          rates may apply.{' '}
          <Text className="text-[#7D858E]">
            What happens if your number changes?
          </Text>
        </Text>

        {/* ── Button ── */}
        <View className="mt-6">
          <PrimaryButton
            title="Send verification Code"
            onPress={() => {
              const result = onboardingPhoneSchema.safeParse(
                getValues().phoneNumber,
              );
              if (!result.success) {
                // eslint-disable-next-line no-console
                console.warn(
                  'Phone number validation failed',
                  result.error.flatten(),
                );
              }
              navigation.navigate('NumberVerifyScreen');
            }}
            colors={['#1E78F5', '#FBB202']}
            variant="gradient"
            style={{ alignSelf: 'stretch' }}
            textStyle={{
              color: '#ffffff',
              fontSize: sf(20),
              fontWeight: '500',
            }}
          />
        </View>

        {/* ── Already have account ── */}
        <View className="mt-4 items-center">
          <Text className="text-[#7D858E]  font-normal " style={{ fontSize: sf(16) }}>
            Already have an account?{' '}
            <Text className="text-[#1E78F5] underline font-medium">Login</Text>
          </Text>
        </View>
      </View>

      {/* ── Country Picker ── */}
      <CountryPicker
        lang="en"
        show={show}
        pickerButtonOnPress={item => {
          setCountry(item);
          setShow(false);
        }}
      />
    </SafeAreaView>
  );
};

export default NumberEnterScreen;
