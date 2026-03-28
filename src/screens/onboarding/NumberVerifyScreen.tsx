import React, { useRef } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Text } from '@/components/common/Text';
import { FieldError } from '@/components/common/FieldError';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '@/components/common/PrimaryButton';
import { sf } from '@/utils/responsive';
import { useZodForm } from '@/utils/form';
import { otpFormSchema } from '@/schemas/onboarding';

const DIGIT_KEYS = ['d0', 'd1', 'd2', 'd3'] as const;

const NumberVerifyScreen = ({navigation}: any) => {
  const inputs = useRef<(TextInput | null)[]>([]);

  const { watch, setValue, handleSubmit, trigger, formState } = useZodForm(otpFormSchema, {
    defaultValues: {
      d0: '',
      d1: '',
      d2: '',
      d3: '',
    },
  });

  const digits = DIGIT_KEYS.map(k => watch(k));
  const otpErrors = formState.errors;
  const otpError =
    otpErrors.d0?.message ||
    otpErrors.d1?.message ||
    otpErrors.d2?.message ||
    otpErrors.d3?.message;

  const handleChange = (text: string, index: number) => {
    const nextDigit = text.slice(-1);
    const key = DIGIT_KEYS[index];
    setValue(key, nextDigit, { shouldValidate: true });
    if (nextDigit && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const onValid = () => {
    navigation.navigate('VerificationSuccessScreen');
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
          {DIGIT_KEYS.map((key, index) => (
            <TextInput
              key={key}
              ref={r => {
                inputs.current[index] = r;
              }}
              value={digits[index]}
              onChangeText={text => handleChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              onBlur={() => trigger(key)}
              keyboardType="number-pad"
              maxLength={1}
              style={[
                styles.otpCell,
                otpErrors[key]?.message ? styles.otpCellError : null,
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
        <FieldError message={otpError} />

        <View style={styles.btnWrap}>
          <PrimaryButton
            title="Verify"
            onPress={handleSubmit(onValid)}
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
  otpCellError: { borderColor: '#DC2626' },
  btnWrap: { marginTop: 32 },
  resendWrap: { marginTop: 16, alignItems: 'center' },
  resend: { color: '#1E78F5' },
});

export default NumberVerifyScreen;
