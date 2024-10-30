import Svg, { Path } from 'react-native-svg';
import React from 'react';

export const DownArrow = ({ color = '#fff' }) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 14.661L7.34399 10.005L8.01599 9.33301L12 13.317L15.984 9.33301L16.656 10.005L12 14.661Z"
        fill={color}
      />
    </Svg>
  );
};
