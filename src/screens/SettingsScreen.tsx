import React, { useEffect, useState } from 'react'
import {
  View, TouchableOpacity, ScrollView, TextStyle,
  ActivityIndicator, Modal, Platform, Share,
  StyleSheet,
} from 'react-native'
import { Text }       from '@/components/common/Text'
import {
  ChevronLeft, ChevronRight, LogOut, Trash2, Check, Share2, Copy,
} from 'lucide-react-native'
import { sf, sr, sw, sh } from '@/utils/sizeMatters'
import PrimaryButton  from '@/components/common/PrimaryButton'
import CustomToggle   from '@/components/location/CustomToggle'
import {
  useDiscoveryPreferences,
  usePatchDiscoveryPreferences,
} from '@/features/discovery/hooks'
import { useLogout }    from '@/features/auth/hooks'
import { useMe }        from '@/features/profile/hooks'
import { useEditProfile } from '@/features/profile/hooks'
import { showToast }    from '@/utils/toast'
import Slider           from '@react-native-community/slider'
import * as Clipboard   from 'expo-clipboard'

// ── Constants ─────────────────────────────────────────────────────────────────

const GENDER_OPTIONS  = ['Male', 'Female', 'Other']
const SHOW_ME_OPTIONS = ['Women', 'Men', 'Everyone']
const REFERRAL_LINK   = 'https://spark.app/invite/SPARK-QT53V4'

type DialogType = 'gender' | 'showMe' | 'age' | 'distance' | 'invite' | null

// ── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: sh(14) }}>
      <View style={{ width: sw(80), height: sh(16), borderRadius: sr(8), backgroundColor: '#EFEFEF' }} />
      <View style={{ width: sw(60), height: sh(16), borderRadius: sr(8), backgroundColor: '#EFEFEF' }} />
    </View>
  )
}

// ── Base bottom-sheet wrapper ─────────────────────────────────────────────────
// Key fix: the inner View uses Pressable/stopPropagation pattern so the backdrop
// onPress does NOT fire when tapping inside the sheet.

function BottomSheet({
  visible, onClose, children,
}: {
  visible: boolean; onClose: () => void; children: React.ReactNode
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Backdrop — only closes on direct press of the dark area */}
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        {/* Sheet — stops propagation to backdrop */}
        <View
          onStartShouldSetResponder={() => true}
          style={styles.sheet}
        >
          <View style={styles.sheetHandle} />
          {children}
        </View>
      </View>
    </Modal>
  )
}

// ── Option select sheet ────────────────────────────────────────────────────────

function OptionSheet({
  visible, title, options, selected, onSelect, onClose, isSaving,
}: {
  visible:  boolean
  title:    string
  options:  string[]
  selected: string
  onSelect: (v: string) => void
  onClose:  () => void
  isSaving?: boolean
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.sheetTitle}>{title}</Text>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          onPress={() => onSelect(opt)}
          disabled={isSaving}
          style={[
            styles.sheetOption,
            selected === opt && styles.sheetOptionSelected,
          ]}
        >
          <Text style={[
            styles.sheetOptionText,
            selected === opt && { color: '#1E78F5', fontFamily: 'Poppins-SemiBold' },
          ]}>
            {opt}
          </Text>
          {isSaving && selected === opt
            ? <ActivityIndicator size="small" color="#1E78F5" />
            : selected === opt
            ? <Check size={sf(18)} color="#1E78F5" />
            : null
          }
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={onClose} style={styles.sheetCancel}>
        <Text style={{ color: '#7D858E', fontSize: sf(15), fontFamily: 'Poppins-Medium' }}>
          Cancel
        </Text>
      </TouchableOpacity>
    </BottomSheet>
  )
}

// ── Age range sheet ───────────────────────────────────────────────────────────

