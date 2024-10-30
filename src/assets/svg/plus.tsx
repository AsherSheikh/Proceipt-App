import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function PlusIcon() {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16">
      <Path
        fill="#000"
        d="M8 2.5a.5.5 0 00-1 0V7H2.5a.5.5 0 000 1H7v4.5a.5.5 0 001 0V8h4.5a.5.5 0 000-1H8z"
      />
    </Svg>
  );
}

export default PlusIcon;
