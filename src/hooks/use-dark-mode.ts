import { useColorScheme } from 'react-native';

const useDarkMode = () => {
  const colorScheme = useColorScheme();
  return colorScheme === 'light' ? 'light' : 'light';
};

export default useDarkMode;
