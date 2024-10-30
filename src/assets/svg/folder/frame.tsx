import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const FrameIcon = ({ color }: { color: string }) => {
  return (
    <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <Path
        d="M22.9375 20.839C22.9375 17.3757 21.277 14.3841 18.875 12.9907V7.84547C18.875 7.37687 18.7404 6.92379 18.4916 6.56691L14.6221 0.959245C14.4596 0.723394 14.2285 0.605469 14 0.605469C13.7715 0.605469 13.5404 0.723394 13.3779 0.959245L9.5084 6.56691C9.26126 6.92452 9.12547 7.37736 9.125 7.84547V12.9907C6.72305 14.3841 5.0625 17.3757 5.0625 20.839H9.03613C8.97773 21.0624 8.94727 21.3045 8.94727 21.5776C8.94727 22.2634 9.14023 22.9337 9.49062 23.4644C9.77663 23.8984 10.1554 24.2271 10.585 24.414C11.1715 26.0898 12.5045 27.1697 14 27.1697C14.7389 27.1697 15.4549 26.9028 16.0668 26.4001C16.666 25.9098 17.1307 25.2239 17.4125 24.414C17.8419 24.2282 18.2207 23.9006 18.5068 23.4675C18.8577 22.932 19.0493 22.2667 19.0502 21.5807C19.0502 21.32 19.0223 21.0717 18.9715 20.8421H22.9375V20.839ZM20.3553 17.2826C20.5939 17.7357 20.7869 18.2229 20.9266 18.7287H18.7734V15.3368C19.4069 15.8421 19.9459 16.5052 20.3553 17.2826ZM10.8516 12.9907V7.89202L14 3.33017L17.1484 7.89202V18.7287H10.8516V12.9907ZM7.07344 18.7287C7.21309 18.2229 7.40606 17.7357 7.64473 17.2826C8.05859 16.5006 8.59688 15.8396 9.22656 15.3368V18.7287H7.07344ZM16.9479 22.3348C16.8158 22.4279 16.6635 22.4651 16.5137 22.4403L16.0186 22.3658L15.9475 22.9678C15.8104 24.144 14.9725 25.0315 14 25.0315C13.0275 25.0315 12.1896 24.144 12.0525 22.9678L11.9814 22.3627L11.4863 22.4403C11.3358 22.4622 11.1835 22.4241 11.0521 22.3317C10.8312 22.1765 10.6941 21.8879 10.6941 21.5745C10.6941 21.2455 10.8439 20.9724 11.0648 20.8359H16.9377C17.1611 20.9755 17.3084 21.2486 17.3084 21.5745C17.3059 21.891 17.1687 22.1827 16.9479 22.3348ZM12.7812 10.4119C12.7813 10.807 12.9097 11.1858 13.1382 11.4652C13.3668 11.7445 13.6768 11.9015 14 11.9015C14.3232 11.9015 14.6332 11.7445 14.8618 11.4652C15.0903 11.1858 15.2188 10.807 15.2188 10.4119C15.2188 10.0168 15.0903 9.63795 14.8618 9.3586C14.6332 9.07925 14.3232 8.92231 14 8.92231C13.6768 8.92231 13.3668 9.07925 13.1382 9.3586C12.9097 9.63795 12.7813 10.0168 12.7812 10.4119Z"
        fill={color}
      />
    </Svg>
  );
};