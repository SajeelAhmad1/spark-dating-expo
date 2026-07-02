import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Text } from '@/components/common/Text';
import { Share2, Bell, Users2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PrimaryButton from '@/components/common/PrimaryButton';
import { sf, sw, sh, sr } from '@/utils/sizeMatters';
import { useLaunchProgress } from '@/features/referrals/hooks';

// ─── Screen ───────────────────────────────────────────────
const WaitingScreen = ({ navigation }: any) => {
  const { data: progress, isLoading } = useLaunchProgress();

  const target = progress?.target ?? 1000;
  const current = progress?.current ?? 0;
  const remaining = progress?.remaining ?? Math.max(target - current, 0);
  const progressPercent = progress?.progressPercent ?? 0;

  if (isLoading) {
    return (
      <View style={[styles.safeArea, styles.loading]}>
        <ActivityIndicator color='#0B0B0B' />
      </View>
    );
  }

  return (
  <View style={styles.safeArea}>
    <View style={styles.page}>
      {/* ── Main Content ── */}
      <View style={styles.main}>
        {/* Icon */}
        <LinearGradient
          colors={['#EAD6A9', '#EAD6A9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}
        >
          <Users2
            width={sf(56)}
            height={sf(56)}
            color='#0B0B0B'
          />
        </LinearGradient>

        {/* Title */}
        <Text
          style={[styles.title, { fontSize: sf(24) }]}
          weight='semibold'
        >
          We're Almost There!
        </Text>

        {/* Subtitle */}
        <Text
          style={[
            styles.subtitle,
            { fontFamily: 'Poppins-Regular', fontSize: sf(16) },
          ]}
        >
          Spark goes live when{' '}
          <Text
            style={{ fontFamily: 'Poppins-Medium', color: '#CEB98F' }}
            weight='medium'
          >
            {target.toLocaleString()} people
          </Text>{' '}
          join. Invite friends to speed it up!
        </Text>

        {/* Progress */}
        <View style={styles.progressBlock}>
          <View style={styles.progressRow}>
            <Text
              style={[
                styles.progressLabel,
                { fontFamily: 'Poppins-Medium', fontSize: sf(16) },
              ]}
            >
              Launch Progress
            </Text>
            <Text
              style={[
                styles.progressValue,
                { fontFamily: 'Poppins-Medium', fontSize: sf(16) },
              ]}
            >
              {current}/{target}
            </Text>
          </View>

          <View style={styles.track}>
            <View style={[styles.trackFill, { width: `${progressPercent}%` }]} />
          </View>

          <Text
            style={[
              styles.progressHint,
              { fontFamily: 'Poppins-Medium', fontSize: sf(14) },
            ]}
          >
            {remaining} more to go!
          </Text>
        </View>

        {/* Notification Card */}
        <View style={styles.notifyCard}>
          <View style={styles.notifyIconWrap}>
            <Bell
              size={sf(24)}
              color='#0B0B0B'
            />
          </View>
          <View style={styles.notifyTextCol}>
            <Text
              style={[
                styles.notifyTitle,
                { fontFamily: 'Poppins-SemiBold', fontSize: sf(16) },
              ]}
            >
              You'll be notified
            </Text>
            <Text
              style={[
                styles.notifyBody,
                { fontFamily: 'Poppins-Regular', fontSize: sf(13) },
              ]}
            >
              We will send you a notification when we reach {target} users
            </Text>
          </View>
        </View>
      </View>

      {/* ── Bottom: Action ── */}
      <PrimaryButton
        title='Invite friends to speed up'
        onPress={() => navigation.navigate('LaunchScreen')}
        icon={
          <Share2
            size={sf(20)}
            color='#0B0B0B'
          />
        }
        iconPosition='middle'
        textStyle={{
          fontSize: sf(18),
          fontWeight: '500',
          lineHeight: sh(56),
        }}
      />
    </View>
  </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F3ED', paddingBottom: sh(20) },
  loading: { alignItems: 'center', justifyContent: 'center' },
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sh(16),
  },
  title: {
    color: '#000000',
    textAlign: 'center',
  },
  subtitle: {
    color: '#7D858E',
    textAlign: 'center',
  },
  progressBlock: { width: '100%', rowGap: sh(8) },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: { color: '#000000' },
  progressValue: { color: '#CEB98F' },
  track: {
    width: '100%',
    height: sh(8),
    borderRadius: 9999,
    backgroundColor: '#E8EAED',
    overflow: 'hidden',
  },
  trackFill: { height: '100%', borderRadius: 9999, backgroundColor: '#CEB98F' },
  progressHint: { color: '#CEB98F', textAlign: 'center' },
  notifyCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: sr(16),
    backgroundColor: '#EDEDED',
    paddingHorizontal: sw(16),
    height: sh(100),
  },
  notifyIconWrap: {
    width: sw(40),
    height: sw(40),
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: '#EAD6A933',
    borderWidth: 0.4,
    borderColor: '#CEB98F',
  },
  notifyTextCol: { flex: 1, flexShrink: 1, marginLeft: sw(8) },
  notifyTitle: { color: '#000000' },
  notifyBody: { color: '#555555' },
});

export default WaitingScreen;
