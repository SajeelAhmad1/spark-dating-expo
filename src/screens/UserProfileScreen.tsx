// screens/UserProfileScreen.tsx
import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextStyle,
  Dimensions,
  ImageStyle,
  StyleProp,
  Alert,
} from 'react-native';
import { Text } from '@/components/common/Text';
import {
  MoreVertical,
  MapPin,
  Ruler,
  UserRound,
  X,
  AlertTriangle,
  Flag,
  UserRoundX,
  Zap,
} from 'lucide-react-native';
import { sf, sr, sw, sh } from '@/utils/sizeMatters';
import DiscoveryMatchCard from '@/components/discovery/DiscoveryMatchCard';
import DiscoveryActions from '@/components/discovery/DiscoveryActions';
import { ViewStyle } from 'react-native';
import { showToast } from '@/utils/toast';
// 1️⃣ Import ChatMenu
import ChatMenu, { type ChatMenuItem } from '@/screens/ChatMenu';

type UserProfile = {
  id: string;
  name: string;
  age: number;
  images: string[];
  bio: string;
  bio2: string;
  height: string;
  gender: string;
  location: string;
  attributes: string[];
  interests: string[];
};

const MOCK_USER: UserProfile = {
  id: '1',
  name: 'Emma',
  age: 25,
  bio: 'Coffee lover ☕ | Travel enthusiast ✈️',
  images: [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800',
  ],
  bio2: "Adventure lover & coffee enthusiast. Always looking for the next trip. Let's explore together! ✈️",
  height: `5' 10"`,
  gender: 'Women',
  location: 'Live in New York City',
  attributes: ['Native American', 'Toned'],
  interests: ['✈️ Travel', '🎵 Music', '☕ Coffee', '📷 Photography'],
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_H_PADDING = sw(12);
const CARD_WIDTH = SCREEN_WIDTH - CARD_H_PADDING * 2;
const CARD_HEIGHT = Math.min(SCREEN_HEIGHT * 0.6, sh(560));
const BTN_OVERLAP = sf(32);

const UserProfileScreen = ({ navigation, route }: any) => {
  const scrollRef = useRef<ScrollView>(null);
  const user: UserProfile = useMemo(() => {
    return route?.params?.user ?? MOCK_USER;
  }, [route?.params?.user]);

  // 2️⃣ Menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchorPos, setMenuAnchorPos] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const menuAnchorRef = useRef<View>(null);

    const onLikePress = () => {
    navigation.navigate("MatchScreen");
  };

  const openMenu = () => {
    menuAnchorRef.current?.measureInWindow((x, y, width, height) => {
      setMenuAnchorPos({ x, y, width, height });
      setMenuVisible(true);
    });
  };

  // 3️⃣ Menu items
  const menuItems: ChatMenuItem[] = [
    {
      key: 'block',
      label: 'Block',
      icon: (
        <AlertTriangle
          size={sf(18)}
          color='#FBB202'
          strokeWidth={1.8}
        />
      ),
      color: '#FBB202',
      onPress: () => {
        showToast({ text1: 'User Blocked', icon: UserRoundX });
        navigation?.goBack();
      },
    },
    {
      key: 'report',
      label: 'Report',
      icon: (
        <Flag
          size={sf(18)}
          color='#E53935'
          strokeWidth={1.8}
        />
      ),
      color: '#E53935',
      onPress: () => {
        showToast({ text1: 'User Reported', icon: AlertTriangle });
        navigation?.goBack();
      },
    },
  ];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#F8F8F8',
        paddingTop: sh(40),
        paddingBottom: sh(20),
      }}
    >
      {/* 4️⃣ Pass ref + openMenu into Header */}
      <Header
        navigation={navigation}
        menuAnchorRef={menuAnchorRef}
        onMenuPress={openMenu}
      />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {/* ── Hero Card ── */}
        <View
          style={{
            paddingHorizontal: CARD_H_PADDING,
            paddingBottom: BTN_OVERLAP,
            position: 'relative',
            marginTop: sh(12),
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: sh(20),
              left: sw(30),
              zIndex: 1,
            }}
          >
            <View
              style={{
                minWidth: sw(60),
                height: sh(28),
                paddingHorizontal: sw(10),
                borderRadius: sr(14),
                backgroundColor: 'rgba(251, 178, 2, 0.4)',
                borderWidth: 0.6,
                borderColor: 'rgba(220, 155, 0, 1)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: 'rgba(220, 155, 0, 1)',
                  fontSize: sf(16),
                  fontWeight: '600',
                }}
              >
                🔥 101
              </Text>
            </View>
          </View>
          <DiscoveryMatchCard
            item={{ ...user, image: user.images[0], images: user.images, bio: user.bio }}
            cardWidth={CARD_WIDTH}
            cardHeight={CARD_HEIGHT}
            btnOverlap={BTN_OVERLAP}
            photoTotal={user.images.length}
            photoIndex={0}
            showProgressDots={false}
            rightChatOnPress={() => navigation?.navigate('ChatScreen', { user })}
          />
          <DiscoveryActions
            onLikePress={onLikePress}
              onStarPress={() =>
                        showToast({ text1: 'Starred', text2: `${user.name} added to starred users`, icon: Zap })
                      }
            onCrossPress={() => {}}
          />
        </View>

        <Card style={{gap: 10}}>
          <InfoRow
            icon={<Ruler size={sf(16)} />}
            text={user.height}
          />
          <InfoRow
            icon={<UserRound size={sf(16)} />}
            text={user.gender}
          />
          <InfoRow
            icon={<MapPin size={sf(16)} />}
            text={user.location}
          />
        </Card>

        {user.images.slice(1, 2).map((img, i) => (
          <ImageCard
            key={i}
            uri={img}
          />
        ))}

        <Section title='Bio'>
          <Text style={styles.description}>{user.bio2}</Text>
        </Section>

        {user.images.slice(2, 3).map((img, i) => (
          <ImageCard
            key={i}
            uri={img}
          />
        ))}

        {!!user.attributes?.length && (
          <Section
            title='Physical attributes'
            style={{ minHeight: 107 }}
          >
            <Wrap style={{ marginTop: sh(6) }}>
              {user.attributes.map((attr, i) => (
                <Chip
                  key={i}
                  label={attr}
                  style={{ borderColor: '#7D858E', borderWidth: 1 }}
                  textStyle={{ color: '#7D858E', lineHeight: sh(36) }}
                />
              ))}
            </Wrap>
          </Section>
        )}

        {user.images.slice(1, 2).map((img, i) => (
          <ImageCard
            key={i}
            uri={img}
          />
        ))}

        {!!user.interests?.length && (
          <Section
            title='Interests'
            style={{ minHeight: 152 }}
          >
            <Wrap style={{ marginTop: sh(2) }}>
              {user.interests.map((interest, i) => (
                <Chip
                  key={i}
                  label={interest}
                  filled
                  style={{ backgroundColor: '#FBB202' }}
                  textStyle={{  lineHeight: sh(36) }}
                />
              ))}
            </Wrap>
          </Section>
        )}

        <Footer
          onBackToTop={() =>
            scrollRef.current?.scrollTo({ y: 0, animated: true })
          }
        />
      </ScrollView>

      {/* 5️⃣ Render ChatMenu at root level */}
      <ChatMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        anchorPosition={menuAnchorPos}
        items={menuItems}
      />
    </View>
  );
};

