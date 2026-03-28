import React from 'react';
import { TouchableOpacity } from 'react-native';
import CameraIcon from '@/assets/images/cameraIcon.svg';

export default function CameraButton() {
  return (
    <TouchableOpacity>
      <CameraIcon width={52} height={52} />
    </TouchableOpacity>
  );
}

