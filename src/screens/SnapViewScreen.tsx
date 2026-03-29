import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Keyboard,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { ChevronLeft } from 'lucide-react-native';
import CameraScreen from '@/screens/CameraScreen';
import PhotoPreviewScreen from '@/screens/PhotoPreviewScreen';
import { sf, sr, sw, sh } from '@/utils/responsive';

const SNAP_DURATION_SECONDS = 20;

export default function SnapViewScreen({ navigation, route }: any) {
  const snapUri: string | undefined = route?.params?.snapUri;
  const chatUserName: string = route?.params?.chatUserName ?? 'User';

  const [remainingSeconds, setRemainingSeconds] = useState(SNAP_DURATION_SECONDS);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

      <View style={{ position: 'absolute', left: sw(16), right: sw(16), bottom: sh(20), gap: sh(10) }}>
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
