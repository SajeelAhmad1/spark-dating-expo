import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, useWindowDimensions, StyleSheet } from 'react-native';
import { Text } from '@/components/common/Text';
import { X } from 'lucide-react-native';
import CameraScreen from './CameraScreen';
import PhotoPreviewScreen from './PhotoPreviewScreen';
import MatchTitle from '@/components/match/MatchTitle';
import PhotoStack from '@/components/match/PhotoStack';
import MessageInputBar from '@/components/match/MessageInputBar';
import { calculateMatchPhotoLayout } from '@/utils/match';
import { sf, sr, sw, sh } from '@/utils/responsive';
import { MATCHES } from '@/constants/matches';
import { useZodForm } from '@/utils/form';
import { matchCaptionFormSchema } from '@/schemas/messaging';
import * as MediaLibrary from 'expo-media-library';
import { showToast } from '@/utils/toast';

const MatchScreen = ({ navigation, route }: any) => {
  const match = route?.params?.match ?? MATCHES[0];
  const autoOpenCamera: boolean = !!route?.params?.autoOpenCamera;

  const [isCamOpen, setIsCamOpen] = useState(false);
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const { watch, setValue, getValues, trigger, formState } = useZodForm(
    matchCaptionFormSchema,
    { defaultValues: { inputMessage: '' } },
  );
  const inputMessage = watch('inputMessage');
  const captionError = formState.errors.inputMessage?.message;
  const [isSending, setIsSending] = useState(false);
  const { width } = useWindowDimensions();

  const { PHOTO_WIDTH, PHOTO_HEIGHT, CONTAINER_HEIGHT } =
    calculateMatchPhotoLayout(width);

  useEffect(() => {
    if (autoOpenCamera) setIsCamOpen(true);
  }, [autoOpenCamera]);

  const closeCameraAndPreview = () => {
    setIsCamOpen(false);
    setIsPhotoPreviewOpen(false);
    setCapturedPhoto(null);
    navigation.replace('DiscoveryScreen');
  };

  // Function to send photo message
  const sendPhotoMessage = async (photoUri: string) => {
    const captionOk = matchCaptionFormSchema.safeParse({
      inputMessage: getValues().inputMessage,
    });
    if (!captionOk.success) {
      trigger('inputMessage');
      return;
    }
    try {
      setIsSending(true);
      
      // Upload to server (uncomment and configure as needed)
      /*
      const formData = new FormData();
      formData.append('photo', {
        uri: photoUri,
        type: 'image/jpeg',
        name: `photo_${Date.now()}.jpg`,
      });
      formData.append('message', inputMessage);
      
      const response = await fetch('YOUR_API_ENDPOINT/messages', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      */
      
      // For demo purposes, simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Photo sent:', photoUri);
      console.log('Message:', inputMessage);
      
      // Clear after successful send
      setCapturedPhoto(null);
      setValue('inputMessage', '');
      setIsPhotoPreviewOpen(false);

      // Move to chat with the same user that was selected on Discovery.
      navigation.navigate('ChatScreen', {
        chatUserName: match.name,
        chatUserImageUri: match.image,
        initialPhotoUri: photoUri,
        initialLocked: false,
      });
      
    } catch (error) {
      console.error('Error sending photo:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Function to download photo
  const downloadPhoto = async () => {
    if (!capturedPhoto) return;
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      showToast('Please allow gallery permission', 'error');
      return;
    }
    await MediaLibrary.createAssetAsync(capturedPhoto);
    showToast('Photo saved');
  };

  // Function to handle captured photo from camera
  const handlePhotoCapture = (photoUri: string) => {
    setCapturedPhoto(photoUri);
    setIsPhotoPreviewOpen(true);
  };

  // Function to handle send button from preview screen
  const handleSendPhoto = () => {
    if (capturedPhoto) {
      sendPhotoMessage(capturedPhoto);
    }
  };

  // Function to close preview
  const handleClosePreview = () => {
    setIsPhotoPreviewOpen(false);
    setCapturedPhoto(null);
    setValue('inputMessage', '');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBB202' }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          paddingHorizontal: sw(24),
          paddingTop: sh(28),
          paddingBottom: sh(24),
        }}
      >
        <MatchTitle />

        <PhotoStack
          screenWidth={width}
          photoWidth={PHOTO_WIDTH}
          photoHeight={PHOTO_HEIGHT}
          containerHeight={CONTAINER_HEIGHT}
        />

        {/* ── Subtitle ── */}
        <Text
          style={[styles.matchSubtitle, { fontSize: sf(16) }]}
          weight="medium"
        >
          {`You and ${match.name} liked each other.`}
        </Text>

        <MessageInputBar
          value={inputMessage}
          onChangeText={v => setValue('inputMessage', v, { shouldValidate: true })}
          onOpenCamera={() => setIsCamOpen(true)}
          errorMessage={captionError}
        />

        {/* Camera Modal */}
        <CameraScreen
          visible={isCamOpen}
          onClose={() => setIsCamOpen(false)}
          onPhotoCapture={handlePhotoCapture}
        />

        {/* Photo Preview Modal */}
        <PhotoPreviewScreen
          visible={isPhotoPreviewOpen}
          photoUri={capturedPhoto}
          isSending={isSending}
          onClose={handleClosePreview}
          onDownload={downloadPhoto}
          onSend={handleSendPhoto}
        />

        {/* ── Close button ── */}
        <TouchableOpacity
          onPress={closeCameraAndPreview}
          style={{
            width: sf(40),
            height: sf(40),
            borderRadius: sr(20),
            backgroundColor: '#1E78F5',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={sf(18)} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  matchSubtitle: { color: '#000000', marginBottom: sh(16), textAlign: 'center', fontWeight: '500'},
});

export default MatchScreen;
