import React, { useMemo, useState, useCallback } from 'react'
import {
  View, TouchableOpacity, ScrollView, Image,
  TextInput, FlatList, Modal, ActivityIndicator, Alert,
} from 'react-native'
import { Text }            from '@/components/common/Text'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import {
  Settings, Plus, X, ChevronDown, Check,
} from 'lucide-react-native'
import { sf, sr, sw, sh } from '@/utils/sizeMatters'
import ETHNICITIES    from '@/constants/ethnicities'
import HEIGHTS        from '@/constants/heights'
import GENDER         from '@/constants/gender'
import * as ImagePicker from 'expo-image-picker'
import { useZodForm }  from '@/utils/form'
import { createEditProfileSchema, type EditProfileFormValues } from '@/schemas/editProfile'
import { FieldError }  from '@/components/common/FieldError'
import { showToast }   from '@/utils/toast'
import { useEditProfile, useMe } from '@/features/profile/hooks'
import { useInterestsCatalog }   from '@/features/interests/hooks'
import { uploadToCloudinary }    from '@/utils/cloudinary'
import type { EditProfileDto }   from '@/features/profile/schema'

const MAX_INTERESTS = 5

// ── Types ─────────────────────────────────────────────────────────────────────

type DropdownField = 'gender' | 'height' | 'ethnicity' | null

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (date: Date): string =>
  `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`

