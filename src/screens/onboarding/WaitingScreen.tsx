import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/common/Text';
import { Share2, Bell, Users2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '@/components/common/PrimaryButton';
import { sf } from '@/utils/responsive';

// ─── Constants ────────────────────────────────────────────
const CURRENT = 454;
const TARGET = 1000;
const REMAINING = TARGET - CURRENT;
const PROGRESS = (CURRENT / TARGET) * 100;

// ─── Screen ───────────────────────────────────────────────
const WaitingScreen = ({ navigation }: any) => (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.page}>

      {/* ── Main Content ── */}
      <View style={styles.main}>

        {/* Icon */}
        <View style={styles.iconCircle}>
          <Users2 width={56} height={56} color="#ffffff" />
        </View>

        {/* Title */}
        <Text
          style={[styles.title, { fontSize: sf(24) }]}
          weight="semibold"
        >
          We're Almost There! 🚀
        </Text>

        {/* Subtitle */}
        <Text
          style={[styles.subtitle, { fontFamily: 'Poppins-Regular', fontSize: sf(16) }]}
        >
          Spark goes live when{' '}
          <Text style={{ fontFamily: 'Poppins-Medium', color: '#1E78F5' }} weight="medium">
            {TARGET.toLocaleString()} people
          </Text>{' '}
          join. Invite friends to speed it up!
        </Text>

        {/* Progress */}
        <View style={styles.progressBlock}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { fontFamily: 'Poppins-Medium', fontSize: sf(16) }]}>
              Launch Progress
            </Text>
            <Text style={[styles.progressValue, { fontFamily: 'Poppins-Medium', fontSize: sf(16) }]}>
              {CURRENT}/{TARGET}
            </Text>
          </View>

          <View style={styles.track}>
            <View style={[styles.trackFill, { width: `${PROGRESS}%` }]} />
          </View>

          <Text
            style={[styles.progressHint, { fontFamily: 'Poppins-Medium', fontSize: sf(14) }]}
          >
            {REMAINING} more to go!
          </Text>
        </View>

        {/* Notification Card */}
        <View style={styles.notifyCard}>
          <View style={styles.notifyIconWrap}>
            <Bell size={24} color="#DC9B00" />
          </View>
          <View style={styles.notifyTextCol}>
            <Text style={[styles.notifyTitle, { fontFamily: 'Poppins-SemiBold', fontSize: sf(16) }]}>
              You'll be notified
            </Text>
            <Text style={[styles.notifyBody, { fontFamily: 'Poppins-Regular', fontSize: sf(13) }]}>
              We will send you a notification when we reach {TARGET} users
            </Text>
          </View>
        </View>

      </View>

      {/* ── Bottom: Action ── */}
      <PrimaryButton
        title="Invite Friends to Speed Up"
        onPress={() => navigation.navigate("LaunchScreen")}
        colors={['#1E78F5', '#DC9B00']}
        variant="gradient"
        iconPosition="start"
        textStyle={{fontSize: sf(18), fontWeight: '500', color: '#ffffff'}}
      />

    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  page: { flex: 1, paddingHorizontal: 20, paddingVertical: 40 },
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
  title: {
    color: '#000000',
    textAlign: 'center',
  },
  subtitle: {
    color: '#7D858E',
    textAlign: 'center',
  },
  progressBlock: { width: '100%', rowGap: 8 },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: { color: '#000000' },
  progressValue: { color: '#1E78F5' },
  track: {
    width: '100%',
    height: 8,
    borderRadius: 9999,
    backgroundColor: '#E8EAED',
    overflow: 'hidden',
  },
  trackFill: { height: '100%', borderRadius: 9999, backgroundColor: '#1E78F5' },
  progressHint: { color: '#DC9B00', textAlign: 'center' },
  notifyCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#EDEDED',
    paddingHorizontal: 16,
    height: 100,
  },
  notifyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: '#FBB20233',
    borderWidth: 0.4,
    borderColor: '#DC9B00',
  },
  notifyTextCol: { flex: 1, flexShrink: 1, marginLeft: 8 },
  notifyTitle: { color: '#000000' },
  notifyBody: { color: '#555555' },
});

export default WaitingScreen;
