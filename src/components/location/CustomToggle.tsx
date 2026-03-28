import React, { useRef } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

const TRACK_WIDTH = 46;
const TRACK_HEIGHT = 26;
const THUMB_SIZE = 20;
const THUMB_MARGIN = 3;

export default function CustomToggle({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  const translateX = useRef(
    new Animated.Value(
      value ? TRACK_WIDTH - THUMB_SIZE - THUMB_MARGIN : THUMB_MARGIN,
    ),
  ).current;

  const toggle = () => {
    const toValue = value
      ? THUMB_MARGIN
      : TRACK_WIDTH - THUMB_SIZE - THUMB_MARGIN;
    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
    onValueChange(!value);
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={toggle}>
      <View
        style={{
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          backgroundColor: value ? '#1E78F533' : '#E5E5E5',
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
            backgroundColor: '#ffffff',
            transform: [{ translateX }],
          }}
        />
      </View>
    </TouchableOpacity>
  );
}

