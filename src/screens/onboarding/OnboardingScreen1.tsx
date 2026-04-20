import React, { useMemo } from 'react';
import { View, useWindowDimensions } from 'react-native';

import OnboardingCard from './OnboardingCard'; 

import Profile1 from '@/assets/images/avatar1.svg';
import Profile2 from '@/assets/images/avatar2.svg';
import Profile3 from '@/assets/images/avatar3.svg';
import Profile4 from '@/assets/images/avatar4.svg';
import Profile5 from '@/assets/images/avatar5.svg';
import CenterProfile from '@/assets/images/avatar6.svg';
import LocationIcon from '@/assets/images/locationIcon.svg';

import { sf } from '@/utils/sizeMatters';
import OrbitAvatarAnimation from '@/components/common/OrbitAvatarAnimation'; 

const OnboardingScreen1 = ({ navigation }: any) => {
  const { width } = useWindowDimensions(); 
 

  // ── Orbit data (UNCHANGED LOGIC) ─────────────────────────────
  const { ORBIT_D, ORBIT_R, AVATARS, PINS } = useMemo(() => {
    const orbitD = width * 0.78;
    const orbitR = orbitD / 2;

    return {
      ORBIT_D: orbitD,
      ORBIT_R: orbitR,

      AVATARS: [
        { Component: Profile1, angle: -150, size: sf(68) },
        { Component: Profile2, angle: -55, size: sf(52) },
        { Component: Profile3, angle: 0, size: sf(62) },
        { Component: Profile5, angle: 58, size: sf(68) },
        { Component: Profile4, angle: 140, size: sf(56) },
      ],

      PINS: [
        { size: sf(24), angle: -95, tilt: 0 },
        { size: sf(24), angle: -22, tilt: 20 },
        { size: sf(24), angle: 105, tilt: 0 },
      ],
    };
  }, [width]);

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff', paddingBottom: 20 }}>

      {/* ── Orbit Animation (REUSABLE COMPONENT) ── */}
      <OrbitAvatarAnimation
        CenterProfile={CenterProfile}
        AVATARS={AVATARS}
        PINS={PINS}
        LocationIcon={LocationIcon}
      />

      {/* ── Bottom Card ── */}
      <OnboardingCard
        title="Find Your Match"
        subtitle="Swipe through profiles and connect with people who interest you in real-time."
        activeDot={0}
        buttonLabel="Next"
        onPress={() => navigation.navigate('Onboarding2')}
      /> 
    </View>
  );
};

export default OnboardingScreen1;