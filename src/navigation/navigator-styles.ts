import { StyleSheet } from 'react-native';
import { styleSheetFactory } from 'theme';

const styles = styleSheetFactory(theme =>
  StyleSheet.create({
    background: {
      backgroundColor: theme.colors.background.primary,
      flex: 1,
    },
  }),
);

export default styles;
