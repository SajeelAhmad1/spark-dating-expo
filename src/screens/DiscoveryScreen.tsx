import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, Easing, View, TouchableOpacity } from "react-native";
import { Text } from "@/components/common/Text";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Settings, Zap } from "lucide-react-native";
import BottomTabBar from "@/components/common/BottomTabBar";
import Logo from "@/assets/images/logo.svg";
import { MATCHES } from "@/constants/matches";
import DiscoveryMatchCard from "@/components/discovery/DiscoveryMatchCard";
import DiscoveryActions from "@/components/discovery/DiscoveryActions";
import { sf, sr, sw, sh } from "@/utils/sizeMatters";
import { showToast } from "@/utils/toast";
import { PanGestureHandler } from "react-native-gesture-handler";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_H_PADDING = sw(12);
const CARD_WIDTH = SCREEN_WIDTH - CARD_H_PADDING * 2;
const CARD_HEIGHT = Math.min(SCREEN_HEIGHT * 0.6, sh(560));
const BTN_OVERLAP = sf(32);

const DiscoveryScreen = ({ navigation }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);

  const photoTotal = 7;
  const cardLeftX = useRef(0);
  const photoFade = useRef(new Animated.Value(1)).current;

  const activeMatch =
    MATCHES[Math.max(0, Math.min(currentIndex, MATCHES.length - 1))];

  const translateX = useRef(new Animated.Value(0)).current;
  const isSwipingRef = useRef(false);

  const rotate = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ["-8deg", "0deg", "8deg"],
    extrapolate: "clamp",
  });

  const goToNextUser = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, MATCHES.length - 1));
    setPhotoIndex(0);
  };

  const goToPrevPhoto = () => {
    setPhotoIndex((prev) => (prev - 1 + photoTotal) % photoTotal);
  };

  const goToNextPhoto = () => {
    setPhotoIndex((prev) => (prev + 1) % photoTotal);
  };

  const openChatForActiveMatch = () => {
    navigation.navigate("ChatScreen", {
      chatUserId: activeMatch.id,
      chatUserName: activeMatch.name,
      chatUserImageUri: activeMatch.image,
      initialLocked: false,
    });
  };

  const onLikePress = () => {
    navigation.navigate("MatchScreen", { match: activeMatch });
  };

  const onCrossPress = () => {
    if (currentIndex >= MATCHES.length - 1) return;
    goToNextUser();
  };

  const swipeThreshold = CARD_WIDTH * 0.25;
  const velocityThreshold = 900;

  const gestureEvent = useMemo(() => {
    return Animated.event([{ nativeEvent: { translationX: translateX } }], {
      useNativeDriver: true,
    });
  }, [translateX]);

  useEffect(() => {
    photoFade.setValue(0);
    Animated.timing(photoFade, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [currentIndex, photoIndex, photoFade]);

  return (
    <View style={{ flex: 1, paddingBottom: sh(20) }}>
      {/* ── Full screen background gradient ── */}
      <LinearGradient
        colors={["#1E78F5", "#FBB202"]}
        start={{ x: 0, y: -0.1 }}
        end={{ x: 2, y: 0.7 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* ── Header ── */}
      <LinearGradient
        colors={["#1E78F5", "#FBB202"]}
        start={{ x: 1.5, y: 1.5 }}
        end={{ x: -2, y: -0.8 }}
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.2)",
          shadowColor: "#000000",
          shadowOpacity: 0.032,
          shadowRadius: 7,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: sw(20),
            paddingTop: sh(40),
            paddingBottom: sh(16),
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: sw(8) }}
          >
            <Logo width={sf(40)} height={sf(40)} />
            <Text
              style={{
                fontFamily: "ZenDots-Regular",
                fontSize: sf(20),
                color: "#FFFFFF",
              }}
            >
              SPARK
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => { navigation.navigate("SettingsScreen"); }}
            style={{
              width: sf(36),
              height: sf(36),
              borderRadius: sr(92),
              backgroundColor: "#FBB20233",
              alignItems: "center",
              justifyContent: "center",
              borderColor: "#FFFFFF",
              borderWidth: 1,
            }}
          >
            <Settings size={sf(24)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ── Title ── */}
      <View
        style={{
          paddingHorizontal: sw(20),
          marginTop: sh(16),
          marginBottom: sh(12),
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <MaskedView
          maskElement={
            <Text
              style={{
                fontSize: sf(22),
                fontWeight: "600",
              }}
            >
              {"Connect Through Moments"}
            </Text>
          }
        >
          <LinearGradient
            colors={["#FFFFFF", "#FBB202"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text
              style={{
                fontSize: sf(22),
                opacity: 0,
                fontWeight: "600",
              }}
            >
              {"Connect Through Moments"}
            </Text>
          </LinearGradient>
        </MaskedView>
        <View>
          <Text style={{ fontSize: sf(24) }}>🔥</Text>
        </View>
      </View>

      {/* ── Card Carousel + Action Buttons ── */}
      <View
        style={{
          paddingHorizontal: CARD_H_PADDING,
          paddingBottom: BTN_OVERLAP,
          position: "relative",
        }}
      >
        <View
          style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
          onLayout={(e) => {
            cardLeftX.current = e.nativeEvent.layout.x;
          }}
        >
          <PanGestureHandler
            onGestureEvent={gestureEvent}
            activeOffsetX={[-25, 25]}
            failOffsetY={[-15, 15]}
            onEnded={(e: any) => {
              if (isSwipingRef.current) return;

              const { translationX, velocityX } = e?.nativeEvent ?? {};
              const dx = Number(translationX ?? 0);
              const vx = Number(velocityX ?? 0);

              const isRightSwipe = dx > swipeThreshold || vx > velocityThreshold;
              const isLeftSwipe = dx < -swipeThreshold || vx < -velocityThreshold;

              if (!isRightSwipe && !isLeftSwipe) {
                Animated.spring(translateX, {
                  toValue: 0,
                  useNativeDriver: true,
                  speed: 20,
                  bounciness: 10,
                }).start();
                return;
              }

              if (isRightSwipe) {
                if (currentIndex >= MATCHES.length - 1) {
                  Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                    speed: 20,
                    bounciness: 10,
                  }).start();
                  return;
                }

                isSwipingRef.current = true;
                Animated.timing(translateX, {
                  toValue: SCREEN_WIDTH,
                  duration: 220,
                  useNativeDriver: true,
                  easing: Easing.out(Easing.cubic),
                }).start(() => {
                  isSwipingRef.current = false;
                  translateX.setValue(0);
                  onCrossPress();
                });
                return;
              }

              if (isLeftSwipe) {
                isSwipingRef.current = true;
                Animated.timing(translateX, {
                  toValue: -SCREEN_WIDTH,
                  duration: 220,
                  useNativeDriver: true,
                  easing: Easing.out(Easing.cubic),
                }).start(() => {
                  isSwipingRef.current = false;
                  translateX.setValue(0);
                  onLikePress();
                });
              }
            }}
          >
            <Animated.View
              style={{
                width: "100%",
                height: "100%",
                opacity: photoFade,
                transform: [{ translateX }, { rotate }],
              }}
            >
              {/* Left/right tap targets — stop above the info box so chat button is tappable */}
              <View
                pointerEvents="box-none"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: sh(110),
                  flexDirection: "row",
                  zIndex: 20, 
                }}
              >
                <TouchableOpacity
                  activeOpacity={1}
                  style={{ flex: 1. }}
                  onPress={goToPrevPhoto}
                />
                <TouchableOpacity
                  activeOpacity={1}
                  style={{ flex: 1 }}
                  onPress={goToNextPhoto}
                />
              </View>

              <DiscoveryMatchCard
                item={activeMatch}
                cardWidth={CARD_WIDTH}
                cardHeight={CARD_HEIGHT}
                btnOverlap={BTN_OVERLAP}
                photoTotal={photoTotal}
                photoIndex={photoIndex}
                rightChatOnPress={openChatForActiveMatch}
              />
            </Animated.View>
          </PanGestureHandler>
        </View>

        {/* ── Action Buttons ── */}
        <DiscoveryActions
          onLikePress={onLikePress}
          onStarPress={() =>
            showToast({ text1: 'Starred', text2: `${activeMatch.name} added to starred users`, icon: Zap })
          }
          onCrossPress={onCrossPress}
        />
      </View>

      <View style={{ flex: 1 }} />

      {/* ── Bottom Tab Bar ── */}
      <BottomTabBar />
    </View>
  );
};

export default DiscoveryScreen;