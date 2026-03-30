import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/common/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomToggle from '@/components/location/CustomToggle';
import LocationIcon from '@/components/location/LocationIcon';
import { sf, sw, sh, sr } from '@/utils/responsive';

// ── Screen ─────────────────────────────────────────────────
const EnableLocationScreen = ({ navigation }: any) => {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerBlock}>
        <LocationIcon />

        <Text
          style={[
            styles.heading,
            {
              fontFamily: 'Poppins-SemiBold',
              fontSize: sf(24), 
            },
          ]}
        >
          Enable Location
        </Text>

        <Text
          style={[
            styles.body,
            {
              fontFamily: 'Poppins-Regular',
              fontSize: sf(16), 
              color: '#B6B9C9',
            },
          ]}
        >
          You need to enable location to be able to use the spark app
        </Text>
      </View>

      <View style={styles.bottomCard}>
        <View style={styles.bottomTextCol}>
          <Text
            style={{
              fontFamily: 'Poppins-SemiBold',
              fontSize: sf(16), 
              color: '#000000',
            }}
          >
            Enable Location
          </Text>
          <Text
            style={[
              styles.bottomSub,
              {
                fontFamily: 'Poppins-Regular',
                fontSize: sf(13), 
                color: '#555555',
              },
            ]}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingBottom: sh(32),
  },
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sw(32),
    rowGap: sh(20),
  },
  heading: {
    color: '#000000',
    textAlign: 'center',
    marginTop: sh(8),
  },
  body: { textAlign: 'center' },
  bottomCard: {
    marginHorizontal: sw(24),
    backgroundColor: '#F9FAFB',
    borderRadius: sr(16),
    paddingHorizontal: sw(20),
    paddingVertical: sh(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomTextCol: { flex: 1 },
  bottomSub: { marginTop: sh(4) },
});

export default EnableLocationScreen;
