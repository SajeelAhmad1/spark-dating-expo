import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Heart, X } from 'lucide-react-native';
import { sf } from '@/utils/responsive';

export default function RequestCard({
  name,
  avatar,
}: {
  name: string;
  avatar: string;
}) {
  return (
    <View
      className="flex-row items-center bg-white rounded-2xl px-4 py-3 mb-3 mx-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.002,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <Image
        source={{ uri: avatar }}
        className="w-12 h-12 rounded-full mr-3"
      />

      <View className="flex-1">
        <Text
          style={{
            fontFamily: 'Poppins-SemiBold',
            fontSize: sf(16),
            lineHeight: sf(16),
            color: '#000000',
          }}
        >
          {name}
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins-Regular',
            fontSize: sf(13),
            lineHeight: sf(13),
            color: '#555555',
            marginTop: 4,
          }}
        >
          Wants to connect with you
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          className="w-8 h-8 rounded-full items-center justify-center"
          style={{
            backgroundColor: '#EDEDED',
            borderWidth: 0.5,
            borderColor: 'rgba(30,30,30,0.2)',
          }}
        >
          <X size={14} color="#4A4A4A" strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-8 h-8 rounded-full items-center justify-center"
          style={{ backgroundColor: '#FF073E' }}
        >
          <Heart size={19} color="#FFFFFF" fill="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

