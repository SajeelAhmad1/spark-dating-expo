import React, { useMemo, useRef } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';
import { sw, sh } from '@/utils/responsive';

export default function CustomToggle({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  const { trackW, trackH, thumb, margin } = useMemo(
    () => ({
      trackW: sw(46),
      trackH: sh(26),
      thumb: sw(20),
      margin: sw(3),
    }),
    [],
  );

  const translateX = useRef(
    new Animated.Value(value ? trackW - thumb - margin : margin),
  ).current;

  const toggle = () => {
    const toValue = value ? margin : trackW - thumb - margin;
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
          width: trackW,
          height: trackH,
          borderRadius: trackH / 2,
          backgroundColor: value ? '#1E78F533' : '#E5E5E5',
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={{
            width: thumb,
            height: thumb,
            borderRadius: thumb / 2,
            backgroundColor: '#ffffff',
            transform: [{ translateX }],
          }}
        />
      </View>
    </TouchableOpacity>
  );
}
