import {
  ActivityIndicator,
  Linking,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import auth from '@react-native-firebase/auth';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TextInput } from 'react-native-gesture-handler';
import { styleSheetFactory, useTheme } from 'theme';
import { LeftArrow } from 'assets/svg/left-arrow';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSignupUserMutation } from 'features/authentication/authentication-reducer';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { CountryList } from 'components/country/country-list';
import EyeIcon from '../../assets/svg/eye';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const schema = yup.object({
  email: yup.string().email('Email is invalid').required('Email is required'),
  name: yup.string().required('Fullname is required'),
  password: yup
    .string()
    .required('signup.password-required')
    .min(8, 'Password too short'),
});

const SignupScreen = () => {
  const [styles] = useTheme(Styles);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showLogginInLoader, setLogginInLoader] = useState(false);
  const insets = useSafeAreaInsets();

  const snapPoints = useMemo(() => ['75%'], []);

  const [country, setCountry] = useState<{
    name: string;
    dial_code: string;
    flag: string;
  } | null>(null);

  const [signup, { isLoading, error: apiError }] = useSignupUserMutation();

  const { goBack } = useNavigation();

  const renderBackdrop: React.FC<BottomSheetBackdropProps> = props => {
    return (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    );
  };

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      request: '',
    },
  });

  async function signupWithEmailAndPassword({
    email,
    name,
    password,
  }: {
    email: string;
    name: string;
    password: string;
  }) {
    try {
      setLogginInLoader(true);
      await signup({
        email: email.toLowerCase(),
        name,
        password,
        country: country?.name,
      }).unwrap();
      await auth().signInWithEmailAndPassword(email, password);
      setLogginInLoader(false);
      // navigate('VerifyAccount', { email });
    } catch (error) {
      console.log(JSON.stringify(error));
    } finally {
      setLogginInLoader(false);
    }
  }

  useEffect(() => {
    bottomSheetRef?.current?.close();
  }, []);

  const _handlePressButtonAsync = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle={'dark-content'} />
        <View style={styles.wrapper}>
          <Pressable onPress={goBack} style={styles.goBackButton}>
            <LeftArrow />
          </Pressable>
          <Text style={styles.title}>Create Account ✍</Text>
          <Text style={styles.subtitle}>
            Get ready to manage your receipts and send invoices
          </Text>

          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            enableOnAndroid
            extraScrollHeight={55}
          >
            <View>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <TextInput
                      placeholderTextColor="#999"
                      placeholder="Full name"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      style={styles.input}
                    />
                  </View>
                )}
                name="name"
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name.message}</Text>
              )}

              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <TextInput
                      placeholderTextColor="#999"
                      placeholder="Email"
                      keyboardType={'email-address'}
                      onBlur={onBlur}
                      onChangeText={text => onChange(text.trim().toLowerCase())}
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

              <Pressable
                onPress={() => bottomSheetRef.current?.present()}
                style={styles.inputContainer}
              >
                {country ? (
                  <Text style={styles.inputStarter}>{country.name}</Text>
                ) : (
                  <Text>Choose country</Text>
                )}
              </Pressable>

              <Controller
                control={control}
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
              <View style={styles.passwordCriteria}>
                <Text style={styles.passwordCriteriaText}>
                  At least 6 characters
                </Text>
              </View>

              {errors.request && <Text>{errors?.request?.message}</Text>}

              <View>
                <Text style={styles.privacy}>
                  By creating account, you agree to our{' '}
                  <Text
                    onPress={() =>
                      _handlePressButtonAsync(
                        'https://proceipt.com/privacy-policy',
                      )
                    }
                    style={styles.privacyMain}
                  >
                    Privacy Policy{' '}
                  </Text>
                  and{' '}
                  <Text
                    onPress={() =>
                      _handlePressButtonAsync('https://proceipt.com/terms')
                    }
                    style={styles.privacyMain}
                  >
                    Terms of Service
                  </Text>
                </Text>
              </View>

              {apiError && (
                <Text style={styles.errorText}>
                  {/** @ts-ignore */}
                  {apiError?.data?.message ??
                    'Something went wrong. Please try again'}
                </Text>
              )}

              <Pressable
                style={styles.button}
                onPress={handleSubmit(signupWithEmailAndPassword)}
              >
                {isLoading || showLogginInLoader ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </Pressable>
              <TouchableOpacity
                style={{
                  marginVertical: 10,
                }}
                onPress={() => {
                  //   Open link in external browser
                  Linking.openURL('https://proceipt.com')
                    .then(_ => {})
                    .catch(e => {
                      console.log(e);
                    });
                }}
              >
                <Text
                  style={{
                    fontSize: 17,
                    textAlign: 'center',
                  }}
                >
                  Check Proceipt for{' '}
                  <Text
                    style={{
                      textDecorationLine: 'underline',
                      fontWeight: 'bold',
                    }}
                  >
                    Organisations
                  </Text>{' '}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          animateOnMount={true}
          backdropComponent={renderBackdrop}
        >
          <CountryList
            onItemPress={item => {
              setCountry(item);
              bottomSheetRef?.current?.close();
            }}
          />
        </BottomSheetModal>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
};

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    criteriaError: {
      color: theme.colors.error.primary,
    },
    criteriaValid: {
      color: theme.colors.success.primary,
    },
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
      marginBottom: theme.spacing.sm,
    },
    input: {
      fontFamily: theme.font.medium,
      fontSize: 13,
      width: '80%',
      color: '#000',
    },
    inputStarter: {
      fontFamily: theme.font.medium,
      fontSize: 13,
      color: theme.colors.text.primary,
    },
    inputContainer: {
      paddingVertical: theme.spacing.xxxs,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderRadius: 14,
      borderColor: theme.colors.input.outline,
      backgroundColor: theme.colors.input.background,
      marginTop: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      height: 50,
      position: 'relative',
    },
    eye: {
      position: 'absolute',
      right: 10,
      top: 10,
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
    passwordCriteria: {
      marginLeft: theme.spacing.xs,
      marginTop: theme.spacing.sm,
    },
    passwordCriteriaText: {
      color: '#999',
      fontFamily: theme.font.regular,
      fontSize: 13,
    },
  }),
);

export default SignupScreen;
