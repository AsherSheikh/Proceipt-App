import {
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import { styleSheetFactory, useTheme } from 'theme';
import { LeftArrow } from 'assets/svg/left-arrow';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AuthStackParameterList } from 'navigation/navigator';

export const VerifyAccountScreen = () => {
  const [styles] = useTheme(Styles);

  const { navigate } = useNavigation<NavigationProp<AuthStackParameterList>>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
      />
      <View style={styles.wrapper}>
        <Pressable style={styles.goBackButton}>
          <LeftArrow />
        </Pressable>
        <Text style={styles.title}>Signup Successful</Text>
        <Text style={styles.subtitle}>Please proceed to login</Text>

        <Pressable style={styles.button} onPress={() => navigate('Login')}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    phoneCode: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },
    privacy: {
      fontFamily: theme.font.regular,
      fontSize: 12,
      width: '85%',
      marginLeft: theme.spacing.sm,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      color: theme.colors.text.dark,
    },
    privacyMain: {
      color: theme.colors.text.main,
    },
    goBackButton: {
      marginBottom: theme.spacing.xl,
    },
    socialContainer: {
      marginVertical: theme.spacing.lg,
      alignItems: 'center',
    },
    iconButton: {
      width: 55,
      height: 55,
      borderColor: theme.colors.input.outline,
      borderRadius: 15,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    wrapper: {
      flex: 1,
      padding: '5%',
      paddingTop: theme.spacing.md,
      backgroundColor: theme.colors.background.primary,
    },
    title: {
      marginTop: theme.spacing.xxl,
      fontWeight: '700',
      fontSize: 30,
      color: theme.colors.text.primary,
      fontFamily: theme.font.bold,
    },
    subtitle: {
      fontWeight: '500',
      fontFamily: theme.font.regular,
      color: theme.colors.text.dark,
      fontSize: 15,
      marginTop: theme.spacing.xxs,
      marginBottom: theme.spacing.md,
    },
    input: {
      fontFamily: theme.font.regular,
      fontSize: 13,
      width: '80%',
    },
    inputContainer: {
      paddingVertical:
        Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.xxxs,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderRadius: 14,
      borderColor: theme.colors.input.outline,
      backgroundColor: theme.colors.input.background,
      marginTop: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
    },
    button: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.button.background,
      color: theme.colors.button.color,
      borderRadius: 14,
      minHeight: 55,
      width: '100%',
      marginTop: theme.spacing.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      fontFamily: theme.font.medium,
      color: theme.colors.button.color,
    },
    errorText: {
      color: theme.colors.error.primary,
      fontFamily: theme.font.regular,
      fontSize: 12,
      marginTop: theme.spacing.xs,
      marginLeft: theme.spacing.xs,
    },
  }),
);

export default VerifyAccountScreen;
