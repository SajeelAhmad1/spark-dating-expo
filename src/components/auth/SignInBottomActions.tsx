import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/common/Text';
import PrimaryButton from '@/components/common/PrimaryButton';
import { sf, sh } from '@/utils/sizeMatters';
import { LoaderCircle } from 'lucide-react-native';

export default function SignInBottomActions({
  onLogin,
  onSignUp,
  disable = false,
}: {
  onLogin: () => void;
  onSignUp: () => void;
  disable?: boolean;
}) {
  return (
    <>
      <View style={[styles.actions, { marginTop: sh(12) }]}>
        <PrimaryButton
          title='Login'
          onPress={onLogin}
          colors={['#1E78F5', '#FBB202']}
          variant='gradient'
          style={{ alignSelf: 'stretch' }}
          textStyle={{ fontSize: sf(20), fontWeight: '500' }}
          disabled={disable} 
          icon={
            disable ? (
              <ActivityIndicator
                color='#ffffff'
                size='small'
              />
            ) : undefined
          }
          iconPosition='middle'
        />

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={[styles.accountLine, { fontSize: sf(16) }]}
            weight='medium'
          >
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={onSignUp}>
            <Text
              weight='medium'
              style={styles.signUpLink}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.helpWrap}>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.helpText}>Need Help?</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  actions: { rowGap: 16, alignItems: 'center' },
  accountLine: { color: '#000000' },
  signUpLink: { color: '#1E78F5' },
  helpWrap: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  helpText: { color: '#7D858E' },
});
