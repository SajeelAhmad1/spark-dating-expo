import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import CameraIcon from '@/assets/images/cameraIcon.svg';
import { FieldError } from '@/components/common/FieldError';
import { sf, sw, sh } from '@/utils/sizeMatters';

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
        height: sh(56),
        marginBottom: sh(20),
        backgroundColor: 'rgba(0, 0, 0, 0.12)',
        
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
          padding: sh(4),
          color: '#FFFFFF',
        }}
      />

      <TouchableOpacity onPress={onOpenCamera} >
       
        <CameraIcon width={sw(44)} height={sh(44)} /> 
      </TouchableOpacity>
    </View>
    <FieldError message={errorMessage} />
    </>
  );
}

