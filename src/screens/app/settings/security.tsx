import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { styleSheetFactory, useTheme } from 'theme';
import { LeftArrow } from 'assets/svg/left-arrow';
import { SearchIcon } from 'assets/svg/search';
import { ArrowRightIcon } from 'assets/svg/arrow-right';
import { useNavigation } from '@react-navigation/native';
import { yupResolver } from '@hookform/resolvers/yup';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import * as yup from 'yup';
import {
  LOWERCASE_REGEX,
  NUMBER_REGEX,
  SYMBOL_REGEX,
  UPPERCASE_REGEX,
} from 'utils/regex';
import { Controller, useForm } from 'react-hook-form';
import { getFbError } from 'utils/get-fb-error';
import { apiSlice } from 'features/api/api-slice';
import { useDispatch } from 'react-redux';
import { useDeleteUserMutation } from 'features/profile/profile-reducer';
import Spinner from 'components/spinner';
import Toast from 'react-native-toast-message';

const OPTIONS = [
  {
    title: 'Password',
    subtitle: 'Change your password',
    link: 'password',
  },
  {
    title: 'Delete my account',
    subtitle: 'Permanently delete account',
    link: 'delete',
  },
];

const schema = yup.object({
  newPassword: yup
    .string()
    .required('Password is required')
    .min(8, 'Password too short')
    .matches(LOWERCASE_REGEX, 'Must have at least one lowercase character')
    .matches(UPPERCASE_REGEX, 'Must have at least one uppercase character')
    .matches(NUMBER_REGEX, 'Must have at least one number')
    .matches(SYMBOL_REGEX, 'Must have have at least one symbol'),
  repeatNewPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Password does not match')
    .required('Password is required'),
  password: yup.string().required('Password is required'),
});

