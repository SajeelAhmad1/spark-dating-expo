import React, { useEffect, useState } from 'react'
import {
  View,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { Text }           from '@/components/common/Text'
import { X, Send }        from 'lucide-react-native'
import CameraIcon         from '@/assets/images/cameraIcon.svg'
import CameraScreen       from './CameraScreen'
import MatchTitle         from '@/components/match/MatchTitle'
import PhotoStack         from '@/components/match/PhotoStack'
import { calculateMatchPhotoLayout } from '@/utils/match'
import { sf, sr, sw, sh } from '@/utils/sizeMatters'
import { TextInput }      from 'react-native'
import { useZodForm }     from '@/utils/form'
import { matchCaptionFormSchema } from '@/schemas/messaging'
import { FieldError }     from '@/components/common/FieldError'
import {
  useCreateDirectConversation,
  useSendMessage,
} from '@/features/chat/hooks'
import { showToast } from '@/utils/toast'
import { useMe }     from '@/features/profile/hooks'

// ── Props ─────────────────────────────────────────────────────────────────────

interface MatchItem {
  id:    string
  name:  string
  image: string
  age?:  number
}

// ── Screen ────────────────────────────────────────────────────────────────────

const MatchScreen = ({ navigation, route }: any) => {
  const match: MatchItem = route?.params?.match ?? {
    id: '', name: 'Match', image: '', age: 0,
  }
  const autoOpenCamera: boolean = !!route?.params?.autoOpenCamera

  const { data: me } = useMe()
  const myPhoto = me?.profile?.photos?.[0]

  const [isCamOpen,        setIsCamOpen]        = useState(false)
  const [isSending,        setIsSending]        = useState(false)
  const [conversationId,   setConversationId]   = useState<string | null>(null)

  const { width } = useWindowDimensions()
  const { PHOTO_WIDTH, PHOTO_HEIGHT, CONTAINER_HEIGHT } = calculateMatchPhotoLayout(width)

  const { watch, setValue, getValues, trigger, reset, formState } = useZodForm(
    matchCaptionFormSchema,
    { defaultValues: { inputMessage: '' } },
  )
  const inputMessage = watch('inputMessage')
  const captionError = formState.errors.inputMessage?.message

  const { mutateAsync: createConversation, isPending: isCreatingConv } =
    useCreateDirectConversation()
  const { mutate: sendMsg } = useSendMessage(conversationId ?? '')

  // ── Bootstrap conversation ────────────────────────────────────────────────
  useEffect(() => {
    if (match.id) {
      createConversation(match.id)
        .then((res) => setConversationId(res.conversation.id))
        .catch(() => {/* already exists — still navigable */})
    }
  }, [match.id])

  useEffect(() => {
    if (autoOpenCamera) setIsCamOpen(true)
  }, [autoOpenCamera])

  const navigateToChat = (extraParams?: Record<string, unknown>) => {
    navigation.navigate('ChatScreen', {
      conversationId,
      chatUserId:       match.id,
      chatUserName:     match.name,
      chatUserImageUri: match.image,
      initialLocked:    false,
      ...extraParams,
    })
  }

  // ── Send text + navigate ──────────────────────────────────────────────────
  const handleSendText = () => {
    const trimmed = inputMessage.trim()
    if (!conversationId || !trimmed) return

    setIsSending(true)
    sendMsg(
      { type: 'text', text: trimmed },
      {
        onSuccess: () => {
          reset({ inputMessage: '' })
          setIsSending(false)
          navigateToChat()
        },
        onError: (err: any) => {
          setIsSending(false)
          showToast({ text1: 'Failed to send', text2: err?.message })
        },
      },
    )
  }

  // ── Send media (from camera) ──────────────────────────────────────────────
  const sendMedia = (uri: string, mime: string) => {
    if (!conversationId) {
      // Conversation not ready yet — pass as initial photo to ChatScreen
      setIsCamOpen(false)
      navigateToChat({ initialPhotoUri: uri })
      return
    }

    setIsSending(true)
    sendMsg(
      {
        type:   'streak',
        media:  { url: uri, mime },
        streak: { ttlSeconds: 24 * 60 * 60 },
      },
      {
        onSuccess: () => {
          setIsSending(false)
          setIsCamOpen(false)
          navigateToChat()
        },
        onError: (err: any) => {
          setIsSending(false)
          showToast({ text1: 'Failed to send', text2: err?.message })
        },
      },
    )
  }

  const handlePhotoCapture = (uri: string) => sendMedia(uri, 'image/jpeg')
  const handleVideoCapture = (uri: string) => sendMedia(uri, 'video/mp4')

  const closeCameraAndPreview = () => {
    setIsCamOpen(false)
    navigation.replace('DiscoveryScreen')
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FBB202', paddingBottom: sh(20) }}>
      <View
        style={{
          flex:              1,
          alignItems:        'center',
          paddingHorizontal: sw(24),
          paddingTop:        sh(40),
          paddingBottom:     sh(24),
        }}
      >
        <MatchTitle />

        {/* ── Photo stack — real avatars ──────────────────────────────── */}
        <PhotoStack
          screenWidth={width}
          photoWidth={PHOTO_WIDTH}
          photoHeight={PHOTO_HEIGHT}
          containerHeight={CONTAINER_HEIGHT}
          myPhotoUri={myPhoto}
          matchPhotoUri={match.image}
        />

        <Text style={[styles.subtitle, { fontSize: sf(16) }]}>
          {`You and ${match.name} liked each other.`}
        </Text>

        {/* ── Input bar ─────────────────────────────────────────────── */}
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Say something nice…"
            placeholderTextColor="#FFFFFF"
            value={inputMessage}
            onChangeText={(v) => setValue('inputMessage', v, { shouldValidate: true })}
            style={styles.input}
          />

          {/* Send text button */}
          <TouchableOpacity
            onPress={handleSendText}
            disabled={!inputMessage.trim() || isSending || !conversationId}
            style={[styles.iconBtn, { opacity: inputMessage.trim() && conversationId ? 1 : 0.4 }]}
          >
            {isSending
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Send size={sf(20)} color="#FFFFFF" strokeWidth={2} />
            }
          </TouchableOpacity>

          {/* Camera button */}
          <TouchableOpacity
            onPress={() => setIsCamOpen(true)}
            style={styles.iconBtn}
          >
            <CameraIcon width={sw(28)} height={sh(28)} />
          </TouchableOpacity>
        </View>

        <FieldError message={captionError} />

        {isCreatingConv && (
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: sf(12), marginTop: sh(4) }}>
            Setting up chat…
          </Text>
        )}

        {/* ── Camera ────────────────────────────────────────────────── */}
        <CameraScreen
          visible={isCamOpen}
          onClose={() => setIsCamOpen(false)}
          onPhotoCapture={handlePhotoCapture}
          onVideoCapture={handleVideoCapture}
        />

        {/* ── Close ────────────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={closeCameraAndPreview}
          style={{ width: sf(40), height: sf(40), borderRadius: sr(20), backgroundColor: '#1E78F5', alignItems: 'center', justifyContent: 'center', marginTop: sh(8) }}
        >
          <X size={sf(18)} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default MatchScreen

const styles = StyleSheet.create({
  subtitle: {
    color:        '#000000',
    marginBottom: sh(16),
    textAlign:    'center',
    fontWeight:   '500',
    fontFamily:   'Poppins-Medium',
  },
  inputRow: {
    flexDirection:     'row',
    alignItems:        'center',
    borderWidth:       1,
    borderColor:       '#000000',
    borderRadius:      999,
    paddingHorizontal: sw(16),
    width:             '100%',
    height:            sh(56),
    marginBottom:      sh(8),
    backgroundColor:   'rgba(0,0,0,0.12)',
    gap:               sw(10),
  },
  input: {
    flex:       1,
    fontFamily: 'Poppins-Regular',
    fontSize:   sf(15),
    color:      '#FFFFFF',
    padding:    0,
  },
  iconBtn: {
    width:           sf(32),
    height:          sf(32),
    alignItems:      'center',
    justifyContent:  'center',
  },
})