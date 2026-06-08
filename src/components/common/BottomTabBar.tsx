import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { Home, MessageSquare, User } from 'lucide-react-native';
import { Text } from '@/components/common/Text';
import { sf, sw, sh } from '@/utils/sizeMatters';
import { useTabStore } from '@/store/tabStore';
import type { BottomTab } from '@/types/bottomTabs';
import type { RootStackParamList } from '@/types/navigation';
import { useMe } from '@/features/profile/hooks';

const ACTIVE_COLOR = '#EAD6A9';
const INACTIVE_COLOR = '#B6B9C9';
const BAR_BG = '#000000';

// ── Tab icon ──────────────────────────────────────────────────────────────────

function TabIcon({ tab, isActive }: { tab: BottomTab; isActive: boolean }) {
  const size = sf(24);
  const color = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;
  const { data: me } = useMe();

  switch (tab) {
    case 'Home':
      return (
        <Home
          size={size}
          color={color}
          strokeWidth={isActive ? 2.2 : 1.8}
        />
      );
    case 'Chats':
      return (
        <MessageSquare
          size={size}
          color={color}
          strokeWidth={isActive ? 2.2 : 1.8}
        />
      );
    case 'Profile':
      return (
        <View
          style={{
            width: size + sw(4),
            height: size + sw(4),
            borderRadius: (size + sw(4)) / 2,
            overflow: 'hidden',
            borderWidth: isActive ? 2 : 0,
            borderColor: ACTIVE_COLOR,
            backgroundColor: '#333333',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {me?.profile?.photos?.[0] ? (
            <Image
              source={{
                uri:
                  typeof me.profile.photos[0] === 'string'
                    ? me.profile.photos[0]
                    : me.profile.photos[0]?.url,
              }}
              style={{ width: '100%', height: '100%' }}
              resizeMode='cover'
            />
          ) : (
            <User
              size={sf(16)}
              color={color}
              strokeWidth={1.8}
            />
          )}
        </View>
      );
    default:
      return null;
  }
}

// ── Screen ────────────────────────────────────────────────────────────────────

const BottomTabBar = () => {
  const activeTab = useTabStore((s) => s.activeTab);
  const setActiveTab = useTabStore((s) => s.setActiveTab);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const TABS: { tab: BottomTab; label: string }[] = [
    { tab: 'Home', label: 'Home' },
    { tab: 'Chats', label: 'Chats' },
    { tab: 'Profile', label: 'Profile' },
  ];

  const handlePress = useCallback(
    (tab: BottomTab) => {
      setActiveTab(tab);
      switch (tab) {
        case 'Home':
          navigation.navigate('DiscoveryScreen');
          break;
        case 'Chats':
          navigation.navigate('InboxScreen');
          break;
        case 'Profile':
          navigation.navigate('ProfileScreen');
          break;
      }
    },
    [navigation, setActiveTab],
  );

  return (
    <View style={styles.bar}>
      {TABS.map(({ tab, label }) => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => handlePress(tab)}
            activeOpacity={0.75}
            style={styles.tabItem}
          >
            <TabIcon
              tab={tab}
              isActive={isActive}
            />
            <Text
              style={[
                styles.label,
                { color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default React.memo(BottomTabBar);

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: BAR_BG,
    // paddingTop: sh(12),
    // paddingBottom: sh(24),
    paddingHorizontal: sw(20),
    height: sh(84),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: sh(4),
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: sf(13),
    marginTop: sh(2),
  },
});

// this is old code do not use

// import React, { useCallback } from "react";
// import { View, TouchableOpacity, useWindowDimensions } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import type { NavigationProp } from "@react-navigation/native";
// import Svg, { Path } from "react-native-svg";
// import CameraIcon from "@/assets/images/cameraIcon.svg";
// import { sf, sr, sw, sh } from "@/utils/sizeMatters";
// import { useTabStore } from "@/store/tabStore";
// import TabItem from "./TabItem";
// import type { BottomTab } from "@/types/bottomTabs";
// import type { RootStackParamList } from "@/types/navigation";

// const PILL_COLOR = "#F0EEE6";

// const HORIZONTAL_PADDING = sw(16);
// const PILL_HEIGHT = sh(72);
// const CAMERA_SIZE = sf(72);
// const NOTCH_RADIUS = CAMERA_SIZE / 3 + 6;
// const PILL_CORNER = sr(40);

// function buildNotchPath(w: number, h: number): string {
//   const r = PILL_CORNER;
//   const nr = NOTCH_RADIUS;
//   const cx = w / 2;
//   const x1 = cx - nr;
//   const x2 = cx + nr;

//   return [
//     `M ${r} 0`,
//     `L ${x1} 0`,
//     `A ${nr} ${nr} 0 0 0 ${x2} 0`,
//     `L ${w - r} 0`,
//     `Q ${w} 0 ${w} ${r}`,
//     `L ${w} ${h - r}`,
//     `Q ${w} ${h} ${w - r} ${h}`,
//     `L ${r} ${h}`,
//     `Q 0 ${h} 0 ${h - r}`,
//     `L 0 ${r}`,
//     `Q 0 0 ${r} 0`,
//     `Z`,
//   ].join(" ");
// }

// const BottomTabBar = () => {
//   const { width: screenWidth } = useWindowDimensions();
//   const activeTab = useTabStore((s) => s.activeTab);
//   const setActiveTab = useTabStore((s) => s.setActiveTab);
//   const navigation = useNavigation<NavigationProp<RootStackParamList>>();

//   const pillWidth = screenWidth - HORIZONTAL_PADDING * 2;

//   const handleTabPress = useCallback(
//     (tab: BottomTab) => {
//       setActiveTab(tab);
//       switch (tab) {
//         case "Home":
//           navigation.navigate("DiscoveryScreen");
//           break;
//         case "Request":
//           navigation.navigate("RequestsScreen");
//           break;
//         case "Camera":
//           navigation.navigate("InboxScreen", { cameraSelectMode: true });
//           break;
//         case "Chats":
//           navigation.navigate("InboxScreen");
//           break;
//         case "Profile":
//           navigation.navigate("ProfileScreen");
//           break;
//       }
//     },
//     [navigation, setActiveTab]
//   );

//   return (
//     <View
//       pointerEvents="box-none"
//       style={{
//         paddingHorizontal: HORIZONTAL_PADDING,
//         paddingTop: CAMERA_SIZE / 2,
//         alignItems: "center",
//         backgroundColor: "transparent",
//         position: "relative",
//       }}
//     >
//       {/* Camera button */}
//       <View
//         pointerEvents="box-none"
//         style={{
//           position: "absolute",
//           top: 0,
//           zIndex: 20,
//           alignItems: "center",
//           width: "100%",
//         }}
//       >
//         <TouchableOpacity
//           onPress={() => handleTabPress("Camera")}
//           activeOpacity={0.85}
//         >
//           <CameraIcon width={CAMERA_SIZE} height={CAMERA_SIZE} />
//         </TouchableOpacity>
//       </View>

//       {/* Pill */}
//       <View
//         pointerEvents="box-none"
//         style={{
//           width: pillWidth,
//           height: PILL_HEIGHT,
//           shadowColor: "#000",
//           shadowOpacity: 0.1,
//           shadowRadius: sr(16),
//           shadowOffset: { width: 0, height: sh(4) },
//           elevation: 10,
//           backgroundColor: "transparent",
//           zIndex: 1,
//         }}
//       >
//         {/* SVG background — non-interactive */}
//         <Svg
//           width={pillWidth}
//           height={PILL_HEIGHT}
//           pointerEvents="none"
//           style={{ position: "absolute", top: 0, left: 0 }}
//         >
//           <Path d={buildNotchPath(pillWidth, PILL_HEIGHT)} fill={PILL_COLOR} />
//         </Svg>

//         {/* Tab items row */}
//         <View
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             flexDirection: "row",
//             alignItems: "center",
//             paddingHorizontal: sw(8),
//           }}
//         >
//           <TabItem
//             tab="Home"
//             label="Home"
//             activeTab={activeTab}
//             onTabPress={handleTabPress}
//           />
//           <TabItem
//             tab="Request"
//             label="Request"
//             activeTab={activeTab}
//             onTabPress={handleTabPress}
//           />

//           {/* Center gap under camera notch */}
//           <View pointerEvents="none" style={{ flex: 1 }} />

//           <TabItem
//             tab="Chats"
//             label="Chats"
//             activeTab={activeTab}
//             onTabPress={handleTabPress}
//           />
//           <TabItem
//             tab="Profile"
//             label="Profile"
//             activeTab={activeTab}
//             onTabPress={handleTabPress}
//           />
//         </View>
//       </View>
//     </View>
//   );
// };

// export default React.memo(BottomTabBar);
