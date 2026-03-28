import { View } from 'react-native';
import { Text } from '@/components/common/Text';
import PrimaryButton from '@/components/common/PrimaryButton';
import Logo from '@/assets/images/logo.svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { sf, sr } from '@/utils/responsive';

export default function LogoScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1 }}>
      {/* Gradient overlay */}
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

      <SafeAreaView
        style={{ flex: 1 }}
        edges={['top', 'bottom']}
      >
        {/* Center content */}
        <View
          style={{
            flex: 1,
            gap: 8,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 8,
          }}
        >
          {/* App icon */}
          <View
            style={{ width: sf(88), height: sf(88), borderRadius: sr(18) }}
          >
            <Logo width={sf(88)} height={sf(88)} />
          </View>

          {/* App name */}
          <Text
            style={{
              fontSize: sf(40),
              lineHeight: sf(40),
              letterSpacing: 0,
              fontFamily: 'ZenDots-Regular',
              fontWeight: '400',
              color: '#ffffff',
            }}
          >
            SPARK
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              fontSize: sf(15),
              color: '#222222',
              fontWeight: '400',
              textAlign: 'center',
              paddingTop: 12,
            }}
          >
            Discover real connections through shared interests{'\n'}and genuine
            conversations.
          </Text>
        </View>

        {/* Bottom Next button */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <PrimaryButton
            title="Next"
            onPress={() => navigation.navigate('SignUpScreen')}
            colors={['#1E78F5', '#1E78F5']}
            variant="solid"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
