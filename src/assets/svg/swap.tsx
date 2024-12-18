import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SwapIcon({
  width = 24,
  height = 24,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24">
      <Path
        fill="#000"
        fillRule="evenodd"
        d="M8.47 2.47a.75.75 0 011.06 0l2 2A.75.75 0 0111 5.75H9a6.25 6.25 0 100 12.5h.5a.75.75 0 010 1.5H9a7.75 7.75 0 010-15.5h.19l-.72-.72a.75.75 0 010-1.06M13.75 5a.75.75 0 01.75-.75h.5a7.75 7.75 0 010 15.5h-.19l.72.72a.75.75 0 11-1.06 1.06l-2-2a.75.75 0 01.53-1.28h2a6.25 6.25 0 100-12.5h-.5a.75.75 0 01-.75-.75"
        clipRule="evenodd"
      />
    </Svg>
  );
}

export default SwapIcon;
