import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function ChangeIcon() {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16">
      <Path
        fill="#000"
        d="M4.146 6.354a.5.5 0 00.708 0L8 3.207l3.146 3.147a.5.5 0 00.708-.708l-3.5-3.5a.5.5 0 00-.708 0l-3.5 3.5a.5.5 0 000 .708m0 3.292a.5.5 0 01.708 0L8 12.793l3.146-3.147a.5.5 0 01.708.708l-3.5 3.5a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 010-.708"
      />
    </Svg>
  );
}

export default ChangeIcon;
