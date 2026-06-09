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

