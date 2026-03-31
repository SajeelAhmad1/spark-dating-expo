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
import { createSignInSchema } from '@/schemas/auth';
import { sf, sw, sh } from '@/utils/responsive';

function SignInFormBody({
  tab,
  navigation,
}: {
  tab: AuthSigninTab;
  navigation: any;
}) {
  const [showPassword, setShowPassword] = useState(false);

  const { watch, setValue, getValues, handleSubmit, trigger, formState } = useZodForm(
    createSignInSchema(tab),
    {
      defaultValues: {
        phoneNumber: '',
        email: '',
        password: '',
        rememberMe: false,
      },
    },
  );

  const { errors } = formState;
  const phoneNumber = watch('phoneNumber');
  const email = watch('email');
  const password = watch('password');
  const rememberMe = watch('rememberMe');

  const onValid = () => {
    navigation.navigate('EnableLocationScreen');
  };

  return (
    <>
      <View style={{ paddingTop: sh(32) }}>
        <PhoneEmailField
          activeTab={tab}
          value={tab === 'phone' ? phoneNumber : email}
          onChangeText={v =>
            setValue(tab === 'phone' ? 'phoneNumber' : 'email', v, { shouldValidate: true })
          }
          onBlur={() =>
            trigger(tab === 'phone' ? 'phoneNumber' : 'email')
          }
          errorMessage={
            tab === 'phone'
              ? errors.phoneNumber?.message
              : errors.email?.message
          }
        />
        <PasswordField
          password={password}
          onChangeText={v => setValue('password', v, { shouldValidate: true })}
          onBlur={() => trigger('password')}
          showPassword={showPassword}
          onToggleShowPassword={() => setShowPassword(p => !p)}
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

      <SignInBottomActions
        onLogin={handleSubmit(onValid)}
        onSignUp={() => navigation.navigate('SignUpScreen')}
      />
    </>
  );
}

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
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: sw(20),
          paddingTop: sh(72),
        }}
      >
        <TouchableOpacity style={{ width: sw(32), height: sw(32) }} onPress={() => {}}>
          <ChevronLeft size={sf(24)} color="#000000" />
        </TouchableOpacity>

        <View style={{ marginTop: sh(48), gap: sh(8) }}>
          <Text
            style={{
              color: '#000000',
              fontWeight: '600',
              fontSize: sf(28), 
            }}
          >
            Welcome Back!
          </Text>
          <Text
            style={{
              color: '#7D858E',
              fontSize: sf(15), 
            }}
          >
            Please enter your number & password to signin
          </Text>
        </View>

        <SignInTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <SignInFormBody key={activeTab} tab={activeTab} navigation={navigation} />
      </View>
    </View>
  );
}
