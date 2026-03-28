import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
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
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function InboxScreen({ navigation }: any) {
  const [activeFilter, setActiveFilter] = useState<InboxFilterType>('All');
  const [activeTab, setActiveTab] = useState<BottomTab>('Chat');
  const navLockRef = React.useRef(false);

  const searchSchema = z.string();
  const { watch, setValue } = useForm<{ searchQuery: string }>({
    defaultValues: {
      searchQuery: '',
    },
  });

  const searchQuery = watch('searchQuery');
  const safeSearchQuery = searchSchema.safeParse(searchQuery).success
    ? searchQuery
    : '';

  const filtered = filterConversations(
    CONVERSATIONS,
    activeFilter,
    safeSearchQuery,
  );

  const activeConversations = filtered.filter(c => c.status === 'active');
  const lockingConversations = filtered.filter(c => c.status === 'locking');
  const lockedConversations = filtered.filter(c => c.status === 'locked');

  const handleTabPress = (tab: BottomTab) => {
    if (navLockRef.current) return;
    navLockRef.current = true;
    setTimeout(() => {
      navLockRef.current = false;
    }, 350);

    // Only update highlight when staying on the same screen.
    if (tab === 'Chat') {
      setActiveTab('Chat');
      return;
    }

    if (tab === 'Home') navigation.navigate('DiscoveryScreen');
    if (tab === 'Request') navigation.navigate('RequestsScreen');
    if (tab === 'Camera')
      navigation.navigate('MatchScreen', {
        match: MATCHES[0],
        autoOpenCamera: true,
      });
    if (tab === 'Profile') navigation.navigate('ProfileScreen');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* ── Nav Bar ── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          paddingHorizontal: sw(20),
        }}
        className="py-6 pt-8"
      >
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={{
            position: 'absolute',
            left: sw(20),
            top: 0,
            bottom: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <ChevronLeft size={sf(18)} color="#555555" strokeWidth={2} />
          <Text
            style={{
              fontSize: sf(13),
              color: '#8D8D8D',
              fontWeight: '400',
            }}
          >
            Back
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            fontSize: sf(20),
            lineHeight: sf(20),
            fontWeight: '600',
            color: '#000000',
          }}
        >
          Inbox
        </Text>
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
          <Search size={sf(16)} color="#8D8D8D" strokeWidth={2} />
          <TextInput
            placeholder="Search conversations..."
            placeholderTextColor="#8D8D8D"
            value={searchQuery}
            onChangeText={v => setValue('searchQuery', v)}
            style={{
              flex: 1,
              fontSize: sf(14),
              lineHeight: sf(14),
              color: '#333333',
              fontWeight: '400',
              padding: 0,
            }}
          />
        </View>
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
        style={{ flexGrow: 0, marginBottom: 16 }}
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
                paddingHorizontal: sw(16),
                paddingVertical: sh(8),
                borderRadius: sr(99),
                backgroundColor: isActive ? '#1E78F5' : '#FFFFFF',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.09,
                shadowRadius: 5,
                elevation: 2,
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
                  lineHeight: sf(16),
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
              icon={<Text style={{ fontSize: sf(18) }}>🔥</Text>}
              label="Active Streaks"
            />
            {activeConversations.map(item => (
              <ConversationItem key={item.id} item={item} />
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
              <ConversationItem key={item.id} item={item} />
            ))}
          </>
        )}

        {/* Locked Chats */}
        {lockedConversations.length > 0 && (
          <>
            <SectionHeader
              mt={
                lockingConversations.length > 0 ||
                activeConversations.length > 0
                  ? 8
                  : 0
              }
              icon={<Lock size={16} color="#000000" strokeWidth={2} />}
              label="Locked Chats"
            />
            {lockedConversations.map(item => (
              <ConversationItem key={item.id} item={item} />
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
      <BottomTabBar
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
    </SafeAreaView>
  );
}
