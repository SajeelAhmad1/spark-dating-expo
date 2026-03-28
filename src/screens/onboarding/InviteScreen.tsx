import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
  <View className="w-[104px] h-[104px] rounded-full bg-[#1E78F5] items-center justify-center mb-8">
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
  <View
    className="w-full rounded-2xl h-[110px]"
    style={{ backgroundColor: '#F7F8FA', padding: 16 }}
  >
    <Text
      style={{
        fontFamily: 'Poppins-Regular',
        fontWeight: '400',
        fontSize: sf(16), 
        color: '#7D858E',
        marginBottom: 10,
      }}
      className='text-[#7D858E]'
    >
      Your Referral Link
    </Text>

    <View className="flex-row items-center justify-between h-[44px] bg-white rounded-[8px] px-2">
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

      <TouchableOpacity
        onPress={onCopy}
        className="ml-3 w-8 h-8 items-center justify-center"
      >
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
    className="flex-1  rounded-2xl items-center justify-center ml-2 h-[72px] "
    style={{ backgroundColor: bg, borderWidth: 0.2, borderColor: border }}
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
  const handleCopy = () => {
    // Clipboard.setString(REFERRAL_LINK);
    console.log('Copied:', REFERRAL_LINK);
  };

  const handleSkip = () => {
    console.log('Skip pressed');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-5 py-10">

        {/* ── Top: Main Content ── */}
        <View className="flex-1 items-center justify-center gap-y-6">
          <GiftIcon />
          <Title />
          <Subtitle />
          <ReferralLinkBox onCopy={handleCopy} />
          <View className="flex-row w-full gap-x-3">
            {STATS.map(stat => (
              <StatCard key={stat.id} {...stat} />
            ))}
          </View>
        </View>

        {/* ── Bottom: Actions ── */}
        <View className="gap-y-4">
          <PrimaryButton
            title="Share Invite Link"
            // onPress={handleShare}
            onPress={() => navigation.navigate('WaitingScreen')}
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

export default InviteScreen;
