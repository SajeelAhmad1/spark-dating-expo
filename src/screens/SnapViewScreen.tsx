import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Keyboard,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/components/common/Text";
import { ChevronLeft, Send, Image as ImageIcon } from "lucide-react-native";
import CameraScreen from "@/screens/CameraScreen";
import PhotoPreviewScreen from "@/screens/PhotoPreviewScreen";
import { sf, sr, sw, sh } from "@/utils/responsive";
import CameraIcon from "@/assets/images/cameraIcon.svg";
import { useZodForm } from "@/utils/form";
import { chatMessageFormSchema } from "@/schemas";
import * as ImagePicker from "expo-image-picker";
import { generateId, getTimeString } from "@/utils/chat";
import type { Message } from "@/types/chat";
import { INITIAL_MESSAGES } from "@/constants/chat";
import ChatAvatar from "@/components/chat/ChatAvatar";

const SNAP_DURATION_SECONDS = 20;

export default function SnapViewScreen({ navigation, route }: any) {
  const snapUri: string | undefined = route?.params?.snapUri;
  const chatUserName: string = route?.params?.chatUserName ?? "User";
  const { watch, setValue, handleSubmit, reset, trigger, formState } =
    useZodForm(chatMessageFormSchema, { defaultValues: { messageText: "" } });
  const messageText = watch("messageText");
  const messageError = formState.errors.messageText?.message;

  const [remainingSeconds, setRemainingSeconds] = useState(
    SNAP_DURATION_SECONDS,
  );
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
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setIsKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setIsKeyboardVisible(false),
    );
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
  };

  useEffect(() => {
    if (remainingSeconds <= 0) {
      navigation.goBack();
      return;
    }
    if (shouldPauseTimer) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [navigation, remainingSeconds, shouldPauseTimer]);

  return (
    // 1. Root fills the screen
    <View style={{ flex: 1 }}>
      {/* 2. Image fills the entire screen absolutely */}
      {snapUri ? (
        <Image
          source={{ uri: snapUri }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: sf(18) }}>
            Snap unavailable
          </Text>
        </View>
      )}

      {/* 3. Header overlaid on top — transparent bg */}
      <View
        style={{
          position: "absolute",
          top: sh(16),
          left: sw(16),
          right: sw(16),
          backgroundColor: "transparent",
          // paddingTop: sh(40),
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              gap: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <ChatAvatar
              size={sf(40)}
              variant="friend"
              imageUri={
                "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80"
              }
            />
            <Text
              style={{ color: "#FFFFFF", fontSize: sf(16), fontWeight: "600" }}
            >
              {chatUserName}
            </Text>
          </View>
          <Text
            style={{ color: "#FFFFFF", fontSize: sf(16), fontWeight: "600" }}
          >
            {remainingSeconds}s
          </Text>
        </View>
      </View>

      {/* 4. Bottom input bar absolutely pinned to bottom — transparent bg */}
      <View
        style={{
          position: "absolute", // ← key fix
          bottom: sh(16), // ← sits above safe area
          left: 0,
          right: 0,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: sw(16),
          paddingVertical: sh(8),
          gap: 14,
          backgroundColor: "transparent", // ← fully transparent
        }}
      >
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
              backgroundColor: "transparent",
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
            backgroundColor: "#FFFFFF", // ← semi-transparent so text is readable
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
              color: "#B6B9C9",
              padding: 0,
              height: sh(56),
              backgroundColor: "transparent",
            }}
          />

          <TouchableOpacity
            onPress={handleSendText}
            disabled={!messageText.trim()}
          >
            <Send size={sf(20)} color="#1E78F5" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <CameraScreen
        visible={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCapture={(uri) => {
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
    </View>
  );
}
