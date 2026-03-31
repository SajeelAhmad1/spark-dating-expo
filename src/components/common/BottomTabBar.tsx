import React, { useCallback } from "react";
import { View, TouchableOpacity, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";
import CameraIcon from "@/assets/images/cameraIcon.svg";
import { sf, sr, sw, sh } from "@/utils/responsive";
import { useTabStore } from "@/store/tabStore";
import TabItem from "./TabItem";
import type { BottomTab } from "@/types/bottomTabs";
import type { RootStackParamList } from "@/types/navigation";

const PILL_COLOR = "#F0EEE6";

const HORIZONTAL_PADDING = sw(16);
const PILL_HEIGHT = sh(72);
const CAMERA_SIZE = sf(72);
const NOTCH_RADIUS = CAMERA_SIZE / 3 + 6;
const PILL_CORNER = sr(40);

function buildNotchPath(w: number, h: number): string {
  const r = PILL_CORNER;
  const nr = NOTCH_RADIUS;
  const cx = w / 2;
  const x1 = cx - nr;
  const x2 = cx + nr;

  return [
    `M ${r} 0`,
    `L ${x1} 0`,
    `A ${nr} ${nr} 0 0 0 ${x2} 0`,
    `L ${w - r} 0`,
    `Q ${w} 0 ${w} ${r}`,
    `L ${w} ${h - r}`,
    `Q ${w} ${h} ${w - r} ${h}`,
    `L ${r} ${h}`,
    `Q 0 ${h} 0 ${h - r}`,
    `L 0 ${r}`,
    `Q 0 0 ${r} 0`,
    `Z`,
  ].join(" ");
}

const BottomTabBar = () => {
  const { width: screenWidth } = useWindowDimensions();
  const activeTab = useTabStore((s) => s.activeTab);
  const setActiveTab = useTabStore((s) => s.setActiveTab);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const pillWidth = screenWidth - HORIZONTAL_PADDING * 2;

  const handleTabPress = useCallback(
    (tab: BottomTab) => {
      setActiveTab(tab);
      switch (tab) {
        case "Home":
          navigation.navigate("DiscoveryScreen");
          break;
        case "Request":
          navigation.navigate("RequestsScreen");
          break;
        case "Camera":
          navigation.navigate("InboxScreen", { cameraSelectMode: true });
          break;
        case "Chat":
          navigation.navigate("InboxScreen");
          break;
        case "Profile":
          navigation.navigate("ProfileScreen");
          break;
      }
    },
    [navigation, setActiveTab]
  );

  return (
    <View
      pointerEvents="box-none"
      style={{
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: CAMERA_SIZE / 2,
        alignItems: "center",
        backgroundColor: "transparent",
        position: "relative",
      }}
    >
      {/* Camera button */}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: 0,
          zIndex: 20,
          alignItems: "center",
          width: "100%",
        }}
      >
        <TouchableOpacity
          onPress={() => handleTabPress("Camera")}
          activeOpacity={0.85}
        >
          <CameraIcon width={CAMERA_SIZE} height={CAMERA_SIZE} />
        </TouchableOpacity>
      </View>

      {/* Pill */}
      <View
        pointerEvents="box-none"
        style={{
          width: pillWidth,
          height: PILL_HEIGHT,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: sr(16),
          shadowOffset: { width: 0, height: sh(4) },
          elevation: 10,
          backgroundColor: "transparent",
          zIndex: 1,
        }}
      >
        {/* SVG background — non-interactive */}
        <Svg
          width={pillWidth}
          height={PILL_HEIGHT}
          pointerEvents="none"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <Path d={buildNotchPath(pillWidth, PILL_HEIGHT)} fill={PILL_COLOR} />
        </Svg>

        {/* Tab items row */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: sw(8),
          }}
        >
          <TabItem
            tab="Home"
            label="Home"
            activeTab={activeTab}
            onTabPress={handleTabPress}
          />
          <TabItem
            tab="Request"
            label="Request"
            activeTab={activeTab}
            onTabPress={handleTabPress}
          />

          {/* Center gap under camera notch */}
          <View pointerEvents="none" style={{ flex: 1 }} />

          <TabItem
            tab="Chat"
            label="Chat"
            activeTab={activeTab}
            onTabPress={handleTabPress}
          />
          <TabItem
            tab="Profile"
            label="Profile"
            activeTab={activeTab}
            onTabPress={handleTabPress}
          />
        </View>
      </View>
    </View>
  );
};

export default React.memo(BottomTabBar);
