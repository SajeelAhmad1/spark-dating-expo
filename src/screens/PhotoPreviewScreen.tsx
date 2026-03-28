import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  StyleSheet,
} from 'react-native';
import { X, Download } from 'lucide-react-native';
import PrimaryButton from '@/components/common/PrimaryButton';
import { sf, sr, sw, sh } from '@/utils/responsive';

interface PhotoPreviewScreenProps {
  visible: boolean;
  photoUri: string | null;
  isSending: boolean;
  onClose: () => void;
  onDownload: () => void;
  onSend: () => void;
}

export default function PhotoPreviewScreen({
  visible,
  photoUri,
  isSending,
  onClose,
  onDownload,
  onSend,
}: PhotoPreviewScreenProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      transparent={false}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
        {/* Fullscreen photo background */}
        {photoUri && (
          <Image
            source={{ uri: photoUri }}
            style={{
              ...StyleSheet.absoluteFillObject,
              width: '100%',
              height: '100%',
            }}
            resizeMode="cover"
          />
        )}

        {/* Header (over photo) */}
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

        {/* Bottom Buttons (over photo) */}
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
            paddingBottom: sh(40),
            paddingTop: sh(20),
            zIndex: 10,
          }}
        >
          {/* Download Button with Yellow Background */}
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

          {/* Send Button */}
          <View style={{ flex: 1 }}>
            <PrimaryButton
              title={isSending ? 'Sending...' : 'Send'}
              onPress={onSend}
              colors={['#1E78F5', '#FBB202']}
              variant="gradient"
              style={{ alignSelf: 'stretch' }}
              iconPosition="end"
              disabled={isSending}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
