import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  View, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Image,
} from 'react-native'
import { Text }        from '@/components/common/Text'
import {
  ChevronLeft, MoreVertical,
  Image as ImageIcon, Send, UserCircle,
  AlertTriangle, UserRoundX,
} from 'lucide-react-native'
import CameraIcon    from '@/assets/images/cameraIcon.svg'
import CameraScreen  from './CameraScreen'
import * as ImagePicker from 'expo-image-picker'
import { BlurView }  from 'expo-blur'
import ChatAvatar    from '@/components/chat/ChatAvatar'
import ChatMenu, { type ChatMenuItem } from '@/screens/ChatMenu'
import { sf, sr, sw, sh } from '@/utils/sizeMatters'
import { useZodForm }           from '@/utils/form'
import { chatMessageFormSchema } from '@/schemas/messaging'
import { showToast }            from '@/utils/toast'
import {
  useMessages,
  useSendMessage,
  useMarkRead,
  useCreateDirectConversation,
  useConversationSocket,
  usePresence,
  useTypingIndicator,
} from '@/features/chat/hooks'
import { useBlockUser }    from '@/features/social/hooks'
import { useMe }           from '@/features/profile/hooks'
import { useGetUserById }  from '@/features/users/hooks'
import type { ChatMessage } from '@/features/chat/schema'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatMsgTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MsgBubble({
  message, isMe, isSeen, friendAvatarUri, myAvatarUri, onSnapPress,
}: {
  message:          ChatMessage
  isMe:             boolean
  isSeen:           boolean
  friendAvatarUri?: string
  myAvatarUri?:     string
  onSnapPress?:     (msg: ChatMessage) => void
}) {
  const isOptimistic = message.id.startsWith('optimistic-')

  const wrapStyle: any = {
    flexDirection:     isMe ? 'row-reverse' : 'row',
    marginBottom:      sh(8),
    paddingHorizontal: sw(16),
    alignItems:        'flex-end',
    gap:               sw(8),
  }

  const timeRow = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: sw(4), marginTop: sh(3) }}>
      <Text style={{ fontSize: sf(10), color: '#B6B9C9' }}>
        {formatMsgTime(message.createdAt)}
        {isOptimistic ? '  ···' : ''}
      </Text>
      {isMe && (
        <Text style={{ fontSize: sf(11), color: isSeen ? '#1E78F5' : '#B6B9C9', fontWeight: '700' }}>
          ✓✓
        </Text>
      )}
    </View>
  )

  if (message.type === 'text') {
    return (
      <View style={wrapStyle}>
        <ChatAvatar size={sf(32)} variant={isMe ? 'me' : 'friend'} imageUri={isMe ? myAvatarUri : friendAvatarUri} />
        <View style={{ maxWidth: '72%', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
          <View style={{
            backgroundColor:       isMe ? '#1E78F5' : 'rgba(251,178,2,0.2)',
            borderTopLeftRadius:   sr(16), borderTopRightRadius: sr(16),
            borderBottomLeftRadius:  isMe ? sr(16) : sr(4),
            borderBottomRightRadius: isMe ? sr(4)  : sr(16),
            paddingHorizontal: sw(14), paddingVertical: sh(10),
            opacity: isOptimistic ? 0.6 : 1,
          }}>
            <Text style={{ color: isMe ? '#FFFFFF' : '#000000', fontSize: sf(15), fontFamily: 'Poppins-Regular' }}>
              {message.text}
            </Text>
          </View>
          {timeRow}
        </View>
      </View>
    )
  }

  if (message.type === 'image' && message.media?.url) {
    return (
      <View style={wrapStyle}>
        <ChatAvatar size={sf(32)} variant={isMe ? 'me' : 'friend'} imageUri={isMe ? myAvatarUri : friendAvatarUri} />
        <View style={{ alignItems: isMe ? 'flex-end' : 'flex-start' }}>
          <TouchableOpacity
            onPress={() => onSnapPress?.(message)}
            style={{ width: sw(200), height: sh(250), borderRadius: sr(14), overflow: 'hidden', backgroundColor: '#EDEDED' }}
          >
            <Image source={{ uri: message.media.url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </TouchableOpacity>
          {timeRow}
        </View>
      </View>
    )
  }

  if (message.type === 'streak') {
    return (
      <View style={wrapStyle}>
        <ChatAvatar size={sf(32)} variant={isMe ? 'me' : 'friend'} imageUri={isMe ? myAvatarUri : friendAvatarUri} />
        <View style={{ alignItems: isMe ? 'flex-end' : 'flex-start' }}>
          <TouchableOpacity
            onPress={() => onSnapPress?.(message)}
            style={{
              backgroundColor: isMe ? '#1E78F533' : 'rgba(251,178,2,0.2)',
              borderRadius: sr(14), paddingHorizontal: sw(14), paddingVertical: sh(10),
              borderWidth: 1, borderColor: isMe ? '#1E78F5' : '#FBB202',
              flexDirection: 'row', alignItems: 'center', gap: sw(8),
            }}
          >
            {message.media?.url ? (
              <Image source={{ uri: message.media.url }} style={{ width: sw(48), height: sh(48), borderRadius: sr(8) }} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: sf(24) }}>🔥</Text>
            )}
            <View>
              <Text style={{ fontSize: sf(14), color: isMe ? '#1E78F5' : '#DC9B00', fontFamily: 'Poppins-Medium' }}>
                Photo
              </Text>
              {message.streakExpiresAt && (
                <Text style={{ fontSize: sf(11), color: '#B6B9C9' }}>
                  Expires {new Date(message.streakExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              )}
            </View>
          </TouchableOpacity>
          {timeRow}
        </View>
      </View>
    )
  }

  return null
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ChatScreen({ navigation, route }: any) {
  const chatUserName:         string            = route?.params?.chatUserName     ?? 'User'
  const chatUserImageUri:     string | undefined = route?.params?.chatUserImageUri
  const chatUserId:           string | undefined = route?.params?.chatUserId
  const initialLocked:        boolean           = route?.params?.initialLocked    ?? false
  const autoOpenCamera:       boolean           = !!route?.params?.autoOpenCamera
  const passedConversationId: string | undefined = route?.params?.conversationId
  const initialText:          string | undefined = route?.params?.initialText
  const initialPhotoUri:      string | undefined = route?.params?.initialPhotoUri

  // ── My profile ────────────────────────────────────────────────────────────
  const { data: me }   = useMe()
  const myId           = me?.id
  const myAvatar       = me?.profile?.photos?.[0]

  // ── Peer profile (for View Profile) ──────────────────────────────────────
  const { data: peerUser } = useGetUserById(chatUserId)
  console.log(peerUser, "peerUser")

  // ── State ─────────────────────────────────────────────────────────────────
  const [conversationId, setConversationId] = useState<string | null>(passedConversationId ?? null)
  const [isLocked,       setIsLocked]       = useState(initialLocked)
  const [isCameraOpen,   setIsCameraOpen]   = useState(false)
  const [menuVisible,    setMenuVisible]    = useState(false)
  const [menuAnchorPos,  setMenuAnchorPos]  = useState<{ x: number; y: number; width: number; height: number } | null>(null)

  const menuAnchorRef  = useRef<View>(null)
  const flatListRef    = useRef<FlatList>(null)
  const sentInitialRef = useRef(false)

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const { mutateAsync: createConversation, isPending: isCreating } = useCreateDirectConversation()
  const { data, isLoading: messagesLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(conversationId)
  const { mutate: sendMsg,  isPending: isSending } = useSendMessage(conversationId ?? '')
  const { mutate: markRead }  = useMarkRead(conversationId ?? '')
  const { mutate: blockUser } = useBlockUser()

  // ── Presence + typing ─────────────────────────────────────────────────────
  const { isOnline, lastSeen }                      = usePresence(chatUserId)
  const { isPeerTyping, onTyping, onStopTyping }    = useTypingIndicator(conversationId, chatUserId)

  const presenceLabel = (() => {
    if (isPeerTyping) return 'typing...'
    if (isOnline)     return 'Online'
    if (lastSeen) {
      const diff = Date.now() - new Date(lastSeen).getTime()
      const mins = Math.floor(diff / 60_000)
      const hrs  = Math.floor(diff / 3_600_000)
      const days = Math.floor(diff / 86_400_000)
      if (mins < 1)  return 'Just now'
      if (mins < 60) return `${mins}m ago`
      if (hrs  < 24) return `${hrs}h ago`
      return `${days}d ago`
    }
    return 'Offline'
  })()

  const presenceColor = isPeerTyping ? '#FBB202' : isOnline ? '#22C55E' : '#B6B9C9'

  // ── Socket real-time ──────────────────────────────────────────────────────
  useConversationSocket(conversationId)

  const messages: ChatMessage[] = data?.messages ?? []

  // ── Form ──────────────────────────────────────────────────────────────────
  const { watch, setValue, handleSubmit, reset, trigger } =
    useZodForm(chatMessageFormSchema, { defaultValues: { messageText: '' } })
  const messageText = watch('messageText')

  // ── Bootstrap conversation ────────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId && chatUserId) {
      createConversation(chatUserId).then((res) => setConversationId(res.conversation.id))
    }
  }, [conversationId, chatUserId])

  // ── Send initial message from MatchScreen ─────────────────────────────────
  useEffect(() => {
    if (!conversationId || sentInitialRef.current) return
    if (initialPhotoUri) {
      sentInitialRef.current = true
      sendMsg({ type: 'streak', media: { url: initialPhotoUri, mime: 'image/jpeg' }, streak: { ttlSeconds: 86400 } })
    } else if (initialText?.trim()) {
      sentInitialRef.current = true
      sendMsg({ type: 'text', text: initialText.trim() })
    }
  }, [conversationId])

  // ── Auto-open camera ──────────────────────────────────────────────────────
  useEffect(() => { if (autoOpenCamera) setIsCameraOpen(true) }, [autoOpenCamera])

  // ── Mark read ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId || messages.length === 0) return
    const last = messages[messages.length - 1]
    if (last && !last.id.startsWith('optimistic-') && last.senderId !== myId) {
      markRead(last.id)
    }
  }, [conversationId, messages.length])

  // ── Scroll ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (messages.length > 0)
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
  }, [messages.length])

  // ── Send handlers ─────────────────────────────────────────────────────────
  const handleSendText = handleSubmit((data) => {
    const trimmed = data.messageText.trim()
    if (!trimmed || !conversationId) return
    sendMsg({ type: 'text', text: trimmed })
    reset({ messageText: '' })
  })

  const handlePhotoCapture = useCallback((uri: string) => {
    if (!conversationId) return
    sendMsg({ type: 'streak', media: { url: uri, mime: 'image/jpeg' }, streak: { ttlSeconds: 86400 } })
    if (isLocked) setIsLocked(false)
    setIsCameraOpen(false)
  }, [conversationId, isLocked, sendMsg])

  const handleVideoCapture = useCallback((uri: string) => {
    if (!conversationId) return
    sendMsg({ type: 'streak', media: { url: uri, mime: 'video/mp4' }, streak: { ttlSeconds: 86400 } })
    if (isLocked) setIsLocked(false)
    setIsCameraOpen(false)
  }, [conversationId, isLocked, sendMsg])

  const handleOpenGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsMultipleSelection: false })
    if (!result.canceled && result.assets?.[0]?.uri && conversationId) {
      sendMsg({ type: 'image', media: { url: result.assets[0].uri, mime: 'image/jpeg' } })
      if (isLocked) setIsLocked(false)
    }
  }

  // ── Block ─────────────────────────────────────────────────────────────────
  const handleBlock = () => {
    if (!chatUserId) return
    blockUser({ blockedUserId: chatUserId }, {
      onSuccess: () => { showToast({ text1: 'User Blocked', icon: UserRoundX }); navigation.goBack() },
    })
  }

  // ── View Profile — use real peer data from API ────────────────────────────
  const openMenu = () => {
    menuAnchorRef.current?.measureInWindow((x, y, width, height) => {
      setMenuAnchorPos({ x, y, width, height })
      setMenuVisible(true)
    })
  }

  const menuItems: ChatMenuItem[] = [
    {
      key: 'view_profile', label: 'View Profile',
      icon:  <UserCircle size={sf(18)} color="#1C1C1E" strokeWidth={1.8} />,
      color: '#1C1C1E',
      onPress: () => {
        // Build UserProfile shape from peerUser API response
        const profile = peerUser?.profile
        const interests = (peerUser?.interests ?? []).map((ui: any) => ui.interest.name)
        const location = peerUser?.location ?? '';

        navigation?.navigate('UserProfileScreen', {
          user: {
            id:         chatUserId ?? '',
            name:       `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim() || chatUserName,
            age:        profile?.dob
              ? Math.floor((Date.now() - new Date(profile.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
              : 0,
            images:     profile?.photos?.length ? profile.photos : chatUserImageUri ? [chatUserImageUri] : [],
            bio:        profile?.bio ?? '',
            bio2:       profile?.bio ?? '',
            height:     profile?.height ? `${profile.height} cm` : '',
            gender:     profile?.gender
              ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)
              : '',
            location:   location,
            attributes: profile?.ethnicity ? [profile.ethnicity] : [],
            interests,
          },
        })
      },
    },
    {
      key: 'block', label: 'Block',
      icon:  <AlertTriangle size={sf(18)} color="#FBB202" strokeWidth={1.8} />,
      color: '#FBB202',
      onPress: handleBlock,
    },
  ]

  // ── Seen detection ────────────────────────────────────────────────────────
  const lastFriendIdx = messages.reduceRight(
    (acc, msg, i) => (acc === -1 && msg.senderId !== myId ? i : acc), -1,
  )
  const isMessageSeen = (idx: number) => {
    if (!myId) return false
    const msg = messages[idx]
    if (!msg || msg.senderId !== myId) return false
    return lastFriendIdx > idx
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isCreating) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator color="#1E78F5" />
        <Text style={{ marginTop: sh(12), color: '#7D858E', fontFamily: 'Poppins-Regular', fontSize: sf(14) }}>
          Opening chat…
        </Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', paddingTop: sh(40), paddingBottom: sh(20) }}>
        <View style={{ flex: 1 }}>

          {/* ── Nav Bar ─────────────────────────────────────────────────── */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: sw(16), paddingBottom: sh(14), backgroundColor: '#FFFFFF', borderBottomWidth: 0.4, borderBottomColor: '#B6B9C9' }}>
            <TouchableOpacity onPress={() => navigation?.goBack()} style={{ marginRight: sw(12) }}>
              <ChevronLeft size={sf(24)} color="#7D858E" strokeWidth={2} />
            </TouchableOpacity>

            <ChatAvatar size={sf(40)} variant="friend" imageUri={chatUserImageUri} />

            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', marginLeft: sw(10) }}>
              <Text style={{ fontWeight: '400', fontSize: sf(20), lineHeight: sf(22), color: '#000000' }}>
                {chatUserName}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: sw(4) }}>
                {isOnline && !isPeerTyping && (
                  <View style={{ width: sf(7), height: sf(7), borderRadius: 99, backgroundColor: '#22C55E' }} />
                )}
                <Text style={{ fontWeight: '400', fontSize: sf(12), color: presenceColor }}>
                  {presenceLabel}
                </Text>
              </View>
            </View>

            <TouchableOpacity ref={menuAnchorRef} onPress={openMenu}>
              <MoreVertical size={sf(22)} color="#1E78F5" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* ── Messages ────────────────────────────────────────────────── */}
          {messagesLoading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color="#1E78F5" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <MsgBubble
                  message={item}
                  isMe={item.senderId === myId || item.id.startsWith('optimistic-')}
                  isSeen={isMessageSeen(index)}
                  friendAvatarUri={chatUserImageUri}
                  myAvatarUri={myAvatar}
                  onSnapPress={(msg) => {
                    if (msg.media?.url) {
                      navigation.navigate('SnapViewScreen', {
                        snapUri:          msg.media.url,
                        snapType:         msg.media.mime?.startsWith('video') ? 'video' : 'photo',
                        chatUserName,
                        chatUserImageUri,
                      })
                    }
                  }}
                />
              )}
              contentContainerStyle={{ paddingVertical: sh(12), flexGrow: 1, justifyContent: 'flex-end' }}
              showsVerticalScrollIndicator={false}
              onEndReached={() => { if (hasNextPage) fetchNextPage() }}
              onEndReachedThreshold={0.1}
              ListHeaderComponent={
                isFetchingNextPage
                  ? <ActivityIndicator color="#1E78F5" style={{ marginVertical: sh(8) }} />
                  : null
              }
              ListEmptyComponent={
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: sh(60) }}>
                  <Text style={{ fontSize: sf(40), marginBottom: sh(8) }}>👋</Text>
                  <Text style={{ fontSize: sf(15), color: '#8D8D8D' }}>Say hello!</Text>
                </View>
              }
            />
          )}

          {/* ── Locked overlay ──────────────────────────────────────────── */}
          {isLocked && (
            <View style={{ ...StyleSheet.absoluteFillObject, padding: 12, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden' }}>
                <View style={{ ...StyleSheet.absoluteFill, backgroundColor: 'rgba(255,243,200,0.55)' }} />
                <BlurView style={StyleSheet.absoluteFill} intensity={85} tint="light" />
                <View style={{ ...StyleSheet.absoluteFill, backgroundColor: 'rgba(251,178,2,0.2)' }} />
                <View style={{ ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <Text style={{ fontSize: sf(40) }}>🔒</Text>
                  <Text style={{ fontFamily: 'Poppins-Medium', fontWeight: '500', fontSize: sf(32), color: '#000000' }}>
                    Chat Locked
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ── Bottom bar ──────────────────────────────────────────────── */}
          {isLocked ? (
            <TouchableOpacity
              onPress={() => setIsCameraOpen(true)}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(251,178,2,0.6)', marginHorizontal: sw(16), marginBottom: sh(16), marginTop: sh(8), borderRadius: sr(15), height: sh(56), paddingHorizontal: sw(20) }}
            >
              <CameraIcon width={40} height={40} />
              <Text style={{ fontWeight: '500', fontSize: sf(16), color: '#000000' }}>
                Send moment to Unlock the chat
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: sw(16), paddingVertical: sh(8), gap: 14, backgroundColor: '#FFFFFF' }}>
              <TouchableOpacity onPress={() => setIsCameraOpen(true)} style={{ width: sw(40), height: sh(40), alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: sw(56), height: sh(56), overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderRadius: sr(94) }}>
                  <CameraIcon />
                </View>
              </TouchableOpacity>

              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', height: sh(56), borderRadius: sr(15), borderWidth: 1, borderColor: '#B6B9C9', paddingHorizontal: sw(16), gap: 8, backgroundColor: '#FFFFFF', shadowColor: '#000000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 1 }}>
                <TextInput
                  placeholder="Respond with a message"
                  placeholderTextColor="#B6B9C9"
                  value={messageText}
                  onChangeText={(v) => { setValue('messageText', v, { shouldValidate: true }); onTyping() }}
                  onBlur={() => { trigger('messageText'); onStopTyping() }}
                  onSubmitEditing={handleSendText}
                  returnKeyType="send"
                  blurOnSubmit={false}
                  style={{ flex: 1, fontFamily: 'Poppins-Regular', fontSize: sf(16), color: '#000000', padding: 0, height: sh(56) }}
                />
                <TouchableOpacity onPress={handleOpenGallery}>
                  <ImageIcon size={sf(20)} color="#7D858E" strokeWidth={1.8} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSendText} disabled={!messageText.trim() || isSending}>
                  {isSending
                    ? <ActivityIndicator size="small" color="#1E78F5" />
                    : <Send size={sf(20)} color={messageText.trim() ? '#1E78F5' : '#B6B9C9'} strokeWidth={2} />
                  }
                </TouchableOpacity>
              </View>
            </View>
          )}

          <CameraScreen
            visible={isCameraOpen}
            onClose={() => setIsCameraOpen(false)}
            onPhotoCapture={handlePhotoCapture}
            onVideoCapture={handleVideoCapture}
          />
        </View>
      </View>

      <ChatMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        anchorPosition={menuAnchorPos}
        items={menuItems}
      />
    </KeyboardAvoidingView>
  )
}