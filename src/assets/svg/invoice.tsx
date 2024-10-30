import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function InvoiceIcon({ color }: { color: string }) {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
      <Path
        fill={color}
        d="M19 21.5H6A3.5 3.5 0 012.5 18V4.943c0-1.067 1.056-1.744 1.985-1.422.133.046.263.113.387.202l.175.125a2.51 2.51 0 002.912-.005 3.52 3.52 0 014.082 0 2.51 2.51 0 002.912.005l.175-.125c.993-.71 2.372 0 2.372 1.22V12.5H21a.75.75 0 01.75.75v5.5A2.75 2.75 0 0119 21.5M17.75 14v4.75a1.25 1.25 0 002.5 0V14zM13.5 9.75a.75.75 0 00-.75-.75h-6a.75.75 0 000 1.5h6a.75.75 0 00.75-.75m-1 3a.75.75 0 00-.75-.75h-5a.75.75 0 100 1.5h5a.75.75 0 00.75-.75m.25 2.25a.75.75 0 110 1.5h-6a.75.75 0 010-1.5z"
      />
    </Svg>
  );
}

export default InvoiceIcon;
