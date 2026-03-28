import React from 'react';
import { Text, View } from 'react-native';
import { MATCH_CIRCLE_SIZE } from '@/constants/match';
import { sf } from '@/utils/responsive';

export default function MatchTitle() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text 
        className="font-bold  text-[#1C1C1E]"
        style={{ fontSize: sf(44), lineHeight: sf(46), letterSpacing: 0 }}
      >
        {"It's a"}
      </Text>

      <View
        style={{
          width: MATCH_CIRCLE_SIZE,
          height: MATCH_CIRCLE_SIZE,
          borderRadius: MATCH_CIRCLE_SIZE / 2,
          backgroundColor: '#1E78F5',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: sf(44),
            lineHeight: sf(46),
            textAlign: 'center',
          }}
          className="font-bold text-[#FFFFFF]"
        >
          {'match!'}
        </Text>
      </View>
    </View>
  );
}

