import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from '@/components/common/Text';
import RefreshControl from '@/components/common/RefreshControl';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {
  Settings,
  Plus,
  X,
  ChevronDown,
  PencilLine,
} from 'lucide-react-native';
import { sf, sr, sw, sh } from '@/utils/sizeMatters';
import ETHNICITIES from '@/constants/ethnicities';
import HEIGHTS from '@/constants/heights';
import GENDER from '@/constants/gender';
import * as ImagePicker from 'expo-image-picker';
import { useZodForm } from '@/utils/form';
import {
  createEditProfileSchema,
  type EditProfileFormValues,
} from '@/schemas/editProfile';
import { FieldError } from '@/components/common/FieldError';
import { showToast } from '@/utils/toast';
import { useEditProfile, useMe } from '@/features/profile/hooks';
import { useInterestStore } from '@/store/interestStore';
import { uploadToCloudinary, deleteFromCloudinary } from '@/utils/cloudinary';
import type { EditProfileDto } from '@/features/profile/schema';

const MAX_INTERESTS = 5;

// ── Types ─────────────────────────────────────────────────────────────────────

type DropdownField = 'gender' | 'height' | 'ethnicity' | null;

interface PhotoItem {
  url: string;
  publicId: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (date: Date): string =>
  `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

function buildEditDto(
  values: EditProfileFormValues,
  photos: PhotoItem[],
): EditProfileDto {
  const dto: EditProfileDto = {};

  // Always include name fields if non-empty
  if (values.firstName?.trim()) dto.firstName = values.firstName.trim();
  if (values.lastName?.trim()) dto.lastName = values.lastName.trim();

  // Bio: include even if empty string (user may have cleared it)
  if (values.bio !== undefined) dto.bio = values.bio;

  // Gender: lowercase to match backend enum
  if (values.gender)
    dto.gender = values.gender.toLowerCase() as EditProfileDto['gender'];

  // Height: extract numeric value from string like "170 cm"
  if (values.height) {
    const num = Number(String(values.height).replace(/[^\d]/g, ''));
    if (num > 0) dto.height = num;
  }

  if (values.ethnicity) dto.ethnicity = values.ethnicity;

  if (photos.length) dto.photos = photos;
  if (values.birthday) {
    const d = values.birthday;
    dto.dob = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  return dto;
}

// ── Interests picker modal ────────────────────────────────────────────────────
// Sends NAMES (not IDs) to the backend, matching EditProfileDtoSchema

function InterestPickerModal({
  visible,
  currentNames,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  currentNames: string[];
  onConfirm: (names: string[]) => void;
  onClose: () => void;
  isSaving: boolean;
}) {
  const { interests } = useInterestStore();
  const [selected, setSelected] = useState<string[]>(currentNames);

  React.useEffect(() => {
    if (visible) setSelected(currentNames);
  }, [visible]);

  const categories = useMemo(() => {
    const map = new Map<string, { name: string; icon?: string | null }[]>();
    for (const item of interests) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push({ name: item.name, icon: item.icon });
    }
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  }, [interests]);

  const toggle = (name: string) => {
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name);
      if (prev.length >= MAX_INTERESTS) return prev;
      return [...prev, name];
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
        <View
          onStartShouldSetResponder={() => true}
          style={{
            backgroundColor: '#F7F3ED',
            borderTopLeftRadius: sr(24),
            borderTopRightRadius: sr(24),
            maxHeight: '90%',
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: sw(20),
              paddingTop: sh(20),
              paddingBottom: sh(4),
            }}
          >
            <View style={{ gap: sh(4) }}>
              <Text style={{ fontSize: sf(28), fontWeight: '600', color: '#000000' }}>
                Your Interests
              </Text>
              <Text style={{ fontSize: sf(15), fontWeight: '400', color: '#7D858E' }}>
                Choose at least 3 interests (max {MAX_INTERESTS})
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ alignSelf: 'flex-start', marginTop: sh(4) }}>
              <X size={sf(22)} color='#7D858E' />
            </TouchableOpacity>
          </View>

          {/* Chips */}
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: sw(20), paddingTop: sh(24), paddingBottom: sh(16), gap: sh(24) }}
            showsVerticalScrollIndicator={false}
          >
            {categories.map(({ category, items }) => (
              <View key={category}>
                <Text
                  style={{
                    fontSize: sf(15),
                    fontWeight: '600',
                    color: '#0B0B0B',
                    marginBottom: sh(12),
                  }}
                >
                  {category}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {items.map((item) => {
                    const isSelected = selected.includes(item.name);
                    return (
                      <TouchableOpacity
                        key={item.name}
                        onPress={() => toggle(item.name)}
                        style={{
                          paddingHorizontal: sw(14),
                          borderRadius: 999,
                          borderWidth: isSelected ? 1 : 0.9,
                          borderColor: isSelected ? '#CEB98F' : '#7D858E',
                          backgroundColor: isSelected ? '#EAD6A9' : 'transparent',
                          height: 40,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'row',
                          gap: sw(6),
                        }}
                      >
                        {!!item.icon && (
                          <Text style={{ fontSize: sf(14), lineHeight: sf(18) }}>
                            {item.icon}
                          </Text>
                        )}
                        <Text
                          style={{
                            fontSize: sf(14),
                            fontWeight: '400',
                            color: isSelected ? '#0B0B0B' : '#404040',
                            lineHeight: 40,
                          }}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={{ paddingHorizontal: sw(24), paddingBottom: sh(65), paddingTop: sh(8), gap: sh(6) }}>
            {selected.length < 3 && (
              <Text style={{ textAlign: 'center', fontSize: sf(12), color: '#7D858E' }}>
                Select at least 3 interests
              </Text>
            )}
            <TouchableOpacity
              onPress={() => onConfirm(selected)}
              disabled={selected.length < 3}
              style={{
                backgroundColor: selected.length < 3 ? '#CCCCCC' : '#CEB98F',
                borderRadius: sr(32),
                height: sh(56),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#0B0B0B', fontWeight: '500', fontSize: sf(20) }}>
                Done ({selected.length} selected)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

const EditProfileScreen = ({ navigation }: any) => {
  const { data: user, isLoading: isMeLoading } = useMe();
  const { mutate: editProfile, isPending: isSaving } = useEditProfile();
  const { interests } = useInterestStore();

  // ── Photos ────────────────────────────────────────────────────────────────
  const existingPhotos: PhotoItem[] = (user?.profile?.photos ?? []).map(
    (p: any) =>
      typeof p === 'string'
        ? { url: p, publicId: '' }
        : { url: p.url, publicId: p.publicId ?? '' },
  );
  const [images, setImages] = useState<PhotoItem[]>(() => existingPhotos);
  const [uploading, setUploading] = useState<number[]>([]);

  React.useEffect(() => {
    if (user?.profile?.photos?.length) {
      setImages(
        (user.profile.photos as any[]).map((p: any) =>
          typeof p === 'string'
            ? { url: p, publicId: '' }
            : { url: p.url, publicId: p.publicId ?? '' },
        ),
      );
    }
  }, [user]);

  // ── Interests — store NAMES, not IDs ──────────────────────────────────────
  const [selectedInterestNames, setSelectedInterestNames] = useState<string[]>(
    () =>
      (user?.interests ?? [])
        .map((ui: any) => ui.interest?.name ?? '')
        .filter(Boolean),
  );
  const [showInterests, setShowInterests] = useState(false);

  React.useEffect(() => {
    if (user?.interests) {
      setSelectedInterestNames(
        user.interests
          .map((ui: any) => ui.interest?.name ?? '')
          .filter(Boolean),
      );
    }
  }, [user]);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [openDropdown, setOpenDropdown] = useState<DropdownField>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // ── Form ──────────────────────────────────────────────────────────────────
  const editProfileSchema = useMemo(() => createEditProfileSchema(), []);

  const { watch, setValue, handleSubmit, trigger, formState } = useZodForm(
    editProfileSchema,
    {
      defaultValues: {
        firstName: user?.profile?.firstName ?? '',
        lastName: user?.profile?.lastName ?? '',
        bio: user?.profile?.bio ?? '',
        gender: user?.profile?.gender
          ? user.profile.gender.charAt(0).toUpperCase() +
            user.profile.gender.slice(1)
          : 'Male',
        height: user?.profile?.height ? `${user.profile.height} cm` : '',
        ethnicity: user?.profile?.ethnicity ?? '',
        birthday: user?.profile?.dob
          ? new Date(user.profile.dob)
          : new Date('1999-05-24'),
      },
    },
  );

  const profile = watch() as EditProfileFormValues;
  const birthDate =
    profile.birthday instanceof Date
      ? profile.birthday
      : new Date('1999-05-24');
  const { errors } = formState;

  // ── Dropdown options ──────────────────────────────────────────────────────
  const dropdownOptions: Record<NonNullable<DropdownField>, string[]> = {
    gender: Object.values(GENDER),
    height: Object.values(HEIGHTS),
    ethnicity: Object.values(ETHNICITIES),
  };

  const handleDropdownSelect = (
    field: NonNullable<DropdownField>,
    value: string,
  ) => {
    setValue(field, value, { shouldValidate: true });
    setOpenDropdown(null);
  };

  // ── Photo handlers ────────────────────────────────────────────────────────
  const addPhoto = async (index: number) => {
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
    if (result.canceled || !result.assets?.[0]?.uri) return;

    const uri = result.assets[0].uri;
    setUploading((prev) => [...prev, index]);
    try {
      const { secure_url, public_id } = await uploadToCloudinary(uri);
      setImages((prev) => {
        const next = [...prev];
        const newItem: PhotoItem = { url: secure_url, publicId: public_id };
        if (index < next.length) next[index] = newItem;
        else next.push(newItem);
        return next;
      });
    } catch (err: any) {
      showToast({ text1: 'Upload failed', text2: err?.message });
    } finally {
      setUploading((prev) => prev.filter((i) => i !== index));
    }
  };

  const removeImage = (index: number) => {
    const item = images[index];
    console.log(item, 'remove image urls');
    if (item?.publicId) {
      deleteFromCloudinary(item.publicId).catch(() => {});
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Save interests locally — API call happens on main Save button ──────────
  const handleSaveInterests = (names: string[]) => {
    setSelectedInterestNames(names);
    setShowInterests(false);
  };

  // ── Submit main form ──────────────────────────────────────────────────────
  const onSave = handleSubmit((values) => {
    const dto = buildEditDto(values, images);
    if (selectedInterestNames.length >= 3)
      dto.interests = selectedInterestNames;
    if (!Object.keys(dto).length) {
      showToast({ text1: 'No changes to save.' });
      return;
    }
    editProfile(dto, {
      onSuccess: () => {
        showToast({
          text1: 'Profile saved successfully.',
          type: 'success',
          icon: Check,
        });
        navigation.goBack();
      },
      onError: (err: any) =>
        showToast({ text1: 'Failed to save profile', text2: err?.message }),
    });
  });

  // ── Shared styles ─────────────────────────────────────────────────────────
  const labelStyle = {
    fontSize: sf(16),
    fontWeight: '500' as const,
    color: '#1E1E1E',
  };
  const inputStyle = {
    fontFamily: 'Poppins-Regular',
    fontSize: sf(16),
    fontWeight: '400' as const,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#7D858E',
    borderRadius: sr(8),
    paddingHorizontal: sw(12),
    backgroundColor: "#FFFFFF",
    height: sh(48),
    flex: 1,
  };

  const renderDropdownTrigger = (field: NonNullable<DropdownField>) => (
    <View>
      <TouchableOpacity
        onPress={() => setOpenDropdown(field)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: errors[field]?.message ? '#DC2626' : '#7D858E',
          borderRadius: sr(8),
          paddingHorizontal: sw(12),
          backgroundColor: "#FFFFFF",
          height: sh(48),
        }}
      >
        <Text
          style={{
            fontFamily: 'Poppins-Regular',
            fontSize: sf(16),
            color: profile[field] ? '#1C1C1E' : '#7D858E',
            lineHeight: 20
          }}
        >
          {(profile as any)[field] || `Select ${field}`}
        </Text>
        <ChevronDown
          size={sf(16)}
          color='#7D858E'
        />
      </TouchableOpacity>
      <FieldError message={errors[field]?.message} />
    </View>
  );

  if (isMeLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F7F3ED',
        }}
      >
        <ActivityIndicator color='#0B0B0B' />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F7F3ED' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={{
          flex: 1,
          paddingTop: sh(40),
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: sw(20),
            paddingTop: sh(16),
            paddingBottom: sh(16),
          }}
        >
          <View style={{ width: sf(36) }} />
          <Text
            style={{ fontWeight: '600', fontSize: sf(20), color: '#000000' }}
          >
            Edit Profile
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SettingsScreen')}
            style={{
              width: sf(36),
              height: sf(36),
              borderRadius: sr(92),
              backgroundColor: 'rgba(251, 178, 2, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Settings
              size={sf(20)}
              color='#0B0B0B'
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={{ paddingBottom: sh(10) }}
          // refreshControl={
          //   <RefreshControl
          //     refreshing={isMeLoading || isSaving || uploading.length > 0}
          //     onRefresh={() => {
          //       // Refresh user profile data
          //       // Since this uses React Query, it should automatically refetch
          //     }}
          //   />
          // }
        >
          {/* ── Photo grid ──────────────────────────────────────────── */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              paddingHorizontal: sw(21),
              gap: sw(12),
              marginTop: sh(6),
              marginBottom: sh(24),
            }}
          >
            {[...Array(5)].map((_, i) => {
              const hasImage = i < images.length;
              const isUploading = uploading.includes(i);
              const imageUri = images[i]?.url;
              return (
                <View
                  key={i}
                  style={{
                    width: sw(119),
                    height: sh(187),
                    borderRadius: sr(12),
                    overflow: 'visible',
                  }}
                >
                  {hasImage ? (
                    <View style={{ width: '100%', height: '100%' }}>
                      <Image
                        source={{ uri: imageUri }}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: sr(12),
                        }}
                        resizeMode='cover'
                      />
                      {i === 0 && (
                        <View
                          style={{
                            position: 'absolute',
                            bottom: sh(8),
                            left: sw(8),
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            borderRadius: sr(6),
                            paddingHorizontal: sw(8),
                            paddingVertical: sh(2),
                          }}
                        >
                          <Text style={{ color: '#FFFFFF', fontSize: sf(11) }}>
                            Main
                          </Text>
                        </View>
                      )}
                      {isUploading && (
                        <View
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            borderRadius: sr(12),
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ActivityIndicator color='#0B0B0B' />
                        </View>
                      )}
                      <TouchableOpacity
                        onPress={() => removeImage(i)}
                        style={{
                          position: 'absolute',
                          top: -sh(6),
                          right: -sw(6),
                          width: sf(22),
                          height: sf(22),
                          borderRadius: sr(99),
                          backgroundColor: '#FF3366',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10,
                        }}
                      >
                        <X
                          size={sf(12)}
                          color='#FFFFFF'
                          strokeWidth={2.5}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => addPhoto(i)}
                      disabled={isUploading}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: sr(12),
                        backgroundColor: '#EDEDED',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isUploading ? (
                        <ActivityIndicator color='#0B0B0B' />
                      ) : (
                        <Plus
                          size={sf(18)}
                          color='#FF3366'
                          strokeWidth={2.5}
                        />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          {/* ── Form ────────────────────────────────────────────────── */}
          <View style={{ paddingHorizontal: sw(20), gap: sh(16) }}>
            <View style={{ flexDirection: 'row', gap: sw(12) }}>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>First name</Text>
                <TextInput
                  value={profile.firstName}
                  onChangeText={(v) =>
                    setValue('firstName', v, { shouldValidate: true })
                  }
                  onBlur={() => trigger('firstName')}
                  style={[
                    inputStyle,
                    errors.firstName && { borderColor: '#DC2626' },
                    { lineHeight: sh(20) },
                  ]}
                />
                <FieldError message={errors.firstName?.message} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>Last name</Text>
                <TextInput
                  value={profile.lastName}
                  onChangeText={(v) =>
                    setValue('lastName', v, { shouldValidate: true })
                  }
                  onBlur={() => trigger('lastName')}
                  style={[
                    inputStyle,
                    errors.lastName && { borderColor: '#DC2626' },
                    { lineHeight: sh(20) },
                  ]}
                />
                <FieldError message={errors.lastName?.message} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: sw(12) }}>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>Gender</Text>
                {renderDropdownTrigger('gender')}
              </View>

              {/* Birthday — modal variant prevents openPicker crash */}
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>Birthday</Text>
                <TouchableOpacity
                  onPress={() => setDatePickerOpen(true)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#7D858E',
                    borderRadius: sr(8),
                    paddingHorizontal: sw(8),
                    backgroundColor: "#FFFFFF",
                    height: sh(48),
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      fontSize: sf(16),
                      color: '#1C1C1E',
                      flex: 1,
                      lineHeight: 20,
                    }}
                  >
                    {formatDate(birthDate)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text style={labelStyle}>Height</Text>
              {renderDropdownTrigger('height')}
            </View>

            <View>
              <Text style={labelStyle}>Ethnicity</Text>
              {renderDropdownTrigger('ethnicity')}
            </View>

            <View>
              <Text style={labelStyle}>Bio</Text>
              <TextInput
                value={profile.bio}
                onChangeText={(v) =>
                  setValue('bio', v, { shouldValidate: true })
                }
                onBlur={() => trigger('bio')}
                multiline
                numberOfLines={4}
                style={{
                  ...inputStyle,
                  flex: undefined,
                  minHeight: sh(112),
                  textAlignVertical: 'top',
                  paddingTop: sh(12),
                  borderColor: errors.bio ? '#DC2626' : '#7D858E',
                }}
              />
              <FieldError message={errors.bio?.message} />
            </View>

            {/* Interests box */}
            <View
              style={{
                borderWidth: 1,
                borderColor: '#7D858E',
                backgroundColor: "#FFFFFF",
                borderRadius: sr(8),
                minHeight: sh(90),
                marginBottom: sh(12),
                marginTop: sh(80),
                paddingHorizontal: sw(12),
                paddingVertical: sh(12),
                gap: sh(10),
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={labelStyle}>
                  Interests ({selectedInterestNames.length}/{MAX_INTERESTS})
                </Text>
                <TouchableOpacity onPress={() => setShowInterests(true)}>
                  <Text
                    style={{
                      color: '#CEB98F',
                      fontFamily: 'Poppins-Medium',
                      fontSize: sf(14),
                    }}
                  > 
                    <PencilLine
                      size={16}
                      color={'#0B0B0B'}
                    />
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 1, backgroundColor: '#7D858E' }} />
              <View
                style={{ flexDirection: 'row', flexWrap: 'wrap', gap: sw(8) }}
              >
                {selectedInterestNames.map((name, i) => {
                    const icon = interests.find((it) => it.name === name)?.icon ?? null;
                    return (
                  <View
                    key={i}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: sw(4),
                      height: sh(36),
                      paddingHorizontal: sw(10),
                      borderWidth: 1,
                      borderColor: '#7D858E',
                      borderRadius: sr(99),
                    }}
                  >
                    {!!icon && (
                      <Text style={{ fontSize: sf(13), lineHeight: sf(18) }}>
                        {icon}
                      </Text>
                    )}
                    <Text
                      style={{
                        fontFamily: 'Poppins-Regular',
                        fontSize: sf(14),
                        color: '#404040',
                        lineHeight: sf(22),
                      }}
                    >
                      {name}
                    </Text>
                  </View>
                    );
                  })}
                {selectedInterestNames.length < MAX_INTERESTS && (
                  <TouchableOpacity
                    onPress={() => setShowInterests(true)}
                    style={{
                      backgroundColor: '#EAD6A9',
                      borderRadius: sr(99),
                      paddingHorizontal: sw(12),
                      height: sh(36),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Poppins-Medium',
                        fontSize: sf(14),
                        color: '#0B0B0B',
                        lineHeight: sf(22),
                      }}
                    >
                       Add
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* ── Bottom buttons ───────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: sw(20),
            paddingVertical: sh(16),
            gap: sw(12),
            // backgroundColor: '#FFFFFF',
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: sw(184),
              height: sh(56),
              borderRadius: sr(32),
              borderWidth: 1,
              borderColor: '#555555',
              // backgroundColor: 'rgba(255,51,102,0.05)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{ fontWeight: '500', fontSize: sf(20), color: '#0B0B0B' }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSave}
            disabled={isSaving}
            style={{
              width: sw(184),
              height: sh(56),
              borderRadius: sr(32),
              backgroundColor: '#EAD6A9',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? (
              <Text
                style={{
                  fontWeight: '500',
                  fontSize: sf(20),
                  color: '#0B0B0B',
                }}
              >
                Saving...
              </Text>
            ) : (
              <Text
                style={{
                  fontWeight: '500',
                  fontSize: sf(20),
                  color: '#0B0B0B',
                }}
              >
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Date picker ─────────────────────────────────────────────── */}
      <DateTimePickerModal
        isVisible={datePickerOpen}
        mode='date'
        date={birthDate}
        maximumDate={new Date()}
        onConfirm={(date) => {
          setDatePickerOpen(false);
          setValue('birthday', date, { shouldValidate: true });
        }}
        onCancel={() => setDatePickerOpen(false)}
      />

      {/* ── Dropdown modal ───────────────────────────────────────────── */}
      <Modal
        visible={openDropdown !== null}
        transparent
        animationType='fade'
        onRequestClose={() => setOpenDropdown(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setOpenDropdown(null)}
          />
          <View
            onStartShouldSetResponder={() => true}
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: sr(24),
              borderTopRightRadius: sr(24),
              paddingHorizontal: sw(20),
              paddingTop: sh(16),
              paddingBottom: sh(40),
              maxHeight: sh(380),
            }}
          >
            <View
              style={{
                width: sw(40),
                height: sh(4),
                backgroundColor: '#E8EAED',
                borderRadius: sr(99),
                alignSelf: 'center',
                marginBottom: sh(16),
              }}
            />
            <FlatList
              data={openDropdown ? dropdownOptions[openDropdown] : []}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const fieldVal = openDropdown
                  ? (profile as any)[openDropdown]
                  : '';
                const isSelected = fieldVal === item;
                return (
                  <TouchableOpacity
                    onPress={() =>
                      openDropdown && handleDropdownSelect(openDropdown, item)
                    }
                    style={{
                      paddingVertical: sh(14),
                      borderBottomWidth: 1,
                      borderBottomColor: '#F0F0F0',
                      backgroundColor: isSelected ? '#FFF8E7' : 'transparent',
                      paddingHorizontal: sw(8),
                      borderRadius: sr(8),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: sf(15),
                        color: isSelected ? '#EAD6A9' : '#000000',
                        fontWeight: isSelected ? '600' : '400',
                      }}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* ── Interests picker ─────────────────────────────────────────── */}
      <InterestPickerModal
        visible={showInterests}
        currentNames={selectedInterestNames}
        onConfirm={handleSaveInterests}
        onClose={() => setShowInterests(false)}
        isSaving={false}
      />
    </KeyboardAvoidingView>
  );
};

export default EditProfileScreen;

const { StyleSheet } = require('react-native');
