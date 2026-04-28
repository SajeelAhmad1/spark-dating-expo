// screens/profile/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Settings,
  Edit2,
  Bell,
  MapPin,
  ChevronRight,
  Venus,
} from 'lucide-react-native';
import BottomTabBar from '@/components/common/BottomTabBar';
import { sf, sr, sw, sh } from '@/utils/sizeMatters';
import { useMe } from '@/features/profile/hooks';
import { getCityFromCoords } from '@/utils/location';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcAge(dob: string | undefined | null): string {
  if (!dob) return '';
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return '';
  const ageDiff = Date.now() - birth.getTime();
  return String(Math.floor(ageDiff / (365.25 * 24 * 60 * 60 * 1000)));
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const ProfileScreen = ({ navigation }: any) => {
  const { data: user, isLoading } = useMe();
  console.log(user, 'console user in profile');
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const [cityName, setCityName] = useState<string>('');

  const profile = user?.profile;
  const interests = user?.interests ?? [];
  const photos = profile?.photos ?? [];

  // ✅ Reverse geocoding: Convert lat/lng to city name
  useEffect(() => {
    if (user?.location?.lat && user?.location?.lng) {
      getCityFromCoords(user.location.lat, user.location.lng).then(setCityName)
    }
  }, [user?.location]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
        }}
      >
        <ActivityIndicator color='#1E78F5' />
      </View>
    );
  }

  const displayName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'You';
  const age = calcAge(profile?.dob);
  const nameLabel = age ? `${displayName} (${age})` : displayName;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      {/* Full-screen background */}
      <LinearGradient
        colors={['#1E78F5', '#FBB202']}
        start={{ x: 0, y: -0.1 }}
        end={{ x: 2, y: 0.7 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <View style={styles.flex1}>
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#1E78F5', '#FBB202']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 9 }}
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
              marginTop: sh(60),
              paddingBottom: sh(16),
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate('EditProfileScreen')}
              style={styles.iconBtn}
            >
              <Edit2
                size={sf(20)}
                color='#FFFFFF'
              />
            </TouchableOpacity>

            <Text
              style={{ color: '#FFF', fontSize: sf(20), fontWeight: '600' }}
            >
              Profile
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('SettingsScreen')}
              style={styles.iconBtn}
            >
              <Settings
                size={sf(20)}
                color='#FFFFFF'
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── Scrollable content ───────────────────────────────────────────── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: sh(20) }}
        >
          {/* ── Primary photo ─────────────────────────────────────────────── */}
          <View
            style={{
              marginHorizontal: sw(12),
              marginTop: sh(16),
              borderRadius: sr(16),
              overflow: 'hidden',
              height: sh(535),
              borderWidth: 1,
              borderColor: '#FFFFFF',
              shadowColor: '#000000',
              shadowOpacity: 0.15,
              shadowRadius: 25,
              shadowOffset: { width: 0, height: 0 },
              elevation: 10,
            }}
          >
            <Image
              source={{ uri: photos[0] ?? 'https://via.placeholder.com/600' }}
              style={{ width: '100%', height: '100%' }}
              resizeMode='cover'
            />

            {/* Name / location banner */}
            <View
              style={{
                position: 'absolute',
                bottom: 10,
                left: 10,
                right: 10,
                height: 70,
                backgroundColor: 'rgba(0,0,0,0.3)',
                paddingHorizontal: sw(16),
                borderColor: '#FFFFFF',
                borderRadius: sr(12),
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: sf(20),
                  fontWeight: '600',
                  color: '#FFFFFF',
                  flexShrink: 1, // Allow text to shrink
                }}
                numberOfLines={1} // Limit to single line
                ellipsizeMode='tail' // Add ... at the end
              >
                {nameLabel}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: sw(4),
                  }}
                >
                  <MapPin
                    size={sf(14)}
                    color='#FFFFFF'
                  />
                   <Text 
                    style={{ fontSize: sf(16), color: '#FFFFFF' }} 
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {cityName || 'Loading location...'}
                  </Text>
                </View>
                {profile?.gender && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Venus
                      size={sf(16)}
                      color='#FFFFFF'
                    />
                    <Text style={{ fontSize: sf(16), color: '#FFFFFF' }}>
                      {profile.gender.charAt(0).toUpperCase() +
                        profile.gender.slice(1)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* ── Additional photos ────────────────────────────────────────── */}
          {photos.length > 1 && (
            <View
              style={{
                flexDirection: 'row',
                gap: sw(10),
                marginHorizontal: sw(12),
                marginTop: sh(10),
              }}
            >
              {photos.slice(1, 3).map((uri, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: sh(220),
                    borderRadius: sr(14),
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: '#FFFFFF',
                    shadowColor: '#000000',
                    shadowOpacity: 0.15,
                    shadowRadius: 25,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: 8,
                  }}
                >
                  <Image
                    source={{ uri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode='cover'
                  />
                </View>
              ))}
            </View>
          )}

          {/* ── Cards ────────────────────────────────────────────────────── */}
          <View
            style={{ marginHorizontal: sw(12), marginTop: sh(20), gap: sh(18) }}
          >
            {/* Invite friends card */}
            <View style={styles.card}>
              {premiumUnlocked ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: 79,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: sw(16),
                      flex: 1,
                    }}
                  >
                    <View
                      style={[
                        styles.iconCircle,
                        {
                          backgroundColor: '#FBB20233',
                          borderColor: '#DC9B00',
                        },
                      ]}
                    >
                      <Text style={{ fontSize: sf(20) }}>👑</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: sf(15),
                          fontWeight: '600',
                          color: '#000000',
                        }}
                      >
                        Premium Unlocked! ⭐
                      </Text>
                      <Text style={{ fontSize: sf(13), color: '#555555' }}>
                        You've earned free Premium
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      width: sf(32),
                      height: sf(32),
                      borderRadius: sr(92),
                      borderWidth: 2,
                      borderColor: '#22C55E',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: '#22C55E',
                        fontSize: sf(16),
                        fontWeight: '700',
                      }}
                    >
                      ✓
                    </Text>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setPremiumUnlocked(true)}
                  activeOpacity={0.8}
                  style={{
                    minHeight: 106,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: sh(14),
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: sw(20),
                        flex: 1,
                      }}
                    >
                      <View
                        style={[
                          styles.iconCircle,
                          {
                            backgroundColor: '#FBB20233',
                            borderColor: '#DC9B00',
                          },
                        ]}
                      >
                        <Bell
                          width={sw(18)}
                          height={sh(20)}
                          size={sf(18)}
                          color='#DC9B00'
                          strokeWidth={1.5}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: sf(15),
                            fontWeight: '600',
                            color: '#000000',
                          }}
                        >
                          Invite Friends, Get Premium Free!
                        </Text>
                        <Text style={{ fontSize: sf(13), color: '#555555' }}>
                          0 of 2 friends invited
                        </Text>
                      </View>
                    </View>
                    <ChevronRight
                      size={sf(20)}
                      color='#555555'
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: sw(6),
                      justifyContent: 'space-between',
                    }}
                  >
                    <View
                      style={{
                        height: sh(10),
                        backgroundColor: '#EDEDED',
                        borderRadius: sr(99),
                        width: '49%',
                      }}
                    />
                    <View
                      style={{
                        height: sh(10),
                        backgroundColor: '#EDEDED',
                        borderRadius: sr(99),
                        width: '49%',
                      }}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Stats card */}
            <View
              style={[
                styles.card,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  height: sh(94),
                  paddingHorizontal: sw(2),
                },
              ]}
            >
              {[
                { value: user?.matchesCount ?? 0, label: 'Matches' },
                { value: '200', label: 'Photos Sent' },
                { value: user?.streakCount ?? 0, label: 'Day Streak' },
              ].map((stat: any, i: number) => (
                <View
                  key={i}
                  style={{ flex: 1, alignItems: 'center' }}
                >
                  <Text
                    style={{
                      fontSize: sf(20),
                      fontWeight: '600',
                      color: '#FBB202',
                      textAlign: 'center',
                    }}
                  >
                    {stat.value}
                  </Text>
                  <Text
                    style={{
                      fontSize: sf(13),
                      color: '#555555',
                      textAlign: 'center',
                    }}
                  >
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Bio card */}
            {!!profile?.bio && (
              <View
                style={[
                  styles.card,
                  { minHeight: 139, justifyContent: 'center' },
                ]}
              >
                <Text
                  style={{
                    fontSize: sf(18),
                    fontWeight: '600',
                    color: '#000000',
                  }}
                >
                  Bio
                </Text>
                <Text style={{ fontSize: sf(16), color: '#7D858E' }}>
                  {profile.bio}
                </Text>
              </View>
            )}

            {/* Interests card */}
            {interests.length > 0 && (
              <View
                style={[
                  styles.card,
                  {
                    minHeight: 152,
                    justifyContent: 'center', 
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: sf(18),
                    fontWeight: '600',
                    color: '#000000',
                    marginBottom: sh(12),
                  }}
                >
                  Interests
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: sw(10),
                  }}
                >
                  {interests.map((entry, i) => (
                    <View
                      key={i}
                      style={{
                        backgroundColor: '#FBB202',
                        borderRadius: sr(20),
                        paddingHorizontal: sw(14),
                        height: 36,
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: sf(16),
                          color: '#000000',
                          lineHeight: sh(16),
                        }}
                      >
                        {entry.interest.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Details card */}
            <View
              style={[
                styles.card,
                {
                  minHeight: 163,
                  justifyContent: 'center',
                  marginBottom: sh(8),
                },
              ]}
            >
              <Text
                style={{
                  fontSize: sf(18),
                  fontWeight: '600',
                  color: '#000000',
                  marginBottom: sh(1),
                }}
              >
                Details
              </Text>
              {[
                {
                  label: 'Height',
                  value: profile?.height ? `${profile.height} cm` : '—',
                },
                { label: 'Ethnicity', value: profile?.ethnicity ?? '—' },
                {
                  label: 'Gender',
                  value: profile?.gender
                    ? profile.gender.charAt(0).toUpperCase() +
                      profile.gender.slice(1)
                    : '—',
                },
              ].map((detail, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: sh(1),
                  }}
                >
                  <Text style={{ fontSize: sf(13), color: '#555555' }}>
                    {detail.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: sf(16),
                      color: '#000000',
                      textAlign: 'right',
                    }}
                  >
                    {detail.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <BottomTabBar />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex1: { flex: 1, paddingBottom: sh(20) },
  card: {
    backgroundColor: '#FFFFFF',
    paddingVertical: sh(12),
    borderRadius: sr(12),
    paddingHorizontal: sw(16),
    shadowColor: '#000000',
    shadowOpacity: 0.09,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  iconBtn: {
    width: sf(36),
    height: sf(36),
    borderRadius: sr(92),
    backgroundColor: '#FBB20233',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#FFFFFF',
    borderWidth: 1,
  },
  iconCircle: {
    width: sw(40),
    height: sh(40),
    borderRadius: sr(92),
    borderWidth: 0.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfileScreen;
