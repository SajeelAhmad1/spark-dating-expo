import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomToggle from '@/components/location/CustomToggle';
import LocationIcon from '@/components/location/LocationIcon';
import { sf } from '@/utils/responsive';

// ── Screen ─────────────────────────────────────────────────
const EnableLocationScreen = ({ navigation }: any) => {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white justify-between pb-8">
      {/* Center Content */}
      <View className="flex-1 items-center justify-center px-8 gap-5">
        <LocationIcon />

        <Text
          className="text-black text-center mt-2"
          style={{
            fontFamily: 'Poppins-SemiBold',
            fontSize: sf(24),
            lineHeight: sf(24),
            letterSpacing: 0,
          }}
        >
          Enable Location
        </Text>

        <Text
          className="text-center"
          style={{
            fontFamily: 'Poppins-Regular',
            fontSize: sf(16),
            lineHeight: sf(22),
            letterSpacing: 0,
            color: '#B6B9C9',
          }}
        >
          You need to enable location to be able to{'\n'}use the spark app
        </Text>
      </View>

      {/* Bottom Card */}
      <View className="mx-6 bg-gray-50 rounded-2xl px-5 py-4 flex-row items-center justify-between">
        <View className="flex-1">
          <Text
            style={{
              fontFamily: 'Poppins-SemiBold',
              fontSize: sf(16),
              lineHeight: sf(16),
              color: '#000000',
            }}
          >
            Enable Location
          </Text>
          <Text
            className="mt-1"
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: sf(13),
              lineHeight: sf(13),
              color: '#555555',
            }}
          >
            Find people near you and get better matches
          </Text>
        </View>

        <CustomToggle
          value={isEnabled}
          onValueChange={val => {
            setIsEnabled(val);
            if (val) { navigation.navigate('SearchScreen') };
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default EnableLocationScreen;
