// screens/auth/SignInScreen.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/common/Text';
import { ChevronLeft } from 'lucide-react-native';
import SignInTabs from '@/components/auth/SignInTabs';
import PhoneEmailField from '@/components/auth/PhoneEmailField';
import PasswordField from '@/components/auth/PasswordField';
import RememberMeToggle from '@/components/auth/RememberMeToggle';
import SignInBottomActions from '@/components/auth/SignInBottomActions';
import { useZodForm } from '@/utils/form';
import { sf, sw, sh } from '@/utils/sizeMatters';
import { useLogin } from '@/features/auth/hooks';
import { showToast } from '@/utils/toast';
import {
  AuthSigninTab,
  loginEmailSchema,
  loginPhoneSchema,
} from '@/features/auth/schema';
import { FieldErrors } from 'react-hook-form';

// ─── Form body ────────────────────────────────────────────────────────────────

function SignInFormBody({
  tab,
  navigation,
}: {
  tab: AuthSigninTab;
  navigation: any;
}) {
  const { mutate: login, isPending: isLoginPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const schema = tab === 'phone' ? loginPhoneSchema : loginEmailSchema;

  const { watch, setValue, getValues, handleSubmit, trigger, formState } =
    useZodForm(schema, {
      defaultValues: {
        phoneNumber: '',
        email: '',
        password: '',
        rememberMe: false,
      },
    });

  const { errors } = formState;
  const phoneNumber = watch('phoneNumber');
  const email       = watch('email');
  const password    = watch('password');
  const rememberMe  = watch('rememberMe');

  const onValid = (dto: any) => {
    // loginPhoneSchema .transform() strips spaces/dashes before this runs,
    // so dto.phoneNumber is already a clean string like "+923443841964".
    const identifier = tab === 'phone' ? dto.phoneNumber : dto.email;
    console.log(identifier, " ", dto.password , "console signin")
    login(
      { identifier, password: dto.password },
      {
        onSuccess: (data: any) => {
          console.log(data , "console signin data")
          showToast({ text1: 'Logged in successfully' });
          navigation.navigate('ProfileSetupScreen');
        },
        onError: (err: any) => {
          showToast({
            text1: 'Login failed',
            text2: err?.message ?? 'Please check your credentials and try again.',
          });
          console.log(err?.message , "console signin error")
        },
      },
    );
  };

  // Narrow error type per tab so TS is happy
  let fieldError: string | undefined;
  if (tab === 'phone') {
    const e = errors as FieldErrors<{ phoneNumber: string; password: string; rememberMe: boolean }>;
    fieldError = e.phoneNumber?.message;
  } else {
    const e = errors as FieldErrors<{ email: string; password: string; rememberMe: boolean }>;
    fieldError = e.email?.message;
  }

  return (
    <>
      <View style={{ paddingTop: sh(32) }}>
        <PhoneEmailField
          activeTab={tab}
          value={tab === 'phone' ? phoneNumber : email}
          onChangeText={(v) =>
            setValue(tab === 'phone' ? 'phoneNumber' : 'email', v, {
              shouldValidate: true,
            })
          }
          onBlur={() => trigger(tab === 'phone' ? 'phoneNumber' : 'email')}
          errorMessage={fieldError}
        />
        <PasswordField
          password={password}
          onChangeText={(v) => setValue('password', v, { shouldValidate: true })}
          onBlur={() => trigger('password')}
          showPassword={showPassword}
          onToggleShowPassword={() => setShowPassword((p) => !p)}
          errorMessage={errors.password?.message}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: sh(20),
        }}
      >
        <RememberMeToggle
          rememberMe={rememberMe}
          onToggle={() => setValue('rememberMe', !getValues().rememberMe)}
        />
        <TouchableOpacity onPress={() => {}}>
          <Text style={{ color: '#1E78F5', fontWeight: '500', fontSize: sf(14) }}>
            Forgot password!
          </Text>
        </TouchableOpacity>
      </View>

      <SignInBottomActions
        onLogin={handleSubmit(onValid)}
        onSignUp={() => navigation.navigate('SignUpScreen')}
        disable={isLoginPending}
      />
    </>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SignInScreen({
  navigation,
  route,
}: {
  navigation: any;
  route?: { params?: { defaultTab?: AuthSigninTab } };
}) {
  const initialTab = route?.params?.defaultTab ?? 'phone';
  const [activeTab, setActiveTab] = useState<AuthSigninTab>(initialTab);

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff', paddingBottom: sh(20) }}>
      <View style={{ flex: 1, paddingHorizontal: sw(20), paddingTop: sh(72) }}>
        <TouchableOpacity
          style={{ width: sw(32), height: sw(32) }}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={sf(24)} color="#000000" />
        </TouchableOpacity>

        <View style={{ marginTop: sh(48), gap: sh(8) }}>
          <Text style={{ color: '#000000', fontWeight: '600', fontSize: sf(28) }}>
            Welcome Back!
          </Text>
          <Text style={{ color: '#7D858E', fontSize: sf(15) }}>
            Please enter your number & password to sign in
          </Text>
        </View>

        <SignInTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <SignInFormBody key={activeTab} tab={activeTab} navigation={navigation} />
      </View>
    </View>
  );
}