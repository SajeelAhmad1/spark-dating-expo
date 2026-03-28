import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '@/components/common/PrimaryButton';
import BODY_TYPES from '@/constants/bodyTypes';
import ETHNICITIES from '@/constants/ethnicities';
import HEIGHTS from '@/constants/heights';
import { sf } from '@/utils/responsive';

type DropdownField = 'height' | 'bodyType' | 'ethnicity' | null;

const PhysicalAttributesScreen = ({ navigation }: any) => {
  const [height, setHeight] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [openDropdown, setOpenDropdown] = useState<DropdownField>(null);

  const dropdownOptions: Record<NonNullable<DropdownField>, string[]> = {
    height: Object.values(HEIGHTS),
    bodyType: Object.values(BODY_TYPES),
    ethnicity: Object.values(ETHNICITIES),
  };

  const dropdownValues: Record<NonNullable<DropdownField>, string> = {
    height,
    bodyType,
    ethnicity,
  };

  const handleSelect = (field: NonNullable<DropdownField>, value: string) => {
    if (field === 'height') setHeight(value);
    if (field === 'bodyType') setBodyType(value);
    if (field === 'ethnicity') setEthnicity(value);
    setOpenDropdown(null);
  };

  const fields: {
    key: NonNullable<DropdownField>;
    label: string;
    placeholder: string;
  }[] = [
    { key: 'height', label: 'Height', placeholder: 'Select height' },
    { key: 'bodyType', label: 'Body Type', placeholder: 'Select bodytype' },
    { key: 'ethnicity', label: 'Ethnicity', placeholder: 'Select ethnicity' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Back Button ── */}
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <ChevronLeft size={24} color="#000000" />
        </TouchableOpacity>

        {/* ── Header ── */}
        <View className="gap-y-2" style={{ marginTop: 12 }}>
          <Text className="text-black  font-semibold leading-[28px]"
          style={{ fontSize: sf(28), lineHeight: sf(28), letterSpacing: 0 }}
          >
            Physical Attributes
          </Text>
          <Text className="text-[#7D858E] font-normal leading-[15px]"
          style={{ fontSize: sf(15), lineHeight: sf(15), letterSpacing: 0 }}
          >
            Help others learn more about you
          </Text>
        </View>

        {/* ── Dropdowns ── */}
        <View className="gap-y-5" style={{ marginTop: 12 }}>
          {fields.map(({ key, label, placeholder }) => (
            <View key={key}>
              <Text className="text-black font-semibold leading-[100%] tracking-[0%] mb-2"
              style={{ fontSize: sf(15), lineHeight: sf(15), letterSpacing: 0 }}
              >
                {label}
              </Text>
              <TouchableOpacity
                onPress={() => setOpenDropdown(key)}
                style={{
                  height: 56,
                  borderRadius: 15,
                  borderWidth: 1,
                  borderColor: '#B6B9C9',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: sf(15),
                    color: dropdownValues[key] ? '#000000' : '#7D858E',
                  }}
                >
                  {dropdownValues[key] || placeholder}
                </Text>
                <ChevronDown size={18} color="#000000" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* ── Skip Note ── */}
        <Text className="text-[#FBB202] font-normal leading-[100%] tracking-[0%] mt-5"
        style={{ fontSize: sf(15), lineHeight: sf(15), letterSpacing: 0 }}
        >
          You can always skip this step and edit later
        </Text>
      </ScrollView>

      {/* ── Continue Button ── */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pb-8">
        <PrimaryButton
          title="Continue"
          onPress={() => navigation?.navigate('InterestsScreen')}
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
          <View
            className="bg-white rounded-t-3xl px-5 pt-4 pb-10"
            style={{ maxHeight: 360 }}
          >
            {/* Handle */}
            <View className="w-10 h-1 bg-[#E8EAED] rounded-full self-center mb-4" />

            <FlatList
              data={openDropdown ? dropdownOptions[openDropdown] : []}
              keyExtractor={item => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = openDropdown
                  ? dropdownValues[openDropdown] === item
                  : false;
                return (
                  <TouchableOpacity
                    onPress={() =>
                      openDropdown && handleSelect(openDropdown, item)
                    }
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

export default PhysicalAttributesScreen;
