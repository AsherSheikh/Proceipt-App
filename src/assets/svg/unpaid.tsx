import * as React from 'react';
import Svg, { G, Path, Rect } from 'react-native-svg';

function UnpaidIcon() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24">
      <G fill="none" stroke="#000" strokeWidth={1.5}>
        <Path d="M17.414 10.414C18 9.828 18 8.886 18 7c0-1.886 0-2.828-.586-3.414m0 6.828C16.828 11 15.886 11 14 11h-4c-1.886 0-2.828 0-3.414-.586m10.828 0zm0-6.828C16.828 3 15.886 3 14 3h-4c-1.886 0-2.828 0-3.414.586m10.828 0zm-10.828 0C6 4.172 6 5.114 6 7c0 1.886 0 2.828.586 3.414m0-6.828zm0 6.828zM13 7a1 1 0 11-2 0 1 1 0 012 0z" />
        <Path
          strokeLinecap="round"
          d="M18 6a3 3 0 01-3-3m3 5a3 3 0 00-3 3M6 6a3 3 0 003-3M6 8a3 3 0 013 3m-4 9.388h2.26c1.01 0 2.033.106 3.016.308a14.85 14.85 0 005.33.118c.868-.14 1.72-.355 2.492-.727.696-.337 1.549-.81 2.122-1.341.572-.53 1.168-1.397 1.59-2.075.364-.582.188-1.295-.386-1.728a1.887 1.887 0 00-2.22 0l-1.807 1.365c-.7.53-1.465 1.017-2.376 1.162-.11.017-.225.033-.345.047m0 0a8.176 8.176 0 01-.11.012m.11-.012a.998.998 0 00.427-.24 1.492 1.492 0 00.126-2.134 1.9 1.9 0 00-.45-.367c-2.797-1.669-7.15-.398-9.779 1.467m9.676 1.274a.524.524 0 01-.11.012m0 0a9.274 9.274 0 01-1.814.004"
        />
        <Rect width={3} height={8} x={2} y={14} rx={1.5} />
      </G>
    </Svg>
  );
}

export default UnpaidIcon;