import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, useWindowDimensions } from 'react-native';
import { X } from 'lucide-react-native';
import CameraScreen from './CameraScreen';
import PhotoPreviewScreen from './PhotoPreviewScreen';
import MatchTitle from '@/components/match/MatchTitle';
import PhotoStack from '@/components/match/PhotoStack';
import MessageInputBar from '@/components/match/MessageInputBar';
import { calculateMatchPhotoLayout } from '@/utils/match';
import { sf, sr, sw, sh } from '@/utils/responsive';
import { MATCHES } from '@/constants/matches';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const MatchScreen = ({ navigation, route }: any) => {
  const match = route?.params?.match ?? MATCHES[0];
  const autoOpenCamera: boolean = !!route?.params?.autoOpenCamera;

  const [isCamOpen, setIsCamOpen] = useState(false);
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const inputMessageSchema = z.string();
  const { watch, setValue, getValues } = useForm<{
    inputMessage: string;
  }>({
    defaultValues: { inputMessage: '' },
  });
  const inputMessage = watch('inputMessage');
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
  };

  // Function to send photo message
  const sendPhotoMessage = async (photoUri: string) => {
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
      const messageResult = inputMessageSchema.safeParse(getValues().inputMessage);
      if (!messageResult.success) {
        // eslint-disable-next-line no-console
        console.warn('Message validation failed', messageResult.error.flatten());
      }
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
  const downloadPhoto = () => {
    if (capturedPhoto) {
      // Implement download functionality
      console.log('Downloading photo:', capturedPhoto);
      // You can use react-native-fs or similar library to save to device
    }
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
          style={{
            lineHeight: sf(20),
            fontSize: sf(16),
          }}
          className='font-medium text-[#000000] mb-4 text-center'
        >
          {`You and ${match.name} liked each other.`}
        </Text>

        <MessageInputBar
          value={inputMessage}
          onChangeText={v => setValue('inputMessage', v)}
          onOpenCamera={() => setIsCamOpen(true)}
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

export default MatchScreen;
