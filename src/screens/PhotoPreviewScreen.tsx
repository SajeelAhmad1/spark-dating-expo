import React, { useRef } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  StyleSheet,
} from 'react-native';
import { X, Download } from 'lucide-react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import PrimaryButton from '@/components/common/PrimaryButton';
import { sf, sr, sw, sh } from '@/utils/sizeMatters';

interface PhotoPreviewScreenProps {
  visible: boolean;
  mediaUri: string | null;
  mediaType?: 'photo' | 'video';
  isSending: boolean;
  onClose: () => void;
  onDownload: () => void;
  onSend: () => void;
}

export default function PhotoPreviewScreen({
  visible,
  mediaUri,
  mediaType = 'photo',
  isSending,
  onClose,
  onDownload,
  onSend,
}: PhotoPreviewScreenProps) {
  const player = useVideoPlayer(mediaType === 'video' && mediaUri ? mediaUri : null, p => {
    p.loop = true;
    p.play();
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      transparent={false}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>

        {/* Fullscreen media background */}
        {mediaUri && mediaType === 'photo' && (
          <Image
            source={{ uri: mediaUri }}
            style={{
              ...StyleSheet.absoluteFillObject,
              width: '100%',
              height: '100%',
            }}
            resizeMode="cover"
          />
        )}

        {mediaUri && mediaType === 'video' && (
          <VideoView
            player={player}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            nativeControls={false}
          />
        )}

        {/* Header */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingHorizontal: sw(20),
            paddingTop: sh(60),
            zIndex: 10,
          }}
        >
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: sf(40),
              height: sf(40),
              borderRadius: sr(20),
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={sf(20)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Bottom Buttons */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: sw(20),
            paddingHorizontal: sw(20),
            paddingBottom: sh(20),
            paddingTop: sh(20),
            zIndex: 10,
            backgroundColor: 'rgba(251, 178, 2, 0.2)',
          }}
        >
          <TouchableOpacity
            onPress={onDownload}
            style={{
              width: sf(60),
              height: sf(60),
              borderRadius: sr(30),
              backgroundColor: '#FBB202',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            disabled={isSending}
          >
            <Download size={sf(28)} color="#000000" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <PrimaryButton
              title={isSending ? 'Sending...' : 'Send'}
              onPress={onSend}
              colors={['#1E78F5', '#FBB202']}
              variant="gradient"
              style={{ alignSelf: 'stretch' }}
              iconPosition="end"
              // icon={<Send size={sf(20)} color="#FFFFFF" />}
              disabled={isSending}
            />
          </View>
        </View>

      </SafeAreaView>
    </Modal>
  );
}
