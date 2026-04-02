import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/common/Text';
import ChatAvatar from '@/components/chat/ChatAvatar';
import { Message } from '@/types/chat';
import { sf, sw, sh, sr } from '@/utils/sizeMatters';

export default function MessageBubble({
  message,
  friendAvatarUri,
  meAvatarUri,
  onSnapPress,
}: {
  message: Message;
  friendAvatarUri?: string | null;
  meAvatarUri?: string | null;
  onSnapPress?: (message: Message) => void;
}) {
  const isMe = message.sender === 'me';

  if (message.type === 'image') {
    return (
      <View
        style={{
          alignItems: isMe ? 'flex-end' : 'flex-start',
          marginBottom: 12,
          paddingHorizontal: 16,
          flexDirection: isMe ? 'row-reverse' : 'row',
          gap: 8,
          alignSelf: 'stretch',
        }}
      >
        {isMe ? (
          <ChatAvatar size={sf(40)} variant="me" imageUri={meAvatarUri} />
        ) : (
          <ChatAvatar size={sf(40)} variant="friend" imageUri={friendAvatarUri} />
        )}
        <Image
          source={{ uri: message.imageUri }}
          style={{ width: sw(148), height: sh(208), borderRadius: sr(12) }}
          resizeMode="cover"
        />
      </View>
    );
  }

  if (message.type === 'snap') {
    if (isMe) {
      return (
        <View
          style={{
            alignItems: 'flex-end',
            marginBottom: sh(4),
            paddingHorizontal: sw(16),
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: sw(8),
            }}
          >
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => onSnapPress?.(message)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#1E78F5',
                 borderBottomLeftRadius: sr(8), 
                borderTopRightRadius: sr(8),
                borderTopLeftRadius: sr(8),
                  paddingHorizontal: sw(16),
                  paddingVertical: sh(10),
                  gap: sw(6),
                }}
              >
                <Text style={{ fontSize: sf(16), color: '#FFFFFF' }}>✦</Text>
                <Text
                  style={{
                    fontFamily: 'Poppins-Medium',
                    fontWeight: '500',
                    fontSize: sf(16), 
                    color: '#FFFFFF',
                  }}
                >
                  {message.text}
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: sw(4),
                  marginTop: sh(4),
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Poppins-Regular',
                    fontWeight: '400',
                    fontSize: sf(10), 
                    color: '#7D858E',
                  }}
                >
                  {message.time}
                </Text>
                {message.seen && (
                  <Text style={{ fontSize: sf(10), color: '#7D858E' }}>✓✓</Text>
                )}
              </View>
            </View>
              <ChatAvatar size={sf(40)} variant="me" imageUri={meAvatarUri} />
          </View>
        </View>
      );
    }

    return (
      <View
        style={{
          alignItems: 'flex-start',
          marginBottom: sh(4),
          paddingHorizontal: sw(16),
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: sw(8) }}>
          <ChatAvatar size={sf(40)} variant="friend" imageUri={friendAvatarUri} />
          <View>
            <TouchableOpacity
              onPress={() => onSnapPress?.(message)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(251,178,2,0.2)',
                      borderBottomRightRadius: sr(8), 
                borderTopRightRadius: sr(8),
                borderTopLeftRadius: sr(8),
                paddingHorizontal: sw(14),
                paddingVertical: sh(10),
                gap: sw(6),
              }}
            >
              <Text style={{ fontSize: sf(16) }}>📷</Text>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontWeight: '500',
                  fontSize: sf(16), 
                  color: '#DC9B00',
                }}
              >
                {message.text}
              </Text>
            </TouchableOpacity>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: sw(4),
                marginTop: sh(4),
              }}
            >
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontWeight: '400',
                  fontSize: sf(10), 
                  color: '#DC9B00',
                }}
              >
                {message.time}
              </Text>
              {message.snapDuration && (
                <Text
                  style={{
                    fontFamily: 'Poppins-Regular',
                    fontWeight: '400',
                    fontSize: sf(10), 
                    color: '#DC9B00',
                  }}
                >
                  {message.snapDuration}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Text message
  if (isMe) {
    return (
      <View
        style={{
          alignItems: 'flex-end',
          marginBottom: sh(6),
          marginTop: sh(6),
          paddingHorizontal: sw(16),
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: sw(8) }}>
          <View style={{ alignItems: 'flex-end' }}>
            <View
              style={{
                backgroundColor: '#1E78F5', 
                borderBottomLeftRadius: sr(8), 
                borderTopRightRadius: sr(8),
                borderTopLeftRadius: sr(8),
                paddingHorizontal: sw(16),
                paddingVertical: sh(10),
                maxWidth: sw(260),
              }}
            >
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontWeight: '400',
                  fontSize: sf(16), 
                  color: '#FFFFFF',
                }}
              >
                {message.text}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: sw(4),
                marginTop: sh(4),
              }}
            >
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontWeight: '400',
                  fontSize: sf(10), 
                  color: '#7D858E',
                }}
              >
                {message.time}
              </Text>
              {message.seen && (
                <Text style={{ fontSize: sf(10), color: '#1E78F5' }}>✓✓</Text>
              )}
            </View>
          </View>
          <ChatAvatar size={sf(40)} variant="me" imageUri={meAvatarUri} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        alignItems: 'flex-start',
        marginBottom: sh(4),
        paddingHorizontal: sw(16),
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: sw(8) }}>
        <ChatAvatar size={sf(40)} variant="friend" imageUri={friendAvatarUri} />
        <View>
          <View
            style={{
              backgroundColor: 'rgba(251,178,2,0.2)',
                       borderBottomRightRadius: sr(8), 
                borderTopRightRadius: sr(8),
                borderTopLeftRadius: sr(8),
              paddingHorizontal: sw(16),
              paddingVertical: sh(10),
              maxWidth: sw(260),
            }}
          >
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                fontWeight: '400',
                fontSize: sf(16), 
                color: '#000000',
              }}
            >
              {message.text}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontWeight: '400',
              fontSize: sf(10), 
              color: '#7D858E',
              marginTop: sh(4),
            }}
          >
            {message.time}
          </Text>
        </View>
      </View>
    </View>
  );
}

