import { Dimensions } from 'react-native';

const BASE_WIDTH = 430;
const BASE_HEIGHT = 932;

const screen = () => Dimensions.get('window');

export const sw = (size: number) => (screen().width / BASE_WIDTH) * size;
export const sh = (size: number) => (screen().height / BASE_HEIGHT) * size;

// Keeps typography/rounded shapes visually stable across devices.
export const sf = (size: number, factor = 0.5) => {
  const widthScaled = sw(size);
  return size + (widthScaled - size) * factor;
};

export const sr = (size: number) => sf(size, 0.35);
