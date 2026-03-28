import { sf } from '@/utils/responsive';
import React from 'react';
import { Image, Text, View } from 'react-native';

type ChatAvatarVariant = 'friend' | 'me';

interface ChatAvatarProps {
  size?: number;
  variant: ChatAvatarVariant;
  imageUri?: string | null;
}

export default function ChatAvatar({
  size = 40,
  variant,
  imageUri,
}: ChatAvatarProps) {
  const emoji = variant === 'friend' ? '👩' : '🧔';
  const backgroundColor = variant === 'friend' ? '#C8A882' : '#8B6F5E';
  const showImage = !!imageUri;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: showImage ? 'transparent' : backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {showImage ? (
        <Image
          source={{ uri: imageUri as string }}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      ) : (
        <Text style={{ fontSize: sf(size * 0.55) }}>{emoji}</Text>
      )}
    </View>
  );
}

