import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '@/components/common/PrimaryButton';
import { sf } from '@/utils/responsive';
import { useZodForm } from '@/utils/form';
import { createProfileSetupSchema } from '@/validations/onboarding';

const GENDERS = ['Male', 'Female', 'Other'];

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = Array.from({ length: 100 }, (_, i) => String(2024 - i));

type DropdownField = 'day' | 'month' | 'year' | null;

const ProfileSetupScreen = ({navigation}: any) => {
  const [openDropdown, setOpenDropdown] = useState<DropdownField>(null);

  const profileSchema = createProfileSetupSchema({
    genders: GENDERS,
    days: DAYS,
    months: MONTHS,
    years: YEARS,
  });

  const { watch, setValue, getValues } = useZodForm(profileSchema, {
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: 'Male',
      day: '24',
      month: 'May',
      year: '1999',
      bio: '',
    },
  });

  const firstName = watch('firstName');
  const lastName = watch('lastName');
  const gender = watch('gender');
  const day = watch('day');
  const month = watch('month');
  const year = watch('year');
  const bio = watch('bio');

  const dropdownOptions: Record<NonNullable<DropdownField>, string[]> = {
    day: DAYS,
    month: MONTHS,
    year: YEARS,
  };

  const dropdownValues: Record<NonNullable<DropdownField>, string> = {
    day,
    month,
    year,
  };

  const handleSelect = (field: NonNullable<DropdownField>, value: string) => {
    setValue(field, value);
    setOpenDropdown(null);
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: '#B6B9C9',
    borderRadius: 15,
    height: 56,
    paddingHorizontal: 16,
    fontSize: sf(15),
    color: '#000000',
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Back Button ── */}
        <TouchableOpacity className="" onPress={() => {}}>
          <ChevronLeft size={24} color="#000000" />
        </TouchableOpacity>

        {/* ── Header ── */}
        <View className="gap-y-2" style={{ marginTop: 12 }}>
          <Text className="text-black font-semibold leading-[28px]"
          style={{ fontSize: sf(28), lineHeight: sf(28), letterSpacing: 0 }}
          >
            Tell Us About You
          </Text>
          <Text className="text-[#7D858E] font-normal leading-[15px]"
          style={{ fontSize: sf(15), lineHeight: sf(15), letterSpacing: 0 }}
          >
            Complete your profile to get started
          </Text>
        </View>

        {/* ── First & Last Name ── */}
        <View className="mt-6 flex-row gap-x-3">
          <View className="flex-1">
            <Text className="text-black font-semibold leading-[100%] tracking-[0%] mb-2"
            style={{ fontSize: sf(15), lineHeight: sf(15), letterSpacing: 0 }}
            >First Name</Text>
            <TextInput
              placeholder="JJ"
              placeholderTextColor="#7D858E"
              value={firstName}
              onChangeText={v => setValue('firstName', v)}
              style={inputStyle}
            />
          </View>
          <View className="flex-1">
            <Text className="text-black font-semibold leading-[100%] tracking-[0%] mb-2"
            style={{ fontSize: sf(15), lineHeight: sf(15), letterSpacing: 0 }}
            >Last Name</Text>
            <TextInput
              placeholder="Smith"
              placeholderTextColor="#7D858E"
              value={lastName}
              onChangeText={v => setValue('lastName', v)}
              style={inputStyle}
            />
          </View>
        </View>

        {/* ── Gender ── */}
        <View className="mt-6">
          <Text className="text-black font-semibold leading-[100%] tracking-[0%] mb-2"
          style={{ fontSize: sf(15), lineHeight: sf(15), letterSpacing: 0 }}
          >Gender</Text>
          <View className="flex-row gap-x-3">
            {GENDERS.map((g) => {
              const selected = gender === g;
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => setValue('gender', g)}
                  style={{
                    flex: 1,
                    height: 56,
                    borderRadius: 15,
                    borderWidth: selected ? 0 : 1,
                    borderColor: '#B6B9C9',
                    backgroundColor: selected ? '#FBB202' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: sf(15),
                      color: '#000000',
                      fontWeight: '400',
                    }}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Date of Birth ── */}
        <View className="mt-6">
          <Text className="text-black  font-semibold leading-[100%] tracking-[0%] mb-2"
          style={{ fontSize: sf(15), lineHeight: sf(15), letterSpacing: 0 }}
          >Date of birth</Text>
          <View className="flex-row gap-x-3">
            {(['day', 'month', 'year'] as NonNullable<DropdownField>[]).map((field) => (
              <TouchableOpacity
                key={field}
                onPress={() => setOpenDropdown(field)}
                style={{
                  flex: 1,
                  height: 56,
                  borderRadius: 15,
                  borderWidth: 1,
                  borderColor: '#B6B9C9',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 12,
                }}
              >
                <Text style={{ fontSize: sf(15), color: '#000000' }}>
                  {dropdownValues[field]}
                </Text>
                <ChevronDown size={16} color="#000000" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Bio ── */}
        <View className="mt-6">
          <Text className="text-black font-normal leading-[100%] tracking-[0%] mb-2"
          style={{ fontSize: sf(15), lineHeight: sf(15), letterSpacing: 0 }}
          >Add a Bio</Text>
          <TextInput
            placeholder="Write something interesting..."
            placeholderTextColor="#7D858E"
            value={bio}
            onChangeText={v => setValue('bio', v)}
            multiline
            textAlignVertical="top"
            style={{
              borderWidth: 1,
              borderColor: '#B6B9C9',
              borderRadius: 15,
              height: 120,
              paddingHorizontal: 16,
              paddingTop: 14,
              fontSize: sf(15),
              color: '#000000',
            }}
          />
        </View>
      </ScrollView>

      {/* ── Continue Button ── */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 bg-white">
        <PrimaryButton
          title="Continue"
          onPress={() => {
            const result = profileSchema.safeParse(getValues());
            if (!result.success) {
              // eslint-disable-next-line no-console
              console.warn('Profile setup validation failed', result.error.flatten());
            }
            navigation.navigate('PhysicalAttributesScreen');
          }}
          colors={['#1E78F5', '#FBB202']}
          variant="gradient"
          style={{ alignSelf: 'stretch' }}
          textStyle={{fontSize: sf(20), fontWeight: '500', lineHeight: sf(20), letterSpacing: 0}}
        />
      </View>

      {/* ── Dropdown Modal ── */}
      <Modal
        visible={openDropdown !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOpenDropdown(null)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPress={() => setOpenDropdown(null)}
        >
          <View className="bg-white rounded-t-3xl px-5 pt-4 pb-10" style={{ maxHeight: 320 }}>
            <View className="w-10 h-1 bg-[#E8EAED] rounded-full self-center mb-4" />
            <FlatList
              data={openDropdown ? dropdownOptions[openDropdown] : []}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = openDropdown ? dropdownValues[openDropdown] === item : false;
                return (
                  <TouchableOpacity
                    onPress={() => openDropdown && handleSelect(openDropdown, item)}
                    style={{
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: '#F0F0F0',
                      backgroundColor: isSelected ? '#FFF8E7' : 'transparent',
                      paddingHorizontal: 8,
                      borderRadius: 8,
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

    </SafeAreaView>
  );
};

export default ProfileSetupScreen;
