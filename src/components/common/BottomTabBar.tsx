import React from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Users, MessageSquare } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import ProfileAvatar from '@/assets/images/profileAvatar.svg';
import CameraIcon from '@/assets/images/cameraIcon.svg';
import { sf, sr, sw, sh } from '@/utils/responsive';

import type { BottomTab } from '@/types/bottomTabs';

interface BottomTabBarProps {
  activeTab: BottomTab;
  onTabPress: (tab: BottomTab) => void;
}

const ACTIVE_COLOR = '#1E78F5';
const INACTIVE_COLOR = '#7D858E';
const PILL_COLOR = '#F0EEE6';

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
  ].join(' ');
}

const BottomTabBar = ({ activeTab, onTabPress }: BottomTabBarProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const pillWidth = screenWidth - HORIZONTAL_PADDING * 2;
  const iconSize = sf(24);

  const TabItem = ({
    tab,
    label,
    icon,
  }: {
    tab: BottomTab;
    label: string;
    icon: React.ReactNode;
  }) => {
    const isActive = activeTab === tab;

    return (
      <TouchableOpacity
        onPress={() => onTabPress(tab)}
        activeOpacity={0.7}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: sh(10),
          gap: 2,
        }}
      >
        {icon}
        <Text
          style={{
            fontFamily: 'Poppins-Regular',
            fontSize: sf(13),
            lineHeight: sf(13),
            letterSpacing: 0,
            color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR,
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingBottom: sh(16),
        paddingTop: CAMERA_SIZE / 2,
        alignItems: 'center',
        backgroundColor: 'transparent',
        position: 'relative',
      }}
    >
      {/* Consistent bottom bar background on all screens */}
      {/* <LinearGradient
        colors={['#1E78F5', '#FBB202']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        pointerEvents="none"
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      /> */}

      {/* ── Camera button — center aligned on the pill's top edge ── */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          zIndex: 20,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <TouchableOpacity onPress={() => onTabPress('Camera')} activeOpacity={0.85}>
          <CameraIcon width={CAMERA_SIZE} height={CAMERA_SIZE} />
        </TouchableOpacity>
      </View>

      {/* ── Pill with SVG notch background ── */}
      <View
        style={{
          width: pillWidth,
          height: PILL_HEIGHT,
          shadowColor: '#000',
          shadowOpacity: 0.10,
          shadowRadius: sr(16),
          shadowOffset: { width: 0, height: sh(4) },
          elevation: 10,
          backgroundColor: 'transparent',
          zIndex: 1,
        }}
      >
        {/* SVG pill shape with arc notch */}
        <Svg
          width={pillWidth}
          height={PILL_HEIGHT}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <Path
            d={buildNotchPath(pillWidth, PILL_HEIGHT)}
            fill={PILL_COLOR}
          />
        </Svg>

        {/* Tab items row — sits on top of the SVG */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: sw(8),
          }}
        >
          <TabItem
            tab="Home"
            label="Home"
            icon={
              <View
                style={{
                  borderWidth: activeTab === 'Home' ? 1 : 0,
                  borderColor: '#FFFFFF',
                  borderRadius: sr(6),
                }}
              >
                <View style={{ width: iconSize + sw(6), height: iconSize + sw(6) }}>
                  {/* Back card */}
                  <View
                    style={{
                      position: 'absolute',
                      top: sh(2),
                      left: sw(6),
                      width: iconSize - sw(2),
                      height: iconSize,
                      backgroundColor: activeTab === 'Home' ? '#5BA4F5' : INACTIVE_COLOR,
                      borderRadius: sr(4),
                      opacity: 0.55,
                      transform: [{ rotate: '-8deg' }],
                    }}
                  />
                  {/* Front card */}
                  <View
                    style={{
                      position: 'absolute',
                      top: sh(2),
                      left: 0,
                      width: iconSize - sw(2),
                      height: iconSize,
                      backgroundColor: activeTab === 'Home' ? ACTIVE_COLOR : INACTIVE_COLOR,
                      borderRadius: sr(4),
                      transform: [{ rotate: '4deg' }],
                    }}
                  />
                </View>
              </View>
            }
          />

          <TabItem
            tab="Request"
            label="Request"
            icon={
              <View
                style={{
                  borderWidth: activeTab === 'Request' ? 1 : 0,
                  borderColor: '#FFFFFF',
                  borderRadius: sr(6),
                }}
              >
                <Users
                  size={iconSize}
                  color={activeTab === 'Request' ? ACTIVE_COLOR : INACTIVE_COLOR}
                  strokeWidth={1.8}
                />
              </View>
            }
          />

          {/* Center gap — sits under the camera notch */}
          <View style={{ flex: 1 }} />

          <TabItem
            tab="Chat"
            label="Chat"
            icon={
              <View
                style={{
                  borderWidth: activeTab === 'Chat' ? 1 : 0,
                  borderColor: '#FFFFFF',
                  borderRadius: sr(6),
                }}
              >
                <MessageSquare
                  size={iconSize}
                  color={activeTab === 'Chat' ? ACTIVE_COLOR : INACTIVE_COLOR}
                  strokeWidth={1.8}
                />
              </View>
            }
          />

          <TabItem
            tab="Profile"
            label="Profile"
            icon={
              <View
                style={{
                  width: iconSize + sw(6),
                  height: iconSize + sw(6),
                  borderRadius: (iconSize + sw(6)) / 2,
                  overflow: 'hidden',
                  borderWidth: activeTab === 'Profile' ? 1 : 0,
                  borderColor: '#FFFFFF',
                }}
              >
                <ProfileAvatar width={iconSize + sw(6)} height={iconSize + sw(6)} />
              </View>
            }
          />
        </View>
      </View>
    </View>
  );
};

export default BottomTabBar;
