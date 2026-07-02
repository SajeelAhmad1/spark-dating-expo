import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/common/Text';
import PrimaryButton from '@/components/common/PrimaryButton';
import { sf, sh } from '@/utils/sizeMatters';
import GoogleIcon from '../../assets/images/google.svg';

export default function SignInBottomActions({
  onLogin,
  onSignUp,
  onGoogleSignIn,
  disable = false,
  googleLoading = false,
}: {
  onLogin: () => void;
  onSignUp: () => void;
  onGoogleSignIn: () => void;
  disable?: boolean;
  googleLoading?: boolean;
}) {
  return (
    <>
      <View style={[styles.actions, { marginTop: sh(12) }]}>
        <PrimaryButton
          title='Login'
          onPress={onLogin}
          variant='gradient'
          style={{ alignSelf: 'stretch' }}
          textStyle={{ fontSize: sf(20), fontWeight: '500' }}
          disabled={disable}
          icon={
            disable ? (
              <ActivityIndicator color='#0B0B0B' size='small' />
            ) : undefined
          }
          iconPosition='middle'
        />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <PrimaryButton
          title={googleLoading ? 'Signing in…' : 'Continue with Google'}
          onPress={onGoogleSignIn}
          disabled={googleLoading || disable}
          iconBackground='#EDEDED'
          variant='outline'
          icon={<GoogleIcon width={sf(28)} height={sf(28)} />}
          iconPosition='start'
          style={{
            alignSelf: 'stretch',
            opacity: googleLoading || disable ? 0.6 : 1,
            borderWidth: 1,
            borderColor: '#555555',
          }}
          textStyle={{ fontSize: sf(16), fontWeight: '500', color: '#0B0B0B' }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={[styles.accountLine, { fontSize: sf(16) }]}
            weight='medium'
          >
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={onSignUp}>
            <Text weight='medium' style={styles.signUpLink}>
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
  signUpLink: { color: '#CEB98F', textDecorationLine: 'underline' },
  helpWrap: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  helpText: { color: '#7D858E' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', gap: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#D1D5DB' },
  dividerText: { color: '#7D858E', fontSize: 13 },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    alignSelf: 'stretch',
    height: 52,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
});