export default function SecuritySettingsScreen() {
  const dispatch = useDispatch();
  const [styles] = useTheme(Styles);
  const { goBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const [deleteAccountMutation, { isLoading: isDeleting, isError }] =
    useDeleteUserMutation();

  useEffect(() => {
    if (isError) {
      Toast.show({
        type: 'success',
        text1: 'Error',
        text2: 'Error extracting text from receipt',
      });
    }
  }, [isError]);

  const {
    control,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm({
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      password: '',
      newPassword: '',
      repeatNewPassword: '',
      request: '',
    },
  });

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} />
    ),
    [],
  );
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ['1%', '70%'], []);
  const onSubmit = async ({
    password,
    newPassword,
  }: {
    password: string;
    newPassword: string;
    repeatNewPassword: string;
  }) => {
    try {
      setIsLoading(true);

      const user = auth().currentUser;
      if (user?.email) {
        const cred = auth.EmailAuthProvider.credential(user.email, password);
        const authenticatedUser = await user.reauthenticateWithCredential(cred);
        await authenticatedUser.user.updatePassword(newPassword);
      }
      setIsLoading(false);
    } catch (error) {
      setError('request', { type: 'manual', message: getFbError(error.code) });
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    setIsLoading(true);
    try {
      await deleteAccountMutation('').unwrap();

      await auth().signOut();
      dispatch(
        apiSlice.util.invalidateTags([
          'User',
          'Folder',
          'Receipt',
          'ReceiptHistory',
        ]),
      );
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Pressable onPress={() => goBack()} style={styles.leftHeader}>
            <LeftArrow color="#333" />
            <Text style={styles.headerText}>Account & Security</Text>
          </Pressable>
          <Pressable>
            <SearchIcon />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollviewContent}
          style={styles.scrollview}
        >
          {OPTIONS.map(x => (
            <Pressable
              onPress={() => {
                x.link === 'password' && bottomSheetRef.current?.snapToIndex(1);
                x.link === 'delete' &&
                  Alert.alert(
                    'Delete Account',
                    'Are you sure you want to delete your account?',
                    [
                      {
                        text: 'Cancel',
                        onPress: () => {},
                        style: 'cancel',
                      },
                      { text: 'OK', onPress: () => deleteAccount() },
                    ],
                  );
              }}
              key={x.title}
              style={styles.item}
            >
              <View>
                <Text style={styles.itemTitle}>{x.title}</Text>
                <Text style={styles.itemSubtitle}>{x.subtitle}</Text>
              </View>
              <View style={styles.iconButton}>
                <ArrowRightIcon color="#5b5b5b" />
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <BottomSheet
          backgroundComponent={renderBackdrop}
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          style={styles.background}
        >
          <BottomSheetScrollView contentContainerStyle={styles.innerView}>
            <Text style={styles.label}>Old Password</Text>

            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <BottomSheetTextInput
                    placeholderTextColor="#999"
                    placeholder="Old Password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    style={styles.input}
                  />
                </View>
              )}
              name="password"
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}

            <Text style={styles.label}>New Password</Text>

            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <BottomSheetTextInput
                    placeholderTextColor="#999"
                    placeholder="New Password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    style={styles.input}
                  />
                </View>
              )}
              name="newPassword"
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}

            <Text style={styles.label}>Re-enter New Password</Text>

            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <BottomSheetTextInput
                    placeholderTextColor="#999"
                    placeholder="New Password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    style={styles.input}
                  />
                </View>
              )}
              name="repeatNewPassword"
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}

            {errors.request && (
              <Text style={styles.errorText}>{errors.request.message}</Text>
            )}

            <Pressable style={styles.button} onPress={handleSubmit(onSubmit)}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Save</Text>
              )}
            </Pressable>
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
      {(isLoading || isDeleting) && <Spinner />}
    </SafeAreaView>
  );
}

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    errorText: {
      color: theme.colors.error.primary,
      fontFamily: theme.font.regular,
      fontSize: 12,
      marginTop: theme.spacing.xs,
      marginLeft: theme.spacing.xs,
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
    input: {
      fontFamily: theme.font.regular,
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
      marginTop: theme.spacing.sm,
    },
    label: {
      fontFamily: theme.font.medium,
      color: theme.colors.text.primary,
    },
    buttonText: {
      fontFamily: theme.font.medium,
      color: theme.colors.button.color,
    },
    innerView: {
      padding: '5%',
      backgroundColor: '#fff',
    },
    background: {
      backgroundColor: '#fff',
      borderRadius: 20,
    },
    item: {
      padding: theme.spacing.sm,
      backgroundColor: 'white',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 0.5,
      borderColor: '#f2f2f2',
    },
    iconButton: {
      width: 30,
      height: 50,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemTitle: {
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xxs,
      fontFamily: theme.font.medium,
      fontSize: 16,
    },
    itemSubtitle: {
      color: theme.colors.text.dark,
      fontFamily: theme.font.regular,
      fontSize: 14,
    },
    scrollviewContent: {
      borderRadius: 15,
      overflow: 'hidden',
    },
    featuredItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    featuredItemText: {
      color: theme.colors.text.white,
      fontFamily: theme.font.medium,
      fontSize: 14,
      marginLeft: theme.spacing.xs,
    },
    featuredItemContainer: {
      width: '90%',
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'space-around',
      minHeight: 70,
      borderRadius: 20,
      backgroundColor: '#0032FA',
      position: 'absolute',
      top: -35,
      flexDirection: 'row',
      zIndex: 1000,
    },
    content: {
      width: '100%',
      height: '100%',
      backgroundColor: '#f2f2f2',
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      marginTop: theme.spacing.xxs,
      zIndex: 1000,
    },
    scrollview: {
      padding: theme.spacing.md,
    },
    profileContainer: {
      width: 110,
      height: 110,
      borderRadius: 110,
      borderWidth: 1,
      borderColor: theme.colors.text.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 100,
      backgroundColor: theme.colors.text.white,
    },
    container: {
      flex: 1,
    },
    leftHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerText: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.semibold,
      fontSize: 16,
      marginLeft: theme.spacing.xs,
    },
    wrapper: {
      padding: '5%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  }),
);
