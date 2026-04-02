import { View } from 'react-native';
import { Text } from '@/components/common/Text';
import {Text as RNText} from 'react-native';
import PrimaryButton from '@/components/common/PrimaryButton';
import Logo from '@/assets/images/logo.svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { sf, sr, sw, sh } from '@/utils/sizeMatters';

export default function LogoScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, paddingBottom: sh(20) }}>
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
        {/* Center content */}
        <View
          style={{
            flex: 1,
            gap: sh(8),
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: sw(8),
          }}
        >
          {/* App icon */}
          <View
            style={{ width: sf(88), height: sf(88), borderRadius: sr(18) }}
          >
            <Logo width={sf(88)} height={sf(88)} />
          </View>

          {/* App name */}
          <RNText
            style={{
              fontSize: sf(40), 
              fontFamily: 'ZenDots-Regular',
              fontWeight: '400',
              color: '#ffffff',
            }}
          >
            SPARK
          </RNText>

          {/* Subtitle */}
          <Text
            style={{
              fontSize: sf(15),
              color: '#222222',
              fontWeight: '400',
              textAlign: 'center',
              paddingTop: sh(12),
            }}
          >
            Discover real connections through shared interests{'\n'}and genuine
            conversations.
          </Text>
        </View>

        {/* Bottom Next button */}
        <View style={{ paddingHorizontal: sw(16) }}>
          <PrimaryButton
            title="Next"
            onPress={() => navigation.navigate('SignUpScreen')}
            colors={['#1E78F5', '#1E78F5']}
            variant="solid"
          />
        </View>
    </View>
  );
}
