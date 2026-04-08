// screens/onboarding/UploadPhotosScreen.tsx
import React, { useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Alert,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { ChevronLeft, Plus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import PrimaryButton from '@/components/common/PrimaryButton';
import { FieldError } from '@/components/common/FieldError';
import { sf, sw, sh, sr } from '@/utils/sizeMatters';
import { uploadPhotosFilledSchema } from '@/schemas/onboarding';
import {
  useSignupStore,
  selectPhotos,
  selectIsAnyPhotoUploading,
  selectGetPayload,
} from '@/store/signupStore';
import { useCompleteProfile } from '@/features/profile/hooks';
import { showToast } from '@/utils/toast';

// ─── Cloudinary config ────────────────────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME = 'du9dfydj4';
const CLOUDINARY_UPLOAD_PRESET = 'spark_expo_dating'; // unsigned preset

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getMimeType = (ext: string): string => {
  switch (ext.toLowerCase()) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'heic':
      return 'image/heic';
    case 'heif':
      return 'image/heif';
    default:
      return 'image/jpeg';
  }
};

/**
 * Upload image to Cloudinary with debug logs
 */
const uploadToCloudinary = async (localUri: string): Promise<string> => {
  const filename = localUri.split('/').pop() ?? 'photo.jpg';
  const ext = filename.split('.').pop() ?? 'jpg';
  const mimeType = getMimeType(ext);

  const body = new FormData();
  body.append('file', { uri: localUri, name: filename, type: mimeType } as any);
  body.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  console.log('[Cloudinary] Uploading:', filename, 'as', mimeType);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[Cloudinary Error]', JSON.stringify(err));
      throw new Error(
        (err as any)?.error?.message ?? `Upload failed (HTTP ${res.status})`,
      );
    }

    const data = await res.json();
    console.log('[Cloudinary] Upload success:', data.secure_url);
    return data.secure_url as string;
  } catch (error: any) {
    console.error('[Cloudinary Exception]', error);
    throw new Error(error?.message ?? 'Upload failed unexpectedly');
  }
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const UploadPhotosScreen = ({ navigation }: any) => {
  const { mutate: completeProfile, isPending: isCompleting } =
    useCompleteProfile();
    const resetStore = useSignupStore((state) => state.reset);
  const { width } = useWindowDimensions();
  const { hPad, gap, slotWidth, slotHeight } = useMemo(() => {
    const hp = sw(24);
    const g = sw(12);
    const slotW = (width - hp * 2 - g) / 2;
    return { hPad: hp, gap: g, slotWidth: slotW, slotHeight: slotW * 1.15 };
  }, [width]);

  const photos = useSignupStore(selectPhotos);
  const isAnyUploading = useSignupStore(selectIsAnyPhotoUploading);
  const getPayload = useSignupStore(selectGetPayload);
  const { setPhoto, patchPhoto } = useSignupStore();

  const [photosError, setPhotosError] = React.useState<string | undefined>();

  // ── Pick & Upload ────────────────────────────────────────────────────────────
  const handlePickedUri = async (index: number, uri: string) => {
    console.log('Uploading to Cloudinary start:', uri);
    setPhoto(index, {
      uri,
      cloudinaryUrl: '',
      isUploading: true,
      uploadError: null,
    });
    setPhotosError(undefined);

    try {
      console.log('Uploading to Cloudinary before:', uri);
      const cloudinaryUrl = await uploadToCloudinary(uri);
      patchPhoto(index, { cloudinaryUrl, isUploading: false });
    } catch (err: any) {
      patchPhoto(index, {
        isUploading: false,
        uploadError: err?.message ?? 'Upload failed. Tap to retry.',
      });
    }
  };

  const pickFromLibrary = async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      await handlePickedUri(index, result.assets[0].uri);
    }
  };

  const takePhoto = async (index: number) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      await handlePickedUri(index, result.assets[0].uri);
    }
  };

  const openPhotoSource = (index: number) => {
    Alert.alert('Add photo', 'Choose a source', [
      { text: 'Take Photo', onPress: () => takePhoto(index) },
      { text: 'Choose from Library', onPress: () => pickFromLibrary(index) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const retryUpload = async (index: number) => {
    const slot = photos[index];
    if (!slot) return;
    patchPhoto(index, { isUploading: true, uploadError: null });
    try {
      const cloudinaryUrl = await uploadToCloudinary(slot.uri);
      patchPhoto(index, { cloudinaryUrl, isUploading: false });
    } catch (err: any) {
      patchPhoto(index, {
        isUploading: false,
        uploadError: err?.message ?? 'Upload failed.',
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhoto(index, null);
    setPhotosError(undefined);
  };

  // ── Complete Profile ──────────────────────────────────────────────────────────
  const handleCompleteProfile = () => {
    if (isAnyUploading) {
      setPhotosError('Please wait for all photos to finish uploading.');
      return;
    }

    const hasUploadErrors = photos.some(
      (p) => p !== null && p.uploadError && !p.cloudinaryUrl,
    );
    if (hasUploadErrors) {
      setPhotosError('Some photos failed to upload. Tap to retry.');
      return;
    }

    const filledCount = photos.filter((p) => p?.cloudinaryUrl).length;
    const parsed = uploadPhotosFilledSchema.safeParse({ filledCount });
    if (!parsed.success) {
      setPhotosError(parsed.error.issues[0]?.message);
      return;
    }

    const payload = getPayload();
    setPhotosError(undefined);
    console.log(payload, 'console payload profile');
    // ✅ Call API
    completeProfile(payload, {
      onSuccess: (data) => {
        console.log(data, 'console data profile');
        showToast({ text1: 'Profile completed successfully' });
        resetStore();
        navigation.navigate('InviteScreen'); // next onboarding step
      },
      onError: (err: any) => {
        showToast({ text1: 'Failed to complete profile', text2: err.message });
      },
    });
  };

  // ── Slot renderer ─────────────────────────────────────────────────────────────
  const renderSlot = (index: number) => {
    const slot = photos[index];
    const filled = slot !== null;
    const isPrimary = index === 0 && filled;

    return (
      <View
        key={index}
        style={{ width: slotWidth, height: slotHeight, marginBottom: gap }}
      >
        {filled ? (
          <View style={{ width: slotWidth, height: slotHeight }}>
            <Image
              source={{ uri: slot!.uri }}
              style={{
                width: slotWidth,
                height: slotHeight,
                borderRadius: sr(16),
                borderWidth: 0.4,
                borderColor: '#A1A1A1',
              }}
              resizeMode='cover'
            />
            {slot!.isUploading && (
              <View
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.35)',
                  borderRadius: sr(16),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ActivityIndicator color='#fff' />
              </View>
            )}
            {slot!.uploadError && !slot!.isUploading && (
              <TouchableOpacity
                onPress={() => retryUpload(index)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(220,38,38,0.55)',
                  borderRadius: sr(16),
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: sh(4),
                  paddingHorizontal: sw(8),
                }}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontSize: sf(11),
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                >
                  Upload failed
                </Text>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: sf(10),
                    fontWeight: '400',
                    textAlign: 'center',
                  }}
                >
                  Tap to retry
                </Text>
              </TouchableOpacity>
            )}
            {isPrimary && !slot!.isUploading && !slot!.uploadError && (
              <View
                style={{
                  position: 'absolute',
                  bottom: sh(10),
                  left: sw(10),
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  paddingHorizontal: sw(10),
                  paddingVertical: sh(4),
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{ color: '#fff', fontSize: sf(12), fontWeight: '500' }}
                >
                  Primary
                </Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => removePhoto(index)}
              style={{
                position: 'absolute',
                top: sh(-9),
                right: sw(-9),
                width: sw(24),
                height: sw(24),
                borderRadius: sr(12),
                backgroundColor: '#1E78F5',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
            >
              <X
                size={sf(12)}
                color='#fff'
                strokeWidth={3}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => openPhotoSource(index)}
            activeOpacity={0.7}
            style={{
              width: slotWidth,
              height: slotHeight,
              borderRadius: sr(16),
              borderWidth: 0.4,
              borderColor: '#A1A1A1',
              borderStyle: 'dashed',
              alignItems: 'center',
              justifyContent: 'center',
              gap: sh(8),
              backgroundColor: '#FAFAFA',
            }}
          >
            <View
              style={{
                width: sw(17.5),
                height: sw(17.5),
                borderRadius: sr(16),
                backgroundColor: '#FBB202',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Plus
                size={sf(8.33)}
                color='#fff'
                strokeWidth={2.5}
              />
            </View>
            <Text
              style={{ fontSize: sf(14), color: '#FBB202', fontWeight: '500' }}
            >
              Add
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: hPad,
          paddingTop: sh(16),
          marginTop: sh(60),
        }}
      >
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <ChevronLeft
            size={sf(24)}
            color='#000000'
          />
        </TouchableOpacity>
        <View style={{ marginTop: sh(12), gap: sh(6) }}>
          <Text
            style={{ fontSize: sf(28), fontWeight: '600', color: '#000000' }}
          >
            Show your authentic self
          </Text>
          <Text
            style={{ fontSize: sf(15), fontWeight: '400', color: '#7D858E' }}
          >
            Add photos to start connecting (required before messaging).
          </Text>
        </View>
        <View style={{ marginTop: sh(28) }}>
          <View style={{ flexDirection: 'row', gap }}>
            {renderSlot(0)}
            {renderSlot(1)}
          </View>
          <View style={{ flexDirection: 'row', gap }}>
            {renderSlot(2)}
            {renderSlot(3)}
          </View>
        </View>
        <FieldError message={photosError} />
      </View>
      <View
        style={{
          paddingHorizontal: hPad,
          paddingBottom: sh(20),
          backgroundColor: '#fff',
        }}
      >
        <PrimaryButton
          title='Complete Profile!'
          onPress={handleCompleteProfile}
          disabled={isAnyUploading || isCompleting}
          colors={['#1E78F5', '#FBB202']}
          variant='gradient'
          style={{
            alignSelf: 'stretch',
            opacity: isAnyUploading || isCompleting ? 0.6 : 1,
          }}
          textStyle={{
            fontSize: sf(20),
            fontWeight: '500',
            lineHeight: sh(56),
          }}
        />
      </View>
    </View>
  );
};

export default UploadPhotosScreen;
