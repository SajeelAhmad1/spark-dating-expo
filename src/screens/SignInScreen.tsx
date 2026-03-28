import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/common/Text';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthSigninTab } from '@/types/auth';
import SignInTabs from '@/components/auth/SignInTabs';
import PhoneEmailField from '@/components/auth/PhoneEmailField';
import PasswordField from '@/components/auth/PasswordField';
import RememberMeToggle from '@/components/auth/RememberMeToggle';
import SignInBottomActions from '@/components/auth/SignInBottomActions';
import { useZodForm } from '@/utils/form';
import {
  signInSchema,
  phoneNumberSchema,
  emailSchema,
  passwordSchema,
  rememberMeSchema,
} from '@/validations/auth';
import { sf } from '@/utils/responsive';

export default function SignInScreen({
  navigation,
  route,
}: {
  navigation: any;
  route?: { params?: { defaultTab?: AuthSigninTab } };
}) {
  const initialTab = route?.params?.defaultTab ?? 'phone';

  const [activeTab, setActiveTab] = useState<AuthSigninTab>(initialTab);
  const [showPassword, setShowPassword] = useState(false);

  const { watch, setValue, getValues } = useZodForm(signInSchema, {
    defaultValues: {
      phoneNumber: '',
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const phoneNumber = watch('phoneNumber');
  const email = watch('email');
  const password = watch('password');
  const rememberMe = watch('rememberMe');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 16,
        }}
      >
        {/* Back Button */}
        <TouchableOpacity style={{ width: 32, height: 32 }} onPress={() => {}}>
          <ChevronLeft size={24} color="#000000" />
        </TouchableOpacity>

        {/* Header */}
        <View style={{ marginTop: 48, gap: 8 }}>
          <Text
            style={{
              color: '#000000',
              fontWeight: '600',
              fontSize: sf(28),
              lineHeight: sf(28),
              letterSpacing: 0,
            }}
          >
            Welcome Back!
          </Text>
          <Text
            style={{
              color: '#7D858E',
              fontSize: sf(15),
              lineHeight: sf(15),
              letterSpacing: 0,
            }}
          >
            Please enter your number & password to signin
          </Text>
        </View>

        {/* Tabs */}
        <SignInTabs
          activeTab={activeTab}
          onTabChange={t => setActiveTab(t)}
        />

        {/* Fields */}
        <View style={{ paddingTop: 32 }}>
          <PhoneEmailField
            activeTab={activeTab}
            value={activeTab === 'phone' ? phoneNumber : email}
            onChangeText={v =>
              setValue(activeTab === 'phone' ? 'phoneNumber' : 'email', v)
            }
          />
          <PasswordField
            password={password}
            onChangeText={v => setValue('password', v)}
            showPassword={showPassword}
            onToggleShowPassword={() => setShowPassword(p => !p)}
          />
        </View>

        {/* Remember me / Forgot password */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 20,
          }}
        >
          <RememberMeToggle
            rememberMe={rememberMe}
            onToggle={() => setValue('rememberMe', !getValues().rememberMe)}
          />

          <TouchableOpacity onPress={() => {}}>
            <Text
              style={{
                color: '#1E78F5',
                fontWeight: '500',
                fontSize: sf(14),
              }}
            >
              Forgot password!
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Actions */}
        <SignInBottomActions
          onLogin={() => {
            const values = getValues();
            const contact =
              activeTab === 'phone' ? values.phoneNumber : values.email;

            const contactSchema =
              activeTab === 'phone'
                ? phoneNumberSchema
                : emailSchema;

            const contactResult = contactSchema.safeParse(contact);
            const passwordResult = passwordSchema.safeParse(values.password);
            const rememberResult = rememberMeSchema.safeParse(values.rememberMe);

            if (!contactResult.success || !passwordResult.success || !rememberResult.success) {
              console.warn('Sign-in validation failed', {
                contactError: contactResult.success ? null : contactResult.error.flatten(),
                passwordError: passwordResult.success ? null : passwordResult.error.flatten(),
                rememberError: rememberResult.success ? null : rememberResult.error.flatten(),
              });
            }

            navigation.navigate('EnableLocationScreen');
          }}
        />
      </View>
    </SafeAreaView>
  );
}
