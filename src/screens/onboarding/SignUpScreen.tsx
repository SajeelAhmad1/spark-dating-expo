import { View } from 'react-native';
import { Text } from '@/components/common/Text';
import PrimaryButton from '@/components/common/PrimaryButton';
import Logo from '@/assets/images/logo.svg';
import GoogleIcon from '@/assets/images/google.svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, Mail } from 'lucide-react-native';
import { sf, sr, sw, sh } from '@/utils/sizeMatters';

export default function SignUpScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, paddingBottom: sh(20) }}>
      <LinearGradient
        colors={['#1E78F5', '#FBB202']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

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
              color: '#ffffff',
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
              <Logo width={sf(88)} height={sf(88)} />
            </View>

            <Text
              style={{
                fontSize: sf(24),
                fontWeight: '600',
                color: '#ffffff',
                textAlign: 'center',
              }}
            >
              Match. Snap. Keep the{'\n'}Spark Alive.
            </Text>
          </View>

          <View
            style={{
              paddingHorizontal: sw(20),
              // paddingBottom: sh(24),
              gap: sh(12),
            }}
          >
            <Text
              style={{
                fontSize: sf(16),
                marginBottom: sh(16),
                fontWeight: '500',
                color: '#ffffff',
                textAlign: 'center',
              }}
            >
              By tapping "Sign In" you agree to or{' '}
              <Text style={{ color: '#1E78F5' }}>Terms</Text>. Learn how we process
              your data in our{' '}
              <Text style={{ color: '#1E78F5' }}>Privacy Policy</Text> and{' '}
              <Text style={{ color: '#1E78F5' }}>Cookies Policy</Text>
            </Text>

            <PrimaryButton
              title="Continue with Emial"
              onPress={() => navigation.navigate('EmailInputScreen')} 
              colors={['#ffffff']}
              iconBackground="#EDEDED"
              variant="outline"  
              icon={<Mail width={sf(28)} height={sf(28)} color="#1E78F5" />}
              iconPosition="start"
              style={{ backgroundColor: 'white' }}
              textStyle={{ fontSize: sf(16), fontWeight: '500', color: '#1E78F5' }}
            />
            <PrimaryButton
              title="Continue with mobile"
              onPress={() => navigation.navigate('NumberInputScreen')}
              colors={['#1E78F5', '#1E78F5']}
              iconBackground="#ffffff"
              variant="solid"
              icon={<Phone width={sf(28)} height={sf(28)} color="#1E78F5" />}
              iconPosition="start"
              textStyle={{ fontSize: sf(16), fontWeight: '500' }}
            />

            <PrimaryButton
              title="Continue with Google"
              onPress={() => navigation.navigate('ProfileSetupScreen')}
              colors={['#ffffff']}
              iconBackground="#EDEDED"
              variant="outline"
              icon={<GoogleIcon width={sf(28)} height={sf(28)} />}
              iconPosition="start"
              style={{ backgroundColor: 'white' }}
              textStyle={{ fontSize: sf(16), fontWeight: '500', color: '#1E78F5' }}
            />

            <View style={{ marginTop: sh(8), alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: sf(16),
                  color: '#ffffff',
                  fontWeight: '400',
                }}
              >
                Already have an account?{' '}
                <Text
                  style={{ color: '#1E78F5', fontWeight: '500', textDecorationLine: 'underline' }}
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
