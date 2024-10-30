import Svg, { Path } from 'react-native-svg';

export const RocketIcon = ({ color }: { color: string }) => {
  return (
    <Svg width="26" height="28" viewBox="0 0 26 28" fill="none">
      <Path
        d="M21.9375 20.839C21.9375 17.3757 20.277 14.3841 17.875 12.9907V7.84546C17.875 7.37686 17.7404 6.92378 17.4916 6.5669L13.6221 0.959245C13.4596 0.723394 13.2285 0.605469 13 0.605469C12.7715 0.605469 12.5404 0.723394 12.3779 0.959245L8.5084 6.5669C8.26126 6.92451 8.12547 7.37736 8.125 7.84546V12.9907C5.72305 14.3841 4.0625 17.3757 4.0625 20.839H8.03613C7.97773 21.0624 7.94727 21.3045 7.94727 21.5776C7.94727 22.2634 8.14023 22.9337 8.49062 23.4644C8.77663 23.8984 9.15542 24.2271 9.58496 24.414C10.1715 26.0898 11.5045 27.1697 13 27.1697C13.7389 27.1697 14.4549 26.9028 15.0668 26.4001C15.666 25.9098 16.1307 25.2239 16.4125 24.414C16.8419 24.2282 17.2207 23.9006 17.5068 23.4675C17.8577 22.932 18.0493 22.2667 18.0502 21.5807C18.0502 21.32 18.0223 21.0717 17.9715 20.8421H21.9375V20.839ZM19.3553 17.2826C19.5939 17.7357 19.7869 18.2229 19.9266 18.7287H17.7734V15.3368C18.4069 15.8421 18.9459 16.5051 19.3553 17.2826ZM9.85156 12.9907V7.89201L13 3.33016L16.1484 7.89201V18.7287H9.85156V12.9907ZM6.07344 18.7287C6.21309 18.2229 6.40605 17.7357 6.64473 17.2826C7.05859 16.5006 7.59687 15.8396 8.22656 15.3368V18.7287H6.07344ZM15.9479 22.3348C15.8158 22.4279 15.6635 22.4651 15.5137 22.4403L15.0186 22.3658L14.9475 22.9678C14.8104 24.144 13.9725 25.0315 13 25.0315C12.0275 25.0315 11.1896 24.144 11.0525 22.9678L10.9814 22.3627L10.4863 22.4403C10.3358 22.4622 10.1835 22.4241 10.0521 22.3317C9.83125 22.1765 9.69414 21.8879 9.69414 21.5745C9.69414 21.2455 9.84395 20.9724 10.0648 20.8359H15.9377C16.1611 20.9755 16.3084 21.2486 16.3084 21.5745C16.3059 21.891 16.1687 22.1827 15.9479 22.3348ZM11.7812 10.4119C11.7812 10.807 11.9097 11.1858 12.1382 11.4652C12.3668 11.7445 12.6768 11.9015 13 11.9015C13.3232 11.9015 13.6332 11.7445 13.8618 11.4652C14.0903 11.1858 14.2188 10.807 14.2188 10.4119C14.2188 10.0168 14.0903 9.63795 13.8618 9.35859C13.6332 9.07924 13.3232 8.92231 13 8.92231C12.6768 8.92231 12.3668 9.07924 12.1382 9.35859C11.9097 9.63795 11.7812 10.0168 11.7812 10.4119Z"
        fill={color}
      />
    </Svg>
  );
};
