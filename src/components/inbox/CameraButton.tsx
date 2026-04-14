// components/inbox/CameraButton.tsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import CameraIcon from '@/assets/images/cameraIcon.svg';
import { sf } from '@/utils/sizeMatters';

export default function CameraButton({ onPress }: { onPress?: () => void }) {
  const s = sf(52);
  return (
    <TouchableOpacity onPress={onPress}>
      <CameraIcon width={s} height={s} />
    </TouchableOpacity>
  );
}
