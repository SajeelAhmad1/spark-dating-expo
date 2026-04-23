import React, { useState } from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { Text } from '@/components/common/Text'
import { ChevronLeft, Search, Lock, RefreshCw } from 'lucide-react-native'
import BottomTabBar from '@/components/common/BottomTabBar'
import { sf, sr, sw, sh } from '@/utils/sizeMatters'
import { useZodForm } from '@/utils/form'
import { inboxSearchFormSchema } from '@/schemas/messaging'
import { FieldError } from '@/components/common/FieldError'
import { useConversations, useCreateDirectConversation } from '@/features/chat/hooks'
import type { ConversationItem } from '@/features/chat/schema'

// ── Filter types & helpers ────────────────────────────────────────────────────

const FILTERS = ['All', 'Unread', 'Streak'] as const
type FilterType = (typeof FILTERS)[number]

function filterItems(
  items: ConversationItem[],
  filter: FilterType,
  search: string,
): ConversationItem[] {
  let result = items

  if (filter === 'Unread') result = result.filter((i) => i.unreadCount > 0)
  if (filter === 'Streak')
    result = result.filter((i) => i.lastMessage?.type === 'streak')

  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter((i) => {
      const name = `${i.otherUser?.firstName ?? ''} ${i.otherUser?.lastName ?? ''}`.toLowerCase()
      return name.includes(q)
    })
  }

  return result
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function lastMessagePreview(item: ConversationItem): string {
  const msg = item.lastMessage
  if (!msg) return 'No messages yet'
  if (msg.type === 'text')   return msg.text ?? ''
  if (msg.type === 'image')  return '📷 Photo'
  if (msg.type === 'streak') return '🔥 Streak'
  return ''
}

// ── Conversation row ──────────────────────────────────────────────────────────

