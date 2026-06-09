import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Text } from '@/components/common/Text';
import {
  ChevronLeft,
  Search,
  Lock,
  RefreshCw,
  X,
  Camera,
} from 'lucide-react-native';

import FireIcon from '@/assets/images/fireIcon.svg';
import GlassIcon from '@/assets/images/glassIcon.svg';
import LockIcon from '@/assets/images/lockIcon.svg';
import BottomTabBar from '@/components/common/BottomTabBar';
import { sf, sr, sw, sh } from '@/utils/sizeMatters';
import { useZodForm } from '@/utils/form';
import { inboxSearchFormSchema } from '@/schemas/messaging';
import { FieldError } from '@/components/common/FieldError';
import {
  useConversations,
  useCreateDirectConversation,
} from '@/features/chat/hooks';
import type { ConversationItem } from '@/features/chat/schema';
import { LinearGradient } from 'expo-linear-gradient';
import { useMe } from '@/features/profile/hooks';

// ── Filter types ──────────────────────────────────────────────────────────────

const FILTERS = [
  { key: 'All', label: 'All', icon: null, svg: null },
  { key: 'ActiveStreaks', label: 'Active Sparks', icon: null, svg: 'fire' },
  { key: 'ExpiringSoon', label: 'Locking Soon', icon: null, svg: 'glass' },
  { key: 'Locked', label: 'Locked', icon: null, svg: 'lock' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

// ── Chat status helpers ───────────────────────────────────────────────────────

function getChatStatus(
  item: ConversationItem,
): 'active' | 'lockingSoon' | 'locked' {
  // Use server-provided chatStatus if available
  if ((item as any).chatStatus === 'locked') return 'locked';
  if ((item as any).chatStatus === 'lockingSoon') return 'lockingSoon';
  if ((item as any).chatStatus === 'active') return 'active';

  // Client-side fallback: compute from lastMessageAt
  const ref = item.lastMessageAt ?? item.lastMessage?.createdAt;
  if (!ref) return 'active';
  const days = (Date.now() - new Date(ref).getTime()) / (1000 * 60 * 60 * 24);
  if (days >= 5) return 'locked';
  if (days >= 3) return 'lockingSoon';
  return 'active';
}

function filterItems(
  items: ConversationItem[],
  filter: FilterKey,
  search: string,
): ConversationItem[] {
  let result = items;

  if (filter === 'ActiveStreaks')
    result = result.filter((i) => getChatStatus(i) === 'active');
  if (filter === 'ExpiringSoon')
    result = result.filter((i) => getChatStatus(i) === 'lockingSoon');
  if (filter === 'Locked')
    result = result.filter((i) => getChatStatus(i) === 'locked');

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter((i) => {
      const name =
        `${i.otherUser?.firstName ?? ''} ${i.otherUser?.lastName ?? ''}`.toLowerCase();
      return name.includes(q);
    });
  }

  return result;
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function lastMessagePreview(item: ConversationItem): string {
  const msg = item.lastMessage;
  if (!msg) return 'No messages yet';
  if (msg.type === 'text') return msg.text ?? '';
  if (msg.type === 'image') return 'Sent a moment';
  if (msg.type === 'streak') return 'Sent a moment';
  return '';
}

function getStreakCount(item: ConversationItem): number {
  return item.streakCount ?? 0;
}

function getTimeWarning(item: ConversationItem): string | null {
  const status = getChatStatus(item);
  if (status === 'active') return null;
  const ref = item.lastMessageAt ?? item.lastMessage?.createdAt;
  if (!ref) return null;
  const days = (Date.now() - new Date(ref).getTime()) / (1000 * 60 * 60 * 24);
  if (status === 'locked') return 'Chat locked';
  const remaining = Math.max(0, 5 - days);
  const hours = Math.round(remaining * 24);
  if (hours < 24) return `Locks in ${hours}h`;
  return `Locks in ${Math.ceil(remaining)}d`;
}

// ── Camera button ─────────────────────────────────────────────────────────────

function CameraBtn({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#EAD6A9', '#EAD6A9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cameraBtn}
      >
        <Camera
          size={sf(20)}
          color='#0B0B0B'
          strokeWidth={2}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ── Streak badge ──────────────────────────────────────────────────────────────

function StreakBadge({ count }: { count: number }) {
  return (
    <View style={styles.streakBadge}>
      <FireIcon
        width={12}
        height={12}
      />
      <Text
        style={{
          fontSize: sf(11),
          color: '#CEB98F',
          fontWeight: '700',
          marginLeft: 3,
        }}
      >
        {count}
      </Text>
    </View>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

const SECTION_SVG: Record<string, (color: string) => React.ReactNode> = {
  fire: (color) => (
    <FireIcon
      width={16}
      height={16}
      color={color}
    />
  ),
  glass: (color) => (
    <GlassIcon
      width={16}
      height={16}
      color={color}
    />
  ),
  lock: (color) => (
    <LockIcon
      width={16}
      height={16}
      color={color}
    />
  ),
};

function SectionHeader({ svgKey, title }: { svgKey: string; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      {SECTION_SVG[svgKey]('#0B0B0B')}
      <Text style={[styles.sectionTitle, { fontSize: sf(15) }]}>{title}</Text>
    </View>
  );
}

// ── Active / Locking row ──────────────────────────────────────────────────────

function ActiveRow({
  item,
  onPress,
  onCameraPress,
  myId,
}: {
  item: ConversationItem;
  onPress: () => void;
  onCameraPress: () => void;
  myId?: string;
}) {
  const name =
    `${item.otherUser?.firstName ?? ''} ${item.otherUser?.lastName ?? ''}`.trim() ||
    'Unknown';
  const avatarRaw = item.otherUser?.photos?.[0];
  const avatar = typeof avatarRaw === 'string' ? avatarRaw : avatarRaw?.url;
  // Show unread dot only when last message was sent by the other user (not me)
  const lastSenderId = item.lastMessage?.senderId;
  const isUnread =
    item.unreadCount > 0 && (!myId || !lastSenderId || lastSenderId !== myId);
  const streakCount = getStreakCount(item);
  const timeWarning = getTimeWarning(item);
  const preview = lastMessagePreview(item);
  const isExpiring = getChatStatus(item) === 'lockingSoon';

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.row, isUnread && styles.rowUnread]}
    >
      {/* Avatar */}
      <View style={{ position: 'relative', marginRight: sw(12) }}>
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            style={styles.avatar}
            resizeMode='cover'
          />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={{ fontSize: sf(22) }}>👤</Text>
          </View>
        )}
        {isUnread && (
          <View style={styles.unreadDot}>
            <Text
              style={{ color: '#FFFFFF', fontSize: sf(8), fontWeight: '800' }}
            >
              {item.unreadCount > 9 ? '9+' : item.unreadCount}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: sw(6),
            marginBottom: sh(2),
          }}
        >
          <Text
            style={{
              fontSize: sf(15),
              fontWeight: isUnread ? '700' : '600',
              color: '#000000',
            }}
            numberOfLines={1}
          >
            {name}
          </Text>
          {streakCount > 0 && <StreakBadge count={streakCount} />}
        </View>
        <Text
          style={{
            fontSize: sf(13),
            color: isUnread ? '#000000' : '#7D858E',
            fontWeight: isUnread ? '500' : '400',
          }}
          numberOfLines={1}
        >
          {preview}
        </Text>
        {timeWarning ? (
          <Text
            style={{
              fontSize: sf(11),
              color: '#FF3B30',
              fontWeight: '500',
              marginTop: sh(1),
            }}
          >
            ⏱ {timeWarning}
          </Text>
        ) : (
          <Text
            style={{ fontSize: sf(11), color: '#B6B9C9', marginTop: sh(1) }}
          >
            ⏱ {formatTime(item.lastMessageAt)}
          </Text>
        )}
      </View>

      {/* Camera button */}
      <CameraBtn onPress={onCameraPress} />
    </TouchableOpacity>
  );
}

// ── Locked row ────────────────────────────────────────────────────────────────

function LockedRow({
  item,
  onPress,
  onCameraPress,
  myId,
}: {
  item: ConversationItem;
  onPress: () => void;
  onCameraPress: () => void;
  myId?: string;
}) {
  const name =
    `${item.otherUser?.firstName ?? ''} ${item.otherUser?.lastName ?? ''}`.trim() ||
    'Unknown';
  const avatarRaw = item.otherUser?.photos?.[0];
  const avatar = typeof avatarRaw === 'string' ? avatarRaw : avatarRaw?.url;
  // Show unread dot only when last message was sent by the other user (not me)
  const lastSenderId = item.lastMessage?.senderId;
  const isUnread =
    item.unreadCount > 0 && (!myId || !lastSenderId || lastSenderId !== myId);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={styles.row}
    >
      <View style={{ position: 'relative', marginRight: sw(12) }}>
        {avatar ? (
          <View style={[styles.avatar, { overflow: 'hidden' }]}>
            <Image
              source={{ uri: avatar }}
              style={StyleSheet.absoluteFill}
              resizeMode='cover'
            />
            <BlurView
              intensity={60}
              tint='dark'
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.lockedAvatarOverlay}>
              <Lock
                size={sf(20)}
                color='#FFFFFF'
                strokeWidth={2.5}
              />
            </View>
          </View>
        ) : (
          <View style={[styles.avatar, styles.lockedAvatar]}>
            <Lock
              size={sf(18)}
              color='#FFFFFF'
              strokeWidth={2.5}
            />
          </View>
        )}
        {isUnread && (
          <View style={styles.unreadDot}>
            <Text
              style={{ color: '#FFFFFF', fontSize: sf(8), fontWeight: '800' }}
            >
              {item.unreadCount > 9 ? '9+' : item.unreadCount}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontSize: sf(15),
            fontWeight: '600',
            color: '#000000',
            marginBottom: sh(2),
          }}
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text
          style={{ fontSize: sf(13), color: '#7D858E' }}
          numberOfLines={1}
        >
          Send a snap to unlock
        </Text>
      </View>

      <CameraBtn onPress={onCameraPress} />
    </TouchableOpacity>
  );
}

