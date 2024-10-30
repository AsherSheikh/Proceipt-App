import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const AddIcon = ({ color = '#fff', width = 48, height = 48 }) => (
  <Svg width={width} height={height} viewBox="0 0 48 48" fill="none">
    <Path
      d="M16.0001 23.9471L23.9999 24.0001M23.9999 24.0001L31.9998 24.053M23.9999 24.0001L23.9469 31.9999M23.9999 24.0001L24.0529 16.0002"
      stroke={color}
      stroke-width="2"
      stroke-linecap="round"
    />
  </Svg>
);
