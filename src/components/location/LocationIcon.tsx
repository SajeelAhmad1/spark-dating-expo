import React from 'react';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

export default function LocationIcon() {
  return (
    <Svg width={80} height={88} viewBox="0 0 80 88" fill="none">
      <Path
        d="M40 4C25.088 4 13 16.088 13 31C13 50.25 40 76 40 76C40 76 67 50.25 67 31C67 16.088 54.912 4 40 4Z"
        fill="#FBB202"
        fillOpacity={0.15}
        stroke="#FBB202"
        strokeWidth={3}
      />
      <Circle cx={40} cy={31} r={10} fill="#FBB202" />
      <Ellipse
        cx={40}
        cy={82}
        rx={16}
        ry={4}
        fill="#FBB202"
        fillOpacity={0.25}
      />
    </Svg>
  );
}

