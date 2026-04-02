import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import {
  Cross,
  FlashlightIcon,
  FlashlightOffIcon,
  GalleryVerticalIcon,
  FlipHorizontal,
} from 'lucide-react-native';
import { sf, sr, sw, sh } from '@/utils/sizeMatters';
import PhotoPreviewScreen from './PhotoPreviewScreen';

interface CameraScreenProps {
  visible: boolean;
  onClose: () => void;
  onPhotoCapture?: (photoUri: string) => void;
  onVideoCapture?: (videoUri: string) => void;
}

export default function CameraScreen({
  visible,
  onClose,
  onPhotoCapture,
  onVideoCapture,
}: CameraScreenProps) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [cameraMode, setCameraMode] = useState<'picture' | 'video'>('picture');
  const [isPickingImage, setIsPickingImage] = useState(false);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordingSeconds(0);
  };

  // Clear timer if component unmounts mid-recording
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ── Preview state ──────────────────────────────────────────────────────────
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'photo' | 'video'>('photo');
  const [previewVisible, setPreviewVisible] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const hasPermission = permission?.granted ?? false;
  const isRecordingRef = useRef(false);
  const longPressTriggeredRef = useRef(false);

  const toggleFlip = () => setFacing(f => (f === 'back' ? 'front' : 'back'));
  const toggleFlash = () => setFlashEnabled(f => !f);

  const openPreview = (uri: string, type: 'photo' | 'video') => {
    setPreviewUri(uri);
    setPreviewType(type);
    setPreviewVisible(true);
  };

  const closePreview = () => {
    setPreviewVisible(false);
    setPreviewUri(null);
  };

  const handlePreviewSend = () => {
    if (!previewUri) return;
    if (previewType === 'photo') {
      onPhotoCapture?.(previewUri);
    } else {
      onVideoCapture?.(previewUri);
    }
    setPreviewVisible(false);
    onClose();
  };

  const handlePreviewDownload = () => {
    console.log('Download:', previewUri);
  };

  // ── Photo ──────────────────────────────────────────────────────────────────

  const takePhoto = async () => {
    if (!cameraRef.current || !hasPermission) return;
    if (isRecordingRef.current) return;

    try {
      setIsTakingPhoto(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      if (photo?.uri) {
        openPreview(photo.uri, 'photo');
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
    } finally {
      setIsTakingPhoto(false);
    }
  };

  // ── Video ──────────────────────────────────────────────────────────────────

  const startRecording = async () => {
    if (!cameraRef.current || !hasPermission) return;
    if (isRecordingRef.current) return;

    try {
      setCameraMode('video');
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!longPressTriggeredRef.current) return;

      isRecordingRef.current = true;
      setIsRecordingVideo(true);
      startTimer(); // ← start timer when recording begins

      const result = await cameraRef.current.recordAsync();

      if (result?.uri) {
        openPreview(result.uri, 'video');
      }
    } catch (error) {
      console.error('Failed to record video:', error);
    } finally {
      isRecordingRef.current = false;
      setIsRecordingVideo(false);
      setCameraMode('picture');
      stopTimer(); // ← stop timer when recording ends
    }
  };

  const stopRecording = () => {
    if (!isRecordingRef.current) return;
    cameraRef.current?.stopRecording();
  };

  // ── Gallery ────────────────────────────────────────────────────────────────

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
        openPreview(result.assets[0].uri, 'photo');
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
    <>
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
                active={visible && !previewVisible}
                mode={cameraMode}
                mute={true}
              />

              {isTakingPhoto && (
                <View style={styles.capturingOverlay}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
              )}

              {/* ── Recording badge + timer ── */}
              {isRecordingVideo && (
                <View style={styles.recordingBadge}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingText}>REC</Text>
                  <Text style={styles.timerText}>{formatTime(recordingSeconds)}</Text>
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
                  disabled={isPickingImage || isRecordingVideo}
                >
                  {isPickingImage
                    ? <ActivityIndicator size="small" color="#FFFFFF" />
                    : <GalleryVerticalIcon size={24} color="#FFFFFF" />
                  }
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.shutterButton,
                    isRecordingVideo && styles.shutterButtonRecording,
                  ]}
                  onPress={() => {
                    if (longPressTriggeredRef.current || isRecordingRef.current) return;
                    takePhoto();
                  }}
                  onLongPress={() => {
                    longPressTriggeredRef.current = true;
                    startRecording();
                  }}
                  onPressOut={() => {
                    if (longPressTriggeredRef.current) {
                      longPressTriggeredRef.current = false;
                      stopRecording();
                    }
                  }}
                  disabled={isTakingPhoto}
                >
                  <View
                    style={[
                      styles.shutterInner,
                      isRecordingVideo && styles.shutterInnerRecording,
                    ]}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={toggleFlip}
                  disabled={isTakingPhoto || isRecordingVideo}
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

      <PhotoPreviewScreen
        visible={previewVisible}
        mediaUri={previewUri}
        mediaType={previewType}
        isSending={false}
        onClose={closePreview}
        onDownload={handlePreviewDownload}
        onSend={handlePreviewSend}
      />
    </>
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
  shutterButtonRecording: {
    borderColor: '#FF3B30',
  },
  shutterInner: {
    width: sf(56),
    height: sf(56),
    borderRadius: sr(28),
    backgroundColor: '#FFFFFF',
  },
  shutterInnerRecording: {
    width: sf(28),
    height: sf(28),
    borderRadius: sr(6),
    backgroundColor: '#FF3B30',
  },
  capturingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  recordingBadge: {
    position: 'absolute',
    top: sh(55),
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sw(6),
    zIndex: 10,
  },
  recordingDot: {
    width: sf(8),
    height: sf(8),
    borderRadius: sr(4),
    backgroundColor: '#FF3B30',
  },
  recordingText: {
    color: '#FF3B30',
    fontSize: sf(12),
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 1,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: sf(12),
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 1,
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
