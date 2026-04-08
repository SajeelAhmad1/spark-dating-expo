import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Text } from '@/components/common/Text';
import { FieldError } from '@/components/common/FieldError';
import PrimaryButton from '@/components/common/PrimaryButton';
import { sf, sw, sh, sr } from '@/utils/sizeMatters';
import { useZodForm } from '@/utils/form';
import { otpFormSchema } from '@/schemas/onboarding';
import { showToast } from '@/utils/toast';
import {
  useSignupStartWithPhone,
  useVerifyOtpPhone,
} from '@/features/auth/hooks';
import * as SecureStore from 'expo-secure-store';

// ─── Constants ────────────────────────────────────────────────────────────────

const DIGIT_KEYS = ['d0', 'd1', 'd2', 'd3'] as const;
const RESEND_COOLDOWN_SEC = 30;

// ─── Screen ───────────────────────────────────────────────────────────────────

const NumberVerifyScreen = ({ navigation, route }: any) => {
  // ✅ Accept either `phone` (from NumberEnterScreen) or `email` (from EmailInputScreen)
  const { phone, email } = route.params as { phone?: string; email?: string };
  const { mutate: signupStart, isPending: isResending } =
    useSignupStartWithPhone();

  // Whichever identifier was passed, use it throughout this screen
  const identifier = phone ?? email ?? '';
  const isEmail = !phone && !!email;

  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtpPhone();
  const inputs = useRef<(TextInput | null)[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [signupSessionId, setSignupSessionId] = useState<string>('');

  useEffect(() => {
    SecureStore.getItemAsync('signupSessionId').then((value: string | null) =>
      setSignupSessionId(value || ''),
    );
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      clearTimer();
      setSecondsLeft(0);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    return () => clearTimer();
  }, []);

  // ─── Form ──────────────────────────────────────────────────────────────────

  const { watch, setValue, handleSubmit, trigger, formState } = useZodForm(
    otpFormSchema,
    { defaultValues: { d0: '', d1: '', d2: '', d3: '' } },
  );

  const digits = DIGIT_KEYS.map((k) => watch(k));
  const { errors: otpErrors } = formState;
  const otpError =
    otpErrors.d0?.message ||
    otpErrors.d1?.message ||
    otpErrors.d2?.message ||
    otpErrors.d3?.message;

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleChange = (text: string, index: number) => {
    const nextDigit = text.slice(-1);
    setValue(DIGIT_KEYS[index], nextDigit, { shouldValidate: true });
    if (nextDigit && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (secondsLeft > 0 || isResending) return;

    const payload = isEmail ? { email: identifier } : { phone: identifier };

    signupStart(payload as any, {
      onSuccess: async (data: any) => {
        // 🔥 Update sessionId again (important)
        if (data?.signupSessionId) {
          await SecureStore.setItemAsync(
            'signupSessionId',
            data.signupSessionId,
          );
          setSignupSessionId(data.signupSessionId);
        }

        showToast({ text1: 'A new code has been sent' });

        // ⏱ Start timer
        clearTimer();
        setSecondsLeft(RESEND_COOLDOWN_SEC);

        intervalRef.current = setInterval(() => {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              clearTimer();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      },

      onError: (err: any) => {
        showToast({
          text1: 'Failed to resend code',
          text2: err?.message,
        });
      },
    });
  };

  const onValid = (data: {
    d0: string;
    d1: string;
    d2: string;
    d3: string;
  }) => {
    const code = `${data.d0}${data.d1}${data.d2}${data.d3}`;

    // ✅ Build the DTO with whichever identifier we have
    const dto = isEmail
      ? { email: identifier, code, signupSessionId }
      : { phone: identifier, code, signupSessionId };

       console.log( identifier, code, signupSessionId)
    verifyOtp(dto as any, {
      onSuccess: () => {
        showToast({ text1: 'Verified successfully' });
        // ✅ Forward the correct identifier to VerificationSuccessScreen
        navigation.navigate('VerificationSuccessScreen', {
          ...(isEmail ? { email: identifier } : { phone: identifier }),
        });
      },
      onError: (err: any) => {
        showToast({ text1: 'Verification failed', text2: err.message });
      },
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.headerBlock}>
          <Text
            style={[styles.title, { fontSize: sf(28) }]}
            weight='semibold'
          >
            Verify Your {isEmail ? 'Email' : 'Number'}
          </Text>
          <Text
            style={[styles.subtitle, { fontSize: sf(15), textAlign: 'center' }]}
            weight='regular'
          >
            Enter the 4-digit code sent to{'\n'}
            <Text style={{ color: '#1E78F5', fontWeight: '600' }}>
              {identifier}
            </Text>
          </Text>
        </View>

        <View style={styles.otpRow}>
          {DIGIT_KEYS.map((key, index) => (
            <TextInput
              key={key}
              ref={(r) => {
                inputs.current[index] = r;
              }}
              value={digits[index]}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onBlur={() => trigger(key)}
              keyboardType='number-pad'
              maxLength={1}
              style={[
                styles.otpCell,
                otpErrors[key]?.message ? styles.otpCellError : null,
                { fontSize: sf(20), width: sf(56), height: sf(56) },
              ]}
            />
          ))}
        </View>

        <FieldError message={otpError} />

        <View style={styles.btnWrap}>
          <PrimaryButton
            title={isVerifying ? 'Verifying...' : 'Verify'}
            onPress={handleSubmit(onValid)}
            colors={['#1E78F5', '#FBB202']}
            variant='gradient'
            style={{ alignSelf: 'stretch' }}
            textStyle={{
              fontWeight: '500',
              fontSize: sf(20),
              color: '#ffffff',
            }}
            disabled={isVerifying}
          />
        </View>

        <TouchableOpacity
          style={styles.resendWrap}
          onPress={handleResend}
          disabled={secondsLeft > 0 || isResending}
          activeOpacity={secondsLeft > 0 ? 1 : 0.7}
        >
          <Text
            style={[
              styles.resend,
              { fontSize: sf(16) },
              secondsLeft > 0 && styles.resendDisabled,
            ]}
            weight='medium'
          >
            {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : 'Resend Code'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  page: {
    flex: 1,
    paddingHorizontal: sw(20),
    paddingTop: sh(16),
    paddingBottom: sh(24),
    marginTop: sh(80),
  },
  headerBlock: { marginTop: sh(64), rowGap: sh(8), alignItems: 'center' },
  title: { color: '#000000' },
  subtitle: { color: '#7D858E' },
  otpRow: {
    marginTop: sh(32),
    flexDirection: 'row',
    columnGap: sw(16),
    justifyContent: 'center',
  },
  otpCell: {
    color: '#000000',
    fontWeight: '600',
    textAlign: 'center',
    borderRadius: sr(15),
    borderWidth: 1,
    borderColor: '#B6B9C9',
  },
  otpCellError: { borderColor: '#DC2626' },
  btnWrap: { marginTop: sh(32) },
  resendWrap: { marginTop: sh(16), alignItems: 'center' },
  resend: { color: '#1E78F5' },
  resendDisabled: { color: '#7D858E' },
});

export default NumberVerifyScreen;
