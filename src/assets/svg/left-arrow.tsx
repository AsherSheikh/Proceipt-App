import Svg, { Path } from 'react-native-svg';
import React from 'react';

export const LeftArrow = ({ color = '#000' }) => {
  return (
    <Svg fill="none" height="24" viewBox="0 0 24 24" width="24">
      <Path
        clipRule="evenodd"
        d="M6.29199 13.1781L15.2762 21.7195C15.6704 22.0935 16.3091 22.0935 16.7043 21.7195C17.0986 21.3456 17.0986 20.7381 16.7043 20.3642L8.43275 12.5005L16.7033 4.63679C17.0976 4.26282 17.0976 3.65539 16.7033 3.28048C16.3091 2.90651 15.6694 2.90651 15.2752 3.28048L6.291 11.8218C5.90283 12.1919 5.90283 12.8089 6.29199 13.1781Z"
        fill={color}
        fillRule="evenodd"
      />
    </Svg>
  );
};
