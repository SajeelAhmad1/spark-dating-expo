import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { ChevronLeft, Plus, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import PrimaryButton from '@/components/common/PrimaryButton';
import { sf } from '@/utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PADDING = 24;
const GAP = 12;
const SLOT_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - GAP) / 2;
const SLOT_HEIGHT = SLOT_WIDTH * 1.15;

type PhotoSlot = { uri: string; isLocal: boolean } | null;

const UploadPhotosScreen = ({ navigation }: any) => {
  const [photos, setPhotos] = useState<PhotoSlot[]>([null, null, null, null]);

  const pickImage = async (index: number) => {
    // Request permission first
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

    const uri = result.assets?.[0]?.uri;
    if (uri) {
      const updated = [...photos];
      updated[index] = { uri, isLocal: true };
      setPhotos(updated);
    }
  };

  const removePhoto = (index: number) => {
    const updated = [...photos];
    updated[index] = null;
    setPhotos(updated);
  };

  const renderSlot = (index: number) => {
    const slot = photos[index];
    const filled = slot !== null;
    const isPrimary = index === 0 && filled;

    return (
      <View
        key={index}
        style={{
          width: SLOT_WIDTH,
          height: SLOT_HEIGHT,
          marginBottom: GAP,
        }}
      >
        {filled ? (
          <View style={{ width: SLOT_WIDTH, height: SLOT_HEIGHT }}>
            <Image
              source={{ uri: slot!.uri }}
              style={{
                width: SLOT_WIDTH,
                height: SLOT_HEIGHT,
                borderRadius: 16,
                borderWidth: 0.4,
                borderColor: '#A1A1A1',
              }}
              resizeMode="cover"
            />

            {isPrimary && (
              <View style={{
                position: 'absolute',
                bottom: 10,
                left: 10,
                backgroundColor: 'rgba(0,0,0,0.5)',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
              }}>
                <Text style={{ color: '#fff', fontSize: sf(12), fontWeight: '500' }}>
                  Primary
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => removePhoto(index)}
              style={{
                position: 'absolute',
                top: -9,
                right: -9,
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#1E78F5',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                shadowColor: '#000',
                shadowOpacity: 0.15,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
                elevation: 4,
              }}
            >
              <X size={12} color="#fff" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => pickImage(index)}
            activeOpacity={0.7}
            style={{
              width: SLOT_WIDTH,
              height: SLOT_HEIGHT,
              borderRadius: 16,
              borderWidth: 0.4,
              borderColor: '#A1A1A1',
              borderStyle: 'dashed',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: '#FAFAFA',
            }}
          >
            <View style={{
              width: 17.5,
              height: 17.5,
              borderRadius: 16,
              backgroundColor: '#FBB202',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Plus size={8.33} color="#fff" strokeWidth={2.5} />
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1, paddingHorizontal: H_PADDING, paddingTop: 16 }}>

        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <ChevronLeft size={24} color="#000000" />
        </TouchableOpacity>

        <View style={{ marginTop: 12, gap: 6 }}>
          <Text style={{ fontSize: sf(28), fontWeight: '600', color: '#000000' }}>
            Show your authentic self
          </Text>
          <Text style={{ fontSize: sf(15), fontWeight: '400', color: '#7D858E' }}>
            Add photos to start connecting (required before messaging).
          </Text>
        </View>

        <View style={{ marginTop: 28 }}>
          <View style={{ flexDirection: 'row', gap: GAP }}>
            {renderSlot(0)}
            {renderSlot(1)}
          </View>
          <View style={{ flexDirection: 'row', gap: GAP }}>
            {renderSlot(2)}
            {renderSlot(3)}
          </View>
        </View>

      </View>

      <View style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        paddingHorizontal: H_PADDING,
        paddingBottom: 32,
        backgroundColor: '#fff',
      }}>
        <PrimaryButton
          title="Complete Profile!"
          onPress={() => { navigation.navigate('InviteScreen'); }}
          colors={['#1E78F5', '#FBB202']}
          variant="gradient"
          style={{ alignSelf: 'stretch' }}
          textStyle={{ fontSize: sf(20), fontWeight: '500' }}
        />
      </View>
    </SafeAreaView>
  );
};

export default UploadPhotosScreen;