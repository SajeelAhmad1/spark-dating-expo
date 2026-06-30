// screens/auth/SignUpScreen.tsx
import { View } from 'react-native';
import { Text } from '@/components/common/Text';
import PrimaryButton from '@/components/common/PrimaryButton';
import Logo from '@/assets/images/logo.svg';
import GoogleIcon from '@/assets/images/google.svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, Mail } from 'lucide-react-native';
import { sf, sr, sw, sh } from '@/utils/sizeMatters';
import { useGoogleSignIn } from '@/features/auth/useGoogleSignIn';
import { showToast } from '@/utils/toast';

export default function SignUpScreen({ navigation }: any) {
  const {
    signIn: googleSignIn,
    isPending: isGooglePending,
    isReady,
  } = useGoogleSignIn();

  const handleGoogleSignIn = () => {
    googleSignIn(
      (data) => {
        // Backend returns `profile` with the user's Google info.
        // If they need onboarding, pre-fill the signup store with whatever
        // Google gave us so the user doesn't have to retype their name.
        if (data.next === 'complete_profile') {
          navigation.navigate('ProfileSetupScreen', {
            prefill: {
              firstName: data.profile.givenName ?? '',
              lastName: data.profile.familyName ?? '',
            },
          });
        } else {
          navigation.replace('MainTabs');
        }
      },
      (errorMessage) => {
        showToast({ text1: 'Google sign-in failed', text2: errorMessage });
      },
    );
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: '#F7F3ED', paddingBottom: sh(20) }}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: sh(80),
            paddingHorizontal: sw(0),
          }}
        >
          <Text
            style={{
              fontSize: sf(32),
              marginBottom: sh(32),
              fontWeight: '600',
              color: '#0B0B0B',
              textAlign: 'center',
            }}
          >
            Welcome back!
          </Text>

          <View style={{ alignItems: 'center', gap: sh(8) }}>
            <View
              style={{
                width: sf(72),
                height: sf(72),
                borderRadius: sr(18),
                elevation: 0,
                shadowOpacity: 0,
              }}
            >
              <Logo
                width={sf(88)}
                height={sf(88)}
              />
            </View>

            <Text
              style={{
                fontSize: sf(24),
                fontWeight: '600',
                color: '#0B0B0B',
                textAlign: 'center',
              }}
            >
              Keep the Spark alive.
            </Text>
          </View>

          <View style={{ paddingHorizontal: sw(20), gap: sh(12) }}>
            <Text
              style={{
                fontSize: sf(16),
                marginBottom: sh(16),
                fontWeight: '500',
                color: '#7D858E',
                textAlign: 'center',
              }}
            >
              By continuing "Sign In" you agree to our{' '}
              <Text style={{ color: '#CEB98F' }}>Terms</Text>. Learn how we
              process your data in our{' '}
              <Text style={{ color: '#CEB98F' }}>Privacy Policy</Text> and{' '}
              <Text style={{ color: '#CEB98F' }}>Cookies Policy</Text>
            </Text>

            {/* <PrimaryButton
              title='Continue with email'
              onPress={() => navigation.navigate('EmailInputScreen')}
              iconBackground='#0B0B0B'
              variant='solid'
              icon={
                <Mail
                  width={sf(28)}
                  height={sf(28)}
                  color='#CEB98F'
                />
              }
              iconPosition='start'
              // style={{ backgroundColor: 'white' }}
              textStyle={{
                fontSize: sf(16),
                fontWeight: '500', 
              }}
            /> */}

            <PrimaryButton
              title='Continue with mobile'
              onPress={() => navigation.navigate('NumberInputScreen')}
              colors={['#EAD6A9']}
              iconBackground='#0B0B0B'
              variant='outline'
              icon={
                <Phone
                  width={sf(28)}
                  height={sf(28)}
                  color='#CEB98F'
                />
              }
              iconPosition='start'
              textStyle={{
                fontSize: sf(16),
                fontWeight: '500',
                color: '#0B0B0B',
              }}
            />

            {/* ── Google sign-in ───────────────────────────────────────────── */}
            <PrimaryButton
              title={isGooglePending ? 'Signing in…' : 'Continue with google'}
              onPress={handleGoogleSignIn}
              disabled={isGooglePending || !isReady}
              iconBackground='#0B0B0B'
              variant='solid'
              icon={
                <GoogleIcon
                  width={sf(28)}
                  height={sf(28)}
                />
              }
              iconPosition='start'
              style={{
                // backgroundColor: 'white',
                opacity: isGooglePending || !isReady ? 0.6 : 1,
              }}
              textStyle={{
                fontSize: sf(16),
                fontWeight: '500',
                color: '#0B0B0B',
              }}
            />

            <View style={{ marginTop: sh(8), alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: sf(16),
                  color: '#0B0B0B',
                  fontWeight: '400',
                }}
              >
                Already have an account?{' '}
                <Text
                  style={{
                    color: '#CEB98F',
                    fontWeight: '500',
                    textDecorationLine: 'underline',
                  }}
                  onPress={() => navigation.navigate('SignInScreen')}
                >
                  Login
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
