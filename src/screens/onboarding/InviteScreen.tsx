import React from 'react';
import { StyleSheet, View, TouchableOpacity, Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { showToast } from '@/utils/toast';
import { Text } from '@/components/common/Text';
import { Share2, Copy } from 'lucide-react-native';
import Gift from '@/assets/images/gift.svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '@/components/common/PrimaryButton';
import { sf } from '@/utils/responsive';

// ─── Constants ────────────────────────────────────────────
const REFERRAL_LINK = 'https://spark.app/invite/SPARK-QT53V4';

const STATS = [
  {
    id: 'invites',
    label: 'Invites Sent',
    value: 0,
    color: '#DC9B00',
    bg: '#FBB2021A',
    border: '#FBB202',
  },
  {
    id: 'signups',
    label: 'Signed Up',
    value: 0,
    color: '#1E78F5',
    bg: '#1E78F51A',
    border: '#1E78F5',
  },
];

// ─── Sub Components ───────────────────────────────────────

const GiftIcon = () => (
  <View style={styles.giftCircle}>
    <Gift width={56} height={56} color="#ffffff" />
  </View>
);

const Title = () => (
  <Text
    style={{
      fontFamily: 'Poppins-SemiBold',
      fontWeight: '600',
      fontSize: sf(24), 
      color: '#000000',
      textAlign: 'center',
      marginBottom: 8,
    }}
  >
    Get Premium Free! 🎉
  </Text>
);

const Subtitle = () => (
  <Text
    style={{
      fontFamily: 'Poppins-Regular',
      fontWeight: '400',
      fontSize: sf(16), 
      color: '#7D858E',
      textAlign: 'center',
      marginBottom: 8,
    }}
  >
    Invite{' '}
    <Text style={{ color: '#1E78F5', fontWeight: '500' }}>2 friends</Text>
    {' '}to Spark and unlock{' '}
    <Text style={{ color: '#DC9B00', fontWeight: '500'  }}>Premium access</Text>
    {' '}for free — no strings attached!
  </Text>
);

const ReferralLinkBox = ({ onCopy }: { onCopy: () => void }) => (
  <View style={styles.linkBoxOuter}>
    <Text
      style={{
        fontFamily: 'Poppins-Regular',
        fontWeight: '400',
        fontSize: sf(16), 
        color: '#7D858E',
        marginBottom: 10,
      }}
    >
      Your Referral Link
    </Text>

    <View style={styles.linkRow}>
      <Text
        numberOfLines={1}
        style={{
          fontFamily: 'Poppins-Medium',
          fontWeight: '500',
          fontSize: sf(14), 
          color: '#000000',
          flex: 1,
        }}
      >
        {REFERRAL_LINK}
      </Text>

      <TouchableOpacity onPress={onCopy} style={styles.copyBtn}>
        <Copy size={16} color="#1E78F5" />
      </TouchableOpacity>
    </View>
  </View>
);

const StatCard = ({
  label,
  value,
  color,
  bg,
  border,
}: (typeof STATS)[0]) => (
  <View
    style={[styles.statCard, { backgroundColor: bg, borderColor: border }]}
  >
    <Text
      style={{
        fontFamily: 'Poppins-SemiBold',
        fontWeight: '600',
        fontSize: sf(20), 
        color,
        textAlign: 'center',
        marginBottom: 4,
      }}
    >
      {value}
    </Text>
    <Text
      style={{
        fontFamily: 'Poppins-Regular',
        fontWeight: '400',
        fontSize: sf(13), 
        color: '#555555',
        textAlign: 'center',
      }}
    >
      {label}
    </Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────
const InviteScreen = ({ navigation }: any) => {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(REFERRAL_LINK);
    showToast('Link copied');
  };

  const handleSkip = () => {
    navigation.navigate('WaitingScreen');
  };

  const handleShare = async () => {
    try {
      const content =
        Platform.OS === 'ios'
          ? { message: REFERRAL_LINK, url: REFERRAL_LINK }
          : { message: REFERRAL_LINK };
      await Share.share(content);
    } catch {
      showToast('Could not open share', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>

        <View style={styles.main}>
          <GiftIcon />
          <Title />
          <Subtitle />
          <ReferralLinkBox onCopy={handleCopy} />
          <View style={styles.statsRow}>
            {STATS.map(stat => (
              <StatCard key={stat.id} {...stat} />
            ))}
          </View>
        </View>

        <View style={styles.bottomActions}>
          <PrimaryButton
            title="Share Invite Link"
            onPress={handleShare}
            colors={['#1E78F5', '#DC9B00']}
            variant="gradient"
            icon={<Share2 size={20} color="#ffffff" />}
            iconPosition="middle"
            textStyle={{ fontSize: sf(18), color: '#ffffff' }}
          />

          <TouchableOpacity onPress={handleSkip}>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontWeight: '500',
                fontSize: sf(16), 
                color: '#7D858E',
                textAlign: 'center',
              }}
            >
              Skip for Now
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  page: { flex: 1, paddingHorizontal: 20, paddingVertical: 40 },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 24,
  },
  giftCircle: {
    width: 104,
    height: 104,
    borderRadius: 9999,
    backgroundColor: '#1E78F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  linkBoxOuter: {
    width: '100%',
    borderRadius: 16,
    height: 110,
    backgroundColor: '#F7F8FA',
    padding: 16,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  copyBtn: { marginLeft: 12, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', width: '100%', columnGap: 12 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 72,
    borderWidth: 0.2,
  },
  bottomActions: { rowGap: 16 },
});

export default InviteScreen;
