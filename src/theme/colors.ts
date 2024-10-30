import { Appearance } from 'react-native';

const colorScheme = Appearance.getColorScheme();

export const LightColor = {
  error: {
    primary: '#FF4B55',
    light: 'rgba(255, 75, 85, 0.16)',
  },
  success: {
    primary: '#02BA6D',
    light: 'rgba(2, 186, 109,0.08)',
  },
  input: {
    background: '#fff',
    outline: '#ebebeb',
    label: '#2E2E2E',
    disabled: '#ebebeb',
    primary_100: '#EBB908',
    primary_50: 'rgba(217, 171, 8, 0.2)',
  },
  banner: '#B3B3B3',
  placeholder: '#999',
  pending: {
    primary: '#F79E1B',
    light: 'rgba(247, 158, 27, 0.08)',
  },
  background: {
    primary: '#fff',
    alt: '#000F48',
  },
  text: {
    primary: '#000',
    main: '#000F48',
    darkGrey: '#111111',
    dark: '#6c6c6c',
    alt: '#fff',
    white: '#fff',
    light: '#BBC4C9',
  },
  card: {
    outline: '#D9D9D9',
    background: '#fff',
  },
  divider: '#D9D9D9',
  button: {
    background: '#000F48',
    color: '#fff',
  },
  statusbar: {
    primary: '#000',
  },
  grey: {
    lighter: '#EBEBEB',
    light: '#CBCFD6',
    dark: '#6c6c6c',
    darker: '#C0C0C0',
    darkest: '#F8F8F8',
  },
  icon: {
    background: 'rgba(0, 104, 252, 0.06)',
  },
  switch: {
    active: '#000F48',
    thumb: '#fff',
    inactive: '#CBCFD6',
  },
};

const Theme = colorScheme === 'light' ? LightColor : LightColor;

export default Theme;
