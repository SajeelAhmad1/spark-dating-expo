import React, { useCallback } from "react";
import { Pressable, View } from "react-native";
import { Text } from "@/components/common/Text";
import { Users, MessageSquare } from "lucide-react-native";
import ProfileAvatar from "@/assets/images/profileAvatar.svg";
import { sf, sr, sw, sh } from "@/utils/responsive";
import type { BottomTab } from "@/types/bottomTabs";

const ACTIVE_COLOR = "#1E78F5";
const INACTIVE_COLOR = "#7D858E";

interface TabItemProps {
  tab: BottomTab;
  label: string;
  activeTab: BottomTab;
  onTabPress: (tab: BottomTab) => void;
}

const TabIcon = ({ tab, isActive }: { tab: BottomTab; isActive: boolean }) => {
  const iconSize = sf(24);

  switch (tab) {
    case "Home":
      return (
        <View style={{ width: iconSize + sw(6), height: iconSize }}>
          <View
            style={{
              position: "absolute",
              top: sh(2),
              left: sw(6),
              width: iconSize - sw(2),
              height: iconSize,
              backgroundColor: isActive ? "#5BA4F5" : INACTIVE_COLOR,
              borderRadius: sr(4),
              opacity: 0.55,
              transform: [{ rotate: "-8deg" }],
            }}
          />
          <View
            style={{
              position: "absolute",
              top: sh(2),
              left: 0,
              width: iconSize - sw(2),
              height: iconSize,
              backgroundColor: isActive ? ACTIVE_COLOR : INACTIVE_COLOR,
              borderRadius: sr(4),
              transform: [{ rotate: "4deg" }],
            }}
          />
        </View>
      );

    case "Request":
      return (
        <View>
          <Users
            size={iconSize}
            color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
            strokeWidth={1.8}
          />
        </View>
      );

    case "Chat":
      return (
        <View>
          <MessageSquare
            size={iconSize}
            color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
            strokeWidth={1.8}
          />
        </View>
      );

    case "Profile":
      return (
        <View
          style={{
            width: iconSize + sw(6),
            height: iconSize + sw(6),
            borderRadius: (iconSize + sw(6)) / 2,
            overflow: "hidden",
            borderWidth: isActive ? 1 : 0,
            borderColor: "transparent",
          }}
        >
          <ProfileAvatar width={iconSize + sw(6)} height={iconSize + sw(6)} />
        </View>
      );

    default:
      return null;
  }
};

const TabItem = ({ tab, label, activeTab, onTabPress }: TabItemProps) => {
  const isActive = activeTab === tab;

  const handlePress = useCallback(() => {
    console.log("TabItem pressed:", tab);
    onTabPress(tab);
  }, [tab, onTabPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View>
        <TabIcon tab={tab} isActive={isActive} />
      </View>
      <Text
        style={{
          fontSize: sf(13),
          color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR,
          flexDirection: "column",
          gap: 2,
          justifyContent: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export default React.memo(TabItem);
