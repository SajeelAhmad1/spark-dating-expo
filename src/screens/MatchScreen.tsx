import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, useWindowDimensions, StyleSheet } from 'react-native';
import { Text } from '@/components/common/Text';
import { X } from 'lucide-react-native';
import CameraScreen from './CameraScreen';
import MatchTitle from '@/components/match/MatchTitle';
import PhotoStack from '@/components/match/PhotoStack';
import MessageInputBar from '@/components/match/MessageInputBar';
import { calculateMatchPhotoLayout } from '@/utils/match';
import { sf, sr, sw, sh } from '@/utils/responsive';
import { MATCHES } from '@/constants/matches';
import { useZodForm } from '@/utils/form';
import { matchCaptionFormSchema } from '@/schemas/messaging';

const MatchScreen = ({ navigation, route }: any) => {
  const match = route?.params?.match ?? MATCHES[0];
  const autoOpenCamera: boolean = !!route?.params?.autoOpenCamera;

  const [isCamOpen, setIsCamOpen] = useState(false);
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
    navigation.replace('DiscoveryScreen');
  };

  // ── Send media (photo or video URI) ───────────────────────────────────────
  // Called AFTER the user confirms send inside CameraScreen's internal preview.
  // Do NOT open any additional preview here.

  const sendMedia = async (mediaUri: string) => {
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
        uri: mediaUri,
        type: 'image/jpeg',
        name: `media_${Date.now()}.jpg`,
      });
      formData.append('message', inputMessage);
      const response = await fetch('YOUR_API_ENDPOINT/messages', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (!response.ok) throw new Error('Upload failed');
      */

      await new Promise(resolve => setTimeout(resolve, 1000));

      setValue('inputMessage', '');

      navigation.navigate('ChatScreen', {
        chatUserName: match.name,
        chatUserImageUri: match.image,
        initialPhotoUri: mediaUri,
        initialLocked: false,
      });
    } catch (error) {
      console.error('Error sending media:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handlePhotoCapture = (photoUri: string) => {
    sendMedia(photoUri);
  };

  const handleVideoCapture = (videoUri: string) => {
    sendMedia(videoUri);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FBB202', paddingBottom: sh(20) }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          paddingHorizontal: sw(24),
          paddingTop: sh(40),
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

        {/* Camera Screen (handles preview internally) */}
        <CameraScreen
          visible={isCamOpen}
          onClose={() => setIsCamOpen(false)}
          onPhotoCapture={handlePhotoCapture}
          onVideoCapture={handleVideoCapture}
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
    </View>
  );
};

const styles = StyleSheet.create({
  matchSubtitle: { color: '#000000', marginBottom: sh(16), textAlign: 'center', fontWeight: '500' },
});

export default MatchScreen;
