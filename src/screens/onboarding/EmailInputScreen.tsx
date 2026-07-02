import React from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Text } from '@/components/common/Text';
import PrimaryButton from '@/components/common/PrimaryButton';
import { ChevronLeft, Mail } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useZodForm } from '@/utils/form';
import { sf, sw, sh, sr } from '@/utils/sizeMatters';
import * as SecureStore from 'expo-secure-store';
import {
  signupStartEmailSchema,
  SignupStartResponse,
} from '@/features/auth/schema';
import { useSignupStartWithPhone } from '@/features/auth/hooks';
import { showToast } from '@/utils/toast';

export default function EmailInputScreen({ navigation }: any) {
  const { mutate: signupStart, isPending: isSendingCode } =
    useSignupStartWithPhone();

  const { watch, setValue, handleSubmit, trigger, formState } = useZodForm(
    signupStartEmailSchema,
    { defaultValues: { email: '' }, mode: 'onBlur' },
  );

  const { errors } = formState;
  const email = watch('email');

  const onValid = (dto: { email: string }) => {
    signupStart(
      { email: dto.email },
      {
        onSuccess: async (data: SignupStartResponse) => {
          console.log(data, 'signup email data');
          await SecureStore.setItemAsync(
            'signupSessionId',
            data.signupSessionId,
          );
          showToast({ text1: 'Verification code sent' });
          // ✅ Pass `email` (not `phone`) so NumberVerifyScreen knows the channel
          navigation.navigate('NumberVerifyScreen', { email: dto.email });
        },
        onError: (err: any) => {
          showToast({
            text1: 'Failed to send verification code',
            text2: err.message,
          });
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
    >
      <View style={{ flex: 1, backgroundColor: '#F7F3ED' }}>
       

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: sh(40) }}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingHorizontal: sw(20), paddingTop: sh(72) }}>
            {/* Back */}
            <TouchableOpacity
              style={{
                width: sw(36),
                height: sw(36),
                justifyContent: 'center',
              }}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronLeft
                size={sf(24)}
                color='#000000'
              />
            </TouchableOpacity>

            {/* Header */}
            <View
              style={{ marginTop: sh(32), marginBottom: sh(32), gap: sh(6) }}
            >
              <Text
                style={{
                  fontSize: sf(28),
                  fontWeight: '700',
                  color: '#111827',
                }}
              >
                Create Account
              </Text>
              <Text
                style={{
                  fontSize: sf(15),
                  color: '#6B7280',
                  lineHeight: sf(22),
                }}
              >
                Enter your email and set a strong password to get started.
              </Text>
            </View>

            {/* Email field */}
            <View style={{ marginBottom: sh(16) }}>
              <Text  style={[styles.label, { fontSize: sf(18),  }]}
                      weight="semibold">Email Address</Text>
              <View style={styles.fieldRow} > 
                <TextInput
                  value={email}
                  onChangeText={(v) =>
                    setValue('email', v, { shouldValidate: true })
                  }
                  onBlur={() => trigger('email')}
                  placeholder='you@example.com'
                  placeholderTextColor='#9CA3AF'
                  keyboardType='email-address'
                  autoCapitalize='none'
                  autoCorrect={false}
                 style={[styles.input, { fontSize: sf(14), paddingVertical: sh(8) }]}
                />
              </View>
              {errors.email && (
                <Text
                  style={{
                    fontSize: sf(12),
                    color: '#EF4444',
                    marginTop: sh(4),
                    marginLeft: sw(4),
                  }}
                >
                  {errors.email.message}
                </Text>
              )}
            </View>

            {/* CTA */}
            <PrimaryButton
              title={isSendingCode ? 'Sending...' : 'Continue with email'}
              onPress={handleSubmit(onValid)}  
              textStyle={{
                fontSize: sf(16),
                fontWeight: '600', 
              }}
              disabled={isSendingCode}
            />

            <View style={{ marginTop: sh(20), alignItems: 'center' }}>
              <Text style={{ fontSize: sf(14), color: '#6B7280' }}>
                Already have an account?{' '}
                <Text
                  style={{ color: '#CEB98F', fontWeight: '600' }}
                  onPress={() => navigation.navigate('SignInScreen')}
                >
                  Sign In
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF', paddingBottom: sh(20) },
   label: { color: "#000000" },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#B6B9C9",
  },
  input: {
    flex: 1,
    color: "#7D858E",
  },
});
