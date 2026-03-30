import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings } from 'lucide-react-native';
import BottomTabBar from '@/components/common/BottomTabBar';
import Logo from '@/assets/images/logo.svg';
import { MATCHES } from '@/constants/matches';
import type { BottomTab } from '@/types/bottomTabs';
import DiscoveryMatchCard from '@/components/discovery/DiscoveryMatchCard';
import DiscoveryActions from '@/components/discovery/DiscoveryActions';
import { sf, sr, sw, sh } from '@/utils/responsive';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_H_PADDING = sw(12);
const CARD_WIDTH = SCREEN_WIDTH - CARD_H_PADDING * 2;
const CARD_HEIGHT = Math.min(SCREEN_HEIGHT * 0.6, sh(560));
const BTN_OVERLAP = sf(32);

// ── Discovery Screen ───────────────────────────────────────
const DiscoveryScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<BottomTab>('Home');
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 12));
    setCurrentIndex(Math.max(0, Math.min(index, MATCHES.length - 1)));
  };

  const activeMatch = MATCHES[Math.max(0, Math.min(currentIndex, MATCHES.length - 1))];

  const handleTabPress = (tab: BottomTab) => {
    if (tab === 'Home') {
      setActiveTab('Home');
      return;
    }

    if (tab === 'Request') navigation.navigate('RequestsScreen');
    if (tab === 'Camera')
      navigation.navigate('InboxScreen', { cameraSelectMode: true });
    if (tab === 'Chat') navigation.navigate('InboxScreen');
    if (tab === 'Profile') navigation.navigate('ProfileScreen');
  };

  const goToNextUser = () => {
    const nextIndex = Math.min(currentIndex + 1, MATCHES.length - 1);
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  };

  const openChatForActiveMatch = () => {
    navigation.navigate('ChatScreen', {
      chatUserId: activeMatch.id,
      chatUserName: activeMatch.name,
      chatUserImageUri: activeMatch.image,
      initialLocked: false,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* ── Full screen background gradient ── */}
      <LinearGradient
        colors={['#1E78F5', '#FBB202']}
        start={{ x: 0, y: -0.1 }}
        end={{ x: 2, y: 0.7 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* ── Header ── */}
        <LinearGradient
          colors={['#1E78F5', '#FBB202']}
          start={{ x: 1.5, y: 1.5 }}
          end={{ x: -2, y: -0.8 }}
          style={{
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.2)',
            shadowColor: '#000000',
            shadowOpacity: 0.032,
            shadowRadius: 7,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: sw(20),
              paddingTop: sh(12),
              paddingBottom: sh(16),
            }}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: sw(8) }}
            >
              <Logo width={sf(40)} height={sf(40)} />
              <Text
                style={{
                  fontFamily: 'ZenDots-Regular',
                  fontSize: sf(20), 
                  color: '#FFFFFF', 
                }}
              >
                SPARK
              </Text>
            </View>

            <TouchableOpacity
              style={{
                width: sf(36),
                height: sf(36),
                borderRadius: sr(92),
                backgroundColor: '#FBB20233',
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: '#FFFFFF',
                borderWidth: 1,
              }}
            >
              <Settings size={sf(24)} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── Title ── */}
        <View
          style={{ paddingHorizontal: sw(20), marginTop: sh(16), marginBottom: sh(12) }}
        >
          <MaskedView
            maskElement={
              <Text
                style={{ 
                  fontSize: sf(22),
                  fontWeight: '600',
                }}
              >
                {'Connect Through Moments 🔥'}
              </Text>
            }
          >
            <LinearGradient
              colors={['#FFFFFF', '#FBB202']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text
                style={{ 
                  fontSize: sf(22),
                  opacity: 0,
                  fontWeight: '600',
                }}
              >
                {'Connect Through Moments 🔥'}
              </Text>
            </LinearGradient>
          </MaskedView>
        </View>

        {/* ── Card Carousel + Action Buttons ── */}
        <View
          style={{
            paddingHorizontal: CARD_H_PADDING,
            paddingBottom: BTN_OVERLAP,
            position: 'relative',
          }}
        >
          <FlatList
            ref={flatListRef}
            data={MATCHES}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            snapToInterval={CARD_WIDTH + 12}
            decelerationRate="fast"
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <DiscoveryMatchCard
                item={item}
                cardWidth={CARD_WIDTH}
                cardHeight={CARD_HEIGHT}
                btnOverlap={BTN_OVERLAP}
                total={MATCHES.length}
                currentIndex={currentIndex}
                rightChatOnPress={openChatForActiveMatch}
              />
            )}
          />

          {/* ── Action Buttons ── */}
          <DiscoveryActions
            onLikePress={() => navigation.navigate('MatchScreen', { match: activeMatch })}
            onStarPress={() =>
              Alert.alert('Starred', `${activeMatch.name} added to starred users`)
            }
            onCrossPress={goToNextUser}
          />
        </View>

        <View style={{ flex: 1 }} />

        {/* ── Bottom Tab Bar ── */}
        <BottomTabBar
          activeTab={activeTab}
          onTabPress={handleTabPress}
        />
      </SafeAreaView>
    </View>
  );
};

export default DiscoveryScreen;