function AgeSheet({
  visible, minAge, maxAge, onConfirm, onClose, isSaving,
}: {
  visible:   boolean
  minAge:    number
  maxAge:    number
  onConfirm: (min: number, max: number) => void
  onClose:   () => void
  isSaving?: boolean
}) {
  const [localMin, setLocalMin] = useState(minAge)
  const [localMax, setLocalMax] = useState(maxAge)

  useEffect(() => {
    if (visible) { setLocalMin(minAge); setLocalMax(maxAge) }
  }, [visible, minAge, maxAge])

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.sheetTitle}>Age Range</Text>

      <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: sf(20), color: '#1E78F5', textAlign: 'center', marginBottom: sh(16) }}>
        {localMin} – {localMax}
      </Text>

      <Text style={styles.sliderLabel}>Min Age: {localMin}</Text>
      <Slider
        minimumValue={18}
        maximumValue={Math.max(18, localMax - 1)}
        step={1}
        value={localMin}
        onValueChange={(v) => setLocalMin(Math.round(v))}
        minimumTrackTintColor="#1E78F5"
        maximumTrackTintColor="#E0E0E0"
        thumbTintColor="#1E78F5"
        style={{ marginBottom: sh(12) }}
      />

      <Text style={styles.sliderLabel}>Max Age: {localMax}</Text>
      <Slider
        minimumValue={localMin + 1}
        maximumValue={99}
        step={1}
        value={localMax}
        onValueChange={(v) => setLocalMax(Math.round(v))}
        minimumTrackTintColor="#1E78F5"
        maximumTrackTintColor="#E0E0E0"
        thumbTintColor="#1E78F5"
        style={{ marginBottom: sh(24) }}
      />

      <PrimaryButton
        title={isSaving ? 'Apply...' : 'Apply'}
        icon={isSaving ? <ActivityIndicator size="small" color="#FFFFFF" /> : undefined}
        iconPosition='middle'
        onPress={() => onConfirm(localMin, localMax)}
        colors={['#1E78F5', '#FBB202']}
        variant="gradient"
        style={{ alignSelf: 'stretch' }}
        textStyle={{ fontSize: sf(16), fontWeight: '500' }}
        disabled={isSaving}
      />
      <TouchableOpacity onPress={onClose} style={styles.sheetCancel}>
        <Text style={{ color: '#7D858E', fontSize: sf(15), fontFamily: 'Poppins-Medium' }}>Cancel</Text>
      </TouchableOpacity>
    </BottomSheet>
  )
}

// ── Distance sheet ────────────────────────────────────────────────────────────

function DistanceSheet({
  visible, distance, onConfirm, onClose, isSaving,
}: {
  visible:   boolean
  distance:  number
  onConfirm: (km: number) => void
  onClose:   () => void
  isSaving?: boolean
}) {
  const [local, setLocal] = useState(distance)

  useEffect(() => { if (visible) setLocal(distance) }, [visible, distance])

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.sheetTitle}>Max Distance</Text>

      <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: sf(24), color: '#1E78F5', textAlign: 'center', marginBottom: sh(8) }}>
        {local} km
      </Text>

      <Slider
        minimumValue={1}
        maximumValue={200}
        step={1}
        value={local}
        onValueChange={(v) => setLocal(Math.round(v))}
        minimumTrackTintColor="#1E78F5"
        maximumTrackTintColor="#E0E0E0"
        thumbTintColor="#1E78F5"
        style={{ marginBottom: sh(24) }}
      />

      <PrimaryButton
        title={isSaving ? 'Apply...' : 'Apply'}
        icon={isSaving ? <ActivityIndicator size="small" color="#FFFFFF" /> : undefined}
        iconPosition='middle'
        onPress={() => onConfirm(local)}
        colors={['#1E78F5', '#FBB202']}
        variant="gradient"
        style={{ alignSelf: 'stretch' }}
        textStyle={{ fontSize: sf(16), fontWeight: '500' }}
        disabled={isSaving}
      />
      <TouchableOpacity onPress={onClose} style={styles.sheetCancel}>
        <Text style={{ color: '#7D858E', fontSize: sf(15), fontFamily: 'Poppins-Medium' }}>Cancel</Text>
      </TouchableOpacity>
    </BottomSheet>
  )
}

// ── Invite sheet ──────────────────────────────────────────────────────────────

