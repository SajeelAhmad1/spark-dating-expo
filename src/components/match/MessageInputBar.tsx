import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import CameraIcon from '@/assets/images/cameraIcon.svg';
import { sf } from '@/utils/responsive';

export default function MessageInputBar({
  value,
  onChangeText,
  onOpenCamera,
}: {
  value: string;
  onChangeText: (v: string) => void;
  onOpenCamera: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000000',
        borderRadius: 999,
        paddingHorizontal: 18,
        paddingVertical: 4,
        width: '100%',
        marginBottom: 20,
        backgroundColor: '#000000',
      }}
    >
      <TextInput
        placeholder="Show Emma what you're doing..."
        placeholderTextColor="#FFFFFF"
        value={value}
        onChangeText={onChangeText}
        style={{
          flex: 1,
          fontFamily: 'Poppins-Regular',
          fontSize: sf(16),
          lineHeight: sf(16),
          padding: 4,
          color: '#FFFFFF',
        }}
      />

      <TouchableOpacity onPress={onOpenCamera}>
        <CameraIcon width={32} height={32} />
      </TouchableOpacity>
    </View>
  );
}

