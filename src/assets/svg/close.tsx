import React from 'react';
import Svg, { Path } from 'react-native-svg';

const CloseIcon = ({
  color = '#6C6C6C',
  width = 24,
  height = 24,
}: {
  color?: string;
  width?: number;
  height?: number;
}) => {
  return (
    <Svg fill="none" height={height} width={width} viewBox="0 0 24 24">
      <Path
        d="M18 6L6 18"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <Path
        d="M6 6L18 18"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </Svg>
  );
};

export default CloseIcon;