function InviteSheet({
  visible, onClose,
}: {
  visible: boolean; onClose: () => void
}) {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(REFERRAL_LINK)
    showToast({ text1: 'Link copied!' })
  }

  const handleShare = async () => {
    try {
      await Share.share(
        Platform.OS === 'ios'
          ? { message: REFERRAL_LINK, url: REFERRAL_LINK }
          : { message: REFERRAL_LINK },
      )
    } catch {
      showToast({ text1: 'Could not open share' })
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.sheetTitle}>Invite Friends 🎉</Text>

      <Text style={{ fontFamily: 'Poppins-Regular', fontSize: sf(14), color: '#7D858E', textAlign: 'center', marginBottom: sh(20) }}>
        Invite{' '}
        <Text style={{ color: '#1E78F5', fontFamily: 'Poppins-SemiBold' }}>2 friends</Text>
        {' '}to Spark and unlock{' '}
        <Text style={{ color: '#DC9B00', fontFamily: 'Poppins-SemiBold' }}>Premium access</Text>
        {' '}for free!
      </Text>

      {/* Referral link box */}
      <View style={{ backgroundColor: '#F7F8FA', borderRadius: sr(12), padding: sw(14), marginBottom: sh(20) }}>
        <Text style={{ fontFamily: 'Poppins-Regular', fontSize: sf(12), color: '#7D858E', marginBottom: sh(8) }}>
          Your Referral Link
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: sr(8), paddingHorizontal: sw(10), height: sh(44) }}>
          <Text numberOfLines={1} style={{ flex: 1, fontFamily: 'Poppins-Medium', fontSize: sf(13), color: '#000000' }}>
            {REFERRAL_LINK}
          </Text>
          <TouchableOpacity onPress={handleCopy} style={{ paddingLeft: sw(8) }}>
            <Copy size={sf(16)} color="#1E78F5" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats row */}
      <View style={{ flexDirection: 'row', gap: sw(12), marginBottom: sh(20) }}>
        {[
          { label: 'Invites Sent', value: '0', color: '#DC9B00', bg: '#FBB2021A', border: '#FBB202' },
          { label: 'Signed Up',    value: '0', color: '#1E78F5', bg: '#1E78F51A', border: '#1E78F5' },
        ].map((s) => (
          <View key={s.label} style={{ flex: 1, height: sh(68), borderRadius: sr(12), backgroundColor: s.bg, borderWidth: 0.2, borderColor: s.border, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: sf(20), color: s.color }}>{s.value}</Text>
            <Text style={{ fontFamily: 'Poppins-Regular', fontSize: sf(12), color: '#555555' }}>{s.label}</Text>
          </View>
        ))}
      </View>

      <PrimaryButton
        title="Share Invite Link"
        onPress={handleShare}
        colors={['#1E78F5', '#DC9B00']}
        variant="gradient"
        icon={<Share2 size={sf(18)} color="#FFFFFF" />}
        iconPosition="middle"
        style={{ alignSelf: 'stretch', marginBottom: sh(12) }}
        textStyle={{ fontSize: sf(16), fontWeight: '500' }}
      />

      <TouchableOpacity onPress={onClose} style={styles.sheetCancel}>
        <Text style={{ color: '#7D858E', fontSize: sf(15), fontFamily: 'Poppins-Medium' }}>
          Close
        </Text>
      </TouchableOpacity>
    </BottomSheet>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

