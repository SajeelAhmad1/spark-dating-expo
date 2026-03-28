import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react-native';
import { sf, sr, sw, sh } from '@/utils/responsive';
import PrimaryButton from '@/components/common/PrimaryButton';
import CustomToggle from '@/components/location/CustomToggle';

const SettingsScreen = ({ navigation }: any) => {
  const [pushNotifications, setPushNotifications] = useState(false);
  const [showDistance, setShowDistance] = useState(false);
  const [showAge, setShowAge] = useState(true);
  const [autoBoost, setAutoBoost] = useState(false);

  // ── Reusable row ──
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
          fontWeight: '400',
          color: '#1C1C1E',
          letterSpacing: 0,
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
              fontWeight: '400',
              color: '#A1A1A1',
              letterSpacing: 0,
            }}
          >
            {value}
          </Text>
        )}
        <ChevronRight size={sf(18)} color="#1C1C1E" />
      </View>
    </TouchableOpacity>
  );

  const Divider = () => (
    <View style={{ height: 1, backgroundColor: '#F0F0F0' }} />
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text
      style={{
        fontFamily: 'Poppins-Bold',
        fontSize: sf(20),
        fontWeight: '700',
        color: '#1C1C1E',
        letterSpacing: 0,
        marginTop: sh(24),
        marginBottom: sh(8),
      }}
    >
      {title}
    </Text>
  );

  // ── Toggle row inside card ──
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
              fontWeight: '500',
              color: '#000000',
              letterSpacing: 0,
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: sf(13),
              fontWeight: '400',
              color: '#555555',
              letterSpacing: 0,
              marginTop: sh(4),
            }}
          >
            {description}
          </Text>
        </View>
        <CustomToggle value={value} onValueChange={onValueChange} />
      </View>
      {showDivider && <Divider />}
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* ── Header ── */}
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
            <ChevronLeft size={sf(24)} color="#000000" />
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: 'Poppins-SemiBold',
              fontSize: sf(20),
              fontWeight: '600',
              color: '#1C1C1E',
              letterSpacing: 0,
            }}
          >
            Setting
          </Text>
          <View style={{ width: sf(24) }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: sw(20),
            paddingBottom: sh(40),
          }}
        >
          {/* ── Account ── */}
          <SectionTitle title="Account" />
          <SettingRow label="Email" value="Example@gmail.com" />
          <Divider />
          <SettingRow label="Password" />
          <Divider />
          <SettingRow label="Blocked Users" />

          {/* ── Discovery ── */}
          <SectionTitle title="Discovery" />
          <SettingRow label="Gender" value="Women" />
          <Divider />
          <SettingRow label="Show me" value="Women" />
          <Divider />
          <SettingRow label="Age" value="24-72" />
          <Divider />
          <SettingRow label="Distance" value="10 miles" />

          {/* ── General ── */}
          <SectionTitle title="General" />
          <SettingRow label="Invite Friends" />

          {/* ── Preferences ── */}
          <SectionTitle title="Preferences" />
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
              elevation: 4,
              overflow: 'hidden',
            }}
          >
            <ToggleRow
              label="Push Notifications"
              description="Get notified about matches and messages"
              value={pushNotifications}
              onValueChange={setPushNotifications}
            />
            <ToggleRow
              label="Show Distance"
              description="Display distance on your profile"
              value={showDistance}
              onValueChange={setShowDistance}
            />
            <ToggleRow
              label="Show Age"
              description="Display your age on your profile"
              value={showAge}
              onValueChange={setShowAge}
            />
            <ToggleRow
              label="Auto Boost"
              description="Automatically boost during peak hours"
              value={autoBoost}
              onValueChange={setAutoBoost}
              showDivider={false}
            />
          </View>

          {/* ── Spark Premium ── */}
          <SectionTitle title="⚡ Spark Premium" />
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: sf(16),
              fontWeight: '400',
              color: '#7D858E',
              letterSpacing: 0,
              marginBottom: sh(14),
            }}
          >
            Get unlimited likes, see who liked you, and boost your profile
          </Text>
          <PrimaryButton
            title="Upgrade to Premium"
            onPress={() => {}}
            colors={['#1E78F5', '#FBB202']}
            variant="gradient"
            style={{ alignSelf: 'stretch' }}
            textStyle={{fontSize: sf(16), fontWeight: '500'}}
          />

          {/* ── Support ── */}
          <SectionTitle title="Support" />
          <SettingRow label="Help Center" />
          <Divider />
          <SettingRow label="Safety Guidelines" />
          <Divider />
          <SettingRow label="Contact Us" />

          {/* ── Buttons ── */}
          <View style={{ marginTop: sh(24), gap: sh(12) }}>
            <PrimaryButton
              title="Logout"
              onPress={() => {}}
              colors={['#1E78F5']}
              variant="solid"
              style={{ alignSelf: 'stretch' }}
              textStyle={{fontSize: sf(20), fontWeight: '500'}}
            />
            <PrimaryButton
              title="Delete Account"
              onPress={() => {}}
              colors={['#FF073E']}
              variant="solid"
              style={{ alignSelf: 'stretch' }}
              textStyle={{fontSize: sf(20), fontWeight: '500'}}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default SettingsScreen;
