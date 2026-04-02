import {
  moderateScale,
  scale,
  verticalScale,
} from 'react-native-size-matters/extend';

export const sw = scale;
export const sh = verticalScale;
export const sf = moderateScale;
export const sr = (size: number) => moderateScale(size, 0.35);
