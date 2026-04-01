import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/common/Text';
import { Zap, Heart, Camera, Flame, MessageCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import PrimaryButton from '@/components/common/PrimaryButton';
import { sf, sw, sh, sr } from '@/utils/responsive';

// ─── Constants ────────────────────────────────────────────
const FEATURES = [
  {
    id: 'matches',
    label: 'Like Matches',
    icon: <Heart size={sf(24)} color="#E53935" fill="#E53935" />,
  },
  {
    id: 'snaps',
    label: 'Send Snaps',
    icon: <Camera size={sf(24)} color="#212121" />,
  },
  {
    id: 'streaks',
    label: 'Build Streaks',
    icon: <Flame size={sf(24)} color="#FF6D00" />,
  },
  {
    id: 'connect',
    label: 'Stay Connected',
    icon: <MessageCircle size={sf(24)} color="#1E78F5" fill="#1E78F5" />,
  },
];

// ─── Screen ───────────────────────────────────────────────
const LaunchScreen = ({ navigation }: any) => {
  return (
    <View style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.main}>
          <View style={styles.iconCircle}>
            <Zap width={sf(35)} height={sf(56)} color="#ffffff" fill="#ffffff" />
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
          textStyle={{fontSize: sf(18), fontWeight: '500', }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF', paddingBottom: sh(20) },
  page: { flex: 1, paddingHorizontal: sw(20) },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: sh(16),
  },
  iconCircle: {
    width: sw(104),
    height: sw(104),
    borderRadius: 9999,
    backgroundColor: '#1E78F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sh(16),
  },
  title: { color: '#000000', textAlign: 'center' },
  subtitle: { color: '#7D858E', textAlign: 'center' },
  cardLine: { color: '#000000', textAlign: 'center' },
  cardHighlight: { color: '#1E78F5', textAlign: 'center' },
  cardMuted: { color: '#555555', textAlign: 'center' },
  featureGrid: { rowGap: sh(12), marginTop: sh(4) },
  featureRow: { flexDirection: 'row', columnGap: sw(8) },
  featureTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: sr(16),
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: sh(12),
    height: sh(88),
  },
  featureLabel: { color: '#7D858E' },
  premiumBanner: { alignItems: 'center', marginTop: sh(12) },
  premiumText: { color: '#000000', textAlign: 'center' },
});

export default LaunchScreen;
