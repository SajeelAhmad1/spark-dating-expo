import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextStyle,
  Dimensions,
  Alert,
  ImageStyle,
  StyleProp,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/common/Text';
import { ChevronLeft, MoreVertical, MapPin, Ruler, UserRound } from 'lucide-react-native';
import { sf, sr, sw, sh } from '@/utils/responsive';
import DiscoveryMatchCard from '@/components/discovery/DiscoveryMatchCard';
import DiscoveryActions from '@/components/discovery/DiscoveryActions';
import { ViewStyle } from 'react-native';

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
  const user: UserProfile = useMemo(() => {
    return route?.params?.user ?? MOCK_USER;
  }, [route?.params?.user]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <SafeAreaView style={{ flex: 1 }}>
        
        {/* ── Header ── */}
        <Header navigation={navigation} />

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          
          {/* ── Hero Card ── */}
          <View style={{
            paddingHorizontal: CARD_H_PADDING,
            paddingBottom: BTN_OVERLAP,
            position: 'relative',
          }}>
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
      101
    </Text>
  </View>
</View>
            <DiscoveryMatchCard
              item={{ ...user, image: user.images[0] }}
              cardWidth={CARD_WIDTH}
              cardHeight={CARD_HEIGHT}
              btnOverlap={BTN_OVERLAP}
              total={1}
              currentIndex={0}
              showProgressDots={false}
            />
                      {/* ── Action Buttons ── */}
                      <DiscoveryActions
                        onLikePress={() => {}}
                        onStarPress={() => {}}
                        onCrossPress={() => {}}
                      />
          </View>

          {/* ── Info Card ── */}
          <Card >
            <InfoRow icon={<Ruler size={sf(16)} />} text={user.height} />
            <InfoRow icon={<UserRound size={sf(16)} />} text={user.gender} />
            <InfoRow icon={<MapPin size={sf(16)} />} text={user.location} />
          </Card>

          {/* ── Gallery ── */}
          {user.images.slice(1, 2).map((img, i) => (
            <ImageCard key={i} uri={img} />
          ))}

          {/* ── Bio ── */}
          <Section title="Bio">
            <Text style={styles.description}>{user.bio2}</Text>
          </Section>

                    {/* ── Gallery ── */}
          {user.images.slice(2,3).map((img, i) => (
            <ImageCard key={i} uri={img} />
          ))}

          {/* ── Attributes ── */}
          {!!user.attributes?.length && (
            <Section title="Physical attributes" style={{ minHeight: sh(107) }}>
              <Wrap style={{ marginTop: sh(2) }}>
                {user.attributes.map((attr, i) => (
                  <Chip key={i} label={attr} style={{ borderColor: '#7D858E', borderWidth: 1, }} textStyle={{ color: '#7D858E' }} />
                ))}
              </Wrap>
            </Section>
          )}

                              {/* ── Gallery ── */}
          {user.images.slice(1,2).map((img, i) => (
            <ImageCard key={i} uri={img} />
          ))}

          {/* ── Interests ── */}
          {!!user.interests?.length && (
            <Section title="Interests" style={{ minHeight: sh(152), }}>
              <Wrap style={{marginTop: sh(2) }}>
                {user.interests.map((interest, i) => (
                  <Chip key={i} label={interest} filled style={{backgroundColor: '#FBB202'}}  />
                ))}
              </Wrap>
            </Section>
          )}

          {/* ── Footer ── */}
          <Footer />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default UserProfileScreen;


// ─────────────────────────────────────────────
// 🔹 Sub Components (LOCAL = reusable but scoped)
// ─────────────────────────────────────────────

const Header = ({ navigation }: any) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: sw(20),
      paddingVertical: sh(12),
    }}
  >
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <ChevronLeft size={sf(24)} color="#000" />
    </TouchableOpacity>

    <Text style={styles.headerTitle}>Profile</Text>

    <TouchableOpacity>
      <MoreVertical size={sf(22)} color="#000" />
    </TouchableOpacity>
  </View>
);

const Card = ({ children, style }: { children: React.ReactNode; style?: ViewStyle | ViewStyle[]; }) => (
  <View
   style={[
      {
        marginTop: sh(30),
        marginHorizontal: sw(16),
        backgroundColor: '#fff',
        borderRadius: sr(12),
        // padding: sw(16),
        paddingHorizontal: sw(16),
        minHeight: sh(136),
        justifyContent: 'center',

        // iOS shadow
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.09, // roughly matching #00000017
        shadowRadius: 11,

        // Android shadow
        elevation: 4,
      },
      style, // 👈 external styles override or extend defaults
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
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: sh(8) }}>
    {icon}
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

const ImageCard = ({ uri, style }: { uri: string; style?: ImageStyle | ImageStyle[]; }) => (
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
      style, // external styles override or extend default styles
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
        // paddingVertical: sh(6),
        borderRadius: sr(32),
        height: 36,
        justifyContent: 'center',
        gap: sw(4),
      },
      style, // 👈 external container styles
    ]}
  >
    <Text     style={[
        { color: filled ? '#000' : '#333' },
        textStyle, // 👈 external text styles
      ]}>{label}</Text>
  </View>
);

const Wrap = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; }) => (
  <View
    style={[
      {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: sw(8),
      },
      style, // external styles override or extend defaults
    ]}
  >
    {children}
  </View>
);

const Footer = () => (
  <View style={{ alignItems: 'center', marginVertical: sh(30) }}>
    <Text style={styles.footerText}>Block</Text>
    <View style={{ height: 1, backgroundColor: '#7D858E', width: '100%', marginVertical: sh(8) }} />
    <Text style={[styles.footerText, { marginTop: sh(8) }]}>
      Back to top
    </Text>
  </View>
);


// ─────────────────────────────────────────────
// 🎨 Styles
// ─────────────────────────────────────────────

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

  infoText: {
    marginLeft: sw(8),
    color: '#000',
  } as TextStyle,

  footerText: {
    color: '#000',
  } as TextStyle,
};