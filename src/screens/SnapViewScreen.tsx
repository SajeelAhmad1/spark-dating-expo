import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { ChevronLeft, Send, Image as ImageIcon, } from 'lucide-react-native';
import CameraScreen from '@/screens/CameraScreen';
import PhotoPreviewScreen from '@/screens/PhotoPreviewScreen';
import { sf, sr, sw, sh } from '@/utils/responsive';
import CameraIcon from "@/assets/images/cameraIcon.svg";
import { useZodForm } from '@/utils/form';
import { chatMessageFormSchema } from '@/schemas';
import * as ImagePicker from "expo-image-picker";
import { generateId, getTimeString } from "@/utils/chat";
import type { Message } from "@/types/chat";
import { INITIAL_MESSAGES } from "@/constants/chat";


const SNAP_DURATION_SECONDS = 20;

export default function SnapViewScreen({ navigation, route }: any) {
  
  const snapUri: string | undefined = route?.params?.snapUri;
  const chatUserName: string = route?.params?.chatUserName ?? 'User';
   const { watch, setValue, handleSubmit, reset, trigger, formState } =
      useZodForm(chatMessageFormSchema, { defaultValues: { messageText: "" } });
  const messageText = watch("messageText");
  const messageError = formState.errors.messageText?.message;
  

  const [remainingSeconds, setRemainingSeconds] = useState(SNAP_DURATION_SECONDS);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const initialPhotoUri: string | undefined = route?.params?.initialPhotoUri;
   const initialMessages: Message[] | undefined = route?.params?.initialMessages;
   const scrollViewRef = useRef<ScrollView>(null);



    const [messages, setMessages] = useState<Message[]>(() => {
      if (initialMessages) return initialMessages;
      if (initialPhotoUri) {
        return [
          ...INITIAL_MESSAGES,
          {
            id: generateId(),
            type: "image",
            sender: "me",
            imageUri: initialPhotoUri,
            time: getTimeString(),
            seen: false,
          },
        ];
      }
      return INITIAL_MESSAGES;
    });

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const shouldPauseTimer = useMemo(
    () => isKeyboardVisible || isInputFocused || isCameraOpen || isPreviewOpen,
    [isKeyboardVisible, isInputFocused, isCameraOpen, isPreviewOpen],
  );

    const handleSendText = handleSubmit((data) => {
      const trimmed = data.messageText.trim();
      const newMsg: Message = {
        id: generateId(),
        type: "text",
        sender: "me",
        text: trimmed,
        time: getTimeString(),
        seen: false,
      };
  
      setMessages((prev) => [...prev, newMsg]);
      reset({ messageText: "" });
      setTimeout(
        () => scrollViewRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    });

    
      const handleOpenGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          allowsMultipleSelection: false,
          base64: false,
        });
      }
  

  useEffect(() => {
    if (remainingSeconds <= 0) {
      navigation.goBack();
      return;
    }
    if (shouldPauseTimer) return;
    const timer = setInterval(() => {
      setRemainingSeconds(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [navigation, remainingSeconds, shouldPauseTimer]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      {snapUri ? (
        <Image source={{ uri: snapUri }} style={{ flex: 1 }} resizeMode="cover" />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontSize: sf(18) }}>Snap unavailable</Text>
        </View>
      )}

      <View style={{ position: 'absolute', top: sh(16), left: sw(16), right: sw(16) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={sf(26)} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ color: '#FFFFFF', fontSize: sf(16), fontWeight: '600' }}>
            {chatUserName}
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: sf(16), fontWeight: '600' }}>
            {remainingSeconds}s
          </Text>
        </View>
      </View>

      {/* <View style={{ position: 'absolute', left: sw(16), right: sw(16), bottom: sh(20), gap: sh(10) }}>
        <View
          style={{
            height: sh(56),
            borderRadius: sr(28),
            backgroundColor: 'rgba(255,255,255,0.95)',
            paddingHorizontal: sw(14),
            flexDirection: 'row',
            alignItems: 'center',
            gap: sw(10),
          }}
        >
          <TouchableOpacity onPress={() => setIsCameraOpen(true)}>
            <Text style={{ fontSize: sf(22) }}>📷</Text>
          </TouchableOpacity>
          <TextInput
            placeholder="Type a reply..."
            placeholderTextColor="#7D858E"
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            style={{ flex: 1, color: '#000000', fontSize: sf(15), padding: 0 }}
          />
        </View>
      </View> */}

      <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: sw(16),
                paddingVertical: sh(8),
                gap: 14,
                backgroundColor: "#FFFFFF",
              }}
            >
              {/* FIX 1: Camera icon constrained to exact dimensions */}
              <TouchableOpacity
                onPress={() => setIsCameraOpen(true)}
                style={{
                  width: sw(40),
                  height: sh(40),
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: sw(56),
                    height: sh(56),
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: sr(94),
                    borderWidth: 1,
                    borderColor: "transparent",
                  }}
                >
                  <CameraIcon />
                </View>
              </TouchableOpacity>

              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  height: sh(56),
                  borderRadius: sr(15),
                  borderWidth: 1,
                  borderColor: messageError ? "#DC2626" : "#B6B9C9",
                  paddingHorizontal: sw(16),
                  gap: 8,
                  backgroundColor: "#FFFFFF",
                  shadowColor: "#000000",
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
                  onChangeText={(v) =>
                    setValue("messageText", v, { shouldValidate: true })
                  }
                  onBlur={() => trigger("messageText")}
                  onSubmitEditing={handleSendText}
                  returnKeyType="send"
                  blurOnSubmit={false}
                  style={{
                    flex: 1,
                    fontFamily: "Poppins-Regular",
                    fontWeight: "400",
                    fontSize: sf(16),
                    color: "#000000",
                    padding: 0,
                    height: sh(56),
                  }}
                />

                <TouchableOpacity onPress={handleOpenGallery}>
                  <ImageIcon size={sf(20)} color="#7D858E" strokeWidth={1.8} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSendText}
                  disabled={!messageText.trim()}
                >
                  <Send
                    size={sf(20)}
                    color={messageText.trim() ? "#1E78F5" : "#B6B9C9"}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              </View>
            </View>

      <CameraScreen
        visible={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCapture={uri => {
          setCapturedPhotoUri(uri);
          setIsCameraOpen(false);
          setIsPreviewOpen(true);
        }}
      />
      <PhotoPreviewScreen
        visible={isPreviewOpen}
        photoUri={capturedPhotoUri}
        isSending={false}
        onClose={() => {
          setIsPreviewOpen(false);
          setCapturedPhotoUri(null);
        }}
        onDownload={() => {}}
        onSend={() => {
          setIsPreviewOpen(false);
          setCapturedPhotoUri(null);
        }}
      />
    </SafeAreaView>
  );
}
