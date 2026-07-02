import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { Text } from '@/components/common/Text';
import RefreshControl from '@/components/common/RefreshControl';
import {
  ChevronLeft,
  MoreVertical,
  Image as ImageIcon,
  Send,
  UserCircle,
  AlertTriangle,
  UserRoundX,
  Loader,
  Check,
  CheckCheck,
  Eye,
} from 'lucide-react-native';
import Logo from '@/assets/images/logo.svg';
import CameraIcon from '@/assets/images/cameraIcon.svg';
import CameraScreen from './CameraScreen';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import ChatAvatar from '@/components/chat/ChatAvatar';
import ChatMenu, { type ChatMenuItem } from '@/screens/ChatMenu';
import { sf, sr, sw, sh } from '@/utils/sizeMatters';
import { useZodForm } from '@/utils/form';
import { chatMessageFormSchema } from '@/schemas/messaging';
import { showToast } from '@/utils/toast';
import {
  useMessages,
  useSendMessage,
  useMarkRead,
  useCreateDirectConversation,
  useConversationSocket,
  usePresence,
  useTypingIndicator,
  useConversations,
} from '@/features/chat/hooks';
import { useBlockUser } from '@/features/social/hooks';
import { useMe } from '@/features/profile/hooks';
import { useGetUserById } from '@/features/users/hooks';
import type { ChatMessage } from '@/features/chat/schema';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { onSocketReconnect } from '@/services/socket';
import { useActiveChatStore } from '@/store/activeChatStore';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatMsgTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MsgBubble({
  message,
  isMe,
  isDelivered,
  isSeen,
  friendAvatarUri,
  myAvatarUri,
  onSnapPress,
  myId,
}: {
  message: ChatMessage;
  isMe: boolean;
  isDelivered: boolean;
  isSeen: boolean;
  friendAvatarUri?: string;
  myAvatarUri?: string;
  onSnapPress?: (msg: ChatMessage) => void;
  myId?: string;
}) {
  const isOptimistic = message.id.startsWith('optimistic-')
  // Tick states:
  //   optimistic  → no tick (still sending)
  //   real + !isDelivered → single gray tick (sent to server, recipient offline)
  //   real + isDelivered + !isSeen → double gray tick (delivered to device)
  //   real + isSeen → double blue tick
  // isDelivered = message has a real server id AND recipient was online when it arrived.
  // We approximate delivered as: message is real (non-optimistic) — the server
  // confirmed receipt. isSeen comes from readBy[] stamped by message:read events.
  const showTick = isMe && !isOptimistic;

  const wrapStyle: any = {
    flexDirection: isMe ? 'row-reverse' : 'row',
    marginBottom: sh(8),
    paddingHorizontal: sw(16),
    alignItems: 'flex-end',
    gap: sw(8),
  };

  const timeRow = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: sw(4),
        marginTop: sh(3),
      }}
    >
      <Text style={{ fontSize: sf(10), color: '#B6B9C9' }}>
        {formatMsgTime(message.createdAt)}
        {isOptimistic ? '  ···' : ''}
      </Text>
      {showTick && (
        <View>
          {isSeen ? (
            // Double blue tick — read by recipient
            <CheckCheck size={15} color='#1E78F5' />
          ) : isDelivered ? (
            // Double gray tick — delivered but not yet read
            <CheckCheck size={15} color='#B6B9C9' />
          ) : (
            // Single gray tick — sent to server, recipient offline
            <Check size={15} color='#B6B9C9' />
          )}
        </View>
      )}
    </View>
  );

  // ── Text bubble ─────────────────────────────────────────────────────────────
  if (message.type === 'text') {
    return (
      <View style={wrapStyle}>
        <ChatAvatar
          size={sf(32)}
          variant={isMe ? 'me' : 'friend'}
          imageUri={isMe ? myAvatarUri : friendAvatarUri}
        />
        <View
          style={{
            maxWidth: '72%',
            alignItems: isMe ? 'flex-end' : 'flex-start',
          }}
        >
          <View
            style={{
              // ── Sent: #0B0B0B bg, white text ──────────────────────────
              // ── Received: #EAD6A9 bg, #0B0B0B text ───────────────────
              backgroundColor: isMe ? '#0B0B0B' : '#EAD6A9',
              borderTopLeftRadius: sr(16),
              borderTopRightRadius: sr(16),
              borderBottomLeftRadius: isMe ? sr(16) : sr(4),
              borderBottomRightRadius: isMe ? sr(4) : sr(16),
              paddingHorizontal: sw(14),
              paddingVertical: sh(10),
              opacity: isOptimistic ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                color: isMe ? '#FFFFFF' : '#0B0B0B',
                fontSize: sf(15),
                fontFamily: 'Poppins-Regular',
              }}
            >
              {message.text}
            </Text>
          </View>
          {timeRow}
        </View>
      </View>
    );
  }

  // ── Image bubble ─────────────────────────────────────────────────────────────
  if (message.type === 'image' && message.media?.url) {
    return (
      <View style={wrapStyle}>
        <ChatAvatar
          size={sf(32)}
          variant={isMe ? 'me' : 'friend'}
          imageUri={isMe ? myAvatarUri : friendAvatarUri}
        />
        <View style={{ alignItems: isMe ? 'flex-end' : 'flex-start' }}>
          <TouchableOpacity
            onPress={() => onSnapPress?.(message)}
            style={{
              width: sw(200),
              height: sh(250),
              borderRadius: sr(14),
              overflow: 'hidden',
              backgroundColor: '#EDEDED',
            }}
          >
            <Image
              source={{ uri: message.media.url }}
              style={{ width: '100%', height: '100%' }}
              resizeMode='cover'
            />
          </TouchableOpacity>
          {timeRow}
        </View>
      </View>
    );
  }

  // ── Streak bubble ─────────────────────────────────────────────────────────────
  if (message.type === 'streak') {
    const alreadyViewed = Array.isArray(message.streakViewedBy) && myId
      ? message.streakViewedBy.includes(myId)
      : false;
    const mediaRedacted = !message.media?.url;

    if (!isMe) {
      // ── RECEIVED streak ──
      const isViewed = alreadyViewed || mediaRedacted;
      return (
        <View style={wrapStyle}>
          <ChatAvatar size={sf(32)} variant='friend' imageUri={friendAvatarUri} />
          <View style={{ alignItems: 'flex-start' }}>
            <TouchableOpacity
              onPress={() => !isViewed && onSnapPress?.(message)}
              activeOpacity={isViewed ? 1 : 0.8}
              style={{
                backgroundColor: isViewed ? '#E8E8E8' : '#EAD6A9',
                borderRadius: sr(16),
                borderBottomLeftRadius: sr(4),
                paddingHorizontal: sw(14),
                paddingVertical: sh(12),
                flexDirection: 'row',
                alignItems: 'center',
                gap: sw(10),
                opacity: isOptimistic ? 0.6 : 1,
              }}
            >
              <View
                style={{
                  width: sw(38),
                  height: sw(38),
                  borderRadius: sr(10),
                  backgroundColor: isViewed ? '#B0B0B0' : '#0B0B0B',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isViewed
                  ? <Eye size={sf(20)} color='#FFFFFF' />
                  : <Logo width={sf(22)} height={sf(22)} />}
              </View>
              <View>
                <Text style={{ fontSize: sf(15), fontWeight: '600', color: isViewed ? '#888888' : '#0B0B0B', fontFamily: 'Poppins-Medium' }}>
                  {isViewed ? 'Viewed' : 'View moment'}
                </Text>
                {!isViewed && message.streakExpiresAt && (
                  <Text style={{ fontSize: sf(11), color: '#8D7A5A' }}>
                    {formatMsgTime(message.createdAt)}
                    {'  '}
                    {(() => {
                      const remaining = new Date(message.streakExpiresAt).getTime() - Date.now();
                      const secs = Math.max(0, Math.floor(remaining / 1000));
                      if (secs < 60) return `${secs}s`;
                      if (secs < 3600) return `${Math.floor(secs / 60)}m`;
                      return `${Math.floor(secs / 3600)}h`;
                    })()}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: sw(4), marginTop: sh(3) }}>
              <Text style={{ fontSize: sf(10), color: '#B6B9C9' }}>{formatMsgTime(message.createdAt)}</Text>
            </View>
          </View>
        </View>
      );
    }

    // ── SENT streak: show "Viewed" if receiver has opened it ──────────────────
    const receiverViewed = Array.isArray(message.streakViewedBy) && message.streakViewedBy.length > 0
      && (!myId || message.streakViewedBy.some((id) => id !== myId));

    return (
      <View style={wrapStyle}>
        <ChatAvatar size={sf(32)} variant='me' imageUri={myAvatarUri} />
        <View style={{ alignItems: 'flex-end' }}>
          <View
            style={{
              backgroundColor: '#0B0B0B',
              borderRadius: sr(16),
              borderBottomRightRadius: sr(4),
              paddingHorizontal: sw(18),
              paddingVertical: sh(12),
              flexDirection: 'row',
              alignItems: 'center',
              gap: sw(10),
              opacity: isOptimistic ? 0.6 : 1,
            }}
          >
            {receiverViewed
              ? <Eye size={14} color='#CEB98F' />
              : <Loader size={14} color='#FFFFFF' />}
            <Text style={{ fontSize: sf(16), fontWeight: '500', color: receiverViewed ? '#CEB98F' : '#FFFFFF', fontFamily: 'Poppins-Medium' }}>
              {receiverViewed ? 'Viewed' : 'Moment'}
            </Text>
          </View>
          {timeRow}
        </View>
      </View>
    );
  }

  return null;
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ChatScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const routeUser = route?.params?.user as
    | { id?: string; name?: string; images?: string[] }
    | undefined;
  const chatUserName: string =
    route?.params?.chatUserName ?? routeUser?.name ?? 'User';
  const chatUserImageUri: string | undefined =
    route?.params?.chatUserImageUri ?? routeUser?.images?.[0];
  const routeChatUserId: string | undefined =
    route?.params?.chatUserId ?? routeUser?.id;
  const initialLocked: boolean = route?.params?.initialLocked ?? false;
  const autoOpenCamera: boolean = !!route?.params?.autoOpenCamera;
  const passedConversationId: string | undefined =
    route?.params?.conversationId;
  const initialText: string | undefined = route?.params?.initialText;
  const initialPhotoUri: string | undefined = route?.params?.initialPhotoUri;

  const { data: conversationsData } = useConversations();
  const conversations = conversationsData?.items;
  const resolvedConversationId =
    passedConversationId ??
    conversations?.find((c) => c.otherUser?.id === routeChatUserId)?.conversationId ??
    null;
  const chatUserId =
    routeChatUserId ??
    conversations?.find((c) => c.conversationId === resolvedConversationId)?.otherUser?.id;

  // ── My profile ────────────────────────────────────────────────────────────
  const { data: me } = useMe();
  const myId = me?.id;
  const myAvatarRaw = me?.profile?.photos?.[0];
  const myAvatar =
    typeof myAvatarRaw === 'string' ? myAvatarRaw : (myAvatarRaw as any)?.url;

  // ── Peer profile ──────────────────────────────────────────────────────────
  const { data: peerUser } = useGetUserById(chatUserId);

  const convPeer = conversations?.find(
    (c) => c.conversationId === resolvedConversationId,
  )?.otherUser;

  const displayName = (() => {
    if (chatUserName && chatUserName !== 'User') return chatUserName;
    const fromPeer = peerUser?.profile;
    const name = `${fromPeer?.firstName ?? ''} ${fromPeer?.lastName ?? ''}`.trim();
    if (name) return name;
    const fromConv = `${convPeer?.firstName ?? ''} ${convPeer?.lastName ?? ''}`.trim();
    return fromConv || chatUserName;
  })();

  const displayAvatar = (() => {
    if (chatUserImageUri) return chatUserImageUri;
    const peerPhoto = peerUser?.profile?.photos?.[0];
    if (peerPhoto) return typeof peerPhoto === 'string' ? peerPhoto : (peerPhoto as any)?.url;
    const convPhoto = convPeer?.photos?.[0];
    if (convPhoto) return typeof convPhoto === 'string' ? convPhoto : (convPhoto as any)?.url;
    return undefined;
  })();

  // ── State ─────────────────────────────────────────────────────────────────
  const [conversationId, setConversationId] = useState<string | null>(
    resolvedConversationId,
  );
  const [isLocked, setIsLocked] = useState(initialLocked);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchorPos, setMenuAnchorPos] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const menuAnchorRef = useRef<View>(null);
  const flatListRef = useRef<FlatList>(null);
  const sentInitialRef = useRef(false);
  const initialScrollPendingRef = useRef(true);
  const stickToBottomRef = useRef(true);

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const { mutateAsync: createConversation, isPending: isCreating } =
    useCreateDirectConversation();
  const {
    data,
    isLoading: messagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(conversationId);
  const { mutate: sendMsg, isPending: isSending } = useSendMessage(
    conversationId ?? '',
  );
  const { mutate: markRead } = useMarkRead(conversationId ?? '');
  const { mutate: blockUser } = useBlockUser();

  // ── Presence + typing ─────────────────────────────────────────────────────
  const { isOnline, lastSeen } = usePresence(chatUserId);
  const { isPeerTyping, onTyping, onStopTyping } = useTypingIndicator(
    conversationId,
    chatUserId,
  );

  const presenceLabel = (() => {
    if (isPeerTyping) return 'typing...';
    if (isOnline) return 'Online';
    if (lastSeen) {
      const diff = Date.now() - new Date(lastSeen).getTime();
      const mins = Math.floor(diff / 60_000);
      const hrs = Math.floor(diff / 3_600_000);
      const days = Math.floor(diff / 86_400_000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      if (hrs < 24) return `${hrs}h ago`;
      return `${days}d ago`;
    }
    return 'Offline';
  })();

  const presenceColor = isPeerTyping
    ? '#EAD6A9'
    : isOnline
      ? '#1E78F5'
      : '#B6B9C9';

  // ── Socket ────────────────────────────────────────────────────────────────
  useConversationSocket(conversationId);

  const setActiveConversationId = useActiveChatStore((s) => s.setActiveConversationId);
  useEffect(() => {
    if (conversationId) setActiveConversationId(conversationId);
    return () => setActiveConversationId(null);
  }, [conversationId]);
  const messages: ChatMessage[] = data?.messages ?? [];

  const scrollToBottom = useCallback((animated = false) => {
    flatListRef.current?.scrollToEnd({ animated });
  }, []);

  useEffect(() => {
    initialScrollPendingRef.current = true;
    stickToBottomRef.current = true;
  }, [conversationId]);

  // ── Form ──────────────────────────────────────────────────────────────────
  const { watch, setValue, handleSubmit, reset, trigger } = useZodForm(
    chatMessageFormSchema,
    { defaultValues: { messageText: '' } },
  );
  const messageText = watch('messageText');

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId && resolvedConversationId) {
      setConversationId(resolvedConversationId);
    }
  }, [conversationId, resolvedConversationId]);

  useEffect(() => {
    if (!conversationId && chatUserId) {
      createConversation(chatUserId).then((res) =>
        setConversationId(res.conversation.id),
      );
    }
  }, [conversationId, chatUserId]);

  useEffect(() => {
    if (!conversationId || sentInitialRef.current) return;
    if (initialPhotoUri) {
      sentInitialRef.current = true;
      sendMsg({
        type: 'streak',
        media: { url: initialPhotoUri, mime: 'image/jpeg' },
        streak: { ttlSeconds: 86400 },
      });
    } else if (initialText?.trim()) {
      sentInitialRef.current = true;
      sendMsg({ type: 'text', text: initialText.trim() });
    }
  }, [conversationId]);

  useEffect(() => {
    if (autoOpenCamera) setIsCameraOpen(true);
  }, [autoOpenCamera]);

  const lastPeerMessageId = [...messages]
    .reverse()
    .find((m) => !m.id.startsWith('optimistic-') && m.senderId !== myId)?.id;

  useEffect(() => {
    if (!conversationId || !lastPeerMessageId) return;
    markRead(lastPeerMessageId);
    const offReconnect = onSocketReconnect(() => markRead(lastPeerMessageId));
    return offReconnect;
  }, [conversationId, lastPeerMessageId]);

  useEffect(() => {
    if (messagesLoading || messages.length === 0) return;

    if (initialScrollPendingRef.current) {
      requestAnimationFrame(() => scrollToBottom(false));
      return;
    }

    if (stickToBottomRef.current) {
      requestAnimationFrame(() => scrollToBottom(true));
    }
  }, [messagesLoading, messages.length, messages[messages.length - 1]?.id, scrollToBottom]);

  const handleMessagesContentSizeChange = useCallback(() => {
    if (messages.length === 0) return;

    if (initialScrollPendingRef.current) {
      scrollToBottom(false);
      initialScrollPendingRef.current = false;
      return;
    }

    if (stickToBottomRef.current) {
      scrollToBottom(false);
    }
  }, [messages.length, scrollToBottom]);

  const handleMessagesScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number }; contentSize: { height: number }; layoutMeasurement: { height: number } } }) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const distanceFromBottom =
        contentSize.height - layoutMeasurement.height - contentOffset.y;
      stickToBottomRef.current = distanceFromBottom < sh(80);
    },
    [],
  );

  // ── Send handlers ─────────────────────────────────────────────────────────
  const handleSendText = handleSubmit((data) => {
    const trimmed = data.messageText.trim();
    if (!trimmed || !conversationId) return;
    sendMsg({ type: 'text', text: trimmed });
    reset({ messageText: '' });
  });

  const handlePhotoCapture = useCallback(
    (uri: string) => {
      if (!conversationId) return;
      sendMsg({
        type: 'streak',
        media: { url: uri, mime: 'image/jpeg' },
        streak: { ttlSeconds: 86400 },
      });
      if (isLocked) setIsLocked(false);
      setIsCameraOpen(false);
    },
    [conversationId, isLocked, sendMsg],
  );

  const handleVideoCapture = useCallback(
    (uri: string) => {
      if (!conversationId) return;
      sendMsg({
        type: 'streak',
        media: { url: uri, mime: 'video/mp4' },
        streak: { ttlSeconds: 86400 },
      });
      if (isLocked) setIsLocked(false);
      setIsCameraOpen(false);
    },
    [conversationId, isLocked, sendMsg],
  );

  const handleOpenGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets?.[0]?.uri && conversationId) {
      sendMsg({
        type: 'image',
        media: { url: result.assets[0].uri, mime: 'image/jpeg' },
      });
      if (isLocked) setIsLocked(false);
    }
  };

  const handleBlock = () => {
    if (!chatUserId) return;
    blockUser(
      { blockedUserId: chatUserId },
      {
        onSuccess: () => {
          showToast({ text1: 'User Blocked', icon: UserRoundX });
          navigation.goBack();
        },
      },
    );
  };

  const openMenu = () => {
    menuAnchorRef.current?.measureInWindow((x, y, width, height) => {
      setMenuAnchorPos({ x, y, width, height });
      setMenuVisible(true);
    });
  };

  const menuItems: ChatMenuItem[] = [
    {
      key: 'view_profile',
      label: 'View Profile',
      icon: (
        <UserCircle
          size={sf(18)}
          color='#1C1C1E'
          strokeWidth={1.8}
        />
      ),
      color: '#1C1C1E',
      onPress: () => {
        navigation?.navigate('UserProfileScreen', { userId: chatUserId });
      },
    },
    {
      key: 'block',
      label: 'Block',
      icon: (
        <AlertTriangle
          size={sf(18)}
          color='#EAD6A9'
          strokeWidth={1.8}
        />
      ),
      color: '#EAD6A9',
      onPress: handleBlock,
    },
  ];

  // ── Tick state ────────────────────────────────────────────────────────────
  // isSeen      → recipient's id is in message.readBy[]
  // isDelivered → recipient's id is in message.deliveredTo[]
  const isMessageSeen = (idx: number): boolean => {
    if (!myId || !chatUserId) return false
    const msg = messages[idx]
    if (!msg || msg.senderId !== myId) return false
    return Array.isArray((msg as any).readBy) && (msg as any).readBy.includes(chatUserId)
  }

  const isMessageDelivered = (idx: number): boolean => {
    if (!chatUserId) return false
    const msg = messages[idx]
    if (!msg || msg.senderId !== myId) return false
    if (msg.id.startsWith('optimistic-')) return false
    return Array.isArray((msg as any).deliveredTo) && (msg as any).deliveredTo.includes(chatUserId)
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isCreating) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F7F3ED',
        }}
      >
        <ActivityIndicator color='#0B0B0B' />
        <Text
          style={{
            marginTop: sh(12),
            color: '#7D858E',
            fontFamily: 'Poppins-Regular',
            fontSize: sf(14),
          }}
        >
          Opening chat…
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style='dark' backgroundColor='#FFFFFF' translucent={false} />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#F7F3ED' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1 }}>
          {/* ── Nav Bar (white extends into status bar area) ─────────── */}
          <View
            style={{
              backgroundColor: '#FFFFFF',
              paddingTop: insets.top,
              borderBottomWidth: 0.4,
              borderBottomColor: '#B6B9C9',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: sw(16),
                paddingBottom: sh(14),
              }}
            >
              <TouchableOpacity
                onPress={() => navigation?.goBack()}
                style={{ marginRight: sw(12) }}
              >
                <ChevronLeft
                  size={sf(24)}
                  color='#7D858E'
                  strokeWidth={2}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                activeOpacity={0.7}
                disabled={!chatUserId}
                onPress={() =>
                  navigation?.navigate('UserProfileScreen', {
                    userId: chatUserId,
                  })
                }
              >
                <ChatAvatar
                  size={sf(40)}
                  variant='friend'
                  imageUri={displayAvatar}
                />

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    marginLeft: sw(10),
                  }}
                >
                  <Text
                    style={{
                      fontWeight: '400',
                      fontSize: sf(20),
                      lineHeight: sf(22),
                      color: '#000000',
                      flexShrink: 1,
                    }}
                    numberOfLines={1}
                    ellipsizeMode='tail'
                  >
                    {displayName}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: sw(4),
                    }}
                  >
                    {isOnline && !isPeerTyping && (
                      <View
                        style={{
                          width: sf(7),
                          height: sf(7),
                          borderRadius: 99,
                          backgroundColor: '#22C55E',
                        }}
                      />
                    )}
                    <Text
                      style={{
                        fontWeight: '400',
                        fontSize: sf(12),
                        color: presenceColor,
                      }}
                    >
                      {presenceLabel}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* <TouchableOpacity
                ref={menuAnchorRef}
                onPress={openMenu}
              >
                <MoreVertical
                  size={sf(22)}
                  color='#0B0B0B'
                  strokeWidth={2}
                />
              </TouchableOpacity> */}
            </View>
          </View>

            {/* ── Messages ──────────────────────────────────────────────── */}
            {messagesLoading ? (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ActivityIndicator color='#0B0B0B' />
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                onContentSizeChange={handleMessagesContentSizeChange}
                onScroll={handleMessagesScroll}
                scrollEventThrottle={16}
                renderItem={({ item, index }) => (
                  <MsgBubble
                    message={item}
                    isMe={
                      item.senderId === myId ||
                      item.id.startsWith('optimistic-')
                    }
                    isDelivered={isMessageDelivered(index)}
                    isSeen={isMessageSeen(index)}
                    friendAvatarUri={chatUserImageUri}
                    myAvatarUri={myAvatar}
                    myId={myId}
                    onSnapPress={(msg) => {
                      if (msg.media?.url) {
                        navigation.navigate('SnapViewScreen', {
                          snapUri: msg.media.url,
                          snapType: msg.media.mime?.startsWith('video')
                            ? 'video'
                            : 'photo',
                          chatUserName,
                          chatUserImageUri,
                          chatUserId,
                          conversationId,
                          messageId: msg.id,
                        });
                      }
                    }}
                  />
                )}
                contentContainerStyle={{
                  paddingVertical: sh(12),
                  flexGrow: 1,
                  justifyContent: 'flex-end',
                }}
                showsVerticalScrollIndicator={false}
                onEndReached={() => {
                  if (hasNextPage) fetchNextPage();
                }}
                onEndReachedThreshold={0.1}
                // refreshControl={
                //   <RefreshControl
                //     refreshing={isFetchingNextPage}
                //     onRefresh={() => {
                //       if (hasNextPage) fetchNextPage();
                //     }}
                //   />
                // }
                ListHeaderComponent={
                  isFetchingNextPage ? (
                    <ActivityIndicator
                      color='#0B0B0B'
                      style={{ marginVertical: sh(8) }}
                    />
                  ) : null
                }
                ListEmptyComponent={
                  <View
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingTop: sh(60),
                    }}
                  >
                    <Text style={{ fontSize: sf(40), marginBottom: sh(8) }}>
                      👋
                    </Text>
                    <Text style={{ fontSize: sf(15), color: '#8D8D8D' }}>
                      Say hello!
                    </Text>
                  </View>
                }
              />
            )}

            {/* ── Locked overlay ────────────────────────────────────────── */}
            {isLocked && (
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  padding: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 20,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      ...StyleSheet.absoluteFill,
                      backgroundColor: 'rgba(255,243,200,0.55)',
                    }}
                  />
                  <BlurView
                    style={StyleSheet.absoluteFill}
                    intensity={85}
                    tint='light'
                  />
                  <View
                    style={{
                      ...StyleSheet.absoluteFill,
                      backgroundColor: 'rgba(251,178,2,0.2)',
                    }}
                  />
                  <View
                    style={{
                      ...StyleSheet.absoluteFillObject,
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12,
                    }}
                  >
                    <Text style={{ fontSize: sf(40) }}>🔒</Text>
                    <Text
                      style={{
                        fontFamily: 'Poppins-Medium',
                        fontWeight: '500',
                        fontSize: sf(32),
                        color: '#000000',
                      }}
                    >
                      Chat Locked
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* ── Bottom bar ────────────────────────────────────────────── */}
            {isLocked ? (
              <TouchableOpacity
                onPress={() => setIsCameraOpen(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  backgroundColor: 'rgba(251,178,2,0.6)',
                  marginHorizontal: sw(16),
                  marginBottom: sh(16),
                  marginTop: sh(8),
                  borderRadius: sr(15),
                  height: sh(56),
                  paddingHorizontal: sw(20),
                }}
              >
                <CameraIcon
                  width={40}
                  height={40}
                />
                <Text
                  style={{
                    fontWeight: '500',
                    fontSize: sf(16),
                    color: '#000000',
                  }}
                >
                  Send moment to Unlock the chat
                </Text>
              </TouchableOpacity>
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: sw(16),
                  paddingVertical: sh(8),
                  gap: 14,
                  // backgroundColor: '#FFFFFF',
                }}
              >
                <TouchableOpacity
                  onPress={() => setIsCameraOpen(true)}
                  style={{
                    width: sw(40),
                    height: sh(40),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      width: sw(56),
                      height: sh(56),
                      overflow: 'hidden',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: sr(94),
                    }}
                  >
                    <CameraIcon />
                  </View>
                </TouchableOpacity>

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: sh(56),
                    borderRadius: sr(15),
                    borderWidth: 1,
                    borderColor: '#B6B9C9',
                    paddingHorizontal: sw(16),
                    gap: 8,
                    backgroundColor: '#FFFFFF',
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.04,
                    shadowRadius: 24,
                    elevation: 1,
                  }}
                >
                  <TextInput
                    placeholder='Type to a message...'
                    placeholderTextColor='#B6B9C9'
                    value={messageText}
                    onChangeText={(v) => {
                      setValue('messageText', v, { shouldValidate: true });
                      onTyping();
                    }}
                    onBlur={() => {
                      trigger('messageText');
                      onStopTyping();
                    }}
                    onSubmitEditing={handleSendText}
                    returnKeyType='send'
                    blurOnSubmit={false}
                    style={{
                      flex: 1,
                      fontFamily: 'Poppins-Regular',
                      fontSize: sf(16),
                      color: '#000000',
                      padding: 0,
                      height: sh(56),
                    }}
                  />
                  <TouchableOpacity onPress={handleOpenGallery}>
                    <ImageIcon
                      size={sf(20)}
                      color='#7D858E'
                      strokeWidth={1.8}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSendText}
                    disabled={!messageText.trim() || isSending}
                  >
                    {isSending ? (
                      <ActivityIndicator
                        size='small'
                        color='#0B0B0B'
                      />
                    ) : (
                      <Send
                        size={sf(20)}
                        color={messageText.trim() ? '#0B0B0B' : '#B6B9C9'}
                        strokeWidth={2}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {isCameraOpen && (
              <CameraScreen
                visible={isCameraOpen}
                onClose={() => setIsCameraOpen(false)}
                onPhotoCapture={handlePhotoCapture}
                onVideoCapture={handleVideoCapture}
              />
            )}
          </View>

        <ChatMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          anchorPosition={menuAnchorPos}
          items={menuItems}
        />
      </KeyboardAvoidingView>
    </>
  );
}
