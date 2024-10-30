import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TextInput } from 'react-native-gesture-handler';
import { styleSheetFactory, useTheme } from 'theme';
import { LeftArrow } from 'assets/svg/left-arrow';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useOnboardUserMutation } from 'features/authentication/authentication-reducer';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { CountryList } from 'components/country/country-list';
import {
  setIsAuthenticated,
  setOnboarded,
} from 'features/profile/profile-reducer';
import auth from '@react-native-firebase/auth';
import { useDispatch } from 'react-redux';
import { apiSlice } from 'features/api/api-slice';

const schema = yup.object({
  username: yup.string().required('Full name is required'),
});

const OnboardScreen = () => {
  const [styles] = useTheme(Styles);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const dispatch = useDispatch();

  const [artificialLoading, setArtificialLoading] = useState(true);

  const snapPoints = useMemo(() => ['75%'], []);

  const [country, setCountry] = useState<{
    name: string;
    dial_code: string;
    flag: string;
  } | null>(null);

  const [onboard, { isLoading, error: apiError }] = useOnboardUserMutation();

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
      username: auth().currentUser?.displayName || '',
      request: '',
    },
  });

  async function onboardUser({ username }: { username: string }) {
    try {
      await onboard({
        username,
        country: country?.name,
      }).unwrap();
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }

  useEffect(() => {
    bottomSheetRef?.current?.close();
  }, []);
  useEffect(() => {
    // set time out for 3 seconds and turn off artificial loading
    const timer = setTimeout(() => {
      setArtificialLoading(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const _handlePressButtonAsync = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const onLogout = async () => {
    await auth().signOut();
    dispatch(setIsAuthenticated(false));
    dispatch(setOnboarded(false));
    dispatch(
      apiSlice.util.invalidateTags([
        'User',
        'Folder',
        'Receipt',
        'ReceiptHistory',
      ]),
    );
  };

  if (artificialLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        />
        <View style={styles.wrapper}>
          <Pressable onPress={onLogout} style={styles.goBackButton}>
            <LeftArrow />
          </Pressable>
          <Text style={styles.title}>Complete your details</Text>
          <Text style={styles.subtitle}>
            Almost done, just a few more details to get started
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
                      onChangeText={x => onChange(x)}
                      value={value}
                      style={styles.input}
                    />
                  </View>
                )}
                name="username"
              />
              {errors.username && (
                <Text style={styles.errorText}>{errors.username.message}</Text>
              )}

              <Pressable
                onPress={() => bottomSheetRef.current?.present()}
                style={styles.inputContainer}
              >
                {country ? (
                  <Text style={styles.inputStarter}>{country.name}</Text>
                ) : (
                  <Text style={{ color: '#999' }}>Choose country</Text>
                )}
              </Pressable>

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
                  {apiError.data.message ?? ''}
                </Text>
              )}

              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit(onboardUser)}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Finish setup</Text>
                )}
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
      marginBottom: theme.spacing.md,
    },
    input: {
      fontFamily: theme.font.medium,
      fontSize: 13,
      width: '80%',
      color: '#000',
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
    inputStarter: {
      fontSize: 14,
      fontFamily: theme.font.regular,
      color: theme.colors.text.primary,
    },
  }),
);

export default OnboardScreen;