function buildEditDto(values: EditProfileFormValues, photos: string[]): EditProfileDto {
  const dto: EditProfileDto = {}
  if (values.firstName) dto.firstName = values.firstName
  if (values.lastName)  dto.lastName  = values.lastName
  if (values.bio)       dto.bio       = values.bio
  if (values.gender)    dto.gender    = values.gender.toLowerCase() as EditProfileDto['gender']
  if (values.height) {
    const num = Number(String(values.height).replace(/[^\d]/g, ''))
    if (num > 0) dto.height = num
  }
  if (values.ethnicity) dto.ethnicity = values.ethnicity
  if (photos.length)    dto.photos    = photos
  if (values.birthday) {
    const d = values.birthday
    dto.dob = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  return dto
}

// ── Interests picker modal ────────────────────────────────────────────────────
// Sends NAMES (not IDs) to the backend, matching EditProfileDtoSchema

function InterestPickerModal({
  visible, currentNames, onConfirm, onClose, isSaving,
}: {
  visible:      boolean
  currentNames: string[]   // interest names currently selected
  onConfirm:    (names: string[]) => void
  onClose:      () => void
  isSaving:     boolean
}) {
  const { data: rawData } = useInterestsCatalog()
  const [selected, setSelected] = useState<string[]>(currentNames)

  React.useEffect(() => {
    if (visible) setSelected(currentNames)
  }, [visible])

  // Flatten catalog to {id, name, category}[]
  const catalog: { id: string; name: string; category: string }[] = useMemo(() => {
    if (!rawData) return []
    const arr = Array.isArray(rawData)
      ? rawData
      : (rawData as any)?.interests
        ?? (rawData as any)?.data?.interests
        ?? (rawData as any)?.data
        ?? []
    return arr
  }, [rawData])

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, { id: string; name: string }[]>()
    for (const item of catalog) {
      if (!map.has(item.category)) map.set(item.category, [])
      map.get(item.category)!.push({ id: item.id, name: item.name })
    }
    return Array.from(map.entries()).map(([cat, items]) => ({ cat, items }))
  }, [catalog])

  const toggle = (name: string) => {
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name)
      if (prev.length >= MAX_INTERESTS) return prev  // already at max — ignore
      return [...prev, name]
    })
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
        <View
          onStartShouldSetResponder={() => true}
          style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: sr(24),
            borderTopRightRadius: sr(24),
            maxHeight: '85%',
            paddingBottom: sh(40),
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: sw(20), paddingTop: sh(16), paddingBottom: sh(8) }}>
            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: sf(18), color: '#000000' }}>
              Interests
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: sw(12) }}>
              <Text style={{ fontFamily: 'Poppins-Regular', fontSize: sf(13), color: selected.length >= MAX_INTERESTS ? '#FF3366' : '#7D858E' }}>
                {selected.length}/{MAX_INTERESTS}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <X size={sf(22)} color="#7D858E" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Max notice */}
          {selected.length >= MAX_INTERESTS && (
            <View style={{ marginHorizontal: sw(20), marginBottom: sh(8), backgroundColor: '#FFF3CD', borderRadius: sr(8), paddingHorizontal: sw(12), paddingVertical: sh(8) }}>
              <Text style={{ fontFamily: 'Poppins-Regular', fontSize: sf(13), color: '#856404' }}>
                Maximum {MAX_INTERESTS} interests selected. Remove one to add another.
              </Text>
            </View>
          )}

          {/* List */}
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: sw(20), paddingBottom: sh(16) }}
            showsVerticalScrollIndicator={false}
          >
            {grouped.map(({ cat, items }) => (
              <View key={cat}>
                <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: sf(13), color: '#7D858E', marginTop: sh(16), marginBottom: sh(8), textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {cat}
                </Text>
                {items.map((item) => {
                  const isSelected = selected.includes(item.name)
                  const isDisabled = !isSelected && selected.length >= MAX_INTERESTS
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => toggle(item.name)}
                      disabled={isDisabled}
                      style={{
                        flexDirection:   'row',
                        alignItems:      'center',
                        justifyContent:  'space-between',
                        paddingVertical: sh(13),
                        borderBottomWidth: 1,
                        borderBottomColor: '#F0F0F0',
                        opacity: isDisabled ? 0.4 : 1,
                      }}
                    >
                      <Text style={{ fontFamily: 'Poppins-Regular', fontSize: sf(15), color: isSelected ? '#1E78F5' : '#1C1C1E' }}>
                        {item.name}
                      </Text>
                      <View style={{
                        width: sf(22), height: sf(22), borderRadius: sr(4),
                        borderWidth: 1.5,
                        borderColor: isSelected ? '#1E78F5' : '#B6B9C9',
                        backgroundColor: isSelected ? '#1E78F5' : 'transparent',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isSelected && <Check size={sf(13)} color="#FFFFFF" strokeWidth={2.5} />}
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            ))}
          </ScrollView>

          {/* Save button */}
          <View style={{ paddingHorizontal: sw(20), paddingTop: sh(12) }}>
            <TouchableOpacity
              onPress={() => onConfirm(selected)}
              disabled={isSaving || selected.length < 3}
              style={{
                backgroundColor: selected.length < 3 ? '#CCCCCC' : '#1E78F5',
                borderRadius: sr(32), height: sh(52),
                alignItems: 'center', justifyContent: 'center',
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              {isSaving
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={{ color: '#FFFFFF', fontFamily: 'Poppins-SemiBold', fontSize: sf(16) }}>
                    Save ({selected.length} selected)
                  </Text>
              }
            </TouchableOpacity>
            {selected.length < 3 && (
              <Text style={{ textAlign: 'center', fontFamily: 'Poppins-Regular', fontSize: sf(12), color: '#7D858E', marginTop: sh(6) }}>
                Select at least 3 interests
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

const EditProfileScreen = ({ navigation }: any) => {
  const { data: user, isLoading: isMeLoading } = useMe()
  const { mutate: editProfile, isPending: isSaving } = useEditProfile()

  // ── Photos ────────────────────────────────────────────────────────────────
  const [images,    setImages]    = useState<string[]>(() => user?.profile?.photos ?? [])
  const [uploading, setUploading] = useState<number[]>([])

  React.useEffect(() => {
    if (user?.profile?.photos?.length) setImages(user.profile.photos)
  }, [user])

  // ── Interests — store NAMES, not IDs ──────────────────────────────────────
  const [selectedInterestNames, setSelectedInterestNames] = useState<string[]>(
    () => (user?.interests ?? []).map((ui: any) => ui.interest?.name ?? '').filter(Boolean),
  )
  const [showInterests,     setShowInterests]     = useState(false)
  const [isSavingInterests, setIsSavingInterests] = useState(false)

  React.useEffect(() => {
    if (user?.interests) {
      setSelectedInterestNames(
        user.interests.map((ui: any) => ui.interest?.name ?? '').filter(Boolean),
      )
    }
  }, [user])

  // ── UI state ──────────────────────────────────────────────────────────────
  const [openDropdown,   setOpenDropdown]   = useState<DropdownField>(null)
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  // ── Form ──────────────────────────────────────────────────────────────────
  const editProfileSchema = useMemo(() => createEditProfileSchema(), [])

  const { watch, setValue, handleSubmit, trigger, formState } = useZodForm(
    editProfileSchema,
    {
      defaultValues: {
        firstName: user?.profile?.firstName ?? '',
        lastName:  user?.profile?.lastName  ?? '',
        bio:       user?.profile?.bio       ?? '',
        gender:    user?.profile?.gender
          ? user.profile.gender.charAt(0).toUpperCase() + user.profile.gender.slice(1)
          : 'Male',
        // Pre-fill height: find the matching string from HEIGHTS constant
        height:    user?.profile?.height
          ? String(user.profile.height)
          : '',
        ethnicity: user?.profile?.ethnicity ?? '',
        birthday:  user?.profile?.dob ? new Date(user.profile.dob) : new Date('1999-05-24'),
      },
    },
  )

  const profile   = watch() as EditProfileFormValues
  const birthDate = profile.birthday instanceof Date ? profile.birthday : new Date('1999-05-24')
  const { errors } = formState

  // ── Dropdown options ──────────────────────────────────────────────────────
  const dropdownOptions: Record<NonNullable<DropdownField>, string[]> = {
    gender:    Object.values(GENDER),
    height:    Object.values(HEIGHTS),
    ethnicity: Object.values(ETHNICITIES),
  }

  const handleDropdownSelect = (field: NonNullable<DropdownField>, value: string) => {
    setValue(field, value, { shouldValidate: true })
    setOpenDropdown(null)
  }

  // ── Photo handlers ────────────────────────────────────────────────────────
  const addPhoto = async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality:    0.8,
      allowsMultipleSelection: false,
    })
    if (result.canceled || !result.assets?.[0]?.uri) return

    const uri = result.assets[0].uri
    setUploading((prev) => [...prev, index])
    try {
      const cloudUrl = await uploadToCloudinary(uri)
      setImages((prev) => {
        const next = [...prev]
        if (index < next.length) next[index] = cloudUrl
        else next.push(cloudUrl)
        return next
      })
    } catch (err: any) {
      showToast({ text1: 'Upload failed', text2: err?.message })
    } finally {
      setUploading((prev) => prev.filter((i) => i !== index))
    }
  }

  const removeImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index))

  // ── Save interests — send NAMES ───────────────────────────────────────────
  const handleSaveInterests = (names: string[]) => {
    setIsSavingInterests(true)
    editProfile(
      { interests: names },        // backend expects string[] of names
      {
        onSuccess: () => {
          setSelectedInterestNames(names)
          setIsSavingInterests(false)
          setShowInterests(false)
          showToast({ text1: 'Interests saved' })
        },
        onError: (err: any) => {
          setIsSavingInterests(false)
          showToast({ text1: 'Failed to save interests', text2: err?.message })
        },
      },
    )
  }

  // ── Submit main form ──────────────────────────────────────────────────────
  const onSave = handleSubmit((values) => {
    const dto = buildEditDto(values, images)
    if (!Object.keys(dto).length) { showToast({ text1: 'No changes to save.' }); return }
    editProfile(dto, {
      onSuccess: () => {
        showToast({ text1: 'Profile saved successfully.', type: 'success', icon: Check })
        navigation.goBack()
      },
      onError: (err: any) => showToast({ text1: 'Failed to save profile', text2: err?.message }),
    })
  })

  // ── Shared styles ─────────────────────────────────────────────────────────
  const labelStyle = { fontSize: sf(16), fontWeight: '500' as const, color: '#1E1E1E' }
  const inputStyle = {
    fontFamily: 'Poppins-Regular', fontSize: sf(16), fontWeight: '400' as const,
    color: '#1C1C1E', borderWidth: 1, borderColor: '#7D858E',
    borderRadius: sr(8), paddingHorizontal: sw(12), height: sh(48), flex: 1,
  }

  const renderDropdownTrigger = (field: NonNullable<DropdownField>) => (
    <View>
      <TouchableOpacity
        onPress={() => setOpenDropdown(field)}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: errors[field]?.message ? '#DC2626' : '#7D858E', borderRadius: sr(8), paddingHorizontal: sw(12), height: sh(48) }}
      >
        <Text style={{ fontFamily: 'Poppins-Regular', fontSize: sf(16), color: profile[field] ? '#1C1C1E' : '#7D858E' }}>
          {(profile as any)[field] || `Select ${field}`}
        </Text>
        <ChevronDown size={sf(16)} color="#7D858E" />
      </TouchableOpacity>
      <FieldError message={errors[field]?.message} />
    </View>
  )

  if (isMeLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator color="#1E78F5" />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', paddingTop: sh(40), paddingBottom: sh(20) }}>
      <View style={{ flex: 1 }}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: sw(20), paddingTop: sh(16), paddingBottom: sh(16) }}>
          <View style={{ width: sf(36) }} />
          <Text style={{ fontWeight: '600', fontSize: sf(20), color: '#000000' }}>Edit Profile</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SettingsScreen')}
            style={{ width: sf(36), height: sf(36), borderRadius: sr(92), backgroundColor: '#FBB20233', alignItems: 'center', justifyContent: 'center' }}
          >
            <Settings size={sf(20)} color="#000000" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: sh(10) }}>

          {/* ── Photo grid ──────────────────────────────────────────── */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: sw(21), gap: sw(12), marginTop: sh(6), marginBottom: sh(24) }}>
            {[...Array(5)].map((_, i) => {
              const hasImage    = i < images.length
              const isUploading = uploading.includes(i)
              return (
                <View key={i} style={{ width: sw(119), height: sh(187), borderRadius: sr(12), overflow: 'visible' }}>
                  {hasImage ? (
                    <View style={{ width: '100%', height: '100%' }}>
                      <Image source={{ uri: images[i] }} style={{ width: '100%', height: '100%', borderRadius: sr(12) }} resizeMode="cover" />
                      {i === 0 && (
                        <View style={{ position: 'absolute', bottom: sh(8), left: sw(8), backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: sr(6), paddingHorizontal: sw(8), paddingVertical: sh(2) }}>
                          <Text style={{ color: '#FFFFFF', fontSize: sf(11) }}>Main</Text>
                        </View>
                      )}
                      {isUploading && (
                        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: sr(12), alignItems: 'center', justifyContent: 'center' }}>
                          <ActivityIndicator color="#FFFFFF" />
                        </View>
                      )}
                      <TouchableOpacity
                        onPress={() => removeImage(i)}
                        style={{ position: 'absolute', top: -sh(6), right: -sw(6), width: sf(22), height: sf(22), borderRadius: sr(99), backgroundColor: '#FF3366', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
                      >
                        <X size={sf(12)} color="#FFFFFF" strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => addPhoto(i)}
                      disabled={isUploading}
                      style={{ width: '100%', height: '100%', borderRadius: sr(12), backgroundColor: '#EDEDED', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {isUploading
                        ? <ActivityIndicator color="#FBB202" />
                        : <Plus size={sf(18)} color="#FF3366" strokeWidth={2.5} />
                      }
                    </TouchableOpacity>
                  )}
                </View>
              )
            })}
          </View>

          {/* ── Form ────────────────────────────────────────────────── */}
          <View style={{ paddingHorizontal: sw(20), gap: sh(16) }}>

            <View style={{ flexDirection: 'row', gap: sw(12) }}>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>First name</Text>
                <TextInput value={profile.firstName} onChangeText={(v) => setValue('firstName', v, { shouldValidate: true })} onBlur={() => trigger('firstName')} style={[inputStyle, errors.firstName && { borderColor: '#DC2626' }, { lineHeight: sh(20) }]} />
                <FieldError message={errors.firstName?.message} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>Last name</Text>
                <TextInput value={profile.lastName} onChangeText={(v) => setValue('lastName', v, { shouldValidate: true })} onBlur={() => trigger('lastName')} style={[inputStyle, errors.lastName && { borderColor: '#DC2626' }, { lineHeight: sh(20) }]} />
                <FieldError message={errors.lastName?.message} />
              </View>
            </View>

            <View>
              <Text style={labelStyle}>Gender</Text>
              {renderDropdownTrigger('gender')}
            </View>

            {/* Birthday — modal variant prevents openPicker crash */}
            <View>
              <Text style={labelStyle}>Birthday</Text>
              <TouchableOpacity
                onPress={() => setDatePickerOpen(true)}
                style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#7D858E', borderRadius: sr(8), paddingHorizontal: sw(8), height: sh(48) }}
              >
                <Text style={{ fontFamily: 'Poppins-Regular', fontSize: sf(16), color: '#1C1C1E', flex: 1 }}>
                  {formatDate(birthDate)}
                </Text>
              </TouchableOpacity>
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
                onChangeText={(v) => setValue('bio', v, { shouldValidate: true })}
                onBlur={() => trigger('bio')}
                multiline numberOfLines={4}
                style={{ ...inputStyle, flex: undefined, minHeight: sh(112), textAlignVertical: 'top', paddingTop: sh(12), borderColor: errors.bio ? '#DC2626' : '#7D858E' }}
              />
              <FieldError message={errors.bio?.message} />
            </View>

            {/* Interests box */}
            <View style={{ borderWidth: 1, borderColor: '#7D858E', borderRadius: sr(8), minHeight: sh(90), marginBottom: sh(12), paddingHorizontal: sw(12), paddingVertical: sh(12), gap: sh(10) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={labelStyle}>
                  Interests ({selectedInterestNames.length}/{MAX_INTERESTS})
                </Text>
                <TouchableOpacity onPress={() => setShowInterests(true)}>
                  <Text style={{ color: '#1E78F5', fontFamily: 'Poppins-Medium', fontSize: sf(14) }}>Edit</Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 1, backgroundColor: '#EFEFEF' }} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: sw(8) }}>
                {selectedInterestNames.map((name, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: sw(4), borderRadius: sr(20), height: sh(32), paddingHorizontal: sw(10), backgroundColor: '#FBB202' }}>
                    <Text style={{ fontFamily: 'Poppins-Regular', fontSize: sf(13), color: '#000000' }}>{name}</Text>
                    <TouchableOpacity
                      onPress={() => setSelectedInterestNames((prev) => prev.filter((n) => n !== name))}
                      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                    >
                      <X size={sf(11)} color="#000000" strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                ))}
                {selectedInterestNames.length < MAX_INTERESTS && (
                  <TouchableOpacity
                    onPress={() => setShowInterests(true)}
                    style={{ backgroundColor: '#1E78F5', borderRadius: sr(99), paddingHorizontal: sw(12), height: sh(32), alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ fontFamily: 'Poppins-Medium', fontSize: sf(13), color: '#FFFFFF' }}>+ Add</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* ── Bottom buttons ───────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', paddingHorizontal: sw(20), paddingVertical: sh(16), gap: sw(12), backgroundColor: '#FFFFFF' }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ width: sw(184), height: sh(56), borderRadius: sr(32), borderWidth: 1, borderColor: '#FF3366', backgroundColor: 'rgba(255,51,102,0.05)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontWeight: '500', fontSize: sf(20), color: '#1C1C1E' }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSave} disabled={isSaving}
            style={{ width: sw(184), height: sh(56), borderRadius: sr(32), backgroundColor: '#FF3366', alignItems: 'center', justifyContent: 'center', opacity: isSaving ? 0.6 : 1 }}
          >
            {isSaving
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={{ fontWeight: '500', fontSize: sf(20), color: '#FFFFFF' }}>Save</Text>
            }
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Date picker ─────────────────────────────────────────────── */}
      <DateTimePickerModal
        isVisible={datePickerOpen}
        mode="date"
        date={birthDate}
        maximumDate={new Date()}
        onConfirm={(date) => { setDatePickerOpen(false); setValue('birthday', date, { shouldValidate: true }) }}
        onCancel={() => setDatePickerOpen(false)}
      />

      {/* ── Dropdown modal ───────────────────────────────────────────── */}
      <Modal visible={openDropdown !== null} transparent animationType="fade" onRequestClose={() => setOpenDropdown(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setOpenDropdown(null)} />
          <View
            onStartShouldSetResponder={() => true}
            style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: sr(24), borderTopRightRadius: sr(24), paddingHorizontal: sw(20), paddingTop: sh(16), paddingBottom: sh(40), maxHeight: sh(380) }}
          >
            <View style={{ width: sw(40), height: sh(4), backgroundColor: '#E8EAED', borderRadius: sr(99), alignSelf: 'center', marginBottom: sh(16) }} />
            <FlatList
              data={openDropdown ? dropdownOptions[openDropdown] : []}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const fieldVal   = openDropdown ? (profile as any)[openDropdown] : ''
                const isSelected = fieldVal === item
                return (
                  <TouchableOpacity
                    onPress={() => openDropdown && handleDropdownSelect(openDropdown, item)}
                    style={{ paddingVertical: sh(14), borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: isSelected ? '#FFF8E7' : 'transparent', paddingHorizontal: sw(8), borderRadius: sr(8) }}
                  >
                    <Text style={{ fontSize: sf(15), color: isSelected ? '#FBB202' : '#000000', fontWeight: isSelected ? '600' : '400' }}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )
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
        isSaving={isSavingInterests}
      />
    </View>
  )
}

export default EditProfileScreen

const { StyleSheet } = require('react-native')