import React, { useRef } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Text } from '@/components/common/Text';
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>

        <View style={styles.headerBlock}>
          <Text style={[styles.title, { fontSize: sf(28) }]} weight="semibold">
            Verify Your Number
          </Text>
          <Text style={[styles.subtitle, { fontSize: sf(15) }]} weight="regular">
            Enter the 4 digit code
          </Text>
        </View>

        <View style={styles.otpRow}>
          {digits.map((digit: string, index: number) => (
            <TextInput
              key={index}
              value={digit}
              onChangeText={(text) => handleChange(text.slice(-1), index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              style={[
                styles.otpCell,
                {
                  fontSize: sf(20),
                  lineHeight: sf(24),
                  width: sf(56),
                  height: sf(56),
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.btnWrap}>
          <PrimaryButton
            title="Verify"
            onPress={() => {
              const result = otpSchema.safeParse(getValues());
              if (!result.success) {
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

        <TouchableOpacity style={styles.resendWrap} onPress={() => {}}>
          <Text style={[styles.resend, { fontSize: sf(16) }]} weight="medium">
            Resend Code
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  page: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    marginTop: 80,
  },
  headerBlock: { marginTop: 64, rowGap: 8 },
  title: { color: '#000000' },
  subtitle: { color: '#7D858E' },
  otpRow: {
    marginTop: 32,
    flexDirection: 'row',
    columnGap: 16,
    justifyContent: 'center',
  },
  otpCell: {
    color: '#000000',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#B6B9C9',
  },
  btnWrap: { marginTop: 32 },
  resendWrap: { marginTop: 16, alignItems: 'center' },
  resend: { color: '#1E78F5' },
});

export default NumberVerifyScreen;
