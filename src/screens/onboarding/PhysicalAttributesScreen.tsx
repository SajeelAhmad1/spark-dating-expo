// screens/onboarding/PhysicalAttributesScreen.tsx
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
import { FieldError } from '@/components/common/FieldError';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';
import PrimaryButton from '@/components/common/PrimaryButton';
import ETHNICITIES from '@/constants/ethnicities';
import HEIGHTS from '@/constants/heights';
import { sf, sw, sh, sr } from '@/utils/sizeMatters';
import { useZodForm } from '@/utils/form';
import { physicalAttributesSchema } from '@/schemas/onboarding';
import { useSignupStore, selectForm, selectPatch } from '@/store/signupStore';

type DropdownField = 'height' | 'ethnicity' | null;

const PhysicalAttributesScreen = ({ navigation }: any) => {
  const [openDropdown, setOpenDropdown] = useState<DropdownField>(null);

  const form  = useSignupStore(selectForm);
  const patch = useSignupStore(selectPatch);

  const { watch, setValue, handleSubmit, formState } = useZodForm(physicalAttributesSchema, {
    defaultValues: {
      height:    form.height,
      ethnicity: form.ethnicity,
    },
  });

  const height    = watch('height');
  const ethnicity = watch('ethnicity');
  const { errors } = formState;

  const dropdownOptions: Record<NonNullable<DropdownField>, string[]> = {
    height:    Object.values(HEIGHTS),
    ethnicity: Object.values(ETHNICITIES),
  };

  const dropdownValues: Record<NonNullable<DropdownField>, string> = {
    height:    height    || '',
    ethnicity: ethnicity || '',
  };

  const handleDropdownSelect = (field: NonNullable<DropdownField>, value: string) => {
    setValue(field, value, { shouldValidate: true });
    setOpenDropdown(null);
  };

  const fields: { key: NonNullable<DropdownField>; label: string; placeholder: string }[] = [
    { key: 'height',    label: 'Height (cm)', placeholder: 'Select height'    },
    { key: 'ethnicity', label: 'Ethnicity',   placeholder: 'Select ethnicity' },
  ];

  const onContinue = (data: any) => {
    patch({ height: data.height, ethnicity: data.ethnicity });
    navigation?.navigate('InterestsScreen');
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: sh(120) }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <ChevronLeft size={sf(24)} color="#000000" />
        </TouchableOpacity>

        <View style={styles.headerBlock}>
          <Text style={[styles.screenTitle, { fontSize: sf(28) }]} weight="semibold">
            Physical Attributes
          </Text>
          <Text style={[styles.screenSubtitle, { fontSize: sf(15) }]} weight="regular">
            Help others learn more about you
          </Text>
        </View>

        <View style={styles.fieldsCol}>
          {fields.map(({ key, label, placeholder }) => (
            <View key={key}>
              <Text style={[styles.fieldLabel, { fontSize: sf(15) }]} weight="semibold">
                {label}
              </Text>
              <TouchableOpacity
                onPress={() => setOpenDropdown(key)}
                style={{
                  height: sh(56),
                  borderRadius: sr(15),
                  borderWidth: 1,
                  borderColor: errors[key]?.message ? '#DC2626' : '#B6B9C9',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: sw(16),
                }}
              >
                <Text style={{ fontSize: sf(15), color: dropdownValues[key] ? '#000000' : '#7D858E', lineHeight: sh(56) }}>
                  {dropdownValues[key] || placeholder}
                </Text>
                <ChevronDown size={sf(18)} color="#000000" />
              </TouchableOpacity>
              <FieldError message={errors[key]?.message} />
            </View>
          ))}
        </View>

        <Text style={[styles.skipNote, { fontSize: sf(15) }]} weight="regular">
          You can always skip this step and edit later
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Continue"
          onPress={handleSubmit(onContinue)}
          colors={['#1E78F5', '#FBB202']}
          variant="gradient"
          style={{ alignSelf: 'stretch' }}
          textStyle={{ fontSize: sf(20), fontWeight: '500', lineHeight: sh(56) }}
        />
      </View>

      {/* Dropdown Modal */}
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
          <View style={[styles.modalSheet, { maxHeight: sh(360) }]}>
            <View style={styles.modalHandle} />
            <FlatList
              data={openDropdown ? dropdownOptions[openDropdown] : []}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = openDropdown ? dropdownValues[openDropdown] === item : false;
                return (
                  <TouchableOpacity
                    onPress={() => openDropdown && handleDropdownSelect(openDropdown, item)}
                    style={{
                      paddingVertical: sh(14),
                      borderBottomWidth: 1,
                      borderBottomColor: '#F0F0F0',
                      backgroundColor: isSelected ? '#FFF8E7' : 'transparent',
                      paddingHorizontal: sw(8),
                      borderRadius: sr(8),
                    }}
                  >
                    <Text style={{ fontSize: sf(15), color: isSelected ? '#FBB202' : '#000000', fontWeight: isSelected ? '600' : '400' }}>
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
  );
};

const styles = StyleSheet.create({
  safeArea:       { flex: 1, backgroundColor: '#FFFFFF', paddingBottom: sh(20) },
  scroll:         { flex: 1, paddingHorizontal: sw(20), paddingTop: sh(16), marginTop: sh(60) },
  headerBlock:    { marginTop: sh(12), rowGap: sh(8) },
  screenTitle:    { color: '#000000' },
  screenSubtitle: { color: '#7D858E' },
  fieldsCol:      { marginTop: sh(12), rowGap: sh(20) },
  fieldLabel:     { color: '#000000', marginBottom: sh(8) },
  skipNote:       { color: '#FBB202', marginTop: sh(20) },
  footer:         { paddingHorizontal: sw(20) },
  modalBackdrop:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: sr(24),
    borderTopRightRadius: sr(24),
    paddingHorizontal: sw(20),
    paddingTop: sh(16),
    paddingBottom: sh(30),
  },
  modalHandle: {
    width: sw(40),
    height: sh(4),
    backgroundColor: '#E8EAED',
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: sh(16),
  },
});

export default PhysicalAttributesScreen;