function ConversationRow({
  item,
  onPress,
}: {
  item:    ConversationItem
  onPress: (item: ConversationItem) => void
}) {
  const name   = `${item.otherUser?.firstName ?? ''} ${item.otherUser?.lastName ?? ''}`.trim() || 'Unknown'
  const avatar = item.otherUser?.photos[0]
  const isUnread = item.unreadCount > 0
  const isStreak = item.lastMessage?.type === 'streak'
  const isLocked = false // extend when you have locking logic

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onPress(item)}
      style={[styles.row, isUnread && styles.rowUnread]}
    >
      {/* Avatar */}
      <View style={{ position: 'relative', marginRight: sw(12) }}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={{ fontSize: sf(20) }}>👤</Text>
          </View>
        )}
        {isUnread && (
          <View style={styles.unreadDot}>
            <Text style={{ color: '#FFFFFF', fontSize: sf(9), fontWeight: '700' }}>
              {item.unreadCount > 9 ? '9+' : item.unreadCount}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: sw(6), marginBottom: sh(2) }}>
          <Text style={{ fontSize: sf(16), fontWeight: isUnread ? '600' : '400', color: '#000000' }} numberOfLines={1}>
            {name}
          </Text>
          {isStreak && <Text style={{ fontSize: sf(13) }}>🔥</Text>}
          {isLocked && <Lock size={sf(12)} color="#7D858E" />}
        </View>
        <Text
          style={{ fontSize: sf(13), color: isUnread ? '#000000' : '#7D858E', fontWeight: isUnread ? '500' : '400' }}
          numberOfLines={1}
        >
          {lastMessagePreview(item)}
        </Text>
      </View>

      {/* Time */}
      <Text style={{ fontSize: sf(11), color: '#B6B9C9', marginLeft: sw(8) }}>
        {formatTime(item.lastMessageAt)}
      </Text>
    </TouchableOpacity>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function InboxScreen({ navigation, route }: any) {
  const cameraSelectMode: boolean = !!route?.params?.cameraSelectMode

  const [activeFilter, setActiveFilter] = useState<FilterType>('All')

  const { watch, setValue, trigger, formState } = useZodForm(inboxSearchFormSchema, {
    defaultValues: { searchQuery: '' },
  })
  const searchQuery = watch('searchQuery')
  const searchError = formState.errors.searchQuery?.message
  const safeSearch  = searchQuery.length > 120 ? searchQuery.slice(0, 120) : searchQuery

  const { data: conversations = [], isLoading, isError, refetch, isFetching } =
    useConversations()

  const { mutateAsync: createConversation } = useCreateDirectConversation()

  const filtered = filterItems(conversations, activeFilter, safeSearch)

  const openConversation = async (item: ConversationItem) => {
    const peerId   = item.otherUser?.id
    const peerName = `${item.otherUser?.firstName ?? ''} ${item.otherUser?.lastName ?? ''}`.trim()
    const peerAvatar = item.otherUser?.photos[0]

    navigation.navigate('ChatScreen', {
      conversationId:  item.conversationId,
      chatUserId:      peerId,
      chatUserName:    peerName,
      chatUserImageUri: peerAvatar,
      initialLocked:   false,
      autoOpenCamera:  cameraSelectMode,
    })
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', paddingBottom: sh(20) }}>

      {/* ── Nav Bar ──────────────────────────────────────────────────────── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingHorizontal: sw(20), paddingTop: sh(34), paddingBottom: sh(24) }}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4, width: sw(60) }}
        >
          <ChevronLeft size={sf(24)} color="#555555" strokeWidth={2} />
          <Text style={{ fontSize: sf(13), color: '#8D8D8D', fontWeight: '400' }}>Back</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: sf(20), fontWeight: '600', color: '#000000' }}>Inbox</Text>

        <View style={{ width: sw(60), alignItems: 'flex-end' }}>
          {isFetching && <ActivityIndicator size="small" color="#1E78F5" />}
        </View>
      </View>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: sw(20), marginBottom: sh(14) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', height: sh(48), backgroundColor: '#FFFFFF', borderRadius: sr(12), paddingHorizontal: sw(14), gap: 8, borderWidth: 1, borderColor: '#EDEDED', shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}>
          <Search size={sf(24)} color="#8D8D8D" strokeWidth={2} />
          <TextInput
            placeholder="Search conversations…"
            placeholderTextColor="#8D8D8D"
            value={searchQuery}
            onChangeText={(v) => setValue('searchQuery', v, { shouldValidate: true })}
            onBlur={() => trigger('searchQuery')}
            style={{ flex: 1, fontSize: sf(14), color: '#333333', padding: 0 }}
          />
        </View>
        <FieldError message={searchError} />
      </View>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: sw(20), gap: 8, paddingBottom: 4 }}
        style={{ flexGrow: 0, marginBottom: 16, marginTop: 10 }}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            style={{ paddingHorizontal: sw(14), paddingVertical: sh(6), borderRadius: sr(99), backgroundColor: activeFilter === f ? '#1E78F5' : '#FFFFFF', borderWidth: 1, borderColor: activeFilter === f ? '#1E78F5' : '#B6B9C9' }}
          >
            <Text style={{ fontSize: sf(14), fontWeight: '500', color: activeFilter === f ? '#FFFFFF' : '#B6B9C9' }}>
              {f === 'Streak' ? '🔥 Streaks' : f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#1E78F5" />
        </View>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {isError && !isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: sh(12) }}>
          <Text style={{ color: '#7D858E', fontSize: sf(14) }}>Could not load conversations.</Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={{ flexDirection: 'row', alignItems: 'center', gap: sw(6), backgroundColor: '#1E78F5', paddingHorizontal: sw(16), paddingVertical: sh(10), borderRadius: sr(99) }}
          >
            <RefreshCw size={sf(16)} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontFamily: 'Poppins-SemiBold', fontSize: sf(14) }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── List ──────────────────────────────────────────────────────────── */}
      {!isLoading && !isError && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: sw(20), paddingBottom: sh(140) }}
          style={{ flex: 1 }}
        >
          {filtered.map((item) => (
            <ConversationRow
              key={item.conversationId}
              item={item}
              onPress={openConversation}
            />
          ))}

          {filtered.length === 0 && (
            <View style={{ alignItems: 'center', marginTop: sh(60), gap: sh(12) }}>
              <Text style={{ fontSize: sf(40) }}>💬</Text>
              <Text style={{ fontSize: sf(15), color: '#8D8D8D', textAlign: 'center' }}>
                {searchQuery ? 'No results found' : 'No conversations yet'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      <BottomTabBar />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   sh(12),
    paddingHorizontal: sw(4),
    borderRadius:      sr(12),
    marginBottom:      sh(4),
  },
  rowUnread: {
    backgroundColor: 'rgba(30,120,245,0.04)',
  },
  avatar: {
    width:        sw(52),
    height:       sw(52),
    borderRadius: 9999,
  },
  avatarFallback: {
    backgroundColor: '#EDEDED',
    alignItems:      'center',
    justifyContent:  'center',
  },
  unreadDot: {
    position:        'absolute',
    top:             -2,
    right:           -2,
    width:           sf(18),
    height:          sf(18),
    borderRadius:    9999,
    backgroundColor: '#FF3B30',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1.5,
    borderColor:     '#FFFFFF',
  },
})