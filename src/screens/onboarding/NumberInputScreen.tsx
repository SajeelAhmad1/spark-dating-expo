import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Text } from '@/components/common/Text';
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.headerBlock}>
          <Text style={[styles.title, { fontSize: sf(28) }]} weight="semibold">
            My mobile number
          </Text>
          <Text style={[styles.subtitle, { fontSize: sf(15) }]} weight="regular">
            Your streak is waiting 🔥
          </Text>
        </View>

        <View style={styles.phoneRow}>
          <TouchableOpacity style={styles.countryBtn} onPress={() => setShow(true)}>
            <Text style={{ fontSize: sf(20) }}>{country.flag}</Text>
            <Text style={[styles.dialCode, { fontSize: sf(16) }]}>{country.dial_code}</Text>
            <ChevronDown size={16} color="#000000" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TextInput
            placeholder="300 1234567"
            placeholderTextColor="black"
            keyboardType="phone-pad"
            value={phoneNumber}
            style={[styles.phoneInput, { fontSize: sf(16) }]}
            onChangeText={v => setValue('phoneNumber', v)}
          />
        </View>

        <Text style={[styles.helper, { fontSize: sf(15) }]} weight="regular">
          We'll text you a code to verify you're really you. Message and data
          rates may apply.{' '}
          <Text style={styles.helperMuted} weight="regular">
            What happens if your number changes?
          </Text>
        </Text>

        <View style={styles.btnWrap}>
          <PrimaryButton
            title="Send verification Code"
            onPress={() => {
              const result = onboardingPhoneSchema.safeParse(
                getValues().phoneNumber,
              );
              if (!result.success) {
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

        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { fontSize: sf(16) }]} weight="regular">
            Already have an account?{' '}
            <Text style={styles.loginLink} weight="medium">
              Login
            </Text>
          </Text>
        </View>
      </View>

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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  page: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    marginTop: 80,
    paddingBottom: 24,
  },
  headerBlock: { marginTop: 64, rowGap: 8 },
  title: { color: '#000000' },
  subtitle: { color: '#7D858E' },
  phoneRow: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EAED',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    columnGap: 12,
  },
  countryBtn: { flexDirection: 'row', alignItems: 'center', columnGap: 4 },
  dialCode: { color: '#000000' },
  divider: { width: 1, height: 20, backgroundColor: '#E8EAED' },
  phoneInput: {
    flex: 1,
    color: '#000000',
    fontWeight: '500',
  },
  helper: { color: '#7D858E', marginTop: 16 },
  helperMuted: { color: '#7D858E' },
  btnWrap: { marginTop: 24 },
  footerRow: { marginTop: 16, alignItems: 'center' },
  footerText: { color: '#7D858E' },
  loginLink: { color: '#1E78F5', textDecorationLine: 'underline' },
});

export default NumberEnterScreen;
