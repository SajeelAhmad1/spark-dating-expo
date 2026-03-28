import React from 'react';
import SignInScreen from '@/screens/SignInScreen';

export default function NumberSigninScreen(props: any) {
  return (
    <SignInScreen
      {...props}
      route={{
        ...(props?.route ?? {}),
        params: { ...(props?.route?.params ?? {}), defaultTab: 'phone' },
      }}
    />
  );
}
