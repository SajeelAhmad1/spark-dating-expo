import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, Image, Alert, useWindowDimensions } from 'react-native';
import { Text } from '@/components/common/Text';
import { ChevronLeft, Plus, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import PrimaryButton from '@/components/common/PrimaryButton';
import { FieldError } from '@/components/common/FieldError';
import { sf, sw, sh, sr } from '@/utils/sizeMatters';
import { uploadPhotosFilledSchema } from '@/schemas/onboarding';

type PhotoSlot = { uri: string; isLocal: boolean } | null;

const UploadPhotosScreen = ({ navigation }: any) => {
  const { width } = useWindowDimensions();
  const { hPad, gap, slotWidth, slotHeight } = useMemo(() => {
    const hp = sw(24);
    const g = sw(12);
    const slotW = (width - hp * 2 - g) / 2;
    return { hPad: hp, gap: g, slotWidth: slotW, slotHeight: slotW * 1.15 };
  }, [width]);

  const [photos, setPhotos] = useState<PhotoSlot[]>([null, null, null, null]);
  const [photosError, setPhotosError] = useState<string | undefined>();

  const applyPickedUri = (index: number, uri: string | undefined) => {
    if (!uri) return;
    const updated = [...photos];
    updated[index] = { uri, isLocal: true };
    setPhotos(updated);
    setPhotosError(undefined);
  };

  const pickFromLibrary = async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (result.canceled) return;
    applyPickedUri(index, result.assets?.[0]?.uri);
  };

  const takePhoto = async (index: number) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled) return;
    applyPickedUri(index, result.assets?.[0]?.uri);
  };

  const openPhotoSource = (index: number) => {
    Alert.alert('Add photo', 'Choose a source', [
      { text: 'Take Photo', onPress: () => takePhoto(index) },
      { text: 'Choose from Library', onPress: () => pickFromLibrary(index) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const removePhoto = (index: number) => {
    const updated = [...photos];
    updated[index] = null;
    setPhotos(updated);
    setPhotosError(undefined);
  };

  const renderSlot = (index: number) => {
    const slot = photos[index];
    const filled = slot !== null;
    const isPrimary = index === 0 && filled;

    return (
      <View
        key={index}
        style={{
          width: slotWidth,
          height: slotHeight,
          marginBottom: gap,
        }}
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
              resizeMode="cover"
            />

            {isPrimary && (
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
                <Text style={{ color: '#fff', fontSize: sf(12), fontWeight: '500' }}>
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
                shadowColor: '#000',
                shadowOpacity: 0.15,
                shadowRadius: sr(4),
                shadowOffset: { width: 0, height: sh(2) },
                elevation: 4,
              }}
            >
              <X size={sf(12)} color="#fff" strokeWidth={3} />
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
              <Plus size={sf(8.33)} color="#fff" strokeWidth={2.5} />
            </View>
            <Text style={{ fontSize: sf(14), color: '#FBB202', fontWeight: '500' }}>
              Add
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1, paddingHorizontal: hPad, paddingTop: sh(16), marginTop: sh(60) }}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <ChevronLeft size={sf(24)} color="#000000" />
        </TouchableOpacity>

        <View style={{ marginTop: sh(12), gap: sh(6) }}>
          <Text style={{ fontSize: sf(28), fontWeight: '600', color: '#000000' }}>
            Show your authentic self
          </Text>
          <Text style={{ fontSize: sf(15), fontWeight: '400', color: '#7D858E' }}>
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
          // position: 'absolute',
          // bottom: 0,
          // left: 0,
          // right: 0,
          paddingHorizontal: hPad,
          paddingBottom: sh(20),
          backgroundColor: '#fff',
        }}
      >
        <PrimaryButton
          title="Complete Profile!"
          onPress={() => {
            const filledCount = photos.filter(Boolean).length;
            const parsed = uploadPhotosFilledSchema.safeParse({ filledCount });
            if (!parsed.success) {
              setPhotosError(parsed.error.issues[0]?.message);
              return;
            }
            setPhotosError(undefined);
            navigation.navigate('InviteScreen');
          }}
          colors={['#1E78F5', '#FBB202']}
          variant="gradient"
          style={{ alignSelf: 'stretch' }}
          textStyle={{ fontSize: sf(20), fontWeight: '500', lineHeight: sh(56) }}
        />
      </View>
    </View>
  );
};

export default UploadPhotosScreen;
