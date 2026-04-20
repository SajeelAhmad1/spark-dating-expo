// screens/profile/EditProfileScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/components/common/Text';
import DatePicker from 'react-native-date-picker';
import {
  Settings,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Calendar,
  Check,
} from 'lucide-react-native';
import { sf, sr, sw, sh } from '@/utils/sizeMatters';
import BODY_TYPES from '@/constants/bodyTypes';
import ETHNICITIES from '@/constants/ethnicities';
import HEIGHTS from '@/constants/heights';
import GENDER from '@/constants/gender';
import { useZodForm } from '@/utils/form';
import {
  createEditProfileSchema,
  type EditProfileFormValues,
} from '@/schemas/editProfile';
import { FieldError } from '@/components/common/FieldError';
import { showToast } from '@/utils/toast';
import { useEditProfile, useMe } from '@/features/profile/hooks';
import type { EditProfileDto } from '@/features/profile/schema';

// ─── Types ────────────────────────────────────────────────────────────────────

type DropdownField = 'gender' | 'height' | 'bodyType' | 'ethnicity' | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (date: Date): string =>
  `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

/**
 * Converts the local form values into the EditProfileDto shape expected
 * by PATCH /api/profile/edit. Only sends fields that are non-empty.
 */
function buildEditDto(
  values: EditProfileFormValues,
  photos: string[],
): EditProfileDto {
  const dto: EditProfileDto = {};

  if (values.firstName) dto.firstName = values.firstName;
  if (values.lastName) dto.lastName = values.lastName;
  if (values.bio) dto.bio = values.bio;
  if (values.gender)
    dto.gender = values.gender.toLowerCase() as EditProfileDto['gender'];
  if (values.height)
    dto.height = Number(values.height.replace(/[^\d]/g, '')) || undefined;
  if (values.ethnicity) dto.ethnicity = values.ethnicity;
  if (photos.length) dto.photos = photos;

  if (values.birthday) {
    const d = values.birthday;
    dto.dob = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  return dto;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const EditProfileScreen = ({ navigation }: any) => {
  // ── Remote data ────────────────────────────────────────────────────────────
  const { data: user, isLoading: isMeLoading } = useMe();
  const { mutate: editProfile, isPending: isSaving } = useEditProfile();
  console.log(user, "console user me")
  // ── Local UI state ─────────────────────────────────────────────────────────
  const [images, setImages] = useState<string[]>(
    () => user?.profile?.photos ?? [],
  );
  const [openDropdown, setOpenDropdown] = useState<DropdownField>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Keep images in sync if user data loads after mount
  React.useEffect(() => {
    if (user?.profile?.photos?.length) setImages(user.profile.photos);
  }, [user]);

  // ── Form ───────────────────────────────────────────────────────────────────
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
        height: '', // string from HEIGHTS constant e.g. "5'10\""
        bodyType: '',
        ethnicity: user?.profile?.ethnicity ?? '',
        birthday: user?.profile?.dob
          ? new Date(user.profile.dob)
          : new Date('1999-05-24'),
      },
    },
  );

  const profile = watch() as EditProfileFormValues;
  const birthDate = profile.birthday;
  const { errors } = formState;

  // ── Dropdown options ───────────────────────────────────────────────────────
  const dropdownOptions: Record<NonNullable<DropdownField>, string[]> = {
    gender: Object.values(GENDER),
    height: Object.values(HEIGHTS),
    bodyType: Object.values(BODY_TYPES),
    ethnicity: Object.values(ETHNICITIES),
  };

  const handleDropdownSelect = (
    field: NonNullable<DropdownField>,
    value: string,
  ) => {
    setValue(field, value, { shouldValidate: true });
    setOpenDropdown(null);
  };

  // ── Photo helpers ──────────────────────────────────────────────────────────
  const removeImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSave = handleSubmit((values) => {
    const dto = buildEditDto(values, images);

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
      onError: (err: any) => {
        showToast({ text1: 'Failed to save profile', text2: err?.message });
      },
    });
  });

  // ── Shared styles ──────────────────────────────────────────────────────────
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
          height: sh(48),
        }}
      >
        <Text
          style={{
            fontFamily: 'Poppins-Regular',
            fontSize: sf(16),
            color: profile[field] ? '#1C1C1E' : '#7D858E',
          }}
        >
          {profile[field] || `Select ${field}`}
        </Text>
        <ChevronDown
          size={sf(16)}
          color='#7D858E'
        />
      </TouchableOpacity>
      <FieldError message={errors[field]?.message} />
    </View>
  );

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isMeLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
        }}
      >
        <ActivityIndicator color='#1E78F5' />
      </View>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: sh(40),
        paddingBottom: sh(20),
      }}
    >
      <View style={{ flex: 1 }}>
        {/* ── Header ──────────────────────────────────────────────────────── */}
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
              backgroundColor: '#FBB20233',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Settings
              size={sf(20)}
              color='#000000'
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={{ paddingBottom: sh(10) }}
        >
          {/* ── Photo grid ──────────────────────────────────────────────── */}
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
                        source={{ uri: images[i] }}
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
                            borderRadius: sr(6),
                            paddingHorizontal: sw(8),
                            paddingVertical: sh(4),
                          }}
                        >
                          <Text style={{ color: '#FFFFFF', fontSize: sf(12) }}>
                            Main
                          </Text>
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
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: sr(12),
                        backgroundColor: '#EDEDED',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Plus
                        size={sf(18)}
                        color='#FF3366'
                        strokeWidth={2.5}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          {/* ── Form fields ─────────────────────────────────────────────── */}
          <View style={{ paddingHorizontal: sw(20), gap: sh(16) }}>
            {/* First & Last Name */}
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

            {/* Gender */}
            <View>
              <Text style={labelStyle}>Gender</Text>
              {renderDropdownTrigger('gender')}
            </View>

            {/* Birthday */}
            <View>
              <Text style={labelStyle}>Birthday</Text>
              <TouchableOpacity
                onPress={() => setDatePickerOpen(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: errors.birthday?.message ? '#DC2626' : '#7D858E',
                  borderRadius: sr(8),
                  paddingHorizontal: sw(8),
                  height: sh(48),
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Poppins-Regular',
                    fontSize: sf(16),
                    color: '#1C1C1E',
                    flex: 1,
                  }}
                >
                  {formatDate(birthDate)}
                </Text>
                <Calendar
                  size={sf(16)}
                  color='#7D858E'
                />
              </TouchableOpacity>
              <FieldError message={errors.birthday?.message} />
            </View>

            {/* Height */}
            <View>
              <Text style={labelStyle}>Height</Text>
              {renderDropdownTrigger('height')}
            </View>

            {/* Body Type */}
            <View>
              <Text style={labelStyle}>Body Type</Text>
              {renderDropdownTrigger('bodyType')}
            </View>

            {/* Ethnicity */}
            <View>
              <Text style={labelStyle}>Ethnicity</Text>
              {renderDropdownTrigger('ethnicity')}
            </View>

            {/* Bio */}
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

            {/* Interests (navigate to InterestsScreen to edit) */}
            <View
              style={{
                borderWidth: 1,
                borderColor: '#7D858E',
                borderRadius: sr(8),
                minHeight: sh(164),
                marginTop: sh(70),
                marginBottom: sh(12),
                paddingHorizontal: sw(12),
                paddingVertical: sh(12),
                gap: sh(12),
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={labelStyle}>Interests</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('InterestsScreen')}
                >
                  <ChevronRight
                    size={sf(20)}
                    color='#7D858E'
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  height: 1,
                  width: '100%',
                  backgroundColor: '#7D858E',
                  marginBottom: sh(8),
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: sw(10),
                  alignItems: 'center',
                }}
              >
                {(user?.interests ?? []).map((entry, i) => (
                  <View
                    key={i}
                    style={{
                      borderRadius: sr(20),
                      height: sh(36),
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: sw(12),
                      borderWidth: 1,
                      borderColor: '#7D858E',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Poppins-Regular',
                        fontSize: sf(16),
                        color: '#000000',
                      }}
                    >
                      {entry.interest.name}
                    </Text>
                  </View>
                ))}
                <TouchableOpacity
                  onPress={() => navigation.navigate('InterestsScreen')}
                  style={{
                    backgroundColor: '#1E78F5',
                    borderRadius: sr(99),
                    paddingHorizontal: sw(14),
                    paddingVertical: sh(6),
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      fontSize: sf(14),
                      color: '#FFFFFF',
                    }}
                  >
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* ── Bottom buttons ───────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: sw(20),
            paddingVertical: sh(16),
            gap: sw(12),
            backgroundColor: '#FFFFFF',
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: sw(184),
              height: sh(56),
              borderRadius: sr(32),
              borderWidth: 1,
              borderColor: '#FF3366',
              backgroundColor: 'rgba(255, 51, 102, 0.05)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{ fontWeight: '500', fontSize: sf(20), color: '#1C1C1E' }}
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
              backgroundColor: '#FF3366',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? (
              <Text style={{
                  fontWeight: '500',
                  fontSize: sf(20),
                  color: '#FFFFFF',
                }}><ActivityIndicator color='#FFFFFF' /> Save</Text>
            ) : (
              <Text
                style={{
                  fontWeight: '500',
                  fontSize: sf(20),
                  color: '#FFFFFF',
                }}
              >
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Dropdown modal ───────────────────────────────────────────────────── */}
      <Modal
        visible={openDropdown !== null}
        transparent
        animationType='fade'
        onRequestClose={() => setOpenDropdown(null)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'flex-end',
          }}
          activeOpacity={1}
          onPress={() => setOpenDropdown(null)}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: sr(24),
              borderTopRightRadius: sr(24),
              paddingHorizontal: sw(20),
              paddingTop: sh(16),
              paddingBottom: sh(40),
              maxHeight: sh(360),
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
                const isSelected = openDropdown
                  ? profile[openDropdown] === item
                  : false;
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
                        color: isSelected ? '#FBB202' : '#000000',
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
        </TouchableOpacity>
      </Modal>

      {/* ── Date picker ──────────────────────────────────────────────────────── */}
      <DatePicker
        modal
        open={datePickerOpen}
        date={birthDate}
        mode='date'
        maximumDate={new Date()}
        onConfirm={(date) => {
          setDatePickerOpen(false);
          setValue('birthday', date, { shouldValidate: true });
        }}
        onCancel={() => setDatePickerOpen(false)}
      />
    </View>
  );
};

export default EditProfileScreen;
