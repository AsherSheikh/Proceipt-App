import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function CheckMarkIcon() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24">
      <Path
        fill="none"
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 12.9l3.143 3.6L15 7.5m5 .063l-8.572 9L11 16"
      />
    </Svg>
  );
}

export default CheckMarkIcon;
