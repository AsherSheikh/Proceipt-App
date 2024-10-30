import useDarkMode from 'hooks/use-dark-mode';

import { registerThemes, useTheme } from './config';

import { LightColor } from './colors';
import font from './fonts';
import spacing from './spacing';

const styleSheetFactory = registerThemes(
  {
    light: { colors: LightColor, spacing, font },
    dark: { colors: LightColor, spacing, font },
  },
  () => {
    const colorScheme = useDarkMode();
    return colorScheme === 'light' ? 'light' : 'light';
  },
);

const theme = { colors: LightColor, spacing, font };

export { styleSheetFactory, theme, useTheme };