const SettingsScreen = ({ navigation }: any) => {
  const { data: prefs, isLoading: prefsLoading } = useDiscoveryPreferences()
  const { mutate: patchPrefs }  = usePatchDiscoveryPreferences()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()
  const { data: me }            = useMe()
  const { mutate: editProfile, isPending: isSavingProfile } = useEditProfile()

  // ── Local toggles ─────────────────────────────────────────────────────────
  const [pushNotifications, setPushNotifications] = useState(false)
  const [showDistance,      setShowDistance]      = useState(false)
  const [showAge,           setShowAge]           = useState(true)
  const [autoBoost,         setAutoBoost]         = useState(false)

  // ── Discovery dialog state ─────────────────────────────────────────────────
  const [gender,  setGender]  = useState('Female')
  const [showMe,  setShowMe]  = useState('Women')
  const [minAge,  setMinAge]  = useState(18)
  const [maxAge,  setMaxAge]  = useState(32)
  const [distKm,  setDistKm]  = useState(10)

  // ── Which dialog is open + its saving state ────────────────────────────────
  const [openDialog,  setOpenDialog]  = useState<DialogType>(null)
  const [isSavingDlg, setIsSavingDlg] = useState(false)

  // ── Sync from API ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!prefs) return
    setDistKm(prefs.maxDistanceKm)
    const myAge = me?.profile?.dob
      ? Math.floor((Date.now() - new Date(me.profile.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 24
    setMinAge(Math.max(18, myAge - prefs.youngerAgeDelta))
    setMaxAge(myAge + prefs.olderAgeDelta)
  }, [prefs, me])

  useEffect(() => {
    if (me?.profile?.gender) {
      const g = me.profile.gender
      setGender(g.charAt(0).toUpperCase() + g.slice(1))
    }
  }, [me])

  // ── Helpers ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => navigation.replace('SignInScreen'),
      onError:   (err: any) => showToast({ text1: 'Logout failed', text2: err?.message }),
    })
  }

  const closeDialog = () => { setOpenDialog(null); setIsSavingDlg(false) }

  // Save gender → keep dialog open until done
  const handleGenderSelect = (v: string) => {
    setGender(v)
    setIsSavingDlg(true)
    editProfile(
      { gender: v.toLowerCase() as any },
      {
        onSuccess: () => { closeDialog(); showToast({ text1: 'Gender updated' }) },
        onError:   (err: any) => {
          setIsSavingDlg(false)
          showToast({ text1: 'Failed', text2: err?.message })
        },
      },
    )
  }

  // Save age deltas
  const handleAgeConfirm = (min: number, max: number) => {
    setIsSavingDlg(true)
    const myAge = me?.profile?.dob
      ? Math.floor((Date.now() - new Date(me.profile.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 24
    patchPrefs(
      { youngerAgeDelta: Math.max(0, myAge - min), olderAgeDelta: Math.max(0, max - myAge) },
      {
        onSuccess: () => { setMinAge(min); setMaxAge(max); closeDialog(); showToast({ text1: 'Age range updated' }) },
        onError:   (err: any) => { setIsSavingDlg(false); showToast({ text1: 'Failed', text2: err?.message }) },
      },
    )
  }

  // Save distance
  const handleDistanceConfirm = (km: number) => {
    setIsSavingDlg(true)
    patchPrefs(
      { maxDistanceKm: km },
      {
        onSuccess: () => { setDistKm(km); closeDialog(); showToast({ text1: 'Distance updated' }) },
        onError:   (err: any) => { setIsSavingDlg(false); showToast({ text1: 'Failed', text2: err?.message }) },
      },
    )
  }

  // ── Sub-components ────────────────────────────────────────────────────────
  const Divider     = () => <View style={{ height: 1, backgroundColor: '#F0F0F0' }} />
  const SectionTitle = ({ title, style }: { title: string; style?: TextStyle }) => (
    <Text style={[{ fontFamily: 'Poppins-Bold', fontSize: sf(20), fontWeight: '700', color: '#1C1C1E', marginTop: sh(24), marginBottom: sh(8) }, style]}>
      {title}
    </Text>
  )

  const SettingRow = ({ label, value, onPress }: { label: string; value?: string; onPress?: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: sh(14) }}
    >
      <Text style={{ fontFamily: 'Poppins-Regular', fontSize: sf(16), color: '#1C1C1E' }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: sw(6) }}>
        {value && (
          <Text style={{ fontFamily: 'Poppins-Regular', fontSize: sf(16), color: '#A1A1A1' }}>{value}</Text>
        )}
        <ChevronRight size={sf(18)} color="#1C1C1E" />
      </View>
    </TouchableOpacity>
  )

  const ToggleRow = ({
    label, description, value, onValueChange, showDivider = true,
  }: { label: string; description: string; value: boolean; onValueChange: (v: boolean) => void; showDivider?: boolean }) => (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: sh(14), paddingHorizontal: sw(16) }}>
        <View style={{ flex: 1, marginRight: sw(12) }}>
          <Text style={{ fontFamily: 'Poppins-Medium', fontSize: sf(16), color: '#000000' }}>{label}</Text>
          <Text style={{ fontFamily: 'Poppins-Regular', fontSize: sf(13), color: '#555555' }}>{description}</Text>
        </View>
        <CustomToggle value={value} onValueChange={onValueChange} />
      </View>
      {showDivider && <Divider />}
    </>
  )

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', paddingTop: sh(40), paddingBottom: sh(20) }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: sw(20), paddingTop: sh(12), paddingBottom: sh(16) }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={sf(24)} color="#000000" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: sf(20), color: '#1C1C1E' }}>
          Setting
        </Text>
        <View style={{ width: sf(24) }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: sw(20) }}>

        {/* ── Account ─────────────────────────────────────────────────── */}
        <SectionTitle title="Account" />
        <SettingRow label="Email"         value={me?.email ?? 'Example@gmail.com'} />
        <SettingRow label="Password" />
        <SettingRow label="Blocked Users" onPress={() => navigation.navigate('BlockedUsersScreen')} />

        {/* ── Discovery ── skeleton while loading ─────────────────────── */}
        <SectionTitle title="Discovery" />
        {prefsLoading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : (
          <>
            <SettingRow label="Gender"   value={gender}             onPress={() => setOpenDialog('gender')} />
            <SettingRow label="Show me"  value={showMe}             onPress={() => setOpenDialog('showMe')} />
            <SettingRow label="Age"      value={`${minAge}-${maxAge}`} onPress={() => setOpenDialog('age')} />
            <SettingRow label="Distance" value={`${distKm} km`}    onPress={() => setOpenDialog('distance')} />
          </>
        )}

        {/* ── General ─────────────────────────────────────────────────── */}
        <SectionTitle title="General" />
        <SettingRow
          label="Invite Friends"
          onPress={() => setOpenDialog('invite')}
        />

        {/* ── Preferences card ────────────────────────────────────────── */}
        <SectionTitle title="Preferences" />
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: sr(16), borderWidth: 1, borderColor: '#E6E7E8', shadowColor: '#000000', shadowOpacity: 0.09, shadowRadius: 11, shadowOffset: { width: 0, height: 0 }, elevation: 1, overflow: 'hidden', marginTop: sh(12) }}>
          <ToggleRow label="Push Notifications" description="Get notified about matches and messages" value={pushNotifications} onValueChange={setPushNotifications} />
          <ToggleRow label="Show Distance"      description="Display distance on your profile"        value={showDistance}      onValueChange={setShowDistance} />
          <ToggleRow label="Show Age"           description="Display your age on your profile"        value={showAge}           onValueChange={setShowAge} />
          <ToggleRow label="Auto Boost"         description="Automatically boost during peak hours"   value={autoBoost}         onValueChange={setAutoBoost} showDivider={false} />
        </View>

        {/* ── Spark Premium ───────────────────────────────────────────── */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: sr(12), borderWidth: 1, borderColor: '#E6E7E8', shadowColor: '#000000', shadowOpacity: 0.09, shadowRadius: 11, shadowOffset: { width: 0, height: 0 }, elevation: 1, overflow: 'hidden', paddingVertical: sh(14), paddingHorizontal: sw(16), marginTop: sh(24), marginBottom: sh(8) }}>
          <SectionTitle title="⚡ Spark Premium" style={{ marginTop: 0, marginBottom: 0 }} />
          <Text style={{ fontFamily: 'Poppins-Regular', fontSize: sf(16), color: '#7D858E', marginBottom: sh(14) }}>
            Get unlimited likes, see who liked you, and boost your profile
          </Text>
          <PrimaryButton title="Upgrade to Premium" onPress={() => {}} colors={['#1E78F5', '#FBB202']} variant="gradient" style={{ alignSelf: 'stretch' }} textStyle={{ fontSize: sf(16), fontWeight: '500' }} height={sh(48)} />
        </View>

        {/* ── Support ─────────────────────────────────────────────────── */}
        <SectionTitle title="Support" />
        <SettingRow label="Help Center" />
        <SettingRow label="Safety Guidelines" />
        <SettingRow label="Contact Us" />

        {/* ── Buttons ─────────────────────────────────────────────────── */}
        <View style={{ marginTop: sh(24), gap: sh(12) }}>
          <PrimaryButton
            title={isLoggingOut ? 'Logging out…' : 'Logout'}
            icon={isLoggingOut
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <LogOut width={sf(24)} height={sf(24)} color="#FFFFFF" />
            }
            iconPosition="middle"
            onPress={handleLogout}
            disabled={isLoggingOut}
            colors={['#1E78F5']}
            variant="solid"
            style={{ alignSelf: 'stretch', opacity: isLoggingOut ? 0.6 : 1 }}
            textStyle={{ fontSize: sf(20), fontWeight: '500' }}
          />
          <PrimaryButton
            title="Delete Account"
            icon={<Trash2 width={sf(24)} height={sf(24)} color="#FFFFFF" />}
            iconPosition="middle"
            onPress={() => {}}
            colors={['#FF073E']}
            variant="solid"
            style={{ alignSelf: 'stretch' }}
            textStyle={{ fontSize: sf(20), fontWeight: '500' }}
          />
        </View>
      </ScrollView>

      {/* ── Bottom sheets ───────────────────────────────────────────────── */}

      <OptionSheet
        visible={openDialog === 'gender'}
        title="Gender"
        options={GENDER_OPTIONS}
        selected={gender}
        onSelect={handleGenderSelect}
        onClose={closeDialog}
        isSaving={isSavingDlg}
      />

      <OptionSheet
        visible={openDialog === 'showMe'}
        title="Show Me"
        options={SHOW_ME_OPTIONS}
        selected={showMe}
        onSelect={(v) => { setShowMe(v); closeDialog() }}
        onClose={closeDialog}
      />

      <AgeSheet
        visible={openDialog === 'age'}
        minAge={minAge}
        maxAge={maxAge}
        onConfirm={handleAgeConfirm}
        onClose={closeDialog}
        isSaving={isSavingDlg}
      />

      <DistanceSheet
        visible={openDialog === 'distance'}
        distance={distKm}
        onConfirm={handleDistanceConfirm}
        onClose={closeDialog}
        isSaving={isSavingDlg}
      />

      <InviteSheet
        visible={openDialog === 'invite'}
        onClose={closeDialog}
      />
    </View>
  )
}

