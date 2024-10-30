import Svg, { Path } from 'react-native-svg';

export const ThrophyIcon = ({ color }: { color: string }) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 4H18V3C18 2.73478 17.8946 2.48043 17.7071 2.29289C17.5196 2.10536 17.2652 2 17 2H7C6.73478 2 6.48043 2.10536 6.29289 2.29289C6.10536 2.48043 6 2.73478 6 3V4H3C2.73478 4 2.48043 4.10536 2.29289 4.29289C2.10536 4.48043 2 4.73478 2 5V8C2 9.06087 2.42143 10.0783 3.17157 10.8284C3.92172 11.5786 4.93913 12 6 12H7.54C8.44453 13.0091 9.66406 13.6824 11 13.91V16H10C9.20435 16 8.44129 16.3161 7.87868 16.8787C7.31607 17.4413 7 18.2044 7 19V21C7 21.2652 7.10536 21.5196 7.29289 21.7071C7.48043 21.8946 7.73478 22 8 22H16C16.2652 22 16.5196 21.8946 16.7071 21.7071C16.8946 21.5196 17 21.2652 17 21V19C17 18.2044 16.6839 17.4413 16.1213 16.8787C15.5587 16.3161 14.7956 16 14 16H13V13.91C14.3359 13.6824 15.5555 13.0091 16.46 12H18C19.0609 12 20.0783 11.5786 20.8284 10.8284C21.5786 10.0783 22 9.06087 22 8V5C22 4.73478 21.8946 4.48043 21.7071 4.29289C21.5196 4.10536 21.2652 4 21 4ZM6 10C5.46957 10 4.96086 9.78929 4.58579 9.41421C4.21071 9.03914 4 8.53043 4 8V6H6V8C6.0022 8.68171 6.12056 9.35806 6.35 10H6ZM14 18C14.2652 18 14.5196 18.1054 14.7071 18.2929C14.8946 18.4804 15 18.7348 15 19V20H9V19C9 18.7348 9.10536 18.4804 9.29289 18.2929C9.48043 18.1054 9.73478 18 10 18H14ZM16 8C16 9.06087 15.5786 10.0783 14.8284 10.8284C14.0783 11.5786 13.0609 12 12 12C10.9391 12 9.92172 11.5786 9.17157 10.8284C8.42143 10.0783 8 9.06087 8 8V4H16V8ZM20 8C20 8.53043 19.7893 9.03914 19.4142 9.41421C19.0391 9.78929 18.5304 10 18 10H17.65C17.8794 9.35806 17.9978 8.68171 18 8V6H20V8Z"
        fill={color}
      />
    </Svg>
  );
};
