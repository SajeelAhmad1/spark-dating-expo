import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/common/Text';
import { Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '@/components/common/PrimaryButton';
import { sf, sw, sh, sr } from '@/utils/sizeMatters';

const VerificationSuccessScreen = ({navigation}: any) => {
  return (
    <View style={styles.safeArea}>
      <View style={styles.page}>

        <View
          style={[
            styles.iconWrap,
            {
              width: sf(100),
              height: sf(100),
            },
          ]}
        >
          <Check size={46} color="#FFFFFF" strokeWidth={3} />
        </View>

        <Text style={[styles.title, { fontSize: sf(24) }]} weight="semibold">
          Your Number is verified.
        </Text>

        <View style={styles.btnBlock}>
          <PrimaryButton
            title="Continue"
            onPress={() => {navigation.navigate("ProfileSetupScreen")}}
            colors={['#1E78F5', '#FBB202']}
            variant="gradient"
            style={{ alignSelf: 'stretch' }}
            textStyle={{fontSize: sf(20), fontWeight: '500',}}
          />
        </View>

        <TouchableOpacity style={styles.termsWrap} onPress={() => {}}>
          <Text style={[styles.terms, { fontSize: sf(16) }]} weight="regular">
            Agree our{' '}
            <Text style={styles.termsLink} weight="regular">
              Terms & Condition
            </Text>
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  page: {
    // flex: 1,
    paddingHorizontal: sw(20),
    // paddingBottom: sh(24),
    alignItems: 'center',
    marginTop: sh(104),
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sh(24),
    borderRadius: 999,
    backgroundColor: '#4CD964',
  },
  title: { color: '#000000', marginBottom: sh(32) },
  btnBlock: { width: '100%' },
  termsWrap: { marginTop: sh(16) },
  terms: { color: '#7D858E' },
  termsLink: { textDecorationLine: 'underline', color: '#7D858E' },
});

export default VerificationSuccessScreen;
