import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Keyboard,
  Platform,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { FieldError } from '@/components/common/FieldError';
import { ChevronDown } from 'lucide-react-native';
import { CountryPicker } from 'react-native-country-codes-picker';
import PrimaryButton from '@/components/common/PrimaryButton';
import { sf, sh, sw, sr } from '@/utils/sizeMatters';
import { useZodForm } from '@/utils/form';
import { onboardingPhoneFormSchema } from '@/schemas/onboarding';
import { showToast } from '@/utils/toast';
import { useSignupStartWithPhone } from '@/features/auth/hooks';
import { SignupStartResponse } from '@/features/auth/schema';
import * as SecureStore from 'expo-secure-store';

const { height: winH } = Dimensions.get('window');

const NumberEnterScreen = ({ navigation }: any) => {
  const { mutate: signupStart, isPending: isSendingCode } =
    useSignupStartWithPhone();

  const [show, setShow] = useState(false);
  const [pickerKeyboardHeight, setPickerKeyboardHeight] = useState(0);
  const lastKnownKeyboardHeight = useRef(300);

  const [country, setCountry] = useState({
    flag: '🇳🇱',
    dial_code: '+31',
    code: 'NL',
  });

  const { watch, setValue, handleSubmit, trigger, formState } = useZodForm(
    onboardingPhoneFormSchema,
    { defaultValues: { phoneNumber: '', countryCode: 'NL' } },
  );

  const phoneNumber = watch('phoneNumber');
  const phoneError = formState.errors.phoneNumber?.message;

  // ─── Keyboard height tracking for country picker modal ────────────────────

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        lastKnownKeyboardHeight.current = e.endCoordinates.height;
        setPickerKeyboardHeight(e.endCoordinates.height);
      },
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setPickerKeyboardHeight(0),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleOpenPicker = () => {
    // Pre-apply last known keyboard height so layout is correct when modal opens
    setPickerKeyboardHeight(lastKnownKeyboardHeight.current);
    setShow(true);
  };

  const handleClosePicker = () => {
    setShow(false);
    setPickerKeyboardHeight(0);
  };

  const onValid = (data: { phoneNumber: string; countryCode: string }) => {
    const payload = { phone: `${country.dial_code}${data.phoneNumber}` };

    signupStart(payload, {
      onSuccess: async (data: SignupStartResponse) => {
        await SecureStore.setItemAsync(
          'signupSessionId',
          data?.signupSessionId,
        );

        showToast({ text1: 'Verification code sent' });
        navigation.navigate('NumberVerifyScreen', { phone: payload.phone });
      },
      onError: (err: any) => {
        showToast({
          text1: 'Failed to send verification code',
          text2: err.message,
        });
      },
    });
  };

  const modalMaxHeight =
    pickerKeyboardHeight > 0
      ? winH - pickerKeyboardHeight - sh(24)
      : winH * 0.88;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.headerBlock}>
          <Text
            style={[styles.title, { fontSize: sf(28) }]}
            weight='semibold'
          >
            Your Mobile Number
          </Text>
          <Text
            style={[styles.subtitle, { fontSize: sf(15) }]}
            weight='regular'
          >
            Your moment is waiting 🔥
          </Text>
        </View>

        <View
          style={[styles.phoneRow, phoneError ? styles.phoneRowError : null]}
        >
          <TouchableOpacity
            style={styles.countryBtn}
            onPress={handleOpenPicker}
          >
            <Text style={{ fontSize: sf(20) }}>{country.flag}</Text>
            <Text style={[styles.dialCode, { fontSize: sf(16) }]}>
              {country.dial_code}
            </Text>
            <ChevronDown
              size={sf(16)}
              color='#000000'
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TextInput
            placeholder='300 1234567'
            placeholderTextColor='#7D858E'
            keyboardType='phone-pad'
            value={phoneNumber}
            style={[styles.phoneInput, { fontSize: sf(16) }]}
            onChangeText={(v) =>
              setValue('phoneNumber', v, { shouldValidate: true })
            }
            onBlur={() => trigger('phoneNumber')}
          />
        </View>
        <FieldError message={phoneError} />

        <Text
          style={[styles.helper, { fontSize: sf(15) }]}
          weight='regular'
        >
          We’ll send you a code to confirm it’s you. We will never share your
          number
          {/* <Text
            style={styles.helperMuted}
            weight='regular'
          >
            What happens if your number changes?
          </Text> */}
        </Text>

        <View style={styles.btnWrap}>
          <PrimaryButton
            title={isSendingCode ? 'Sending...' : 'Send verification code'}
            onPress={handleSubmit(onValid)}
            colors={['#1E78F5', '#FBB202']}
            variant='gradient'
            style={{ alignSelf: 'stretch' }}
            textStyle={{
              color: '#ffffff',
              fontSize: sf(20),
              fontWeight: '500',
            }}
            disabled={isSendingCode}
          />
        </View>

        <View style={styles.footerRow}>
          <Text
            style={[styles.footerText, { fontSize: sf(16) }]}
            weight='regular'
          >
            Already have an account?{' '}
            <Text
              onPress={() => navigation.navigate('SignInScreen')}
              style={styles.loginLink}
              weight='medium'
            >
              Login
            </Text>
          </Text>
        </View>
      </View>

      <CountryPicker
        lang='en'
        show={show}
        enableModalAvoiding={false}
        androidWindowSoftInputMode='adjustNothing'
        onBackdropPress={handleClosePicker}
        onRequestClose={handleClosePicker}
        inputPlaceholder='Search country'
        inputPlaceholderTextColor='#7D858E'
        searchMessage='No countries match your search'
        pickerButtonOnPress={(item) => {
          setCountry({
            flag: item.flag,
            dial_code: item.dial_code,
            code: item.code,
          });
          setValue('countryCode', item.code, { shouldValidate: true });
          handleClosePicker();
        }}
        style={{
          modal: {
            maxHeight: modalMaxHeight,
            paddingTop: sh(16),
            paddingBottom: pickerKeyboardHeight > 0 ? 0 : sh(16),
          },
          textInput: {
            height: sh(48),
            borderRadius: sr(12),
            paddingHorizontal: sw(14),
            paddingVertical: sh(10),
            fontSize: sf(16),
            color: '#111111',
            backgroundColor: '#EEF2F6',
            borderWidth: 1,
            borderColor: '#C5CCD6',
          },
          line: {
            backgroundColor: '#D0D5DD',
            marginVertical: sh(12),
          },
        }}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF', paddingBottom: sh(20) },
  page: {
    flex: 1,
    paddingHorizontal: sw(20),
    paddingTop: sh(16),
    marginTop: sh(80),
    paddingBottom: sh(24),
  },
  headerBlock: { marginTop: sh(64), rowGap: sh(8) },
  title: { color: '#000000' },
  subtitle: { color: '#7D858E' },
  phoneRow: {
    marginTop: sh(32),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EAED',
    borderRadius: sr(12),
    paddingHorizontal: sw(16),
    paddingVertical: sh(12),
    columnGap: sw(12),
  },
  phoneRowError: { borderColor: '#DC2626' },
  countryBtn: { flexDirection: 'row', alignItems: 'center', columnGap: sw(4) },
  dialCode: { color: '#000000' },
  divider: { width: 1, height: sh(20), backgroundColor: '#E8EAED' },
  phoneInput: { flex: 1, color: '#000000', fontWeight: '500' },
  helper: { color: '#7D858E', marginTop: sh(16) },
  helperMuted: { color: '#7D858E' },
  btnWrap: { marginTop: sh(24) },
  footerRow: { marginTop: sh(16), alignItems: 'center' },
  footerText: { color: '#7D858E' },
  loginLink: { color: '#1E78F5', textDecorationLine: 'underline' },
});

export default NumberEnterScreen;
