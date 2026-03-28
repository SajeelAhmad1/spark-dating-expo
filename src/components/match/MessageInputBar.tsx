import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import CameraIcon from '@/assets/images/cameraIcon.svg';
import { FieldError } from '@/components/common/FieldError';
import { sf, sw, sh } from '@/utils/responsive';

export default function MessageInputBar({
  value,
  onChangeText,
  onOpenCamera,
  errorMessage,
}: {
  value: string;
  onChangeText: (v: string) => void;
  onOpenCamera: () => void;
  errorMessage?: string;
}) {
  return (
    <>
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000000',
        borderRadius: 999,
        paddingHorizontal: sw(18),
        paddingVertical: sh(4),
        width: '100%',
        marginBottom: sh(20),
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
          padding: sh(4),
          color: '#FFFFFF',
        }}
      />

      <TouchableOpacity onPress={onOpenCamera}>
        <CameraIcon width={sw(32)} height={sw(32)} />
      </TouchableOpacity>
    </View>
    <FieldError message={errorMessage} />
    </>
  );
}

