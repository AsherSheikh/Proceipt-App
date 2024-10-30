import { StyleSheet } from 'react-native';
import { styleSheetFactory } from 'theme';

const styles = styleSheetFactory(theme =>
  StyleSheet.create({
    container: {
      width: '100%',
      zIndex: 1,
    },
    countryCode: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.medium,
      marginRight: theme.spacing.sm,
    },
    disabledInputContainer: {
      backgroundColor: theme.colors.input.disabled,
    },
    disabledSelectInputContainer: {
      backgroundColor: theme.colors.input.disabled,
    },
    errorInfo: {
      color: theme.colors.error.primary,
    },
    errorInputContainer: {
      borderColor: theme.colors.error.primary,
      borderWidth: 2,
    },
    errorOutline: {
      borderColor: theme.colors.error.light,
      borderWidth: 1.5,
    },
    errorSelectInputContainer: {
      borderColor: theme.colors.error.primary,
      borderWidth: 2,
    },
    focusedInputContainer: {
      borderColor: theme.colors.text.primary,
    },
    focusedOutline: {
      borderColor: theme.colors.input.primary_50,
    },
    focusedSelectInputContainer: {
      borderColor: theme.colors.input.primary_100,
    },
    info: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.medium,
      marginLeft: theme.spacing.xs,
      marginTop: theme.spacing.xs,
    },
    input: {
      alignItems: 'flex-start',
      color: theme.colors.text.primary,
      fontFamily: theme.font.medium,
      height: 50,
      justifyContent: 'center',
      width: '90%',
    },
    inputContainer: {
      alignItems: 'center',
      backgroundColor: theme.colors.input.background,
      borderColor: theme.colors.input.outline,
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      overflow: 'hidden',
      paddingHorizontal: theme.spacing.sm,
    },
    label: {
      color: theme.colors.input.label,
      fontFamily: theme.font.medium,
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 17,
      marginBottom: 8,
      marginLeft: theme.spacing.xs,
    },
    outline: {
      borderRadius: 10,
      borderWidth: 0,
    },
    placeholder: {
      color: theme.colors.placeholder,
      fontFamily: theme.font.regular,
    },
    searchContainer: {
      backgroundColor: theme.colors.input.background,
      maxHeight: 250,
      width: '100%',
    },
    searchIconContainer: {
      alignItems: 'center',
      height: 32,
      justifyContent: 'center',
      width: 32,
    },
    searchInput: {
      fontFamily: theme.font.regular,
      height: 40,
      width: '90%',
    },
    searchInputContainer: {
      alignItems: 'center',
      borderBottomColor: theme.colors.grey.light,
      borderBottomWidth: 0.5,
      flexDirection: 'row',
    },
    selectContainer: {
      backgoundColor: theme.colors.input.background,
      borderColor: theme.colors.input.outline,
      borderRadius: 15,
      borderWidth: 1,
      justifyContent: 'space-between',
      overflow: 'hidden',
    },
    selectInput: {
      alignItems: 'center',
      backgroundColor: theme.colors.input.background,
      flexDirection: 'row',
      height: 50,
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      paddingRight: 15,
    },
    selectInputContainer: {
      position: 'relative',
      width: '100%',
    },
    selectItem: {
      alignItems: 'center',
      color: theme.colors.text.primary,
      flexDirection: 'row',
      height: 50,
      paddingHorizontal: '3%',
    },
    selectItemText: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.regular,
      fontSize: 14,
    },
    selectValue: {
      alignItems: 'center',
      color: theme.colors.text.primary,
      fontFamily: theme.font.regular,
      justifyContent: 'center',
      marginTop: 5,
      width: '100%',
    },
    selectedItem: {
      backgroundColor: theme.colors.input.primary_50,
    },
  }),
);

export default styles;
