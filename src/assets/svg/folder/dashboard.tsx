import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const DashboardIcon = ({ color }: { color: string }) => {
  return (
    <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <Path
        d="M25.2875 10.5438C24.6726 9.08827 23.7811 7.76592 22.6625 6.65C21.5466 5.53139 20.2242 4.63992 18.7688 4.025C17.2566 3.38516 15.6543 3.0625 14 3.0625C12.3457 3.0625 10.7434 3.38516 9.23125 4.025C7.77577 4.63992 6.45342 5.53139 5.3375 6.65C4.21889 7.76592 3.32742 9.08827 2.7125 10.5438C2.07266 12.0559 1.75 13.6582 1.75 15.3125C1.75 18.941 3.34414 22.359 6.12227 24.6941L6.16875 24.7324C6.32734 24.8637 6.52695 24.9375 6.73203 24.9375H21.2707C21.4758 24.9375 21.6754 24.8637 21.834 24.7324L21.8805 24.6941C24.6559 22.359 26.25 18.941 26.25 15.3125C26.25 13.6582 25.9246 12.0559 25.2875 10.5438ZM20.8195 22.8594H7.18047C6.1239 21.9067 5.27944 20.7425 4.70191 19.4424C4.12438 18.1422 3.82668 16.7352 3.82812 15.3125C3.82812 12.5945 4.88633 10.0406 6.80859 8.12109C8.73086 6.19883 11.2848 5.14062 14 5.14062C16.718 5.14062 19.2719 6.19883 21.1914 8.12109C23.1137 10.0434 24.1719 12.5973 24.1719 15.3125C24.1719 18.2 22.9551 20.9316 20.8195 22.8594ZM17.0488 11.5254C17.0077 11.4847 16.9522 11.4618 16.8943 11.4618C16.8365 11.4618 16.781 11.4847 16.7398 11.5254L14.4293 13.8359C13.918 13.6992 13.352 13.8305 12.95 14.2324C12.8076 14.3745 12.6947 14.5433 12.6176 14.7291C12.5406 14.9149 12.5009 15.1141 12.5009 15.3152C12.5009 15.5164 12.5406 15.7156 12.6176 15.9014C12.6947 16.0872 12.8076 16.2559 12.95 16.398C13.0921 16.5404 13.2609 16.6534 13.4467 16.7304C13.6325 16.8075 13.8317 16.8472 14.0328 16.8472C14.234 16.8472 14.4331 16.8075 14.6189 16.7304C14.8047 16.6534 14.9735 16.5404 15.1156 16.398C15.3061 16.2082 15.443 15.9714 15.5126 15.7117C15.5822 15.4519 15.5821 15.1784 15.5121 14.9187L17.8227 12.6082C17.9074 12.5234 17.9074 12.384 17.8227 12.2992L17.0488 11.5254ZM13.3984 8.75H14.6016C14.7219 8.75 14.8203 8.65156 14.8203 8.53125V6.34375C14.8203 6.22344 14.7219 6.125 14.6016 6.125H13.3984C13.2781 6.125 13.1797 6.22344 13.1797 6.34375V8.53125C13.1797 8.65156 13.2781 8.75 13.3984 8.75ZM20.5078 14.7109V15.9141C20.5078 16.0344 20.6063 16.1328 20.7266 16.1328H22.9141C23.0344 16.1328 23.1328 16.0344 23.1328 15.9141V14.7109C23.1328 14.5906 23.0344 14.4922 22.9141 14.4922H20.7266C20.6063 14.4922 20.5078 14.5906 20.5078 14.7109ZM20.8551 9.31875L20.0047 8.46836C19.9636 8.42765 19.9081 8.40481 19.8502 8.40481C19.7923 8.40481 19.7368 8.42765 19.6957 8.46836L18.148 10.016C18.1073 10.0571 18.0845 10.1126 18.0845 10.1705C18.0845 10.2284 18.1073 10.2839 18.148 10.325L18.9984 11.1754C19.0832 11.2602 19.2227 11.2602 19.3074 11.1754L20.8551 9.62773C20.9398 9.54297 20.9398 9.40352 20.8551 9.31875ZM8.31523 8.46836C8.27412 8.42765 8.2186 8.40481 8.16074 8.40481C8.10288 8.40481 8.04736 8.42765 8.00625 8.46836L7.15586 9.31875C7.11515 9.35986 7.09231 9.41538 7.09231 9.47324C7.09231 9.5311 7.11515 9.58662 7.15586 9.62773L8.70352 11.1754C8.78828 11.2602 8.92773 11.2602 9.0125 11.1754L9.86289 10.325C9.94766 10.2402 9.94766 10.1008 9.86289 10.016L8.31523 8.46836ZM7.16406 14.4922H4.97656C4.85625 14.4922 4.75781 14.5906 4.75781 14.7109V15.9141C4.75781 16.0344 4.85625 16.1328 4.97656 16.1328H7.16406C7.28438 16.1328 7.38281 16.0344 7.38281 15.9141V14.7109C7.38281 14.5906 7.28438 14.4922 7.16406 14.4922Z"
        fill={color}
      />
    </Svg>
  );
};