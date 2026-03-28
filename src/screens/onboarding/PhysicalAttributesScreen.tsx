import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Text } from '@/components/common/Text';
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Back Button ── */}
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <ChevronLeft size={24} color="#000000" />
        </TouchableOpacity>

        {/* ── Header ── */}
        <View style={styles.headerBlock}>
          <Text
            style={[styles.screenTitle, { fontSize: sf(28), lineHeight: sf(28), letterSpacing: 0 }]}
            weight="semibold"
          >
            Physical Attributes
          </Text>
          <Text
            style={[styles.screenSubtitle, { fontSize: sf(15), lineHeight: sf(15), letterSpacing: 0 }]}
            weight="regular"
          >
            Help others learn more about you
          </Text>
        </View>

        {/* ── Dropdowns ── */}
        <View style={styles.fieldsCol}>
          {fields.map(({ key, label, placeholder }) => (
            <View key={key}>
              <Text
                style={[styles.fieldLabel, { fontSize: sf(15), lineHeight: sf(15), letterSpacing: 0 }]}
                weight="semibold"
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
        <Text
          style={[styles.skipNote, { fontSize: sf(15), lineHeight: sf(15), letterSpacing: 0 }]}
          weight="regular"
        >
          You can always skip this step and edit later
        </Text>
      </ScrollView>

      {/* ── Continue Button ── */}
      <View style={styles.footer}>
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
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setOpenDropdown(null)}
        >
          <View style={[styles.modalSheet, { maxHeight: 360 }]}>
            <View style={styles.modalHandle} />

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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  headerBlock: { marginTop: 12, rowGap: 8 },
  screenTitle: { color: '#000000' },
  screenSubtitle: { color: '#7D858E' },
  fieldsCol: { marginTop: 12, rowGap: 20 },
  fieldLabel: { color: '#000000', marginBottom: 8 },
  skipNote: { color: '#FBB202', marginTop: 20 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E8EAED',
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 16,
  },
});

export default PhysicalAttributesScreen;
