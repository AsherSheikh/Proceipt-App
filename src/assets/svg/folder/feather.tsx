import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const FeatherIcon = ({ color }: { color: string }) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.24 12.2405C21.3658 11.1147 21.9983 9.58771 21.9983 7.99553C21.9983 6.40334 21.3658 4.87637 20.24 3.75053C19.1142 2.62468 17.5872 1.99219 15.995 1.99219C14.4028 1.99219 12.8758 2.62468 11.75 3.75053L5 10.5005V19.0005H13.5L20.24 12.2405Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 8L2 22"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.5 15H9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