// ── Visual conversations modal ────────────────────────────────────────────────

function VisualConversationsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      transparent
      animationType='fade'
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalBackdrop}
        onPress={onClose}
      >
        <Pressable
          style={styles.modalCard}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <TouchableOpacity
            style={styles.modalClose}
            onPress={onClose}
          >
            <X
              size={sf(18)}
              color='#7D858E'
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          {/* Camera icon */}
          <LinearGradient
            colors={['#EAD6A9', '#EAD6A9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalIconWrap}
          >
            <Camera
              size={sf(32)}
              color='#0B0B0B'
              strokeWidth={2}
            />
          </LinearGradient>

          <Text style={[styles.modalTitle, { fontSize: sf(20) }]}>
            “Unlock chats by sharing a moment”
          </Text>
          <Text style={[styles.modalDesc, { fontSize: sf(14) }]}>
            Send a moment to share the 24-hour chat
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function InboxScreen({ navigation, route }: any) {
  const cameraSelectMode: boolean = !!route?.params?.cameraSelectMode;

  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const [lockedModalVisible, setLockedModalVisible] = useState(false);

  const { watch, setValue, trigger, formState } = useZodForm(
    inboxSearchFormSchema,
    {
      defaultValues: { searchQuery: '' },
    },
  );
  const searchQuery = watch('searchQuery');
  const searchError = formState.errors.searchQuery?.message;
  const safeSearch =
    searchQuery.length > 120 ? searchQuery.slice(0, 120) : searchQuery;

  const {
    data: conversations = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useConversations();
  const { mutateAsync: createConversation } = useCreateDirectConversation();
  const { data: me } = useMe();
  const myId = me?.id;

  const filtered = filterItems(conversations, activeFilter, safeSearch);

  // Group by status
  const activeItems = filtered.filter((i) => getChatStatus(i) === 'active');
  const expiring = filtered.filter((i) => getChatStatus(i) === 'lockingSoon');
  const lockedItems = filtered.filter((i) => getChatStatus(i) === 'locked');

  const openChat = (item: ConversationItem, autoCamera = false) => {
    navigation.navigate('ChatScreen', {
      conversationId: item.conversationId,
      chatUserId: item.otherUser?.id,
      chatUserName:
        `${item.otherUser?.firstName ?? ''} ${item.otherUser?.lastName ?? ''}`.trim(),
      chatUserImageUri: (() => {
        const p = item.otherUser?.photos?.[0];
        return typeof p === 'string' ? p : p?.url;
      })(),
      initialLocked: false,
      autoOpenCamera: autoCamera || cameraSelectMode,
    });
  };

  // When filter is not 'All', show a flat list without section headers
  const showSections = activeFilter === 'All';

  return (
    <View
      style={{ flex: 1, backgroundColor: '#F7F3ED', paddingBottom: sh(20) }}
    >
      {/* ── Nav Bar ─────────────────────────────────────────────────────── */}
      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            width: sw(60),
          }}
        >
          <ChevronLeft
            size={sf(20)}
            color='#555555'
            strokeWidth={2}
          />
          <Text style={{ fontSize: sf(13), color: '#8D8D8D' }}>Back</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: sf(20), fontWeight: '700', color: '#000000' }}>
          Inbox
        </Text>

        <View style={{ width: sw(60), alignItems: 'flex-end' }}>
          {isFetching && (
            <ActivityIndicator
              size='small'
              color='#0B0B0B'
            />
          )}
        </View>
      </View>

      {/* ── Search ──────────────────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: sw(20), marginBottom: sh(14) }}>
        <View style={styles.searchBar}>
          <Search
            size={sf(18)}
            color='#B6B9C9'
            strokeWidth={2}
          />
          <TextInput
            placeholder='Search conversations...'
            placeholderTextColor='#B6B9C9'
            value={searchQuery}
            onChangeText={(v) =>
              setValue('searchQuery', v, { shouldValidate: true })
            }
            onBlur={() => trigger('searchQuery')}
            style={{ flex: 1, fontSize: sf(14), color: '#333333', padding: 0 }}
          />
        </View>
        <FieldError message={searchError} />
      </View>

      {/* ── Filter chips ─────────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: sw(20),
          gap: sw(8),
          paddingBottom: sh(4),
        }}
        style={{ flexGrow: 0, marginBottom: sh(16) }}
      >
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={[
                styles.filterChip,
                isActive ? styles.filterChipActive : styles.filterChipInactive,
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: sw(4),
                }}
              >
                {f.svg && SECTION_SVG[f.svg](isActive ? '#0B0B0B' : '#B6B9C9')}
                <Text
                  style={{
                    fontSize: sf(13),
                    fontWeight: '500',
                    color: isActive ? '#0B0B0B' : '#B6B9C9',
                  }}
                >
                  {f.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Loading ──────────────────────────────────────────────────────── */}
      {isLoading && (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator color='#0B0B0B' />
        </View>
      )}

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {isError && !isLoading && (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: sh(12),
          }}
        >
          <Text style={{ color: '#0B0B0B', fontSize: sf(14) }}>
            Could not load conversations.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: sw(6),
              backgroundColor: '#EAD6A9',
              paddingHorizontal: sw(16),
              paddingVertical: sh(10),
              borderRadius: sr(99),
            }}
          >
            <RefreshCw
              size={sf(16)}
              color='#0B0B0B'
            />
            <Text
              style={{ color: '#0B0B0B', fontSize: sf(14), fontWeight: '600' }}
            >
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Conversation list ────────────────────────────────────────────── */}
      {!isLoading && !isError && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: sw(20),
            paddingBottom: sh(140),
          }}
          style={{ flex: 1 }}
        >
          {showSections ? (
            <>
              {/* Active Streaks */}
              {activeItems.length > 0 && (
                <>
                  <SectionHeader
                    svgKey='fire'
                    title='Active Sparks'
                  />
                  {activeItems.map((item) => (
                    <ActiveRow
                      key={item.conversationId}
                      item={item}
                      myId={myId}
                      onPress={() => openChat(item)}
                      onCameraPress={() => openChat(item, true)}
                    />
                  ))}
                </>
              )}

              {/* Locking Soon */}
              {expiring.length > 0 && (
                <>
                  <SectionHeader
                    svgKey='glass'
                    title='Locking Soon'
                  />
                  {expiring.map((item) => (
                    <ActiveRow
                      key={item.conversationId}
                      item={item}
                      myId={myId}
                      onPress={() => openChat(item)}
                      onCameraPress={() => openChat(item, true)}
                    />
                  ))}
                </>
              )}

              {/* Locked Chats */}
              {lockedItems.length > 0 && (
                <>
                  <SectionHeader
                    svgKey='lock'
                    title='Locked Chats'
                  />
                  {lockedItems.map((item) => (
                    <LockedRow
                      key={item.conversationId}
                      item={item}
                      myId={myId}
                      onPress={() => setLockedModalVisible(true)}
                      onCameraPress={() => openChat(item, true)}
                    />
                  ))}
                </>
              )}

              {/* Empty state */}
              {filtered.length === 0 && (
                <View
                  style={{
                    alignItems: 'center',
                    marginTop: sh(60),
                    gap: sh(12),
                  }}
                >
                  <Text style={{ fontSize: sf(40) }}>💬</Text>
                  <Text
                    style={{
                      fontSize: sf(15),
                      color: '#8D8D8D',
                      textAlign: 'center',
                    }}
                  >
                    {searchQuery ? 'No results found' : 'No conversations yet'}
                  </Text>
                </View>
              )}
            </>
          ) : (
            // Flat filtered list (no section headers when filter active)
            <>
              {filtered.map((item) => {
                const status = getChatStatus(item);
                if (status === 'locked') {
                  return (
                    <LockedRow
                      key={item.conversationId}
                      item={item}
                      onPress={() => setLockedModalVisible(true)}
                      onCameraPress={() => openChat(item, true)}
                    />
                  );
                }
                return (
                  <ActiveRow
                    key={item.conversationId}
                    item={item}
                    myId={myId}
                    onPress={() => openChat(item)}
                    onCameraPress={() => openChat(item, true)}
                  />
                );
              })}
              {filtered.length === 0 && (
                <View
                  style={{
                    alignItems: 'center',
                    marginTop: sh(60),
                    gap: sh(12),
                  }}
                >
                  <Text style={{ fontSize: sf(40) }}>💬</Text>
                  <Text
                    style={{
                      fontSize: sf(15),
                      color: '#8D8D8D',
                      textAlign: 'center',
                    }}
                  >
                    {searchQuery ? 'No results found' : 'No conversations yet'}
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* ── Bottom tab bar ──────────────────────────────────────────── */}
      <View style={styles.tabBarWrap}>
        <BottomTabBar />
      </View>

      {/* ── Visual Conversations Modal ───────────────────────────────────── */}
      <VisualConversationsModal
        visible={lockedModalVisible}
        onClose={() => setLockedModalVisible(false)}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor: '#FFFFFF',
    paddingHorizontal: sw(20),
    paddingTop: sh(52),
    paddingBottom: sh(16),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: sh(46),
    backgroundColor: '#FFFFFF',
    borderRadius: sr(14),
    paddingHorizontal: sw(14),
    gap: sw(8),
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChip: {
    paddingHorizontal: sw(14),
    paddingVertical: sh(7),
    borderRadius: sr(99),
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: '#EAD6A9',
    borderColor: '#EAD6A9',
  },
  filterChipInactive: {
    backgroundColor: 'transparent',
    borderColor: '#B6B9C9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(6),
    marginTop: sh(8),
    marginBottom: sh(10),
    paddingLeft: sw(2),
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#0B0B0B',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sh(10),
    paddingHorizontal: sw(4),
    borderRadius: sr(14),
    marginBottom: sh(6),
  },
  rowUnread: {
    backgroundColor: 'rgba(251,178,2,0.06)',
  },
  avatar: {
    width: sw(52),
    height: sw(52),
    borderRadius: 9999,
  },
  avatarFallback: {
    backgroundColor: '#EDEDED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedAvatar: {
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedAvatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: sf(18),
    height: sf(18),
    borderRadius: 9999,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251,178,2,0.18)',
    borderRadius: sr(20),
    paddingHorizontal: sw(8),
    paddingVertical: sh(2),
    borderWidth: 0.6,
    borderColor: '#CEB98F',
  },
  cameraBtn: {
    width: sw(44),
    height: sw(44),
    borderRadius: sw(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: sw(8),
  },
  lockIconBtn: {
    width: sw(40),
    height: sw(40),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: sw(8),
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sw(32),
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: sr(24),
    paddingHorizontal: sw(28),
    paddingTop: sh(36),
    paddingBottom: sh(32),
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: sh(16),
    right: sw(16),
    width: sf(32),
    height: sf(32),
    borderRadius: sf(16),
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIconWrap: {
    width: sw(72),
    height: sw(72),
    borderRadius: sw(36),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sh(20),
  },
  modalTitle: {
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: sh(10),
  },
  modalDesc: {
    color: '#7D858E',
    textAlign: 'center',
    lineHeight: sh(22),
    marginBottom: sh(14),
  },
  modalHighlight: {
    color: '#EAD6A9',
    fontWeight: '600',
    textAlign: 'center',
  },
  tabBarWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    zIndex: 15,
  },
});