export default SettingsScreen

const styles = StyleSheet.create({
  // ── Bottom sheet ────────────────────────────────────────────────────────
  sheet: {
    backgroundColor:      '#FFFFFF',
    borderTopLeftRadius:  sr(24),
    borderTopRightRadius: sr(24),
    paddingHorizontal:    sw(20),
    paddingTop:           sh(12),
    paddingBottom:        sh(44),
  },
  sheetHandle: {
    width:           sw(40),
    height:          sh(4),
    backgroundColor: '#E8EAED',
    borderRadius:    sr(99),
    alignSelf:       'center',
    marginBottom:    sh(20),
  },
  sheetTitle: {
    fontFamily:   'Poppins-SemiBold',
    fontSize:     sf(18),
    color:        '#000000',
    textAlign:    'center',
    marginBottom: sh(20),
  },
  sheetOption: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingVertical:   sh(15),
    paddingHorizontal: sw(4),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sheetOptionSelected: {
    backgroundColor:   '#F0F7FF',
    borderRadius:      sr(8),
    paddingHorizontal: sw(8),
  },
  sheetOptionText: {
    fontFamily: 'Poppins-Regular',
    fontSize:   sf(16),
    color:      '#1C1C1E',
  },
  sheetCancel: {
    marginTop:  sh(16),
    alignItems: 'center',
  },
  sliderLabel: {
    fontFamily:   'Poppins-Regular',
    fontSize:     sf(13),
    color:        '#7D858E',
    marginBottom: sh(6),
  },
})