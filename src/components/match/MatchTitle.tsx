// components/match/MatchTitle.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/common/Text';
import { MATCH_CIRCLE_SIZE } from '@/constants/match';
import { sf } from '@/utils/sizeMatters';

export default function MatchTitle() {
  return (
    <View style={styles.row}>
      <Text
        style={[styles.titleDark, { fontSize: sf(44), }]}
        weight="bold"
      >
        {"It's a"}
      </Text>

      <View style={styles.circle}>
        <Text
          style={[styles.titleLight, { fontSize: sf(44), }]}
          weight="bold"
        >
          {'match!'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleDark: { color: '#1C1C1E', marginRight: sf(4) },
  circle: {
    width: MATCH_CIRCLE_SIZE,
    height: MATCH_CIRCLE_SIZE,
    borderRadius: MATCH_CIRCLE_SIZE / 2,
    backgroundColor: '#1E78F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleLight: { color: '#FFFFFF', textAlign: 'center' },
});
