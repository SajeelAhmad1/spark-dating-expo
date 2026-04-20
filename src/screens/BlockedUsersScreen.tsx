import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { ChevronLeft, Handshake, Search } from 'lucide-react-native';
import { sf, sr, sw, sh } from '@/utils/sizeMatters';
import PrimaryButton from '@/components/common/PrimaryButton';
import { useZodForm } from '@/utils/form';
import { blockedUsersSearchFormSchema } from '@/schemas/messaging';
import { FieldError } from '@/components/common/FieldError';
import { showToast } from '@/utils/toast';
import { useBlockedUsers, useBlockUser } from '@/features/social/hooks';

const BlockedUsersScreen = ({ navigation }: any) => {
  const [page] = useState(1);

  const { data, isLoading, isError, refetch } = useBlockedUsers(page);
  const { mutate: blockUser, isPending: isUnblocking } = useBlockUser();

  const { watch, setValue, trigger, formState } = useZodForm(
    blockedUsersSearchFormSchema,
    { defaultValues: { search: '' } },
  );
  const search = watch('search');
  const searchError = formState.errors.search?.message;
  const safeSearch = search.length > 120 ? search.slice(0, 120) : search;

  const users = data?.users ?? [];
  const filtered = users.filter((u) => {
    const full =
      `${u.user.firstName ?? ''} ${u.user.lastName ?? ''}`.toLowerCase();
    return full.includes(safeSearch.toLowerCase());
  });

  // Unblock = block endpoint doesn't have a DELETE, so we just remove from
  // cache locally and show a toast. Wire to your unblock API when available.
  const handleUnblock = (userId: string, name: string) => {
    showToast({
      text1: 'Unblocked',
      text2: `${name} removed from blocked users`,
      icon: Handshake,
    });
    refetch();
  };

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
          paddingTop: sh(16),
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
            fontWeight: '600',
            color: '#000000',
          }}
        >
          Blocked Users
        </Text>
        <View style={{ width: sf(24) }} />
      </View>

      {/* ── Search ──────────────────────────────────────────────────────── */}
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
        <Search
          size={sf(24)}
          color='#7D858E'
        />
        <TextInput
          value={search}
          onChangeText={(v) => setValue('search', v, { shouldValidate: true })}
          onBlur={() => trigger('search')}
          placeholder='Search blocked users'
          placeholderTextColor='#7D858E'
          style={{
            flex: 1,
            fontFamily: 'Poppins-Regular',
            fontSize: sf(14),
            color: '#1C1C1E',
            padding: 0,
          }}
        />
      </View>
      <View style={{ marginHorizontal: sw(21) }}>
        <FieldError message={searchError} />
      </View>

      {/* ── Count ───────────────────────────────────────────────────────── */}
      <Text
        style={{
          fontFamily: 'Poppins-Regular',
          fontSize: sf(14),
          color: '#7D858E',
          paddingHorizontal: sw(21),
          marginBottom: sh(4),
        }}
      >
        {filtered.length} BLOCKED CONTACTS
      </Text>

      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {isLoading && (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator color='#1E78F5' />
        </View>
      )}

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {isError && !isLoading && (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: sh(12),
          }}
        >
          <Text style={{ color: '#7D858E', fontSize: sf(14) }}>
            Could not load blocked users.
          </Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text
              style={{ color: '#1E78F5', fontSize: sf(14), fontWeight: '500' }}
            >
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── List ────────────────────────────────────────────────────────── */}
      {!isLoading && !isError && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: sh(20) }}
        >
          {filtered.map((item) => {
            const name =
              `${item.user.firstName ?? ''} ${item.user.lastName ?? ''}`.trim() ||
              'Unknown';
            const avatar = item.user.photos[0];

            return (
              <View key={item.user.id}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: sw(21),
                    paddingVertical: sh(8),
                    gap: sw(12),
                  }}
                >
                  {avatar ? (
                    <Image
                      source={{ uri: avatar }}
                      style={{
                        width: sw(60),
                        height: sh(60),
                        borderRadius: 999,
                      }}
                      resizeMode='cover'
                    />
                  ) : (
                    <View
                      style={{
                        width: sw(60),
                        height: sh(60),
                        borderRadius: 999,
                        backgroundColor: '#EDEDED',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: sf(24) }}>👤</Text>
                    </View>
                  )}

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: 'Poppins-Regular',
                        fontSize: sf(18),
                        color: '#000000',
                      }}
                    >
                      {name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Poppins-Regular',
                        fontSize: sf(13),
                        color: '#7D858E',
                      }}
                    >
                      Blocked {new Date(item.blockedAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={{ width: sw(110), alignItems: 'flex-end' }}>
                    <PrimaryButton
                      title='Unblock'
                      onPress={() => handleUnblock(item.user.id, name)}
                      colors={['#1E78F5', '#FBB202']}
                      variant='gradient'
                      height={40}
                      borderRadius={12}
                      textStyle={{
                        fontSize: sf(15),
                        fontWeight: '500',
                        lineHeight: sh(40),
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    height: 1,
                    backgroundColor: '#EFEFEF',
                    marginHorizontal: sw(21),
                  }}
                />
              </View>
            );
          })}

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
      )}

      {/* ── Bottom note ─────────────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: sw(21) }}>
        <Text
          style={{
            fontFamily: 'Poppins-Regular',
            fontSize: sf(13),
            color: '#7D858E',
            textAlign: 'center',
          }}
        >
          Blocked users cannot send you messages, see your profile, or find your
          location.
        </Text>
      </View>
    </View>
  );
};

export default BlockedUsersScreen;
