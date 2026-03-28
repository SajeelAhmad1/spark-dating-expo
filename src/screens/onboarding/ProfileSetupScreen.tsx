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
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '@/components/common/PrimaryButton';
import { sf } from '@/utils/responsive';
import { useZodForm } from '@/utils/form';
import { createProfileSetupSchema } from '@/schemas/onboarding';

const GENDERS = ['Male', 'Female', 'Other'];

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = Array.from({ length: 100 }, (_, i) => String(2024 - i));

type DropdownField = 'day' | 'month' | 'year' | null;

const ProfileSetupScreen = ({navigation}: any) => {
  const [openDropdown, setOpenDropdown] = useState<DropdownField>(null);

  const profileSchema = useMemo(
    () =>
      createProfileSetupSchema({
        genders: GENDERS,
        days: DAYS,
        months: MONTHS,
        years: YEARS,
      }),
    [],
  );

  const { watch, setValue, handleSubmit, trigger, formState } = useZodForm(profileSchema, {
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
  const { errors } = formState;
  const dobError =
    errors.day?.message || errors.month?.message || errors.year?.message;

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
    setValue(field, value, { shouldValidate: true });
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Back Button ── */}
        <TouchableOpacity onPress={() => {}}>
          <ChevronLeft size={24} color="#000000" />
        </TouchableOpacity>

        {/* ── Header ── */}
        <View style={styles.headerBlock}>
          <Text
            style={[styles.screenTitle, { fontSize: sf(28), lineHeight: sf(28), letterSpacing: 0 }]}
            weight="semibold"
          >
            Tell Us About You
          </Text>
          <Text
            style={[styles.screenSubtitle, { fontSize: sf(15), lineHeight: sf(15), letterSpacing: 0 }]}
            weight="regular"
          >
            Complete your profile to get started
          </Text>
        </View>

        {/* ── First & Last Name ── */}
        <View style={styles.nameRow}>
          <View style={styles.flex1}>
            <Text
              style={[styles.labelSemibold, { fontSize: sf(15), lineHeight: sf(15), letterSpacing: 0 }]}
              weight="semibold"
            >First Name</Text>
            <TextInput
              placeholder="JJ"
              placeholderTextColor="#7D858E"
              value={firstName}
              onChangeText={v => setValue('firstName', v, { shouldValidate: true })}
              onBlur={() => trigger('firstName')}
              style={[
                inputStyle,
                errors.firstName ? { borderColor: '#DC2626' } : null,
              ]}
            />
            <FieldError message={errors.firstName?.message} />
          </View>
          <View style={styles.flex1}>
            <Text
              style={[styles.labelSemibold, { fontSize: sf(15), lineHeight: sf(15), letterSpacing: 0 }]}
              weight="semibold"
            >Last Name</Text>
            <TextInput
              placeholder="Smith"
              placeholderTextColor="#7D858E"
              value={lastName}
              onChangeText={v => setValue('lastName', v, { shouldValidate: true })}
              onBlur={() => trigger('lastName')}
              style={[
                inputStyle,
                errors.lastName ? { borderColor: '#DC2626' } : null,
              ]}
            />
            <FieldError message={errors.lastName?.message} />
          </View>
        </View>

        {/* ── Gender ── */}
        <View style={styles.section}>
          <Text
            style={[styles.labelSemibold, { fontSize: sf(15), lineHeight: sf(15), letterSpacing: 0 }]}
            weight="semibold"
          >Gender</Text>
          <View style={styles.rowGap}>
            {GENDERS.map((g) => {
              const selected = gender === g;
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => setValue('gender', g, { shouldValidate: true })}
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
          <FieldError message={errors.gender?.message} />
        </View>

        {/* ── Date of Birth ── */}
        <View style={styles.section}>
          <Text
            style={[styles.labelSemibold, { fontSize: sf(15), lineHeight: sf(15), letterSpacing: 0 }]}
            weight="semibold"
          >Date of birth</Text>
          <View style={styles.rowGap}>
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
          <FieldError message={dobError} />
        </View>

        {/* ── Bio ── */}
        <View style={styles.section}>
          <Text
            style={[styles.labelRegular, { fontSize: sf(15), lineHeight: sf(15), letterSpacing: 0 }]}
            weight="regular"
          >Add a Bio</Text>
          <TextInput
            placeholder="Write something interesting..."
            placeholderTextColor="#7D858E"
            value={bio}
            onChangeText={v => setValue('bio', v, { shouldValidate: true })}
            onBlur={() => trigger('bio')}
            multiline
            textAlignVertical="top"
            style={{
              borderWidth: 1,
              borderColor: errors.bio ? '#DC2626' : '#B6B9C9',
              borderRadius: 15,
              height: 120,
              paddingHorizontal: 16,
              paddingTop: 14,
              fontSize: sf(15),
              color: '#000000',
            }}
          />
          <FieldError message={errors.bio?.message} />
        </View>
      </ScrollView>

      {/* ── Continue Button ── */}
      <View style={styles.footer}>
        <PrimaryButton
          title="Continue"
          onPress={handleSubmit(() => {
            navigation.navigate('PhysicalAttributesScreen');
          })}
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
          <View style={[styles.modalSheet, { maxHeight: 320 }]}>
            <View style={styles.modalHandle} />
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  headerBlock: { marginTop: 12, rowGap: 8 },
  screenTitle: { color: '#000000' },
  screenSubtitle: { color: '#7D858E' },
  nameRow: { marginTop: 24, flexDirection: 'row', columnGap: 12 },
  flex1: { flex: 1 },
  labelSemibold: { color: '#000000', marginBottom: 8 },
  labelRegular: { color: '#000000', marginBottom: 8 },
  section: { marginTop: 24 },
  rowGap: { flexDirection: 'row', columnGap: 12 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
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

export default ProfileSetupScreen;