export default UserProfileScreen;

// ─────────────────────────────────────────────
// 🔹 Sub Components
// ─────────────────────────────────────────────

// 6️⃣ Header now accepts menuAnchorRef + onMenuPress
const Header = ({
  navigation,
  menuAnchorRef,
  onMenuPress,
}: {
  navigation: any;
  menuAnchorRef: React.RefObject<View | null>;
  onMenuPress: () => void;
}) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: sw(14),
      paddingVertical: sh(12),
    }}
  >
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <X
        size={sf(24)}
        color='#000'
      />
    </TouchableOpacity>

    <Text style={styles.headerTitle}>Profile</Text>

    <TouchableOpacity
      ref={menuAnchorRef}
      onPress={onMenuPress}
    >
      <MoreVertical
        size={sf(22)}
        color='#000'
      />
    </TouchableOpacity>
  </View>
);

const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}) => (
  <View
    style={[
      {
        marginTop: sh(30),
        marginHorizontal: sw(12.5),
        backgroundColor: '#fff',
        borderRadius: sr(12),
        paddingHorizontal: sw(16),
        minHeight: 136,
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.09,
        shadowRadius: 11,
        elevation: 4,
      },
      style,
    ]}
  >
    {children}
  </View>
);

const Section = ({
  title,
  children,
  style,
}: {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}) => (
  <Card style={style}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </Card>
);

const InfoRow = ({ icon, text }: any) => (
  <View
    style={{ flexDirection: 'row', alignItems: 'center',  }}
  >
    {icon}
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

const ImageCard = ({
  uri,
  style,
}: {
  uri: string;
  style?: ImageStyle | ImageStyle[];
}) => (
  <Image
    source={{ uri }}
    style={[
      {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: sr(15),
        marginTop: sh(24),
        alignSelf: 'center',
      },
      style,
    ]}
  />
);

const Chip = ({
  label,
  filled = false,
  style,
  textStyle,
}: {
  label: string;
  filled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) => (
  <View
    style={[
      {
        backgroundColor: filled ? '#FBB202' : '#F1F1F1',
        paddingHorizontal: sw(12),
        borderRadius: sr(32),
        height: 36, 
        justifyContent: 'center',
        gap: sw(4),
      },
      style,
    ]}
  >
    <Text style={[{ color: filled ? '#000' : '#333', justifyContent: 'center', alignItems: 'center',  }, textStyle]}>
      {label}
    </Text>
  </View>
);

const Wrap = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => (
  <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: sw(8) }, style]}>
    {children}
  </View>
);

const Footer = ({ onBackToTop }: { onBackToTop: () => void }) => (
  <View style={{ alignItems: 'center', marginVertical: sh(30) }}>
    <TouchableOpacity
      onPress={() => showToast({ text1: 'User Blocked', icon: UserRoundX })}
    >
      <Text style={styles.footerText}>Block</Text>
    </TouchableOpacity>
    <View
      style={{
        height: 1,
        backgroundColor: '#7D858E',
        width: '100%',
        marginVertical: sh(8),
      }}
    />
    <TouchableOpacity onPress={onBackToTop}>
      <Text style={[styles.footerText, { marginTop: sh(8) }]}>Back to top</Text>
    </TouchableOpacity>
  </View>
);

const styles = {
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: sf(18),
  } as TextStyle,
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: sf(18),
  } as TextStyle,
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: sf(16),
    color: '#7D858E',
  } as TextStyle,
  infoText: { marginLeft: sw(8), color: '#000' } as TextStyle,
  footerText: { color: '#000' } as TextStyle,
};
