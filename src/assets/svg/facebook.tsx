import React from 'react';
import Svg, { G, ClipPath, Defs, Path, Rect } from 'react-native-svg';

export const FacebookIcon = () => {
  return (
    <Svg width="50" height="50" viewBox="0 0 50 50" fill="none">
      <G clip-path="url(#clip0_571_2554)">
        <Path
          d="M9.1297 0C4.07225 0 0 4.07225 0 9.1297V40.8703C0 45.9278 4.07225 50 9.1297 50H26.3328V30.4531H21.1641V23.4156H26.3328V17.4031C26.3328 12.6794 29.3868 8.3422 36.4219 8.3422C39.2703 8.3422 41.3766 8.61565 41.3766 8.61565L41.211 15.1875C41.211 15.1875 39.0628 15.1672 36.7188 15.1672C34.1818 15.1672 33.775 16.3361 33.775 18.2766V23.4157H41.4125L41.0797 30.4532H33.775V50.0001H40.8703C45.9278 50.0001 50 45.9278 50 40.8704V9.12975C50 4.0723 45.9278 5e-05 40.8703 5e-05H9.12965L9.1297 0Z"
          fill="#2196F3"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_571_2554">
          <Rect width="50" height="50" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
