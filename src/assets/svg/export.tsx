import * as React from 'react';
import Svg, { G, Path } from 'react-native-svg';

function ExportIcon({ color = '#000' }: { color?: string }) {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24">
      <G
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      >
        <Path
          d="M3 15c0 2.828 0 4.243.879 5.121C4.757 21 6.172 21 9 21h6c2.828 0 4.243 0 5.121-.879C21 19.243 21 17.828 21 15"
          opacity={0.5}
        />
        <Path d="M12 3v13m0 0l4-4.375M12 16l-4-4.375" />
      </G>
    </Svg>
  );
}

export default ExportIcon;
