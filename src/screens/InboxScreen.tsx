import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { ChevronLeft, Search, Lock } from 'lucide-react-native';
import BottomTabBar from '@/components/common/BottomTabBar';
import { CONVERSATIONS } from '@/constants/conversations';
import type { BottomTab } from '@/types/bottomTabs';
import { INBOX_FILTERS } from '@/constants/inbox';
import type { InboxFilterType } from '@/types/inbox';
import { filterConversations } from '@/utils/inbox';
import ConversationItem from '@/components/inbox/ConversationItem';
import SectionHeader from '@/components/inbox/SectionHeader';
import { sf, sr, sw, sh } from '@/utils/responsive';
import { MATCHES } from '@/constants/matches';
import { useZodForm } from '@/utils/form';
import { inboxSearchFormSchema } from '@/schemas/messaging';
import { FieldError } from '@/components/common/FieldError';

export default function InboxScreen({ navigation, route }: any) {
  const [activeFilter, setActiveFilter] = useState<InboxFilterType>('All');
  const [activeTab, setActiveTab] = useState<BottomTab>('Chat');
  const cameraSelectMode: boolean = !!route?.params?.cameraSelectMode;

  const { watch, setValue, trigger, formState } = useZodForm(inboxSearchFormSchema, {
    defaultValues: {
      searchQuery: '',
    },
  });

  const searchQuery = watch('searchQuery');
  const searchError = formState.errors.searchQuery?.message;
  const safeSearchQuery =
    searchQuery.length > 120 ? searchQuery.slice(0, 120) : searchQuery;

  const filtered = filterConversations(
    CONVERSATIONS,
    activeFilter,
    safeSearchQuery,
  );

  const activeConversations = filtered.filter(c => c.status === 'active');
  const lockingConversations = filtered.filter(c => c.status === 'locking');
  const lockedConversations = filtered.filter(c => c.status === 'locked');

  const handleTabPress = (tab: BottomTab) => {
    if (tab === 'Chat') {
      setActiveTab('Chat');
      return;
    }
    if (tab === 'Home') navigation.navigate('DiscoveryScreen');
    if (tab === 'Request') navigation.navigate('RequestsScreen');
    if (tab === 'Camera')
      navigation.navigate('InboxScreen', { cameraSelectMode: true });
    if (tab === 'Profile') navigation.navigate('ProfileScreen');
  };

  const openConversation = (item: any) => {
    const user = MATCHES.find(m => m.id === item.userId) ?? MATCHES[0];
    navigation.navigate('ChatScreen', {
      chatUserId: user.id,
      chatUserName: user.name,
      chatUserImageUri: user.image,
      initialLocked: item.status === 'locked',
      autoOpenCamera: false,
    });
  };

  const openCameraForConversation = (item: any) => {
    const user = MATCHES.find(m => m.id === item.userId) ?? MATCHES[0];
    navigation.navigate('ChatScreen', {
      chatUserId: user.id,
      chatUserName: user.name,
      chatUserImageUri: user.image,
      initialLocked: false,
      autoOpenCamera: true,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* ── Nav Bar ── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          paddingHorizontal: sw(20),
          paddingTop: 34,
          paddingBottom: 24,
        }}
      >
        {/* Back button — fixed width */}
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4, width: sw(60) }}
        >
          <ChevronLeft size={sf(24)} color="#555555" strokeWidth={2} />
          <Text style={{ fontSize: sf(13), color: '#8D8D8D', fontWeight: '400' }}>
            Back
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={{ fontSize: sf(20), fontWeight: '600', color: '#000000' }}>
          Inbox
        </Text>

        {/* Spacer — mirrors back button width */}
        <View style={{ width: sw(60) }} />
      </View>

      {/* ── Search Bar ── */}
      <View style={{ paddingHorizontal: sw(20), marginBottom: sh(14) }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: sh(48),
            backgroundColor: '#FFFFFF',
            borderRadius: sr(12),
            paddingHorizontal: sw(14),
            gap: 8,
            borderWidth: 1,
            borderColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Search size={sf(24)} color="#8D8D8D" strokeWidth={2} />
          <TextInput
            placeholder="Search conversations..."
            placeholderTextColor="#8D8D8D"
            value={searchQuery}
            onChangeText={v => setValue('searchQuery', v, { shouldValidate: true })}
            onBlur={() => trigger('searchQuery')}
            style={{
              flex: 1,
              fontSize: sf(14),
              color: '#333333',
              fontWeight: '400',
              padding: 0,
            }}
          />
        </View>
        <FieldError message={searchError} />
      </View>

      {/* ── Filter Chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: sw(20),
          gap: 8,
          paddingBottom: 4,
        }}
        style={{ flexGrow: 0, marginBottom: 16, marginTop: 10 }}
      >
        {INBOX_FILTERS.map(filter => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: sw(8),
                paddingVertical: sh(4),
                borderRadius: sr(99),
                backgroundColor: isActive ? '#1E78F5' : '#FFFFFF',
                borderWidth: 1,
                borderColor: isActive ? '#1E78F5' : '#B6B9C9',
              }}
              activeOpacity={0.75}
            >
              {filter === 'Active Streaks' && (
                <Text style={{ fontSize: sf(14), marginRight: sw(4) }}>🔥</Text>
              )}
              {filter === 'Expiring Soon' && (
                <Text style={{ fontSize: sf(14), marginRight: sw(4) }}>⏳</Text>
              )}
              {filter === 'Locked Chats' && (
                <Text style={{ fontSize: sf(14), marginRight: sw(4) }}>🔒</Text>
              )}
              <Text
                style={{
                  fontSize: sf(16),
                  fontWeight: '500',
                  color: isActive ? '#FFFFFF' : '#B6B9C9',
                }}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Conversation List ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: sw(20),
          paddingBottom: sh(140),
        }}
        style={{ flex: 1 }}
      >
        {/* Active Streaks */}
        {activeConversations.length > 0 && (
          <>
            <SectionHeader
              icon={<Text style={{ fontSize: sf(16) }}>🔥</Text>}
              label="Active Streaks"
            />
            {activeConversations.map(item => (
              <ConversationItem
                key={item.id}
                item={item}
                onPress={cameraSelectMode ? openCameraForConversation : openConversation}
                onCameraPress={openCameraForConversation}
              />
            ))}
          </>
        )}

        {/* Locking Soon */}
        {lockingConversations.length > 0 && (
          <>
            <SectionHeader
              mt={activeConversations.length > 0 ? 8 : 0}
              icon={<Text style={{ fontSize: sf(16) }}>⏳</Text>}
              label="Locking Soon"
            />
            {lockingConversations.map(item => (
              <ConversationItem
                key={item.id}
                item={item}
                onPress={cameraSelectMode ? openCameraForConversation : openConversation}
                onCameraPress={openCameraForConversation}
              />
            ))}
          </>
        )}

        {/* Locked Chats */}
        {lockedConversations.length > 0 && (
          <>
            <SectionHeader
              mt={
                lockingConversations.length > 0 || activeConversations.length > 0
                  ? 8
                  : 0
              }
              icon={<Lock size={16} color="#000000" strokeWidth={2} />}
              label="Locked Chats"
            />
            {lockedConversations.map(item => (
              <ConversationItem
                key={item.id}
                item={item}
                onPress={openConversation}
              />
            ))}
          </>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: sh(60) }}>
            <Text style={{ fontSize: sf(15), color: '#8D8D8D' }}>
              No conversations found
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Bottom Tab Bar ── */}
      <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
}