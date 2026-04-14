// screens/SnapViewScreen.tsxa
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Keyboard,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useEvent } from "expo";
import { Text } from "@/components/common/Text";
import { PanGestureHandler } from "react-native-gesture-handler";
import { useVideoPlayer, VideoView } from "expo-video";
import { sf, sw, sh } from "@/utils/sizeMatters";
import ChatAvatar from "@/components/chat/ChatAvatar";
import CameraScreen from "@/screens/CameraScreen";
import CameraIcon from "@/assets/images/cameraIcon.svg";

const PHOTO_SNAP_SECONDS = 5;
const HOLD_MS = 350;

/** Photo path: no expo-video hooks — avoids crashes when opening photo snaps. */
function SnapPhotoBody({
  snapUri,
  isPaused,
  onAutoClose,
}: {
  snapUri: string;
  isPaused: boolean;
  onAutoClose: () => void;
}) {
  const [remainingSeconds, setRemainingSeconds] = useState(PHOTO_SNAP_SECONDS);

  useEffect(() => {
    if (isPaused) return;
    if (remainingSeconds <= 0) {
      onAutoClose();
      return;
    }
    const t = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [isPaused, remainingSeconds, onAutoClose]);

  return (
    <>
      <Image
        source={{ uri: snapUri }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        resizeMode="cover"
      />
      <View
        style={{
          position: "absolute",
          top: sh(16),
          right: sw(16),
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
        pointerEvents="none"
      >
        <Text style={{ color: "#FFFFFF", fontSize: sf(16), fontWeight: "600" }}>
          {remainingSeconds}s
        </Text>
        {isPaused && (
          <Text style={{ color: "#FFFFFF", fontSize: sf(14), fontWeight: "600" }}>
            Paused
          </Text>
        )}
      </View>
    </>
  );
}

/** Video path: all expo-video hooks live here only. */
function SnapVideoBody({
  snapUri,
  isPaused,
  onAutoClose,
}: {
  snapUri: string;
  isPaused: boolean;
  onAutoClose: () => void;
}) {
  const player = useVideoPlayer(snapUri, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 0.2;
    p.play();
  });

  const videoEvents = useEvent(player as any, "timeUpdate", {
    currentTime: 0,
  }) as { currentTime?: number };
  const playedToEnd = useEvent(player as any, "playToEnd", {
    playedToEnd: false,
  }) as { playedToEnd?: boolean };

  const videoDurationSeconds = useMemo(() => {
    const d = Number((player as any)?.duration ?? 0);
    return Number.isFinite(d) && d > 0 ? d : 0;
  }, [player, (player as any)?.duration]);

  const videoRemainingSeconds = useMemo(() => {
    const duration = videoDurationSeconds;
    const currentTime = Number(videoEvents?.currentTime ?? 0);
    if (!duration) return 0;
    return Math.max(0, Math.ceil(duration - currentTime));
  }, [videoDurationSeconds, videoEvents?.currentTime]);

  useEffect(() => {
    if (!player) return;
    if (isPaused) player.pause?.();
    else player.play?.();
  }, [isPaused, player]);

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (isPaused) return;
    setRemainingSeconds(videoRemainingSeconds);
    if (videoDurationSeconds > 0 && videoRemainingSeconds <= 0) {
      onAutoClose();
    }
  }, [isPaused, onAutoClose, videoDurationSeconds, videoRemainingSeconds]);

  useEffect(() => {
    if (isPaused) return;
    if (playedToEnd?.playedToEnd) onAutoClose();
  }, [isPaused, onAutoClose, playedToEnd?.playedToEnd]);

  return (
    <>
      <VideoView
        player={player}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        contentFit="cover"
        nativeControls={false}
      />
      <View
        style={{
          position: "absolute",
          top: sh(16),
          right: sw(16),
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
        pointerEvents="none"
      >
        <Text style={{ color: "#FFFFFF", fontSize: sf(16), fontWeight: "600" }}>
          {remainingSeconds}s
        </Text>
        {isPaused && (
          <Text style={{ color: "#FFFFFF", fontSize: sf(14), fontWeight: "600" }}>
            Paused
          </Text>
        )}
      </View>
    </>
  );
}

export default function SnapViewScreen({ navigation, route }: any) {
  const snapUri: string | undefined = route?.params?.snapUri;
  const snapType: "photo" | "video" =
    route?.params?.snapType === "video" ? "video" : "photo";
  const chatUserName: string = route?.params?.chatUserName ?? "User";

  const [keyboardPaused, setKeyboardPaused] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [holdPaused, setHoldPaused] = useState(false);

  const isPaused = keyboardPaused || cameraOpen || holdPaused;

  const isClosingRef = useRef(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressStartRef = useRef(0);
  const holdActiveRef = useRef(false);

  const close = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    navigation.goBack();
    setTimeout(() => {
      isClosingRef.current = false;
    }, 300);
  }, [navigation]);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardPaused(true),
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardPaused(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const onBackdropPressIn = () => {
    pressStartRef.current = Date.now();
    holdActiveRef.current = false;
    clearHoldTimer();
    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      holdActiveRef.current = true;
      setHoldPaused(true);
    }, HOLD_MS);
  };

  const onBackdropPressOut = () => {
    clearHoldTimer();
    const dt = Date.now() - pressStartRef.current;
    if (holdActiveRef.current) {
      holdActiveRef.current = false;
      setHoldPaused(false);
      return;
    }
    if (dt < HOLD_MS) {
      close();
    }
  };

  return (
    <PanGestureHandler
      onEnded={(e: any) => {
        const { translationY, velocityY } = e?.nativeEvent ?? {};
        const shouldClose =
          (translationY ?? 0) > sh(90) || (velocityY ?? 0) > 900;
        if (shouldClose) close();
      }}
    >
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        <Pressable
          style={{ flex: 1 }}
          onPressIn={onBackdropPressIn}
          onPressOut={onBackdropPressOut}
        >
          {snapUri ? (
            snapType === "video" ? (
              <SnapVideoBody
                snapUri={snapUri}
                isPaused={isPaused}
                onAutoClose={close}
              />
            ) : (
              <SnapPhotoBody
                snapUri={snapUri}
                isPaused={isPaused}
                onAutoClose={close}
              />
            )
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: sf(18) }}>
                Snap unavailable
              </Text>
            </View>
          )}

          <View
            style={{
              position: "absolute",
              top: sh(16),
              left: sw(16),
              right: sw(16),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            pointerEvents="box-none"
          >
            <View
              style={{
                gap: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <ChatAvatar
                size={sf(40)}
                variant="friend"
                imageUri={route?.params?.chatUserImageUri}
              />
              <Text
                style={{ color: "#FFFFFF", fontSize: sf(16), fontWeight: "600" }}
              >
                {chatUserName}
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Bottom bar: typing + camera — pauses snap (not tap-to-close) */}
        <View
          style={{
            position: "absolute",
            bottom: sh(16),
            left: 0,
            right: 0,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: sw(16),
            gap: 14,
          }}
        >
          <TouchableOpacity
            onPress={() => setCameraOpen(true)}
            style={{
              width: sw(40),
              height: sh(40),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: sw(56),
                height: sh(56),
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
              }}
            >
              <CameraIcon />
            </View>
          </TouchableOpacity>

          <TextInput
            placeholder="Type a message..."
            placeholderTextColor="#B6B9C9"
            style={{
              flex: 1,
              // height: sh(48),
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#B6B9C9",
              paddingHorizontal: sw(16),
              backgroundColor: "#FFFFFF",
              fontFamily: "Poppins-Regular",
              fontSize: sf(16),
              color: "#000000",
            }}
            onFocus={() => setKeyboardPaused(true)}
            onBlur={() => setKeyboardPaused(false)}
          />
        </View>

        <CameraScreen
          visible={cameraOpen}
          onClose={() => setCameraOpen(false)}
          onPhotoCapture={() => setCameraOpen(false)}
          onVideoCapture={() => setCameraOpen(false)}
        />
      </View>
    </PanGestureHandler>
  );
}
