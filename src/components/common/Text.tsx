import React from 'react';
import { Text as RNText, TextProps, StyleProp, TextStyle } from 'react-native';

type FontWeight = 'thin' | 'extralight' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';

interface Props extends TextProps {
  weight?: FontWeight;
  style?: StyleProp<TextStyle>;
}

const fontMap: Record<FontWeight, string> = {
  thin:       'Poppins-Thin',       // 100
  extralight: 'Poppins-ExtraLight', // 200
  light:      'Poppins-Light',      // 300
  regular:    'Poppins-Regular',    // 400
  medium:     'Poppins-Medium',     // 500
  semibold:   'Poppins-SemiBold',   // 600
  bold:       'Poppins-Bold',       // 700
  extrabold:  'Poppins-ExtraBold',  // 800
  black:      'Poppins-Black',      // 900
};

export function Text({ style, weight = 'regular', children, ...props }: Props) {
  return (
    <RNText
      style={[{ fontFamily: fontMap[weight] }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}