import React from 'react';
import { TouchableOpacity } from 'react-native';
import CameraIcon from '@/assets/images/cameraIcon.svg';
import { sf } from '@/utils/responsive';

export default function CameraButton() {
  const s = sf(52);
  return (
    <TouchableOpacity>
      <CameraIcon width={s} height={s} />
    </TouchableOpacity>
  );
}
