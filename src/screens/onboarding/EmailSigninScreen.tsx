import React from 'react';
import SignInScreen from '@/screens/SignInScreen';

export default function EmailSigninScreen(props: any) {
  return (
    <SignInScreen
      {...props}
      route={{
        ...(props?.route ?? {}),
        params: { ...(props?.route?.params ?? {}), defaultTab: 'email' },
      }}
    />
  );
}
