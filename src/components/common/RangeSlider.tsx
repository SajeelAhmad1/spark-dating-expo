import React, { useRef, useEffect } from 'react';
import {
  View,
  Animated,
  PanResponder,
  StyleSheet,
  ViewStyle,
} from 'react-native';

const THUMB_SIZE = 28;
const TRACK_HEIGHT = 4;
const HIT_SLOP = { top: 16, bottom: 16, left: 16, right: 16 };

interface Props {
  min: number;
  max: number;
  low: number;
  high: number;
  onLowChange: (v: number) => void;
  onHighChange: (v: number) => void;
  trackColor?: string;
  rangeColor?: string;
  thumbColor?: string;
  style?: ViewStyle;
}

export default function RangeSlider({
  min,
  max,
  low,
  high,
  onLowChange,
  onHighChange,
  trackColor = '#E0E0E0',
  rangeColor = '#CEB98F',
  thumbColor = '#CEB98F',
  style,
}: Props) {
  const trackWidth = useRef(0);

  // Mutable refs — always current, read directly inside PanResponder callbacks
  const lowRef = useRef(low);
  const highRef = useRef(high);
  useEffect(() => { lowRef.current = low; }, [low]);
  useEffect(() => { highRef.current = high; }, [high]);

  const lowAnim = useRef(new Animated.Value(0)).current;
  const highAnim = useRef(new Animated.Value(0)).current;

  const toX = (v: number) =>
    ((v - min) / (max - min)) * trackWidth.current;

  const toVal = (x: number, lo: number, hi: number) => {
    const raw = (x / trackWidth.current) * (max - min) + min;
    return Math.round(Math.min(hi, Math.max(lo, raw)));
  };

  // Sync anim when prop changes externally (e.g. sheet re-open)
  useEffect(() => {
    if (trackWidth.current > 0) lowAnim.setValue(toX(low));
  }, [low]);
  useEffect(() => {
    if (trackWidth.current > 0) highAnim.setValue(toX(high));
  }, [high]);

  // Each thumb stores its pixel position at drag-start
  const lowStartX = useRef(0);
  const highStartX = useRef(0);

  const lowPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        lowStartX.current = toX(lowRef.current);
      },
      onPanResponderMove: (_, gs) => {
        const next = Math.max(
          0,
          Math.min(lowStartX.current + gs.dx, toX(highRef.current - 1)),
        );
        lowAnim.setValue(next);
        onLowChange(toVal(next, min, highRef.current - 1));
      },
      onPanResponderRelease: () => {},
    }),
  ).current;

  const highPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        highStartX.current = toX(highRef.current);
      },
      onPanResponderMove: (_, gs) => {
        const next = Math.min(
          trackWidth.current,
          Math.max(highStartX.current + gs.dx, toX(lowRef.current + 1)),
        );
        highAnim.setValue(next);
        onHighChange(toVal(next, lowRef.current + 1, max));
      },
      onPanResponderRelease: () => {},
    }),
  ).current;

  const rangeWidth = Animated.subtract(highAnim, lowAnim);

  return (
    <View
      style={[styles.root, style]}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width - THUMB_SIZE;
        trackWidth.current = w;
        lowAnim.setValue(toX(lowRef.current));
        highAnim.setValue(toX(highRef.current));
      }}
    >
      {/* Background track */}
      <View style={[styles.track, { backgroundColor: trackColor }]} />

      {/* Active range fill */}
      <Animated.View
        style={[
          styles.range,
          {
            backgroundColor: rangeColor,
            left: Animated.add(lowAnim, THUMB_SIZE / 2),
            width: rangeWidth,
          },
        ]}
      />

      {/* Low thumb */}
      <Animated.View
        hitSlop={HIT_SLOP}
        {...lowPan.panHandlers}
        style={[
          styles.thumb,
          { backgroundColor: thumbColor, zIndex: 1 },
          { transform: [{ translateX: lowAnim }] },
        ]}
      />

      {/* High thumb — zIndex 2 so it always renders above low */}
      <Animated.View
        hitSlop={HIT_SLOP}
        {...highPan.panHandlers}
        style={[
          styles.thumb,
          { backgroundColor: thumbColor, zIndex: 2 },
          { transform: [{ translateX: highAnim }] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: THUMB_SIZE + 16,
    justifyContent: 'center',
    marginVertical: 4,
  },
  track: {
    position: 'absolute',
    left: THUMB_SIZE / 2,
    right: THUMB_SIZE / 2,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
  },
  range: {
    position: 'absolute',
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    position: 'absolute',
    top: 8,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
});
