import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  StyleSheet,
} from 'react-native';
import { Text } from '@/components/common/Text';
import {
  ChevronLeft,
  MoreVertical,
  Clock,
  Image as ImageIcon,
  Send,
} from 'lucide-react-native';
import CameraIcon from '@/assets/images/cameraIcon.svg';
import PhotoPreviewScreen from './PhotoPreviewScreen';
import CameraScreen from './CameraScreen';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import * as MediaLibrary from 'expo-media-library';
import ChatAvatar from '@/components/chat/ChatAvatar';
import MessageBubble from '@/components/chat/MessageBubble';
import type { Message } from '@/types/chat';
import { INITIAL_MESSAGES } from '@/constants/chat';
import { generateId, getTimeString } from '@/utils/chat';
import { sf, sr, sw, sh } from '@/utils/responsive';
import { useZodForm } from '@/utils/form';
import { chatMessageFormSchema } from '@/schemas/messaging';
import { FieldError } from '@/components/common/FieldError';

export default function ChatScreen({ navigation, route }: any) {
  const chatUserName: string = route?.params?.chatUserName ?? 'Jenny';
  const chatUserImageUri: string | undefined = route?.params?.chatUserImageUri;
  const initialLocked: boolean = route?.params?.initialLocked ?? true;
  const initialPhotoUri: string | undefined = route?.params?.initialPhotoUri;
  const initialMessages: Message[] | undefined = route?.params?.initialMessages;
  const autoOpenCamera: boolean = !!route?.params?.autoOpenCamera;

  const [isLocked, setIsLocked] = useState(initialLocked);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (initialMessages) return initialMessages;
    if (initialPhotoUri) {
      return [
        ...INITIAL_MESSAGES,
        {
          id: generateId(),
          type: 'image',
          sender: 'me',
          imageUri: initialPhotoUri,
          time: getTimeString(),
          seen: false,
        },
      ];
    }
    return INITIAL_MESSAGES;
  });

  const { watch, setValue, handleSubmit, reset, trigger, formState } = useZodForm(
    chatMessageFormSchema,
    { defaultValues: { messageText: '' } },
  );

  const messageText = watch('messageText');
  const messageError = formState.errors.messageText?.message;

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSendingPhoto, setIsSendingPhoto] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  React.useEffect(() => {
    if (autoOpenCamera) {
      setIsCameraOpen(true);
    }
  }, [autoOpenCamera]);

  // ── Text send ──────────────────────────────────────────────────────────────

  const handleSendText = handleSubmit(data => {
    const trimmed = data.messageText.trim();
    const newMsg: Message = {
      id: generateId(),
      type: 'text',
      sender: 'me',
      text: trimmed,
      time: getTimeString(),
      seen: false,
    };

    setMessages(prev => [...prev, newMsg]);
    reset({ messageText: '' });
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  });

  // ── Camera flow ────────────────────────────────────────────────────────────

  const handlePhotoCapture = (uri: string) => {
    setCapturedPhotoUri(uri);
    setIsCameraOpen(false);
    setIsPreviewOpen(true);
  };

  // ── Gallery flow ───────────────────────────────────────────────────────────

  const handleOpenGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: false,
      base64: false,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;

      if (isLocked) setIsLocked(false);

      const imageMsg: Message = {
        id: generateId(),
        type: 'image',
        sender: 'me',
        imageUri: uri,
        time: getTimeString(),
      };

      setMessages(prev => [...prev, imageMsg]);
      setTimeout(
        () => scrollViewRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    }
  };

  // ── Camera photo send ──────────────────────────────────────────────────────

  const handleDownloadPhoto = async () => {
    if (!capturedPhotoUri) return;
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow gallery permission.');
        return;
      }
      await MediaLibrary.createAssetAsync(capturedPhotoUri);
      Alert.alert('Saved', 'Photo saved to your gallery.');
    } catch {
      Alert.alert('Error', 'Could not save photo.');
    }
  };

  const handleSendPhoto = async () => {
    if (!capturedPhotoUri) return;
    setIsSendingPhoto(true);

    await new Promise(res => setTimeout(res, 600));

    const snapMsg: Message = {
      id: generateId(),
      type: 'snap',
      sender: 'me',
      text: 'Photo',
      imageUri: capturedPhotoUri,
      time: getTimeString(),
      seen: false,
    };

    setMessages(prev => [...prev, snapMsg]);
    if (isLocked) setIsLocked(false);
    setIsSendingPhoto(false);
    setIsPreviewOpen(false);
    setCapturedPhotoUri(null);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ flex: 1 }}>

        {/* ── Nav Bar ── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: sw(16),
            paddingVertical: sh(12),
            backgroundColor: '#FFFFFF',
          }}
        >
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            style={{ marginRight: sw(12) }}
          >
            <ChevronLeft size={sf(24)} color="#7D858E" strokeWidth={2} />
          </TouchableOpacity>

          <ChatAvatar size={sf(40)} variant="friend" imageUri={chatUserImageUri} />

          <View style={{ flex: 1, marginLeft: sw(10) }}>
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                fontWeight: '400',
                fontSize: sf(20),
                lineHeight: sf(20),
                color: '#000000',
              }}
            >
              {chatUserName}
            </Text>
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                fontWeight: '400',
                fontSize: sf(12), 
                color: '#1E78F5',
                marginTop: sh(2),
              }}
            >
              Online
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: sw(12) }}>
            <Clock size={sf(14)} color="#7D858E" strokeWidth={2} />
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontWeight: '500',
                fontSize: sf(13),
                lineHeight: sf(13),
                color: '#7D858E',
              }}
            >
              23h
            </Text>
          </View>

          <TouchableOpacity>
            <MoreVertical size={sf(22)} color="#1E78F5" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* ── Messages ── */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingVertical: sh(12) }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: false })
          }
        >
          <View style={{ alignItems: 'center', marginBottom: sh(16) }}>
            <View
              style={{
                backgroundColor: 'rgba(0,0,0,0.06)',
                borderRadius: sr(99),
                paddingHorizontal: sw(14),
                paddingVertical: sh(4),
              }}
            >
              <Text style={{ fontFamily: 'Poppins-Regular', fontSize: sf(12), color: '#7D858E' }}>
                Today
              </Text>
            </View>
          </View>

          {messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={msg}
              friendAvatarUri={chatUserImageUri}
              onSnapPress={snapMessage => {
                if (snapMessage.sender === 'friend') {
                  navigation.navigate('SnapViewScreen', {
                    snapUri: snapMessage.imageUri ?? chatUserImageUri,
                    chatUserName,
                  });
                }
              }}
            />
          ))}
        </ScrollView>

        {/* ── Blur overlay ── */}
        {isLocked && (
          <View style={StyleSheet.absoluteFill}>
            <BlurView
              style={StyleSheet.absoluteFill}
              // blurType="light"
              // blurAmount={10}
              // overlayColor="rgba(251, 178, 2, 0.20)"
            />
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <Text style={{ fontSize: sf(40) }}>🔒</Text>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontWeight: '500',
                  fontSize: sf(32),
                  color: '#000000',
                }}
              >
                Chat Locked
              </Text>
            </View>
          </View>
        )}

        {/* ── Bottom bar ── */}
        {isLocked ? (
          <TouchableOpacity
            onPress={() => setIsCameraOpen(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              backgroundColor: '#FBB202',
              marginHorizontal: sw(16),
              marginBottom: sh(16),
              marginTop: sh(8),
              borderRadius: sr(99),
              paddingVertical: sh(16),
              paddingHorizontal: sw(20),
            }}
          >
            <Text style={{ fontSize: sf(20) }}>🔓</Text>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontWeight: '500',
                fontSize: sf(16),
                lineHeight: sf(16),
                color: '#000000',
              }}
            >
              Send Image to Unlock the chat
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: sw(16),
                paddingVertical: sh(12),
                gap: 14,
                backgroundColor: '#FFFFFF',
              }}
            >
              <TouchableOpacity
                onPress={() => setIsCameraOpen(true)}
                style={{
                  width: sw(56),
                  height: sh(56),
                  borderRadius: sr(92),
                  alignItems: 'center',
                  justifyContent: 'center',
                  // backgroundColor: '#FBB202',
                }}
              >
                <CameraIcon />
              </TouchableOpacity>

              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  height: sh(56),
                  borderRadius: sr(15),
                  borderWidth: 1,
                  borderColor: messageError ? '#DC2626' : '#B6B9C9',
                  paddingHorizontal: sw(16),
                  gap: 8,
                  backgroundColor: '#FFFFFF',
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.04,
                  shadowRadius: 24,
                  elevation: 1,
                }}
              >
                <TextInput
                  placeholder="Type a message..."
                  placeholderTextColor="#B6B9C9"
                  value={messageText}
                  onChangeText={v => setValue('messageText', v, { shouldValidate: true })}
                  onBlur={() => trigger('messageText')}
                  onSubmitEditing={handleSendText}
                  returnKeyType="send"
                  blurOnSubmit={false}
                  style={{
                    flex: 1,
                    fontFamily: 'Poppins-Regular',
                    fontWeight: '400',
                    fontSize: sf(16), 
                    color: '#000000',
                    padding: 0, 
                  }}
                />

                <TouchableOpacity onPress={handleOpenGallery}>
                  <ImageIcon size={sf(20)} color="#7D858E" strokeWidth={1.8} />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSendText} disabled={!messageText.trim()}>
                  <Send
                    size={sf(20)}
                    color={messageText.trim() ? '#1E78F5' : '#B6B9C9'}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ paddingHorizontal: sw(22), paddingBottom: sh(12) }}>
              <FieldError message={messageError} />
            </View>
          </>
        )}

        {/* ── Camera Screen ── */}
        <CameraScreen
          visible={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onPhotoCapture={handlePhotoCapture}
        />

        {/* ── Photo Preview Screen ── */}
        <PhotoPreviewScreen
          visible={isPreviewOpen}
          photoUri={capturedPhotoUri}
          isSending={isSendingPhoto}
          onClose={() => {
            setIsPreviewOpen(false);
            setCapturedPhotoUri(null);
          }}
          onDownload={handleDownloadPhoto}
          onSend={handleSendPhoto}
        />
      </View>
    </SafeAreaView>
  );
}