import { yupResolver } from '@hookform/resolvers/yup';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import React, { useEffect, useState } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AuthStackParameterList } from 'navigation/navigator';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { Controller, useForm } from 'react-hook-form';
import { TextInput } from 'react-native-gesture-handler';
import { styleSheetFactory, useTheme } from 'theme';
import { GoogleIcon } from 'assets/svg/google';
import { getFbError } from 'utils/get-fb-error';
import * as yup from 'yup';
import { useKeyboard } from 'hooks/use-keyboard';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { AppleIcon } from 'assets/svg/apple';
import { LeftArrow } from 'assets/svg/left-arrow';
import {
  useOnboardUserMutation,
  useReadUserEmailMutation,
} from 'features/authentication/authentication-reducer';
import EyeIcon from '../../assets/svg/eye';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const schema = yup.object({
  email: yup.string().required('Email is required'),
  password: yup.string().required('Password is required'),
});

const LoginScreen = () => {
  const [styles] = useTheme(Styles);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [getUserEmail, { isError }] = useReadUserEmailMutation();
  const insets = useSafeAreaInsets();

  const [onboard, {}] = useOnboardUserMutation();

  const { keyboardShown } = useKeyboard();

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId:
        '236766359073-13eqlhfbn46ncd0j81eeh2f7om1d9vdo.apps.googleusercontent.com',
      webClientId:
        '236766359073-fb465bk6unqb4raj69c3hjldo9frn79c.apps.googleusercontent.com',
    });
  }, []);

  const { navigate } = useNavigation<NavigationProp<AuthStackParameterList>>();

  async function onAppleButtonPress() {
    try {
      setLoading(true);
      // Start the sign-in request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // Ensure Apple returned a user identityToken
      if (!appleAuthRequestResponse.identityToken) {
        Alert.alert('Apple', 'Sign in with apple failed');
        setLoading(false);
      }

      // Create a Firebase credential from the response
      const { identityToken, nonce, fullName } = appleAuthRequestResponse;
      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce,
      );

      await auth().signInWithCredential(appleCredential);
      await auth().currentUser?.updateProfile({
        displayName: fullName?.givenName || fullName?.middleName || 'User',
      });
      await onboard({
        username: fullName?.givenName || fullName?.middleName || 'User',
        country: 'United Kingdom',
      }).unwrap();
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  async function onGoogleButtonPress() {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const credential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(credential);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('user cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('operation (e.g. sign in) is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('play services not available or outdated');
      } else {
        console.log(error);
      }
    }
  }

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
      password: '',
      request: '',
    },
  });

  async function loginWithEmailAndPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    try {
      setLoading(true);
      const regexp =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      const result = regexp.test(email);

      if (result) {
        await auth().signInWithEmailAndPassword(email, password);
      } else {
        const response = await getUserEmail({
          username: email.toLowerCase(),
        }).unwrap();
        await auth().signInWithEmailAndPassword(response.email, password);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);

      error?.code &&
        setError('request', {
          type: 'manual',
          message: getFbError(error.code),
        });
      console.log(error.code);
    }
  }

  useEffect(() => {
    if (isError) {
      setError('request', {
        type: 'manual',
        message: 'Username or password is incorrect',
      });
    }
  }, [isError, setError]);

  const navigateToSignup = () => navigate('Signup');
  const navigateToForgotPassword = () => navigate('ForgotPassword');

  const { goBack } = useNavigation();

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle={'dark-content'} />
      <View style={styles.wrapper}>
        <Pressable onPress={goBack} style={styles.goBackButton}>
          <LeftArrow />
        </Pressable>
        <Text style={styles.title}>Welcome 👋</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

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
                  placeholder="Email or username"
                  keyboardType="email-address"
                  onBlur={onBlur}
                  onChangeText={x => onChange(x.trim())}
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

          <Controller
            control={control}
            rules={{
              maxLength: 100,
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  placeholderTextColor="#999"
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  style={[
                    styles.input,
                    {
                      paddingRight: 30,
                    },
                  ]}
                />
                <TouchableOpacity
                  style={styles.eye}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <EyeIcon showPassword={showPassword} />
                </TouchableOpacity>
              </View>
            )}
            name="password"
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password.message}</Text>
          )}

          {errors.request && (
            <Text style={styles.errorText}>{errors?.request?.message}</Text>
          )}

          <Pressable
            style={styles.button}
            onPress={handleSubmit(loginWithEmailAndPassword)}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </Pressable>

          <Pressable onPress={navigateToSignup} style={styles.forgotPassword}>
            <Text style={styles.footerText}>
              Don’t have an account yet?{'  '}
              <Text style={styles.footerTextHighlight}>Sign up</Text>
            </Text>
          </Pressable>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <View style={styles.continueContainer}>
            <Text style={styles.continueText}>or continue with</Text>
          </View>
        </View>

        <View style={styles.socialContainer}>
          <Pressable onPress={onGoogleButtonPress} style={styles.iconButton}>
            <GoogleIcon />
          </Pressable>
          {Platform.OS === 'ios' && (
            <Pressable onPress={onAppleButtonPress} style={styles.iconButton}>
              <AppleIcon />
            </Pressable>
          )}
        </View>
        {!keyboardShown && (
          <Pressable style={styles.footer} onPress={navigateToForgotPassword}>
            <Text style={styles.footerTextHighlight}>Forgot Password</Text>
          </Pressable>
        )}
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
      justifyContent: 'center',
      flexDirection: 'row',
    },
    footer: {
      position: 'absolute',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      bottom: 15,
      textAlign: 'center',
      alignSelf: 'center',
    },
    footerText: {
      fontSize: 14,
      color: theme.colors.text.dark,
      fontFamily: theme.font.medium,
      textAlign: 'center',
    },
    footerTextHighlight: {
      fontSize: 14,
      color: theme.colors.text.main,
      fontFamily: theme.font.medium,
      textAlign: 'center',
    },
    iconButton: {
      width: 55,
      height: 55,
      borderColor: theme.colors.input.outline,
      borderRadius: 15,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
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
    },
    subtitle: {
      fontWeight: '500',
      fontFamily: theme.font.regular,
      color: theme.colors.text.dark,
      fontSize: 15,
      marginTop: theme.spacing.xxs,
      marginBottom: theme.spacing.xl,
    },
    input: {
      fontFamily: theme.font.medium,
      fontSize: 13,
      height: 50,
      color: '#000',
    },
    inputContainer: {
      paddingVertical:
        Platform.OS === 'ios' ? theme.spacing.xxxs : theme.spacing.xxxs,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderRadius: 14,
      borderColor: theme.colors.input.outline,
      backgroundColor: theme.colors.input.background,
      marginTop: theme.spacing.lg,
      position: 'relative',
    },
    eye: {
      position: 'absolute',
      right: 10,
      top: 15,
    },
    button: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.button.background,
      color: theme.colors.button.color,
      borderRadius: 14,
      minHeight: 55,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing.lg,
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
    forgotPassword: {
      width: '100%',
      alignItems: 'center',
      marginTop: theme.spacing.lg,
    },
  }),
);

export default LoginScreen;
