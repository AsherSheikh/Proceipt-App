import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function ShareEmailIcon() {
  return (
    <Svg width="24" height="24" viewBox="0 0 14 14">
      <Path
        fill="none"
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.812 11l2.178 2.168a1.1 1.1 0 001.05.3 1.119 1.119 0 00.809-.74l3.576-10.72A1.118 1.118 0 0011.987.57L1.267 4.147a1.119 1.119 0 00-.74.859 1.099 1.099 0 00.3 1l2.737 2.737-.09 3.466zM13.106.79L3.564 8.742"
      />
    </Svg>
  );
}

export default ShareEmailIcon;
