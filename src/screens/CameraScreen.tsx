import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Cross, FlashlightIcon, FlashlightOffIcon, GalleryVerticalIcon, FlipHorizontal } from 'lucide-react-native';
import { sf, sr, sw, sh } from '@/utils/responsive';

interface CameraScreenProps {
  visible: boolean;
  onClose: () => void;
  onPhotoCapture?: (photoUri: string) => void;
}

export default function CameraScreen({ visible, onClose, onPhotoCapture }: CameraScreenProps) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const hasPermission = permission?.granted ?? false;

  const toggleFlip = () => setFacing(f => (f === 'back' ? 'front' : 'back'));
  const toggleFlash = () => setFlashEnabled(f => !f);

  const takePhoto = async () => {
    if (!cameraRef.current || !hasPermission) return;

    try {
      setIsTakingPhoto(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (photo?.uri) {
        onPhotoCapture?.(photo.uri);
        onClose();
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const openGallery = async () => {
    setIsPickingImage(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: false,
        base64: false,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        onPhotoCapture?.(result.assets[0].uri);
        onClose();
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
    } finally {
      setIsPickingImage(false);
    }
  };

  React.useEffect(() => {
    if (visible && !hasPermission) {
      requestPermission();
    }
  }, [visible, hasPermission]);

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <StatusBar barStyle="light-content" backgroundColor="#000" hidden />
      <View style={styles.fullScreenContainer}>
        {hasPermission ? (
          <>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={facing}
              flash={flashEnabled ? 'on' : 'off'}
              active={visible}
              // enableZoomGesture
            />

            {isTakingPhoto && (
              <View style={styles.capturingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            )}

            <View style={styles.topControls}>
              <TouchableOpacity style={styles.controlButton} onPress={onClose}>
                <Cross size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
                {flashEnabled
                  ? <FlashlightIcon size={24} color="#FFFFFF" />
                  : <FlashlightOffIcon size={24} color="#FFFFFF" />
                }
              </TouchableOpacity>
            </View>

            <View style={styles.bottomControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={openGallery}
                disabled={isPickingImage}
              >
                {isPickingImage ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <GalleryVerticalIcon size={24} color="#FFFFFF" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shutterButton}
                onPress={takePhoto}
                disabled={isTakingPhoto}
              >
                <View style={styles.shutterInner} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={toggleFlip}
                disabled={isTakingPhoto}
              >
                <FlipHorizontal size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>
              {permission === null
                ? 'Requesting camera permission...'
                : 'Camera permission required'}
            </Text>
            {permission !== null && !hasPermission && (
              <TouchableOpacity onPress={requestPermission} style={styles.grantButton}>
                <Text style={styles.grantButtonText}>Grant Permission</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: sw(20),
    paddingTop: sh(50),
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: sw(30),
    paddingBottom: sh(40),
  },
  controlButton: {
    width: sf(50),
    height: sf(50),
    borderRadius: sr(25),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterButton: {
    width: sf(72),
    height: sf(72),
    borderRadius: sr(36),
    borderWidth: sf(4),
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  shutterInner: {
    width: sf(56),
    height: sf(56),
    borderRadius: sr(28),
    backgroundColor: '#FFFFFF',
  },
  capturingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    padding: sw(20),
  },
  permissionText: {
    color: '#888',
    fontFamily: 'Poppins-Regular',
    fontSize: sf(16),
    marginBottom: sh(20),
    textAlign: 'center',
  },
  grantButton: {
    paddingHorizontal: sw(24),
    paddingVertical: sh(12),
    borderRadius: 999,
    backgroundColor: '#1E78F5',
  },
  grantButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: sf(14),
  },
});