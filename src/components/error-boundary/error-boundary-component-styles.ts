import { StyleSheet } from 'react-native';
import spacing from 'theme/spacing';
import { styleSheetFactory } from 'theme';

const styles = styleSheetFactory(theme =>
  StyleSheet.create({
    bottom: {
      alignItems: 'center',
      flex: 1,
    },
    container: {
      flex: 1,
      padding: '4%',
      backgroundColor: '#fff',
    },
    footer: {
      alignSelf: 'center',
      bottom: spacing.xl,
      position: 'absolute',
      width: '100%',
    },
    subtitle: {
      color: theme.colors.text.dark,
      fontSize: 14,
    },
    title: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.regular,
      fontSize: 36,
    },
    top: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
  }),
);

export default styles;
