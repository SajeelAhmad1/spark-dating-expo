import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/components/common/Text';
import PrimaryButton from '@/components/common/PrimaryButton';
import { ChevronLeft, Mail, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { z } from 'zod';
import { useZodForm } from '@/utils/form';
import { sf, sw, sh } from '@/utils/sizeMatters';

// ─── Schema ──────────────────────────────────────────────────────────────────

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ForgotPasswordScreen({ navigation }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const { watch, setValue, handleSubmit, trigger, formState } =
    useZodForm<ForgotPasswordForm>(forgotPasswordSchema, {
      defaultValues: { email: '' },
      mode: 'onBlur',
    });

  const { errors } = formState;
  const email = watch('email');

  const onValid = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      // TODO: call your reset-password API here
      // await authApi.forgotPassword({ email: data.email });
      await new Promise((resolve) => setTimeout(resolve, 1500)); // simulate network
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } catch (err) {
      // Handle API errors (rate limiting, unknown email, etc.)
      // toast.show({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
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
          <View>
            {/* Back */}
            <TouchableOpacity
              style={{ width: sw(36), height: sw(36), justifyContent: 'center' }}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronLeft size={sf(24)} color="#000000" />
            </TouchableOpacity>

            {/* Illustration */}
            <View style={{ alignItems: 'center', marginTop: sh(60), gap: sh(20) }}>
              <View
                style={{
                  width: sf(80),
                  height: sf(80),
                  borderRadius: sf(40),
                  backgroundColor: '#EBF3FE',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Mail size={sf(36)} color="#1E78F5" />
              </View>

              <View style={{ gap: sh(8), alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: sf(24),
                    fontWeight: '700',
                    color: '#111827',
                    textAlign: 'center',
                  }}
                >
                  Check your inbox
                </Text>
                <Text
                  style={{
                    fontSize: sf(15),
                    color: '#6B7280',
                    textAlign: 'center',
                    lineHeight: sf(22),
                  }}
                >
                  We've sent password reset instructions to{'\n'}
                  <Text style={{ color: '#1E78F5', fontWeight: '600' }}>
                    {submittedEmail}
                  </Text>
                </Text>
              </View>

              {/* Info callout */}
              <View
                style={{
                  backgroundColor: '#F0F9FF',
                  borderRadius: sf(12),
                  padding: sw(16),
                  borderLeftWidth: 3,
                  borderLeftColor: '#1E78F5',
                  marginTop: sh(8),
                  width: '100%',
                }}
              >
                <Text style={{ fontSize: sf(13), color: '#374151', lineHeight: sf(20) }}>
                  Didn't receive the email? Check your spam folder or make sure
                  you entered the correct email address.
                </Text>
              </View>
            </View>
          </View>

          <View style={{ gap: sh(12) }}>
            <PrimaryButton
              title="Back to Sign In"
              onPress={() => navigation.navigate('SignInScreen')}
              colors={['#1E78F5', '#1E78F5']}
              variant="solid"
              textStyle={{ fontSize: sf(16), fontWeight: '600', color: '#ffffff' }}
            />
            <TouchableOpacity
              onPress={() => setSubmitted(false)}
              style={{ alignItems: 'center', paddingVertical: sh(10) }}
            >
              <Text style={{ fontSize: sf(14), color: '#6B7280' }}>
                Resend email
              </Text>
            </TouchableOpacity>
          </View>
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

        <View
          style={{
            flex: 1,
            paddingHorizontal: sw(20),
            paddingTop: sh(72),
          }}
        >
          {/* Back */}
          <TouchableOpacity
            style={{ width: sw(36), height: sw(36), justifyContent: 'center' }}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronLeft size={sf(24)} color="#000000" />
          </TouchableOpacity>

          {/* Header */}
          <View style={{ marginTop: sh(32), marginBottom: sh(40), gap: sh(8) }}>
            {/* Icon accent */}
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
              <Mail size={sf(22)} color="#1E78F5" />
            </View>
            <Text style={{ fontSize: sf(28), fontWeight: '700', color: '#111827' }}>
              Forgot Password?
            </Text>
            <Text style={{ fontSize: sf(15), color: '#6B7280', lineHeight: sf(22) }}>
              No worries! Enter your registered email and we'll send you reset instructions.
            </Text>
          </View>

          {/* Email Field */}
          <View style={{ marginBottom: sh(8) }}>
            <Text
              style={{
                fontSize: sf(13),
                fontWeight: '500',
                color: '#374151',
                marginBottom: sh(6),
                letterSpacing: 0.2,
              }}
            >
              Email Address
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F9FAFB',
                borderWidth: 1.5,
                borderColor: errors.email ? '#EF4444' : '#E5E7EB',
                borderRadius: sf(12),
                paddingHorizontal: sw(14),
                height: sh(52),
                gap: sw(10),
              }}
            >
              <Mail size={sf(18)} color="#9CA3AF" />
              <TextInput
                value={email}
                onChangeText={(v) => setValue('email', v, { shouldValidate: true })}
                onBlur={() => trigger('email')}
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                style={{ flex: 1, fontSize: sf(15), color: '#111827', padding: 0 }}
              />
            </View>
            {errors.email ? (
              <Text
                style={{ fontSize: sf(12), color: '#EF4444', marginTop: sh(4), marginLeft: sw(4) }}
              >
                {errors.email.message}
              </Text>
            ) : (
              <Text
                style={{ fontSize: sf(12), color: '#9CA3AF', marginTop: sh(4), marginLeft: sw(4) }}
              >
                We'll send a secure link to this address.
              </Text>
            )}
          </View>

          {/* CTA */}
          <View style={{ marginTop: sh(32), gap: sh(12) }}>
            <PrimaryButton
              title={isLoading ? 'Sending…' : 'Send Reset Link'}
              onPress={handleSubmit(onValid)}
              colors={['#1E78F5', '#1E78F5']}
              variant="solid"
              disabled={isLoading}
              icon={
                isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <ArrowRight size={sf(18)} color="#ffffff" />
                )
              }
              iconPosition="end"
              textStyle={{ fontSize: sf(16), fontWeight: '600', color: '#ffffff' }}
            />

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ alignItems: 'center', paddingVertical: sh(10) }}
            >
              <Text style={{ fontSize: sf(14), color: '#6B7280' }}>
                Back to{' '}
                <Text style={{ color: '#1E78F5', fontWeight: '600' }}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}