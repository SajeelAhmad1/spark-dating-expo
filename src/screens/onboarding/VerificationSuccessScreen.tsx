import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/components/common/Text';
import {
  Check,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from 'lucide-react-native';
import PrimaryButton from '@/components/common/PrimaryButton';
import { sf, sw, sh, sr } from '@/utils/sizeMatters';
import { useZodForm } from '@/utils/form';
import { z } from 'zod';
import { useSetPassword } from '@/features/auth/hooks';
import * as SecureStore from 'expo-secure-store';
import { showToast } from '@/utils/toast';

// ─── Schema ───────────────────────────────────────────────────────────────────

const setPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SetPasswordForm = z.infer<typeof setPasswordFormSchema>;

// ─── Password rules ───────────────────────────────────────────────────────────

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'One number', test: (v: string) => /[0-9]/.test(v) },
  {
    label: 'One special character',
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
];

function getStrength(password: string) {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (passed <= 1) return { score: passed, label: 'Weak', color: '#EF4444' };
  if (passed <= 3) return { score: passed, label: 'Fair', color: '#F59E0B' };
  if (passed === 4) return { score: passed, label: 'Good', color: '#3B82F6' };
  return { score: passed, label: 'Strong', color: '#10B981' };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PasswordField({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  errorMessage,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur?: () => void;
  placeholder: string;
  errorMessage?: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={{ marginBottom: sh(8) }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View
        style={[styles.inputRow, errorMessage ? styles.inputRowError : null]}
      >
        <Lock
          size={sf(18)}
          color='#9CA3AF'
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor='#9CA3AF'
          secureTextEntry={!show}
          autoCapitalize='none'
          autoCorrect={false}
          style={styles.textInput}
        />
        <TouchableOpacity
          onPress={onToggle}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {show ? (
            <EyeOff
              size={sf(18)}
              color='#9CA3AF'
            />
          ) : (
            <Eye
              size={sf(18)}
              color='#9CA3AF'
            />
          )}
        </TouchableOpacity>
      </View>
      {errorMessage && <Text style={styles.fieldError}>{errorMessage}</Text>}
    </View>
  );
}

function StrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, color } = getStrength(password);

  return (
    <View style={{ marginBottom: sh(16) }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: sw(8),
          marginBottom: sh(8),
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', gap: sw(4) }}>
          {Array.from({ length: PASSWORD_RULES.length }).map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: sh(4),
                borderRadius: sf(4),
                backgroundColor: i < score ? color : '#E5E7EB',
              }}
            />
          ))}
        </View>
        <Text
          style={{
            fontSize: sf(12),
            fontWeight: '600',
            color,
            minWidth: sw(44),
            textAlign: 'right',
          }}
        >
          {label}
        </Text>
      </View>
      <View style={{ gap: sh(4) }}>
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <View
              key={rule.label}
              style={{ flexDirection: 'row', alignItems: 'center', gap: sw(6) }}
            >
              {passed ? (
                <CheckCircle2
                  size={sf(13)}
                  color='#10B981'
                />
              ) : (
                <XCircle
                  size={sf(13)}
                  color='#D1D5DB'
                />
              )}
              <Text
                style={{
                  fontSize: sf(12),
                  color: passed ? '#10B981' : '#9CA3AF',
                }}
              >
                {rule.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const VerificationSuccessScreen = ({ navigation, route }: any) => {
  // ✅ Accept either `phone` or `email` — whichever was forwarded by NumberVerifyScreen
  const { phone, email } = route.params as { phone?: string; email?: string };
  const identifier = phone ?? email ?? '';
  const isEmail = !phone && !!email;

  const { mutate: setPassword, isPending } = useSetPassword();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [signupSessionId, setSignupSessionId] = useState('');

  useEffect(() => {
    SecureStore.getItemAsync('signupSessionId').then((v) =>
      setSignupSessionId(v ?? ''),
    );
  }, []);

  const { watch, setValue, handleSubmit, trigger, formState } = useZodForm(
    setPasswordFormSchema,
    { defaultValues: { password: '', confirmPassword: '' }, mode: 'onBlur' },
  );

  const { errors } = formState;
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const onValid = (data: SetPasswordForm) => {
    if (!signupSessionId) {
      showToast({
        text1: 'Session expired',
        text2: 'Please restart the sign-up flow.',
      });
      return;
    }

    // ✅ Build DTO with the correct identifier field (phone or email)
    const dto = {
      signupSessionId,
      password: data.password,
      ...(isEmail ? { email: identifier } : { phone: identifier }),
    };

    setPassword(dto, {
      onSuccess: async (data) => {
        console.log(data, 'console data set password');
        // await SecureStore.deleteItemAsync('signupSessionId');
        // navigation.navigate('ProfileSetupScreen');
        navigation.navigate('SignInScreen');
      },
      onError: (err: any) => {
        showToast({
          text1: 'Failed to set password',
          text2: err?.message ?? 'Please try again.',
        });
      },
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.page}>
            {/* ── Success badge ── */}
            <View style={styles.badgeWrap}>
              <View
                style={[styles.iconWrap, { width: sf(80), height: sf(80) }]}
              >
                <Check
                  size={sf(36)}
                  color='#FFFFFF'
                  strokeWidth={3}
                />
              </View>
              <Text
                style={[styles.badge, { fontSize: sf(20) }]}
                weight='semibold'
              >
                {isEmail ? 'Email Verified ✓' : 'Number Verified ✓'}
              </Text>
              <Text
                style={[
                  styles.badgeSub,
                  { fontSize: sf(14), textAlign: 'center' },
                ]}
                weight='regular'
              >
                Now create a password for{'\n'}
                <Text style={{ color: '#1E78F5', fontWeight: '600' }}>
                  {identifier}
                </Text>
              </Text>
            </View>

            {/* ── Divider ── */}
            <View style={styles.divider} />

            {/* ── Password fields ── */}
            <View
              style={{ width: '100%', flexDirection: 'column', gap: sh(16) }}
            >
              <PasswordField
                label='Password'
                value={password}
                onChangeText={(v) =>
                  setValue('password', v, { shouldValidate: true })
                }
                onBlur={() => trigger('password')}
                placeholder='Min. 8 characters'
                errorMessage={errors.password?.message}
                show={showPassword}
                onToggle={() => setShowPassword((p) => !p)}
              />

              <StrengthMeter password={password} />

              <PasswordField
                label='Confirm Password'
                value={confirmPassword}
                onChangeText={(v) =>
                  setValue('confirmPassword', v, { shouldValidate: true })
                }
                onBlur={() => trigger('confirmPassword')}
                placeholder='Re-enter your password'
                errorMessage={errors.confirmPassword?.message}
                show={showConfirm}
                onToggle={() => setShowConfirm((p) => !p)}
              />

              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: sw(6),
                    marginBottom: sh(24),
                    marginLeft: sw(4),
                  }}
                >
                  {password === confirmPassword ? (
                    <>
                      <CheckCircle2
                        size={sf(13)}
                        color='#10B981'
                      />
                      <Text
                        style={{
                          fontSize: sf(12),
                          color: '#10B981',
                          fontWeight: '500',
                        }}
                      >
                        Passwords match
                      </Text>
                    </>
                  ) : (
                    <>
                      <XCircle
                        size={sf(13)}
                        color='#EF4444'
                      />
                      <Text style={{ fontSize: sf(12), color: '#EF4444' }}>
                        Passwords don't match
                      </Text>
                    </>
                  )}
                </View>
              )}

              <PrimaryButton
                title={isPending ? 'Creating account…' : 'Create Account'}
                onPress={handleSubmit(onValid)}
                colors={['#1E78F5', '#FBB202']}
                variant='gradient'
                style={{ alignSelf: 'stretch' }}
                disabled={isPending}
                icon={
                  isPending ? (
                    <ActivityIndicator
                      size='small'
                      color='#ffffff'
                    />
                  ) : undefined
                }
                iconPosition='middle'
                textStyle={{
                  fontSize: sf(18),
                  fontWeight: '600',
                  color: '#ffffff',
                }}
              />
            </View>

            {/* ── Terms ── */}
            <TouchableOpacity
              style={styles.termsWrap}
              onPress={() => {}}
            >
              <Text
                style={[styles.terms, { fontSize: sf(14) }]}
                weight='regular'
              >
                By continuing you agree to our{' '}
                <Text
                  style={styles.termsLink}
                  weight='medium'
                >
                  Terms & Conditions
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  page: {
    paddingHorizontal: sw(20),
    paddingTop: sh(80),
    paddingBottom: sh(40),
    alignItems: 'center',
  },
  badgeWrap: { alignItems: 'center', gap: sh(12), marginBottom: sh(32) },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: '#4CD964',
  },
  badge: { color: '#111827' },
  badgeSub: { color: '#6B7280', textAlign: 'center', lineHeight: sh(22) },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: sh(28),
  },
  fieldLabel: {
    fontSize: sf(15),
    fontWeight: '600',
    color: '#000000',
    marginBottom: sh(6),
  },
  inputStyle: {
    borderWidth: 1,
    borderColor: '#B6B9C9',
    borderRadius: sr(15),
    height: sh(56),
    paddingHorizontal: sw(10),
    fontSize: sf(15),
    color: '#000000',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: sr(12),
    paddingHorizontal: sw(14),
    height: sh(56),
    gap: sw(10),
    marginBottom: sh(0),
  },
  inputRowError: { borderColor: '#EF4444' },
  textInput: { flex: 1, fontSize: sf(15), color: '#111827', padding: 0 },
  fieldError: {
    fontSize: sf(12),
    color: '#EF4444',
    marginTop: sh(4),
    marginLeft: sw(4),
    marginBottom: sh(8),
  },
  termsWrap: { marginTop: sh(20) },
  terms: { color: '#9CA3AF', textAlign: 'center' },
  termsLink: { textDecorationLine: 'underline', color: '#6B7280' },
});

export default VerificationSuccessScreen;
