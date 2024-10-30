import { StyleSheet } from 'react-native';
import { styleSheetFactory } from 'theme';

const styles = styleSheetFactory(theme =>
  StyleSheet.create({
    bare: {
      borderWidth: 0,
    },
    container: {
      alignItems: 'center',
      backgroundColor: theme.colors.button.background,
      borderRadius: 12,
      height: 50,
      justifyContent: 'center',
      overflow: 'hidden',
      width: '100%',
    },
    disabled: {
      backgroundColor: theme.colors.card.outline,
      borderWidth: 0,
    },
    googleButton: {
      alignItems: 'center',
      borderColor: theme.colors.card.outline,
      borderRadius: 8,
      borderWidth: 2,
      flexDirection: 'row',
      height: 50,
      justifyContent: 'center',
      width: '100%',
    },
    outline: {
      borderWidth: 2,
    },
    primary: {
      backgroundColor: '#000F48',
    },
    secondary: {
      backgroundColor: theme.colors.background.alt,
    },
    text: {
      color: theme.colors.text.alt,
      fontFamily: theme.font.medium,
      fontSize: 15,
    },
    textBare: {
      color: '#fff',
    },
  }),
);

export default styles;
