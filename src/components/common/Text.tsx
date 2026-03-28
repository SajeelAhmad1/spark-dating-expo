import React from 'react';
import {
  Text as RNText,
  TextProps,
  StyleProp,
  TextStyle,
  StyleSheet,
} from 'react-native';

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

function inferWeightFromStyle(fw: TextStyle['fontWeight']): FontWeight | undefined {
  if (fw == null) return undefined;
  if (typeof fw === 'number') {
    if (fw >= 900) return 'black';
    if (fw >= 800) return 'extrabold';
    if (fw >= 700) return 'bold';
    if (fw >= 600) return 'semibold';
    if (fw >= 500) return 'medium';
    if (fw >= 400) return 'regular';
    if (fw >= 300) return 'light';
    if (fw >= 200) return 'extralight';
    return 'thin';
  }
  const key = String(fw).toLowerCase();
  const map: Record<string, FontWeight> = {
    '100': 'thin',
    '200': 'extralight',
    '300': 'light',
    '400': 'regular',
    '500': 'medium',
    '600': 'semibold',
    '700': 'bold',
    '800': 'extrabold',
    '900': 'black',
    normal: 'regular',
    medium: 'medium',
    semibold: 'semibold',
    bold: 'bold',
  };
  return map[key];
}

export function Text({ style, weight, children, ...props }: Props) {
  const flat = StyleSheet.flatten(style ?? {}) as TextStyle | undefined;
  const hasExplicitFontFamily = Boolean(flat?.fontFamily);

  const inferred = !hasExplicitFontFamily ? inferWeightFromStyle(flat?.fontWeight) : undefined;
  const resolved: FontWeight = weight ?? inferred ?? 'regular';

  const fontPrefix = hasExplicitFontFamily ? undefined : fontMap[resolved];

  return (
    <RNText style={[fontPrefix ? { fontFamily: fontPrefix } : null, style]} {...props}>
      {children}
    </RNText>
  );
}