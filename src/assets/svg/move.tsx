import Svg, { Path } from 'react-native-svg';
import React from 'react';

export const MoveIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12.4248 2.5752C12.3691 2.51932 12.3029 2.47499 12.23 2.44474C12.1571 2.4145 12.0789 2.39893 12 2.39893C11.9211 2.39893 11.8429 2.4145 11.77 2.44474C11.6971 2.47499 11.6309 2.51932 11.5752 2.5752L8.5752 5.5752C8.46254 5.68786 8.39924 5.84067 8.39924 6C8.39924 6.15933 8.46254 6.31213 8.5752 6.4248C8.68786 6.53746 8.84067 6.60076 9 6.60076C9.15933 6.60076 9.31214 6.53746 9.4248 6.4248L11.4 4.4484V9C11.4 9.15913 11.4632 9.31174 11.5757 9.42426C11.6883 9.53678 11.8409 9.6 12 9.6C12.1591 9.6 12.3117 9.53678 12.4243 9.42426C12.5368 9.31174 12.6 9.15913 12.6 9V4.4484L14.5752 6.4248C14.6879 6.53746 14.8407 6.60076 15 6.60076C15.1593 6.60076 15.3121 6.53746 15.4248 6.4248C15.5375 6.31213 15.6008 6.15933 15.6008 6C15.6008 5.84067 15.5375 5.68786 15.4248 5.5752L12.4248 2.5752ZM2.5752 11.5752C2.51932 11.6309 2.47499 11.6971 2.44475 11.77C2.4145 11.8429 2.39893 11.9211 2.39893 12C2.39893 12.0789 2.4145 12.1571 2.44475 12.23C2.47499 12.3029 2.51932 12.3691 2.5752 12.4248L5.5752 15.4248C5.68786 15.5375 5.84067 15.6008 6 15.6008C6.15933 15.6008 6.31214 15.5375 6.4248 15.4248C6.53746 15.3121 6.60076 15.1593 6.60076 15C6.60076 14.8407 6.53746 14.6879 6.4248 14.5752L4.4484 12.6H9C9.15913 12.6 9.31174 12.5368 9.42426 12.4243C9.53679 12.3117 9.6 12.1591 9.6 12C9.6 11.8409 9.53679 11.6883 9.42426 11.5757C9.31174 11.4632 9.15913 11.4 9 11.4H4.4484L6.4248 9.4248C6.53746 9.31213 6.60076 9.15933 6.60076 9C6.60076 8.84067 6.53746 8.68786 6.4248 8.5752C6.31214 8.46253 6.15933 8.39924 6 8.39924C5.84067 8.39924 5.68786 8.46253 5.5752 8.5752L2.5752 11.5752ZM12 21.6C11.9212 21.6001 11.8431 21.5847 11.7702 21.5547C11.6973 21.5246 11.631 21.4805 11.5752 21.4248L8.5752 18.4248C8.46254 18.3121 8.39924 18.1593 8.39924 18C8.39924 17.8407 8.46254 17.6879 8.5752 17.5752C8.68786 17.4625 8.84067 17.3992 9 17.3992C9.15933 17.3992 9.31214 17.4625 9.4248 17.5752L11.4 19.5516V15C11.4 14.8409 11.4632 14.6883 11.5757 14.5757C11.6883 14.4632 11.8409 14.4 12 14.4C12.1591 14.4 12.3117 14.4632 12.4243 14.5757C12.5368 14.6883 12.6 14.8409 12.6 15V19.5516L14.5752 17.5752C14.6879 17.4625 14.8407 17.3992 15 17.3992C15.1593 17.3992 15.3121 17.4625 15.4248 17.5752C15.5375 17.6879 15.6008 17.8407 15.6008 18C15.6008 18.1593 15.5375 18.3121 15.4248 18.4248L12.4248 21.4248C12.369 21.4805 12.3027 21.5246 12.2298 21.5547C12.1569 21.5847 12.0788 21.6001 12 21.6ZM21.4248 12.4248C21.4807 12.3691 21.525 12.3029 21.5553 12.23C21.5855 12.1571 21.6011 12.0789 21.6011 12C21.6011 11.9211 21.5855 11.8429 21.5553 11.77C21.525 11.6971 21.4807 11.6309 21.4248 11.5752L18.4248 8.5752C18.3121 8.46253 18.1593 8.39924 18 8.39924C17.8407 8.39924 17.6879 8.46253 17.5752 8.5752C17.4625 8.68786 17.3992 8.84067 17.3992 9C17.3992 9.15933 17.4625 9.31213 17.5752 9.4248L19.5516 11.4H15C14.8409 11.4 14.6883 11.4632 14.5757 11.5757C14.4632 11.6883 14.4 11.8409 14.4 12C14.4 12.1591 14.4632 12.3117 14.5757 12.4243C14.6883 12.5368 14.8409 12.6 15 12.6H19.5516L17.5752 14.5752C17.4625 14.6879 17.3992 14.8407 17.3992 15C17.3992 15.1593 17.4625 15.3121 17.5752 15.4248C17.6879 15.5375 17.8407 15.6008 18 15.6008C18.1593 15.6008 18.3121 15.5375 18.4248 15.4248L21.4248 12.4248Z"
      fill="black"
    />
  </Svg>
);