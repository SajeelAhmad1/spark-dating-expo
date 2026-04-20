import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { ChevronLeft, ChevronRight, LogOut, Trash2 } from 'lucide-react-native';
import { sf, sr, sw, sh } from '@/utils/sizeMatters';
import PrimaryButton from '@/components/common/PrimaryButton';
import CustomToggle from '@/components/location/CustomToggle';
import {
  useDiscoveryPreferences,
  usePatchDiscoveryPreferences,
} from '@/features/discovery/hooks';
import { useLogout } from '@/features/auth/hooks';
import { useMe } from '@/features/profile/hooks';
import { showToast } from '@/utils/toast';

const SettingsScreen = ({ navigation }: any) => {
  // ── Remote state ──────────────────────────────────────────────────────────
  const { data: prefs, isLoading: prefsLoading } = useDiscoveryPreferences();
  const { mutate: patchPrefs, isPending: isSavingPrefs } =
    usePatchDiscoveryPreferences();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { data: me } = useMe();

  // ── Local toggles (UI-only for now) ──────────────────────────────────────
  const [pushNotifications, setPushNotifications] = useState(false);
  const [showDistance, setShowDistance] = useState(false);
  const [showAge, setShowAge] = useState(true);
  const [autoBoost, setAutoBoost] = useState(false);

  // ── Discovery pref sliders (local copy, saved on blur) ───────────────────
  const [maxDistanceKm, setMaxDistanceKm] = useState(50);
  const [youngerAgeDelta, setYoungerAgeDelta] = useState(5);
  const [olderAgeDelta, setOlderAgeDelta] = useState(5);

  useEffect(() => {
    if (prefs) {
      setMaxDistanceKm(prefs.maxDistanceKm);
      setYoungerAgeDelta(prefs.youngerAgeDelta);
      setOlderAgeDelta(prefs.olderAgeDelta);
    }
  }, [prefs]);

  const savePrefs = (patch: Partial<typeof prefs>) => {
    if (!patch) return;
    patchPrefs(patch as any);
  };

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => navigation.replace('SignInScreen'),
      onError: (err: any) =>
        showToast({ text1: 'Logout failed', text2: err?.message }),
    });
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const Divider = () => (
    <View style={{ height: 1, backgroundColor: '#F0F0F0' }} />
  );

  const SectionTitle = ({
    title,
    style,
  }: {
    title: string;
    style?: TextStyle;
  }) => (
    <Text
      style={[
        {
          fontFamily: 'Poppins-Bold',
          fontSize: sf(20),
          fontWeight: '700',
          color: '#1C1C1E',
          marginTop: sh(24),
          marginBottom: sh(8),
        },
        style,
      ]}
    >
      {title}
    </Text>
  );

  const SettingRow = ({
    label,
    value,
    onPress,
  }: {
    label: string;
    value?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: sh(14),
      }}
    >
      <Text
        style={{
          fontFamily: 'Poppins-Regular',
          fontSize: sf(16),
          color: '#1C1C1E',
        }}
      >
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: sw(6) }}>
        {value && (
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: sf(16),
              color: '#A1A1A1',
            }}
          >
            {value}
          </Text>
        )}
        <ChevronRight
          size={sf(18)}
          color='#1C1C1E'
        />
      </View>
    </TouchableOpacity>
  );

  const ToggleRow = ({
    label,
    description,
    value,
    onValueChange,
    showDivider = true,
  }: {
    label: string;
    description: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
    showDivider?: boolean;
  }) => (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: sh(14),
          paddingHorizontal: sw(16),
        }}
      >
        <View style={{ flex: 1, marginRight: sw(12) }}>
          <Text
            style={{
              fontFamily: 'Poppins-Medium',
              fontSize: sf(16),
              color: '#000000',
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: sf(13),
              color: '#555555',
            }}
          >
            {description}
          </Text>
        </View>
        <CustomToggle
          value={value}
          onValueChange={onValueChange}
        />
      </View>
      {showDivider && <Divider />}
    </>
  );

  // Distance row with inline value and save-on-press chevron
  const PreferenceRow = ({
    label,
    value,
    onDecrease,
    onIncrease,
    unit,
    saving,
  }: {
    label: string;
    value: number;
    onDecrease: () => void;
    onIncrease: () => void;
    unit: string;
    saving: boolean;
  }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: sh(14),
      }}
    >
      <Text
        style={{
          fontFamily: 'Poppins-Regular',
          fontSize: sf(16),
          color: '#1C1C1E',
        }}
      >
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: sw(12) }}>
        {saving ? (
          <ActivityIndicator
            size='small'
            color='#1E78F5'
          />
        ) : null}
        <TouchableOpacity
          onPress={onDecrease}
          style={{
            width: sf(28),
            height: sf(28),
            borderRadius: 99,
            backgroundColor: '#F0F0F0',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{ fontSize: sf(18), color: '#1C1C1E', lineHeight: sf(22) }}
          >
            −
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            fontFamily: 'Poppins-SemiBold',
            fontSize: sf(15),
            color: '#1C1C1E',
            minWidth: sw(36),
            textAlign: 'center',
          }}
        >
          {value} {unit}
        </Text>
        <TouchableOpacity
          onPress={onIncrease}
          style={{
            width: sf(28),
            height: sf(28),
            borderRadius: 99,
            backgroundColor: '#F0F0F0',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{ fontSize: sf(18), color: '#1C1C1E', lineHeight: sf(22) }}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: sh(40),
        paddingBottom: sh(20),
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: sw(20),
          paddingTop: sh(12),
          paddingBottom: sh(16),
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft
            size={sf(24)}
            color='#000000'
          />
        </TouchableOpacity>
        <Text
          style={{
            fontFamily: 'Poppins-SemiBold',
            fontSize: sf(20),
            color: '#1C1C1E',
          }}
        >
          Settings
        </Text>
        <View style={{ width: sf(24) }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: sw(20) }}
      >
        {/* ── Account ──────────────────────────────────────────────────── */}
        <SectionTitle title='Account' />
        <SettingRow
          label='Email'
          value={me?.email ?? '—'}
        />
        <SettingRow label='Password' />
        <SettingRow
          label='Blocked Users'
          onPress={() => navigation.navigate('BlockedUsersScreen')}
        />

        {/* ── Discovery preferences ─────────────────────────────────────── */}
        <SectionTitle title='Discovery' />
        {prefsLoading ? (
          <ActivityIndicator
            color='#1E78F5'
            style={{ marginTop: sh(8) }}
          />
        ) : (
          <>
            <PreferenceRow
              label='Max Distance'
              value={maxDistanceKm}
              unit='km'
              saving={isSavingPrefs}
              onDecrease={() => {
                const v = Math.max(1, maxDistanceKm - 5);
                setMaxDistanceKm(v);
                savePrefs({ maxDistanceKm: v });
              }}
              onIncrease={() => {
                const v = Math.min(200, maxDistanceKm + 5);
                setMaxDistanceKm(v);
                savePrefs({ maxDistanceKm: v });
              }}
            />
            <Divider />
            <PreferenceRow
              label='Show Younger By'
              value={youngerAgeDelta}
              unit='yrs'
              saving={false}
              onDecrease={() => {
                const v = Math.max(0, youngerAgeDelta - 1);
                setYoungerAgeDelta(v);
                savePrefs({ youngerAgeDelta: v });
              }}
              onIncrease={() => {
                const v = Math.min(20, youngerAgeDelta + 1);
                setYoungerAgeDelta(v);
                savePrefs({ youngerAgeDelta: v });
              }}
            />
            <Divider />
            <PreferenceRow
              label='Show Older By'
              value={olderAgeDelta}
              unit='yrs'
              saving={false}
              onDecrease={() => {
                const v = Math.max(0, olderAgeDelta - 1);
                setOlderAgeDelta(v);
                savePrefs({ olderAgeDelta: v });
              }}
              onIncrease={() => {
                const v = Math.min(20, olderAgeDelta + 1);
                setOlderAgeDelta(v);
                savePrefs({ olderAgeDelta: v });
              }}
            />
          </>
        )}

        {/* ── General ──────────────────────────────────────────────────── */}
        <SectionTitle title='General' />
        <SettingRow label='Invite Friends' />

        {/* ── Preferences ──────────────────────────────────────────────── */}
        <SectionTitle title='Preferences' />
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: sr(16),
            borderWidth: 1,
            borderColor: '#E6E7E8',
            shadowColor: '#000000',
            shadowOpacity: 0.09,
            shadowRadius: 11,
            shadowOffset: { width: 0, height: 0 },
            elevation: 1,
            overflow: 'hidden',
            marginTop: sh(12),
          }}
        >
          <ToggleRow
            label='Push Notifications'
            description='Get notified about matches and messages'
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />
          <ToggleRow
            label='Show Distance'
            description='Display distance on your profile'
            value={showDistance}
            onValueChange={setShowDistance}
          />
          <ToggleRow
            label='Show Age'
            description='Display your age on your profile'
            value={showAge}
            onValueChange={setShowAge}
          />
          <ToggleRow
            label='Auto Boost'
            description='Automatically boost during peak hours'
            value={autoBoost}
            onValueChange={setAutoBoost}
            showDivider={false}
          />
        </View>

        {/* ── Spark Premium ────────────────────────────────────────────── */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: sr(12),
            borderWidth: 1,
            borderColor: '#E6E7E8',
            shadowColor: '#000000',
            shadowOpacity: 0.09,
            shadowRadius: 11,
            shadowOffset: { width: 0, height: 0 },
            elevation: 1,
            overflow: 'hidden',
            paddingVertical: sh(14),
            paddingHorizontal: sw(16),
            marginTop: sh(24),
            marginBottom: sh(8),
          }}
        >
          <SectionTitle
            title='⚡ Spark Premium'
            style={{ marginTop: sh(0), marginBottom: sh(0) }}
          />
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: sf(16),
              color: '#7D858E',
              marginBottom: sh(14),
            }}
          >
            Get unlimited likes, see who liked you, and boost your profile
          </Text>
          <PrimaryButton
            title='Upgrade to Premium'
            onPress={() => {}}
            colors={['#1E78F5', '#FBB202']}
            variant='gradient'
            style={{ alignSelf: 'stretch' }}
            textStyle={{ fontSize: sf(16), fontWeight: '500' }}
            height={sh(48)}
          />
        </View>

        {/* ── Support ──────────────────────────────────────────────────── */}
        <SectionTitle title='Support' />
        <SettingRow label='Help Center' />
        <SettingRow label='Safety Guidelines' />
        <SettingRow label='Contact Us' />

        {/* ── Buttons ──────────────────────────────────────────────────── */}
        <View style={{ marginTop: sh(24), gap: sh(12) }}>
          <PrimaryButton
            title={isLoggingOut ? 'Logging out…' : 'Logout'}
            icon={
              isLoggingOut ? (
                <ActivityIndicator
                  size='small'
                  color='#FFFFFF'
                />
              ) : (
                <LogOut
                  width={sf(24)}
                  height={sf(24)}
                  color='#FFFFFF'
                />
              )
            }
            iconPosition='middle'
            onPress={handleLogout}
            disabled={isLoggingOut}
            colors={['#1E78F5']}
            variant='solid'
            style={{ alignSelf: 'stretch', opacity: isLoggingOut ? 0.6 : 1 }}
            textStyle={{ fontSize: sf(20), fontWeight: '500' }}
          />
          <PrimaryButton
            title='Delete Account'
            icon={
              <Trash2
                width={sf(24)}
                height={sf(24)}
                color='#FFFFFF'
              />
            }
            iconPosition='middle'
            onPress={() => {}}
            colors={['#FF073E']}
            variant='solid'
            style={{ alignSelf: 'stretch' }}
            textStyle={{ fontSize: sf(20), fontWeight: '500' }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
