import { useMemo } from 'react';
import { Dimensions, useWindowDimensions } from 'react-native';

/** Design reference: iPhone 14 Pro Max logical size (portrait). */
export const BASE_WIDTH = 430;
export const BASE_HEIGHT = 932;

const screen = () => Dimensions.get('window');

/** Scale horizontal size from design px → current width. */
export const sw = (size: number) => (screen().width / BASE_WIDTH) * size;

/** Scale vertical size from design px → current height. */
export const sh = (size: number) => (screen().height / BASE_HEIGHT) * size;

/**
 * Moderate scale for font sizes (factor 0.5): stays closer to design on small/large phones.
 */
export const sf = (size: number, factor = 0.5) => {
  const widthScaled = sw(size);
  return size + (widthScaled - size) * factor;
};

/** Border radii / small UI chrome — slightly less aggressive than full width scale. */
export const sr = (size: number) => sf(size, 0.35);

/**
 * Reactive scaling (rotation, split-screen). Use inside components when layout must
 * follow live window size; static `sw`/`sh` read dimensions once per call at import time
 * when used in module-level `StyleSheet.create`.
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  return useMemo(() => {
    const swLive = (size: number) => (width / BASE_WIDTH) * size;
    const shLive = (size: number) => (height / BASE_HEIGHT) * size;
    const sfLive = (size: number, factor = 0.5) => {
      const ws = swLive(size);
      return size + (ws - size) * factor;
    };
    const srLive = (size: number) => sfLive(size, 0.35);
    return {
      width,
      height,
      sw: swLive,
      sh: shLive,
      sf: sfLive,
      sr: srLive,
    };
  }, [width, height]);
}
