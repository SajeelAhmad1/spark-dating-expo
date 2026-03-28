import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { REQUESTS } from '@/constants/requests';
import RequestCard from '@/components/requests/RequestCard';
import BottomTabBar from '@/components/common/BottomTabBar';
import { MATCHES } from '@/constants/matches';
import type { BottomTab } from '@/types/bottomTabs';
import { sf, sh, sw } from '@/utils/responsive';

export default function RequestsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = React.useState<BottomTab>('Request');
  const navLockRef = React.useRef(false);

  const handleTabPress = (tab: BottomTab) => {
    if (navLockRef.current) return;
    navLockRef.current = true;
    setTimeout(() => {
      navLockRef.current = false;
    }, 350);

    // Only update highlight when staying on the same screen.
    if (tab === 'Request') {
      setActiveTab('Request');
      return;
    }

    if (tab === 'Home') navigation.navigate('DiscoveryScreen');
    if (tab === 'Camera')
      navigation.navigate('MatchScreen', {
        match: MATCHES[0],
        autoOpenCamera: true,
      });
    if (tab === 'Chat') navigation.navigate('InboxScreen');
    if (tab === 'Profile') navigation.navigate('ProfileScreen');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">

      {/* Back button */}
      <TouchableOpacity style={{ paddingHorizontal: sw(16), paddingTop: sh(12), paddingBottom: sh(4) }}>
        <ChevronLeft size={22} color="#000" />
      </TouchableOpacity>

      {/* Header */}
      <View className="flex-row items-center gap-2" style={{ paddingHorizontal: sw(16), marginBottom: sh(20), marginTop: sh(4) }}>
        <Text
          style={{
            fontFamily: 'Poppins-SemiBold',
            fontSize: sf(28),
            lineHeight: sf(28),
            color: '#000000',
          }}
        >
          New Matches
        </Text>

        {/* Badge */}
        <View
          className="rounded-full px-2 py-2 items-center justify-center"
          style={{ backgroundColor: '#FBB202' }}
        >
          <Text
            style={{
              fontFamily: 'Poppins-SemiBold',
              fontSize: sf(13),
              lineHeight: sf(13),
              color: '#000000',
            }}
          >
            {String(REQUESTS.length).padStart(2, '0')}
          </Text>
        </View>
      </View>

      {/* Match List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: sh(140) }}
      >
        {REQUESTS.map(request => (
          <RequestCard key={request.id} name={request.name} avatar={request.avatar} />
        ))}
      </ScrollView>

      <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />

    </SafeAreaView>
  );
}
