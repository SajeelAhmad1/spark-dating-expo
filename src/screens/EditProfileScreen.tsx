import React, { useMemo, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { createEditProfileSchema, type EditProfileFormValues } from '@/schemas/editProfile';
import { FieldError } from '@/components/common/FieldError';
import { showToast } from '@/utils/toast';

type DropdownField = 'gender' | 'height' | 'bodyType' | 'ethnicity' | null;

const DUMMY_URI =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80';

const EditProfileScreen = ({ navigation }: any) => {
  const [images, setImages] = useState([
    DUMMY_URI,
    DUMMY_URI,
    DUMMY_URI,
    DUMMY_URI,
  ]);
  const [openDropdown, setOpenDropdown] = useState<DropdownField>(null);
  const [interests] = useState([
    '✈️ Travel',
    '🎵 Music',
    '☕ Coffee',
    '📷 Photography',
  ]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const formatDate = (date: Date) =>
    `${String(date.getDate()).padStart(2, '0')}/${String(
      date.getMonth() + 1,
    ).padStart(2, '0')}/${date.getFullYear()}`;

  const editProfileSchema = useMemo(() => createEditProfileSchema(), []);

  const { watch, setValue, handleSubmit, trigger, formState } = useZodForm(
    editProfileSchema,
    {
    defaultValues: {
      firstName: 'Paul',
      lastName: 'W',
      bio: "Adventure lover & coffee enthusiast. Always looking for the next trip. Let's explore together! ✈️",
      gender: 'Male',
      height: '5\'4"',
      bodyType: 'Slim',
      ethnicity: 'Asian',
      birthday: new Date('1998-11-24'),
    },
  });

  const profile = watch() as EditProfileFormValues;
  const birthDate = profile.birthday;
  const { errors } = formState;

  type ProfileKey = Exclude<keyof EditProfileFormValues, 'birthday'>;

  const handleSave = handleSubmit(values => {
    showToast({text1: "Profile saved successfully.", type: 'success', icon: Check})
  });
  const updateProfile = (key: ProfileKey, value: string) => {
    setValue(key, value, { shouldValidate: true });
  };

  const dropdownOptions: Record<NonNullable<DropdownField>, string[]> = {
    gender: Object.values(GENDER),
    height: Object.values(HEIGHTS),
    bodyType: Object.values(BODY_TYPES),
    ethnicity: Object.values(ETHNICITIES),
  };

  const handleSelect = (field: NonNullable<DropdownField>, value: string) => {
    updateProfile(field, value);
    setOpenDropdown(null);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

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
        <ChevronDown size={sf(16)} color="#7D858E" />
      </TouchableOpacity>
      <FieldError message={errors[field]?.message} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', paddingTop: sh(40), paddingBottom: sh(20) }}>
      <View style={{ flex: 1 }}>
        {/* ── Header ── */}
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
            style={{
              fontFamily: 'Poppins-SemiBold',
              fontWeight: '600',
              fontSize: sf(20), 
              color: '#000000', 
            }}
          >
            Edit Profile
          </Text>
          <TouchableOpacity
            onPress={()=>navigation.navigate("SettingsScreen")}
            style={{
              width: sf(36),
              height: sf(36),
              borderRadius: sr(92),
              backgroundColor: '#FBB20233',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Settings size={sf(20)} color="#000000" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: sh(10) }}
        >
          {/* ── Image Grid ── */}
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
                        resizeMode="cover"
                      />
                      {i === 0 && (
                        <View
                          style={{
                            position: 'absolute',
                            bottom: sh(8),
                            left: sw(8),
                            // backgroundColor: '#00000066',
                            borderRadius: sr(6),
                            paddingHorizontal: sw(8),
                            paddingVertical: sh(4),
                          }}
                        >
                          <Text
                            style={{
                              color: '#FFFFFF',
                              fontSize: sf(12),
                              fontFamily: 'Poppins-Regular',
                            }}
                          >
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
                        <X size={sf(12)} color="#FFFFFF" strokeWidth={2.5} />
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
                      <Plus size={sf(18)} color="#FF3366" strokeWidth={2.5} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          {/* ── Form Fields ── */}
          <View style={{ paddingHorizontal: sw(20), gap: sh(16) }}>
            {/* First & Last Name */}
            <View style={{ flexDirection: 'row', gap: sw(12) }}>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>First name</Text>
                <TextInput
                  value={profile.firstName}
                  onChangeText={v => updateProfile('firstName', v)}
                  onBlur={() => trigger('firstName')}
                  style={[
                    inputStyle,
                    errors.firstName ? { borderColor: '#DC2626' } : null,
                    { lineHeight: sh(20) },
                  ]}
                />
                <FieldError message={errors.firstName?.message} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>Last name</Text>
                <TextInput
                  value={profile.lastName}
                  onChangeText={v => updateProfile('lastName', v)}
                  onBlur={() => trigger('lastName')}
                  style={[
                    inputStyle,
                    errors.lastName ? { borderColor: '#DC2626' } : null,
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
                // onPress={() => setDatePickerOpen(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: errors.birthday?.message ? '#DC2626' : '#7D858E',
                  borderRadius: sr(8),
                  paddingHorizontal: sw(8),
                  // paddingVertical: sh(12),
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
                <Calendar size={sf(16)} color="#7D858E" />
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
                onChangeText={v => updateProfile('bio', v)}
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

            {/* Interests */}
            <View style={{ 
              borderWidth: 1,
              borderColor: '#7D858E',
              borderRadius: sr(8),
              minHeight: sh(164),
              marginTop: sh(70),
              marginBottom: sh(12),
                    paddingHorizontal: sw(12),
                  paddingVertical: sh(12),
                  gap: sh(12),
              }}>
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
                  <ChevronRight size={sf(20)} color="#7D858E" />
                </TouchableOpacity>
              </View>
                <View style={{height: 1, width: '100%', backgroundColor: '#7D858E', marginBottom: sh(8)}}></View>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: sw(10),
                 
                  borderRadius: sr(8),
            
                  alignItems: 'center',
                }}
              >
                {interests.map((interest, i) => (
                  <View
                    key={i}
                    style={{
                      // backgroundColor: '#FBB20220',
                      borderRadius: sr(20),
                      height: sh(36), 
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: sw(12),
                      // paddingVertical: sh(6),
                      borderWidth: 1,
                      borderColor: '#7D858E',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Poppins-Regular',
                        fontSize: sf(16),
                        fontWeight: '400', 
                        color: '#000000',
                      }}
                    >
                      {interest}
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

        {/* ── Bottom Buttons ── */}
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
              style={{
                fontFamily: 'Poppins-Medium',
                fontWeight: '500',
                fontSize: sf(20), 
                color: '#1C1C1E', 
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSave}
            style={{
              width: sw(184),
              height: sh(56),
              borderRadius: sr(32),
              backgroundColor: '#FF3366',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontWeight: '500',
                fontSize: sf(20), 
                color: '#FFFFFF', 
              }}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Dropdown Modal ── */}
        <Modal
          visible={openDropdown !== null}
          transparent
          animationType="fade"
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
              {/* Handle */}
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
                keyExtractor={item => item}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected = openDropdown
                    ? profile[openDropdown] === item
                    : false;
                  return (
                    <TouchableOpacity
                      onPress={() =>
                        openDropdown && handleSelect(openDropdown, item)
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
                          fontFamily: isSelected
                            ? 'Poppins-SemiBold'
                            : 'Poppins-Regular',
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
      </View>
      <DatePicker
        modal
        open={datePickerOpen}
        date={birthDate}
        mode="date"
        maximumDate={new Date()}
        onConfirm={date => {
          setDatePickerOpen(false);
          setValue('birthday', date, { shouldValidate: true });
        }}
        onCancel={() => setDatePickerOpen(false)}
      />
    </View>
  );
};

export default EditProfileScreen;
