import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, MessageSquare, User } from 'lucide-react-native';
import { Text } from '@/components/common/Text';
import { sf, sw, sh } from '@/utils/sizeMatters';
import { useMe } from '@/features/profile/hooks';
import DiscoveryScreen from '@/screens/DiscoveryScreen';
import InboxScreen from '@/screens/InboxScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import type { TabParamList } from '@/types/navigation';

const Tab = createBottomTabNavigator<TabParamList>();

const ACTIVE_COLOR = '#EAD6A9';
const INACTIVE_COLOR = '#B6B9C9';

// ── Custom tab bar ────────────────────────────────────────────────────────────

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { data: me } = useMe();

  return (
    <View style={styles.bar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = (options.tabBarLabel as string) ?? route.name;
        const isFocused = state.index === index;
        const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;
        const size = sf(24);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let icon: React.ReactNode;
        if (route.name === 'DiscoveryTab') {
          icon = (
            <Home size={size} color={color} strokeWidth={isFocused ? 2.2 : 1.8} />
          );
        } else if (route.name === 'InboxTab') {
          icon = (
            <MessageSquare size={size} color={color} strokeWidth={isFocused ? 2.2 : 1.8} />
          );
        } else {
          const photoRaw = me?.profile?.photos?.[0];
          const photoUri = typeof photoRaw === 'string' ? photoRaw : photoRaw?.url;
          icon = (
            <View
              style={{
                width: size + sw(4),
                height: size + sw(4),
                borderRadius: (size + sw(4)) / 2,
                overflow: 'hidden',
                borderWidth: isFocused ? 2 : 0,
                borderColor: ACTIVE_COLOR,
                backgroundColor: '#333333',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <User size={sf(16)} color={color} strokeWidth={1.8} />
              )}
            </View>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.75}
            style={styles.tabItem}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
          >
            {icon}
            <Text style={[styles.label, { color }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Navigator ─────────────────────────────────────────────────────────────────

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="DiscoveryTab"
        component={DiscoveryScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="InboxTab"
        component={InboxScreen}
        options={{ tabBarLabel: 'Chats' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#000000',
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
