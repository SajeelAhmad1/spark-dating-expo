import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search } from 'lucide-react-native';
import { sf, sr, sw, sh } from '@/utils/responsive';
import PrimaryButton from '@/components/common/PrimaryButton';
import { BLOCKED_USERS, BlockedUser } from '@/constants/blockedUsers';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const BlockedUsersScreen = ({ navigation }: any) => {
  const [blockedUsers, setBlockedUsers] =
    useState<BlockedUser[]>(BLOCKED_USERS);

  const searchSchema = z.string();
  const { watch, setValue } = useForm<{ search: string }>({
    defaultValues: { search: '' },
  });

  const search = watch('search');
  const safeSearch = searchSchema.safeParse(search).success ? search : '';

  const filtered = blockedUsers.filter(u =>
    u.name.toLowerCase().includes(safeSearch.toLowerCase()),
  );

  const handleUnblock = (id: string) => {
    setBlockedUsers(prev => prev.filter(u => u.id !== id));
  };

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
              color: '#000000',
              letterSpacing: 0,
              lineHeight: sf(20),
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
          <Search size={sf(16)} color="#7D858E" />
          <TextInput
            value={search}
            onChangeText={v => setValue('search', v)}
            placeholder="Search blocked users"
            placeholderTextColor="#7D858E"
            style={{
              flex: 1,
              fontFamily: 'Poppins-Regular',
              fontSize: sf(14),
              fontWeight: '400',
              color: '#1C1C1E',
              letterSpacing: 0,
              padding: 0,
            }}
          />
        </View>

        {/* ── Count ── */}
        <Text
          style={{
            fontFamily: 'Poppins-Regular',
            fontSize: sf(14),
            fontWeight: '400',
            color: '#7D858E',
            letterSpacing: 0,
            lineHeight: sf(14),
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
            <View key={user.id}>
              {/* Row */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: sw(21),
                  paddingVertical: sh(14),
                  gap: sw(12),
                }}
              >
                {/* Avatar */}
                <Image
                  source={{ uri: user.avatar }}
                  style={{
                    width: sf(60),
                    height: sf(60),
                    borderRadius: sf(30),
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
                        letterSpacing: 0,
                        lineHeight: sf(20),
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
                        letterSpacing: 0,
                        lineHeight: sf(14),
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
                      letterSpacing: 0,
                      lineHeight: sf(14),
                      marginTop: sh(6),
                    }}
                  >
                    Blocked {user.blockedDate}
                  </Text>
                </View>

                {/* Unblock Button */}
                <View style={{ width: sw(130), alignItems: 'flex-end' }}>
                  <PrimaryButton
                    title="Unblock"
                    onPress={() => handleUnblock(user.id)}
                    colors={['#1E78F5', '#FBB202']}
                    variant="gradient"
                    height={36}
                    borderRadius={18}
                    paddingHorizontal={sw(16)}
                    textStyle={{
                      fontSize: sf(14),
                      lineHeight: sf(14),
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
                  opacity: 0.25,
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
                  lineHeight: sf(20),
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
            paddingTop: sh(16),
            paddingBottom: sh(28),
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
              lineHeight: sf(20),
            }}
          >
            Blocked users cannot send you messages, see your profile, or find
            your location.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default BlockedUsersScreen;
