import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/common/Text';
import { Zap, Heart, Camera, Flame, MessageCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import PrimaryButton from '@/components/common/PrimaryButton';
import { sf } from '@/utils/responsive';

// ─── Constants ────────────────────────────────────────────
const FEATURES = [
  {
    id: 'matches',
    label: 'Like Matches',
    icon: <Heart size={24} color="#E53935" fill="#E53935" />,
  },
  {
    id: 'snaps',
    label: 'Send Snaps',
    icon: <Camera size={24} color="#212121" />,
  },
  {
    id: 'streaks',
    label: 'Build Streaks',
    icon: <Flame size={24} color="#FF6D00" />,
  },
  {
    id: 'connect',
    label: 'Stay Connected',
    icon: <MessageCircle size={24} color="#1E78F5" fill="#1E78F5" />,
  },
];

// ─── Screen ───────────────────────────────────────────────
const LaunchScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.main}>
          <View style={styles.iconCircle}>
            <Zap width={35} height={56} color="#ffffff" fill="#ffffff" />
          </View>

          <Text style={[styles.title, { fontSize: sf(24) }]} weight="semibold">
            We're Live!
          </Text>

          <Text
            style={[styles.subtitle, { fontFamily: 'Poppins-Regular', fontSize: sf(16) }]}
          >
            SparkLink is officially live with{' '}
            <Text style={{ fontFamily: 'Poppins-Medium', color: '#1E78F5' }}>
              1000+ users
            </Text>
            🎉
          </Text>

          <LinearGradient
            colors={['#1E78F51A', '#FBB2021A']}
            style={{ borderRadius: sf(16), width: '100%', padding: sf(16) }}
          >
            <Text
              style={[styles.cardLine, { fontFamily: 'Poppins-Regular', fontSize: sf(16) }]}
            >
              Every Day You'll See
            </Text>
            <Text
              style={[styles.cardHighlight, { fontFamily: 'Poppins-SemiBold', fontSize: sf(20) }]}
            >
              20 People
            </Text>
            <Text
              style={[styles.cardMuted, { fontFamily: 'Poppins-Regular', fontSize: sf(16) }]}
            >
              Fresh matches to connect with
            </Text>

            <View style={styles.featureGrid}>
              <View style={styles.featureRow}>
                {FEATURES.slice(0, 2).map(({ id, label, icon }) => (
                  <View key={id} style={styles.featureTile}>
                    {icon}
                    <Text
                      style={[
                        styles.featureLabel,
                        {
                          fontFamily: 'Poppins-Regular',
                          fontSize: sf(16),
                          lineHeight: sf(16),
                          letterSpacing: 0,
                        },
                      ]}
                    >
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.featureRow}>
                {FEATURES.slice(2, 4).map(({ id, label, icon }) => (
                  <View key={id} style={styles.featureTile}>
                    {icon}
                    <Text
                      style={[
                        styles.featureLabel,
                        { fontFamily: 'Poppins-Regular', fontSize: sf(16) },
                      ]}
                    >
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.premiumBanner}>
              <Text
                style={[styles.premiumText, { fontFamily: 'Poppins-SemiBold', fontSize: sf(16) }]}
              >
                Invite 2 friends to unlock premium features
              </Text>
            </View>
          </LinearGradient>
        </View>

        <PrimaryButton
          title="Let's Find your Spark!"
          onPress={() => navigation.navigate('EnableLocationScreen')}
          colors={['#1E78F5', '#FBB202']}
          variant="gradient"
          textStyle={{fontSize: sf(18), fontWeight: '500', lineHeight: sf(18), letterSpacing: 0}}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  page: { flex: 1, paddingHorizontal: 20, paddingVertical: 24 },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 16,
  },
  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: 9999,
    backgroundColor: '#1E78F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { color: '#000000', textAlign: 'center' },
  subtitle: { color: '#7D858E', textAlign: 'center' },
  cardLine: { color: '#000000', textAlign: 'center' },
  cardHighlight: { color: '#1E78F5', textAlign: 'center' },
  cardMuted: { color: '#555555', textAlign: 'center' },
  featureGrid: { rowGap: 12, marginTop: 4 },
  featureRow: { flexDirection: 'row', columnGap: 8 },
  featureTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 12,
    height: 88,
  },
  featureLabel: { color: '#7D858E' },
  premiumBanner: { alignItems: 'center', marginTop: 12 },
  premiumText: { color: '#000000', textAlign: 'center' },
});

export default LaunchScreen;
