import { yupResolver } from '@hookform/resolvers/yup';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import React, { useState } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AuthStackParameterList } from 'navigation/navigator';
import { Controller, useForm } from 'react-hook-form';
import { TextInput } from 'react-native-gesture-handler';
import { styleSheetFactory, useTheme } from 'theme';
import { LeftArrow } from 'assets/svg/left-arrow';
import { getFbError } from 'utils/get-fb-error';
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email('Email is invalid').required('Email is required'),
});

const ForgotPasswordScreen = () => {
  const [styles] = useTheme(Styles);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { goBack } = useNavigation<NavigationProp<AuthStackParameterList>>();

  const {
    control,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      request: '',
    },
  });

  async function sendResetMail({ email }: { email: string }) {
    try {
      setLoading(true);
      await auth().sendPasswordResetEmail(email);
      setLoading(false);
      setSuccess(true);
    } catch (error) {
      setLoading(false);
      setSuccess(false);
      setError('request', { type: 'manual', message: getFbError(error.code) });
      console.log(error.code);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
      />
      <View style={styles.wrapper}>
        <Pressable onPress={goBack} style={styles.goBackButton}>
          <LeftArrow />
        </Pressable>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          We will send you a reset link in your email
        </Text>

        <View>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  placeholderTextColor="#999"
                  placeholder="Email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  style={styles.input}
                />
              </View>
            )}
            name="email"
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email.message}</Text>
          )}

          {errors.request && (
            <Text style={styles.errorText}>{errors?.request?.message}</Text>
          )}
          {success && (
            <Text style={styles.successText}>
              Password reset sent succesfully. Please check your email
            </Text>
          )}

          <Pressable
            style={styles.button}
            onPress={handleSubmit(sendResetMail)}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Email</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    goBackButton: {
      marginBottom: theme.spacing.xl,
    },
    socialContainer: {
      marginVertical: theme.spacing.lg,
      alignItems: 'center',
    },
    footer: {
      position: 'absolute',
      width: '100%',
      alignItems: 'center',
      bottom: 15,
    },
    footerText: {
      fontSize: 14,
      color: theme.colors.text.dark,
      fontFamily: theme.font.medium,
    },
    footerTextHighlight: {
      fontSize: 14,
      color: theme.colors.text.main,
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
      fontWeight: '700',
      fontSize: 30,
      color: theme.colors.text.primary,
      fontFamily: theme.font.bold,
      marginTop: theme.spacing.xxxl,
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
      fontFamily: theme.font.medium,
      fontSize: 13,
      color: '#000',
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
    continueContainer: {
      backgroundColor: theme.colors.background.primary,
      paddingHorizontal: theme.spacing.md,
    },
    continueText: {
      fontFamily: theme.font.regular,
      fontSize: 13,
      color: theme.colors.text.dark,
    },
    divider: {
      position: 'absolute',
      width: '100%',
      height: 1,
      backgroundColor: theme.colors.divider,
    },
    dividerContainer: {
      position: 'relative',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.xxl,
    },
    errorText: {
      color: theme.colors.error.primary,
      fontFamily: theme.font.regular,
      fontSize: 12,
      marginTop: theme.spacing.xs,
      marginLeft: theme.spacing.xs,
    },
    successText: {
      color: '#02BA6D',
      fontFamily: theme.font.regular,
      fontSize: 12,
      marginTop: theme.spacing.xs,
      marginLeft: theme.spacing.xs,
    },
  }),
);

export default ForgotPasswordScreen;
