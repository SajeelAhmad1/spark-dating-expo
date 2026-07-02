import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import BottomTabBar from '@/components/common/BottomTabBar';
import { sh } from '@/utils/sizeMatters';

// Screens that should show the bottom tab bar
const TAB_SCREENS = ['DiscoveryScreen', 'InboxScreen', 'ProfileScreen'];

interface TabLayoutProps {
  children: React.ReactNode;
  showTabBar?: boolean;
}

const TabLayout: React.FC<TabLayoutProps> = ({ children, showTabBar }) => {
  const route = useRoute();
  const shouldShowTabBar = showTabBar ?? TAB_SCREENS.includes(route.name);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
      {shouldShowTabBar && (
        <View style={styles.tabBarWrap}>
          <BottomTabBar />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBarWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    zIndex: 15,
  },
});

export default TabLayout;