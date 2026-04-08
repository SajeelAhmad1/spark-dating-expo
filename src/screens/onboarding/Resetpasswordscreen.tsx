import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/components/common/Text';
import PrimaryButton from '@/components/common/PrimaryButton';
import {
  ChevronLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { z } from 'zod';
import { useZodForm } from '@/utils/form';
import { sf, sw, sh } from '@/utils/sizeMatters';

// ─── Schema ──────────────────────────────────────────────────────────────────

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

// ─── Password rules ───────────────────────────────────────────────────────────

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'One number', test: (v: string) => /[0-9]/.test(v) },
  { label: 'One special character', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
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
    <View style={{ marginBottom: sh(16) }}>
      <Text
        style={{
          fontSize: sf(13),
          fontWeight: '500',
          color: '#374151',
          marginBottom: sh(6),
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#F9FAFB',
          borderWidth: 1.5,
          borderColor: errorMessage ? '#EF4444' : '#E5E7EB',
          borderRadius: sf(12),
          paddingHorizontal: sw(14),
          height: sh(52),
          gap: sw(10),
        }}
      >
        <Lock size={sf(18)} color="#9CA3AF" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          style={{ flex: 1, fontSize: sf(15), color: '#111827', padding: 0 }}
        />
        <TouchableOpacity
          onPress={onToggle}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {show ? (
            <EyeOff size={sf(18)} color="#9CA3AF" />
          ) : (
            <Eye size={sf(18)} color="#9CA3AF" />
          )}
        </TouchableOpacity>
      </View>
      {errorMessage && (
        <Text
          style={{
            fontSize: sf(12),
            color: '#EF4444',
            marginTop: sh(4),
            marginLeft: sw(4),
          }}
        >
          {errorMessage}
        </Text>
      )}
    </View>
  );
}

function StrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, color } = getStrength(password);
  const total = PASSWORD_RULES.length;

  return (
    <View style={{ marginTop: sh(-8), marginBottom: sh(16) }}>
      {/* Bar + label row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: sw(8),
          marginBottom: sh(8),
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', gap: sw(4) }}>
          {Array.from({ length: total }).map((_, i) => (
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

      {/* Rules checklist */}
      <View
        style={{
          backgroundColor: '#F9FAFB',
          borderRadius: sf(10),
          padding: sw(12),
          gap: sh(6),
        }}
      >
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <View
              key={rule.label}
              style={{ flexDirection: 'row', alignItems: 'center', gap: sw(8) }}
            >
              {passed ? (
                <CheckCircle2 size={sf(14)} color="#10B981" />
              ) : (
                <XCircle size={sf(14)} color="#D1D5DB" />
              )}
              <Text
                style={{
                  fontSize: sf(12),
                  color: passed ? '#10B981' : '#9CA3AF',
                  fontWeight: passed ? '500' : '400',
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

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ResetPasswordScreen({
  navigation,
  route,
}: {
  navigation: any;
  /**
   * In real usage, pass the reset token from deep-link params:
   * route.params.token — include this in your API call.
   */
  route?: { params?: { token?: string } };
}) {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { watch, setValue, handleSubmit, trigger, formState } =
    useZodForm<ResetPasswordForm>(resetPasswordSchema, {
      defaultValues: { newPassword: '', confirmPassword: '' },
      mode: 'onBlur',
    });

  const { errors } = formState;
  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  const onValid = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    try {
      // TODO: call your API here
      // await authApi.resetPassword({ token: route?.params?.token, newPassword: data.newPassword });
      await new Promise((resolve) => setTimeout(resolve, 1500)); // simulate network
      setSuccess(true);
    } catch (err) {
      // Handle token expiry, etc.
    } finally {
      setIsLoading(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <LinearGradient
          colors={['#EBF3FE', '#ffffff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: sh(260) }}
        />

        <View
          style={{
            flex: 1,
            paddingHorizontal: sw(20),
            paddingTop: sh(72),
            justifyContent: 'space-between',
            paddingBottom: sh(40),
          }}
        >
          <View style={{ alignItems: 'center', marginTop: sh(80), gap: sh(20) }}>
            {/* Success icon */}
            <View
              style={{
                width: sf(88),
                height: sf(88),
                borderRadius: sf(44),
                backgroundColor: '#ECFDF5',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={sf(42)} color="#10B981" />
            </View>

            <View style={{ gap: sh(8), alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: sf(26),
                  fontWeight: '700',
                  color: '#111827',
                  textAlign: 'center',
                }}
              >
                Password Reset!
              </Text>
              <Text
                style={{
                  fontSize: sf(15),
                  color: '#6B7280',
                  textAlign: 'center',
                  lineHeight: sf(22),
                }}
              >
                Your password has been successfully updated.{'\n'}
                You can now sign in with your new password.
              </Text>
            </View>
          </View>

          <PrimaryButton
            title="Back to Sign In"
            onPress={() => navigation.navigate('SignInScreen')}
            colors={['#1E78F5', '#1E78F5']}
            variant="solid"
            textStyle={{ fontSize: sf(16), fontWeight: '600', color: '#ffffff' }}
          />
        </View>
      </View>
    );
  }

  // ── Default state ──────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <LinearGradient
          colors={['#EBF3FE', '#ffffff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: sh(220) }}
        />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: sh(40) }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingHorizontal: sw(20), paddingTop: sh(72) }}>
            {/* Back */}
            <TouchableOpacity
              style={{ width: sw(36), height: sw(36), justifyContent: 'center' }}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronLeft size={sf(24)} color="#000000" />
            </TouchableOpacity>

            {/* Header */}
            <View style={{ marginTop: sh(32), marginBottom: sh(32), gap: sh(8) }}>
              <View
                style={{
                  width: sf(48),
                  height: sf(48),
                  borderRadius: sf(14),
                  backgroundColor: '#EBF3FE',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: sh(8),
                }}
              >
                <Lock size={sf(22)} color="#1E78F5" />
              </View>
              <Text style={{ fontSize: sf(28), fontWeight: '700', color: '#111827' }}>
                Reset Password
              </Text>
              <Text style={{ fontSize: sf(15), color: '#6B7280', lineHeight: sf(22) }}>
                Create a strong new password for your account. Do not reuse an old password.
              </Text>
            </View>

            {/* New Password */}
            <PasswordField
              label="New Password"
              value={newPassword}
              onChangeText={(v) => setValue('newPassword', v, { shouldValidate: true })}
              onBlur={() => trigger('newPassword')}
              placeholder="Min. 8 characters"
              errorMessage={errors.newPassword?.message}
              show={showNew}
              onToggle={() => setShowNew((p) => !p)}
            />

            {/* Strength meter (shown while typing) */}
            <StrengthMeter password={newPassword} />

            {/* Confirm Password */}
            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={(v) => setValue('confirmPassword', v, { shouldValidate: true })}
              onBlur={() => trigger('confirmPassword')}
              placeholder="Re-enter your new password"
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
                  marginTop: sh(-8),
                  marginBottom: sh(24),
                  marginLeft: sw(4),
                }}
              >
                {newPassword === confirmPassword ? (
                  <>
                    <CheckCircle2 size={sf(14)} color="#10B981" />
                    <Text style={{ fontSize: sf(12), color: '#10B981', fontWeight: '500' }}>
                      Passwords match
                    </Text>
                  </>
                ) : (
                  <>
                    <XCircle size={sf(14)} color="#EF4444" />
                    <Text style={{ fontSize: sf(12), color: '#EF4444' }}>
                      Passwords don't match
                    </Text>
                  </>
                )}
              </View>
            )}

            {/* CTA */}
            <PrimaryButton
              title={isLoading ? 'Updating…' : 'Update Password'}
              onPress={handleSubmit(onValid)}
              colors={['#1E78F5', '#1E78F5']}
              variant="solid"
              disabled={isLoading}
              icon={isLoading ? <ActivityIndicator size="small" color="#ffffff" /> : undefined}
              iconPosition="end"
              textStyle={{ fontSize: sf(16), fontWeight: '600', color: '#ffffff' }}
            />

            {/* Security note */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: sw(8),
                marginTop: sh(20),
                backgroundColor: '#FFFBEB',
                borderRadius: sf(10),
                padding: sw(12),
                borderLeftWidth: 3,
                borderLeftColor: '#F59E0B',
              }}
            >
              <ShieldCheck size={sf(16)} color="#F59E0B" style={{ marginTop: sh(1) }} />
              <Text style={{ flex: 1, fontSize: sf(12), color: '#78350F', lineHeight: sf(18) }}>
                After resetting, all other active sessions will be signed out automatically.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}