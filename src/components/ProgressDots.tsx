// components/ProgressDots.tsx
import { View } from 'react-native';
import { sw, sh } from '@/utils/sizeMatters';

export const ProgressDots = ({
  total,
  current,
}: {
  total: number;
  current: number;
}) => (
  <View style={{ flexDirection: 'row', gap: sw(5) }}>
    {Array.from({ length: total }).map((_, i) => {
      const isActive = i === current;
      return (
        <View
          key={i}
          style={{
            height: sh(8),
            flex: 1,
            borderRadius: 999,
            backgroundColor: isActive ? '#FBB202' : 'transparent',
            borderWidth: isActive ? 0 : 1.5,
            borderColor: isActive ? 'transparent' : '#FBB202',
          }}
        />
      );
    })}
  </View>
);
