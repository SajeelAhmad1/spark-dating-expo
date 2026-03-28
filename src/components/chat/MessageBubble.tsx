import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import ChatAvatar from '@/components/chat/ChatAvatar';
import { Message } from '@/types/chat';
import { sf } from '@/utils/responsive';

export default function MessageBubble({
  message,
  friendAvatarUri,
  meAvatarUri,
}: {
  message: Message;
  friendAvatarUri?: string | null;
  meAvatarUri?: string | null;
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
          <ChatAvatar size={32} variant="me" imageUri={meAvatarUri} />
        ) : (
          <ChatAvatar size={32} variant="friend" imageUri={friendAvatarUri} />
        )}
        <Image
          source={{ uri: message.imageUri }}
          style={{ width: 148, height: 208, borderRadius: 16 }}
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
            marginBottom: 4,
            paddingHorizontal: 16,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: 8,
            }}
          >
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#1E78F5',
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  gap: 6,
                }}
              >
                <Text style={{ fontSize: sf(16), color: '#FFFFFF' }}>✦</Text>
                <Text
                  style={{
                    fontFamily: 'Poppins-Medium',
                    fontWeight: '500',
                    fontSize: sf(16),
                    lineHeight: 16,
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
                  gap: 4,
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Poppins-Regular',
                    fontWeight: '400',
                    fontSize: sf(10),
                    lineHeight: 10,
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
              <ChatAvatar size={40} variant="me" imageUri={meAvatarUri} />
          </View>
        </View>
      );
    }

    return (
      <View
        style={{
          alignItems: 'flex-start',
          marginBottom: 4,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
          <ChatAvatar size={40} variant="friend" imageUri={friendAvatarUri} />
          <View>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(251,178,2,0.2)',
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 10,
                gap: 6,
              }}
            >
              <Text style={{ fontSize: sf(16) }}>📷</Text>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontWeight: '500',
                  fontSize: sf(16),
                  lineHeight: 16,
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
                gap: 4,
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontWeight: '400',
                  fontSize: sf(10),
                  lineHeight: 10,
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
                    lineHeight: 10,
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
          marginBottom: 4,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
          <View style={{ alignItems: 'flex-end' }}>
            <View
              style={{
                backgroundColor: '#1E78F5',
                borderRadius: 20,
                borderBottomRightRadius: 4,
                paddingHorizontal: 16,
                paddingVertical: 10,
                maxWidth: 260,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontWeight: '400',
                  fontSize: sf(16),
                  lineHeight: 16,
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
                gap: 4,
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontWeight: '400',
                  fontSize: sf(10),
                  lineHeight: 10,
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
          <ChatAvatar size={40} variant="me" imageUri={meAvatarUri} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        alignItems: 'flex-start',
        marginBottom: 4,
        paddingHorizontal: 16,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
        <ChatAvatar size={40} variant="friend" imageUri={friendAvatarUri} />
        <View>
          <View
            style={{
              backgroundColor: 'rgba(251,178,2,0.2)',
              borderRadius: 20,
              borderBottomLeftRadius: 4,
              paddingHorizontal: 16,
              paddingVertical: 10,
              maxWidth: 260,
            }}
          >
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                fontWeight: '400',
                fontSize: sf(16),
                lineHeight: 16,
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
              lineHeight: 10,
              color: '#7D858E',
              marginTop: 4,
            }}
          >
            {message.time}
          </Text>
        </View>
      </View>
    </View>
  );
}

