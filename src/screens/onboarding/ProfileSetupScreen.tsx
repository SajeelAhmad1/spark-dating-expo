// screens/onboarding/ProfileSetupScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  TextInput,
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
import { sf, sw, sh, sr } from '@/utils/sizeMatters';
import { useZodForm } from '@/utils/form';
import { createProfileSetupSchema } from '@/schemas/onboarding';
import { useSignupStore, selectForm, selectPatch } from '@/store/signupStore';

const GENDERS = ['Male', 'Female', 'Other'];
const DAYS    = Array.from({ length: 31 }, (_, i) => String(i + 1));
const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const YEARS   = Array.from({ length: 100 }, (_, i) => String(2024 - i));

type DropdownField = 'day' | 'month' | 'year' | null;

const ProfileSetupScreen = ({ navigation }: any) => {
  const [openDropdown, setOpenDropdown] = useState<DropdownField>(null);

  const form  = useSignupStore(selectForm);
  const patch = useSignupStore(selectPatch);

  const profileSchema = useMemo(
    () => createProfileSetupSchema({ genders: GENDERS, days: DAYS, months: MONTHS, years: YEARS }),
    [],
  );

  const { watch, setValue, handleSubmit, trigger, formState } = useZodForm(profileSchema, {
    defaultValues: {
      firstName: form.firstName,
      lastName:  form.lastName,
      gender:    form.gender,
      day:       form.day,
      month:     form.month,
      year:      form.year,
      bio:       form.bio,
    },
  });

  const firstName = watch('firstName');
  const lastName  = watch('lastName');
  const gender    = watch('gender');
  const day       = watch('day');
  const month     = watch('month');
  const year      = watch('year');
  const bio       = watch('bio');

  const { errors } = formState;
  const dobError   = errors.day?.message || errors.month?.message || errors.year?.message;

  const dropdownOptions: Record<NonNullable<DropdownField>, string[]> = { day: DAYS, month: MONTHS, year: YEARS };
  const dropdownValues:  Record<NonNullable<DropdownField>, string>   = { day, month, year };

  const handleDropdownSelect = (field: NonNullable<DropdownField>, value: string) => {
    setValue(field, value, { shouldValidate: true });
    setOpenDropdown(null);
  };

  const onContinue = (data: any) => {
    patch({
      firstName: data.firstName,
      lastName:  data.lastName,
      gender:    data.gender,
      day:       data.day,
      month:     data.month,
      year:      data.year,
      bio:       data.bio,
    });
    navigation.navigate('PhysicalAttributesScreen');
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: '#B6B9C9',
    borderRadius: sr(15),
    height: sh(56),
    paddingHorizontal: sw(10),
    fontSize: sf(15),
    color: '#000000',
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: sh(120) }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <ChevronLeft size={sf(24)} color="#000000" />
        </TouchableOpacity>

        <View style={styles.headerBlock}>
          <Text style={[styles.screenTitle, { fontSize: sf(28) }]} weight="semibold">
            Tell Us About You
          </Text>
          <Text style={[styles.screenSubtitle, { fontSize: sf(15) }]} weight="regular">
            Complete your profile to get started
          </Text>
        </View>

        {/* First & Last Name */}
        <View style={styles.nameRow}>
          <View style={styles.flex1}>
            <Text style={[styles.label, { fontSize: sf(15) }]} weight="semibold">First Name</Text>
            <TextInput
              placeholder="JJ"
              placeholderTextColor="#7D858E"
              value={firstName}
              onChangeText={(v) => setValue('firstName', v, { shouldValidate: true })}
              onBlur={() => trigger('firstName')}
              style={[inputStyle, errors.firstName && { borderColor: '#DC2626' }]}
            />
            <FieldError message={errors.firstName?.message} />
          </View>
          <View style={styles.flex1}>
            <Text style={[styles.label, { fontSize: sf(15) }]} weight="semibold">Last Name</Text>
            <TextInput
              placeholder="Smith"
              placeholderTextColor="#7D858E"
              value={lastName}
              onChangeText={(v) => setValue('lastName', v, { shouldValidate: true })}
              onBlur={() => trigger('lastName')}
              style={[inputStyle, errors.lastName && { borderColor: '#DC2626' }]}
            />
            <FieldError message={errors.lastName?.message} />
          </View>
        </View>

        {/* Gender */}
        <View style={styles.section}>
          <Text style={[styles.label, { fontSize: sf(15) }]} weight="semibold">Gender</Text>
          <View style={styles.row}>
            {GENDERS.map((g) => {
              const isSelected = gender === g;
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => setValue('gender', g, { shouldValidate: true })}
                  style={{
                    flex: 1,
                    height: sh(56),
                    borderRadius: sr(15),
                    borderWidth: isSelected ? 0 : 1,
                    borderColor: '#B6B9C9',
                    backgroundColor: isSelected ? '#FBB202' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: sf(15), color: '#000000', fontWeight: '400', lineHeight: sh(46) }}>
                    {g}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <FieldError message={errors.gender?.message} />
        </View>

        {/* Date of Birth */}
        <View style={styles.section}>
          <Text style={[styles.label, { fontSize: sf(15) }]} weight="semibold">Date of birth</Text>
          <View style={styles.row}>
            {(['day', 'month', 'year'] as NonNullable<DropdownField>[]).map((field) => (
              <TouchableOpacity
                key={field}
                onPress={() => setOpenDropdown(field)}
                style={{
                  flex: 1,
                  height: sh(56),
                  borderRadius: sr(15),
                  borderWidth: 1,
                  borderColor: '#B6B9C9',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: sw(12),
                }}
              >
                <Text style={{ fontSize: sf(15), color: '#000000', lineHeight: sh(40) }}>
                  {dropdownValues[field]}
                </Text>
                <ChevronDown size={sf(16)} color="#000000" />
              </TouchableOpacity>
            ))}
          </View>
          <FieldError message={dobError} />
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={[styles.label, { fontSize: sf(15) }]} weight="regular">Add a Bio</Text>
          <TextInput
            placeholder="Write something interesting..."
            placeholderTextColor="#7D858E"
            value={bio}
            onChangeText={(v) => setValue('bio', v, { shouldValidate: true })}
            onBlur={() => trigger('bio')}
            multiline
            textAlignVertical="top"
            style={{
              borderWidth: 1,
              borderColor: errors.bio ? '#DC2626' : '#B6B9C9',
              borderRadius: sr(15),
              height: sh(120),
              paddingHorizontal: sw(16),
              paddingTop: sh(14),
              fontSize: sf(15),
              color: '#000000',
            }}
          />
          <FieldError message={errors.bio?.message} />
        </View>
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
          <View style={[styles.modalSheet, { maxHeight: sh(320) }]}>
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
  nameRow:        { marginTop: sh(24), flexDirection: 'row', columnGap: sw(12) },
  flex1:          { flex: 1 },
  label:          { color: '#000000', marginBottom: sh(8) },
  section:        { marginTop: sh(24) },
  row:            { flexDirection: 'row', columnGap: sw(12) },
  footer:         { paddingHorizontal: sw(20), backgroundColor: '#FFFFFF' },
  modalBackdrop:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: sr(24),
    borderTopRightRadius: sr(24),
    paddingHorizontal: sw(20),
    paddingTop: sh(16),
    paddingBottom: sh(40),
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

export default ProfileSetupScreen;