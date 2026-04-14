// scrrens/BlockedUsersScreen.tsx
import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { ChevronLeft, Handshake, Search, SubscriptIcon } from 'lucide-react-native';
import { sf, sr, sw, sh } from '@/utils/sizeMatters';
import PrimaryButton from '@/components/common/PrimaryButton';
import { BLOCKED_USERS, BlockedUser } from '@/constants/blockedUsers';
import { useZodForm } from '@/utils/form';
import { blockedUsersSearchFormSchema } from '@/schemas/messaging';
import { FieldError } from '@/components/common/FieldError';
import { showToast } from '@/utils/toast';

const BlockedUsersScreen = ({ navigation }: any) => {
  const [blockedUsers, setBlockedUsers] =
    useState<BlockedUser[]>(BLOCKED_USERS);

  const { watch, setValue, trigger, formState } = useZodForm(blockedUsersSearchFormSchema, {
    defaultValues: { search: '' },
  });

  const search = watch('search');
  const searchError = formState.errors.search?.message;
  const safeSearch = search.length > 120 ? search.slice(0, 120) : search;

  const filtered = blockedUsers.filter(u =>
    u.name.toLowerCase().includes(safeSearch.toLowerCase()),
  );

  const handleUnblock = (id: string, name: string) => {
    setBlockedUsers(prev => prev.filter(u => u.id !== id));
    showToast({ text1: 'Unblocked', text2: `${name} removed from blocked users`, icon: Handshake });

  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', paddingTop: sh(40), paddingBottom: sh(20) }}>
        {/* ── Header ── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: sw(20),
            paddingTop: sh(16),
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
              color: '#000000', 
            }}
          >
            Blocked Users
          </Text>
          <View style={{ width: sf(24) }} />
        </View>

        {/* ── Search Bar ── */}
        <View
          style={{
            marginHorizontal: sw(21),
            marginBottom: sh(16),
            height: sh(48),
            borderWidth: 1,
            borderColor: '#7D858E',
            borderRadius: sr(12),
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: sw(14),
            gap: sw(8),
          }}
        >
          <Search size={sf(24)} color="#7D858E" />
          <TextInput
            value={search}
            onChangeText={v => setValue('search', v, { shouldValidate: true })}
            onBlur={() => trigger('search')}
            placeholder="Search blocked users"
            placeholderTextColor="#7D858E"
            style={{
              flex: 1,
              fontFamily: 'Poppins-Regular',
              fontSize: sf(14),
              fontWeight: '400',
              color: '#1C1C1E', 
              padding: 0,
            }}
          />
        </View>
        <View style={{ marginHorizontal: sw(21) }}>
          <FieldError message={searchError} />
        </View>

        {/* ── Count ── */}
        <Text
          style={{
            fontFamily: 'Poppins-Regular',
            fontSize: sf(14),
            fontWeight: '400',
            color: '#7D858E', 
            paddingHorizontal: sw(21),
            marginBottom: sh(4),
          }}
        >
          {filtered.length} BLOCKED CONTACTS
        </Text>

        {/* ── List ── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: sh(20) }}
        >
          {filtered.map(user => (
            <View key={user.id} style={{}}>
              {/* Row */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: sw(21),
                  paddingVertical: sh(8),
                  gap: sw(12),
                  // height: sh(60),
                }}
              >
                {/* Avatar */}
                <Image
                  source={{ uri: user.avatar }}
                  style={{
                    width: sw(60),
                    height: sh(60),
                    borderRadius: (999),
                  }}
                  resizeMode="cover"
                />

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: sw(6),
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Poppins-Regular',
                        fontSize: sf(20),
                        fontWeight: '400',
                        color: '#000000', 
                      }}
                    >
                      {user.name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Poppins-Regular',
                        fontSize: sf(14),
                        fontWeight: '400',
                        color: '#7D858E', 
                      }}
                    >
                      {user.age}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      fontSize: sf(14),
                      fontWeight: '400',
                      color: '#7D858E', 
                      // marginTop: sh(6),
                    }}
                  >
                    Blocked {user.blockedDate}
                  </Text>
                </View>

                {/* Unblock Button */}
                <View style={{ width: sw(130), alignItems: 'flex-end' }}>
                  <PrimaryButton
                    title="Unblock"
                    onPress={() => handleUnblock(user.id, user.name)}
                    colors={['#1E78F5', '#FBB202']}
                    variant="gradient"
                    height={40}
                    borderRadius={12}
                    // paddingHorizontal={sw(2)}
                    textStyle={{
                      fontSize: sf(15),
                      fontWeight: '500',
                      lineHeight: sh(40),
                    }}
                  />
                </View>
              </View>

              {/* Bottom Border */}
              <View
                style={{
                  height: 1,
                  backgroundColor: '#7D858E',
                  marginHorizontal: sw(21),
                  // opacity: 0.25,
                }}
              />
            </View>
          ))}

          {/* ── Empty State ── */}
          {filtered.length === 0 && (
            <View
              style={{
                alignItems: 'center',
                marginTop: sh(48),
                paddingHorizontal: sw(40),
              }}
            >
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontSize: sf(14),
                  color: '#7D858E',
                  textAlign: 'center', 
                }}
              >
                No blocked users found.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* ── Bottom Note ── */}
        <View
          style={{
            paddingHorizontal: sw(21),
          }}
        >
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: sf(14),
              fontWeight: '400',
              color: '#7D858E',
              letterSpacing: 0,
              textAlign: 'center', 
            }}
          >
            Blocked users cannot send you messages, see your profile, or find
            your location.
          </Text>
        </View>
    </View>
  );
};

export default BlockedUsersScreen;
