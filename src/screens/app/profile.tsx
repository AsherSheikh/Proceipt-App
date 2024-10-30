import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useMemo, useRef } from 'react';
import { styleSheetFactory, theme, useTheme } from 'theme';
import * as WebBrowser from 'expo-web-browser';
import {
  getUser,
  setIsAuthenticated,
  setOnboarded,
  useDeleteUserMutation,
  useReadUserQuery,
  useUpdateUserMutation,
} from 'features/profile/profile-reducer';
import auth from '@react-native-firebase/auth';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParameterList } from 'navigation/navigator';
import { launchImageLibrary } from 'react-native-image-picker';
import { manipulateAsync } from 'expo-image-manipulator';
import { useDispatch, useSelector } from 'react-redux';
import { apiSlice } from 'features/api/api-slice';
import { clear } from '../../redux/clear';
import { PenSettingsIcon } from 'assets/svg/pen-settings';
import { Switch, TouchableOpacity } from 'react-native-gesture-handler';
import {
  isBiometricsEnabled,
  setEnableBiometrics,
} from 'features/settings/settings-reducer';
import ReactNativeBiometrics from 'react-native-biometrics';
import { LeftArrow } from 'assets/svg/left-arrow';
import { DefaultProfilePhoto } from 'utils/constants';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { CurrencyList } from 'components/currency/currency-list';
import Spinner from '../../components/spinner';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
  const [styles] = useTheme(Styles);
  const dispatch = useDispatch();

  const { data } = useReadUserQuery();
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const userData = useSelector(getUser);

  const isBiometricEnabled = useSelector(isBiometricsEnabled);

  const [deleteAccountMutation, { isLoading: isDeleting }] =
    useDeleteUserMutation();

  const onLogout = async () => {
    await auth().signOut();
    dispatch(setIsAuthenticated(false));
    dispatch(setOnboarded(false));
    dispatch(clear());
    dispatch(
      apiSlice.util.invalidateTags([
        'User',
        'Folder',
        'Receipt',
        'ReceiptHistory',
      ]),
    );
  };

  const { navigate, goBack } =
    useNavigation<NavigationProp<RootStackParameterList>>();

  const handleNavigate = async (value: string) => {
    if (value !== 'faq') {
      // @ts-ignore
      navigate(value);
    } else {
      await WebBrowser.openBrowserAsync('https://proceipt.com');
    }
  };

  const onChooseImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
      });

      const asset = result?.assets?.[0];

      if (asset) {
        const response = await manipulateAsync(asset.uri as string, [], {
          base64: true,
          compress: 0.3,
        });

        updateUser({
          photoUrl: response.base64,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeBiomentrics = async (value: boolean) => {
    const rnBiometrics = new ReactNativeBiometrics();
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: 'Authenticate',
    });
    if (success) {
      dispatch(setEnableBiometrics(value));
    } else {
      alert('Request failed');
    }
  };

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const deleteAccountBottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['75%'], []);

  const deleteAccount = async () => {
    try {
      deleteAccountBottomSheetRef.current?.dismiss();
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
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  const renderBackdrop: React.FC<BottomSheetBackdropProps> = props => {
    return (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    );
  };

  const onChangeCurrency = (currency: string) => {
    updateUser({ currency });
  };

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.wrapper}>
          <View style={styles.header}>
            <Pressable onPress={() => goBack()} style={styles.leftHeader}>
              <LeftArrow color={theme.colors.text.darkGrey} />
              <Text style={styles.headerText}>Your Details</Text>
            </Pressable>
          </View>
          <View style={styles.headerCardContainer}>
            <Pressable onPress={onChooseImage} style={styles.profileContainer}>
              <Image
                source={{ uri: data?.photoUrl ?? DefaultProfilePhoto }}
                style={styles.profileImage}
              />
              {isLoading && (
                <View style={styles.overlay}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
            </Pressable>
            <View style={styles.editProfile}>
              <PenSettingsIcon />
            </View>
            <Text style={styles.name}>
              {data?.name || auth().currentUser?.displayName || '-'}
            </Text>
            <Text style={styles.username}>{data?.email}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <ScrollView
            contentContainerStyle={styles.scrollviewContent}
            style={styles.scrollview}
          >
            <View style={styles.combinedItem}>
              <Pressable
                onPress={() => navigate('ProfileSettings')}
                style={[styles.combinedContent, { paddingBottom: 15 }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={[styles.iconButton, { backgroundColor: '#EBF6EC' }]}
                  >
                    <Text>✏️</Text>
                  </View>
                  <View>
                    <Text style={[styles.itemTitle]}>Personal Details</Text>
                    <Text style={styles.itemSubtitle}>
                      Your profile information
                    </Text>
                  </View>
                </View>
              </Pressable>
              <Pressable
                onPress={() => navigate('MyOrganisation')}
                style={[
                  styles.combinedContent,
                  {
                    borderColor: '#f2f2f2',
                    borderTopWidth: 2,
                    paddingTop: 15,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={[styles.iconButton, { backgroundColor: '#EBF6EC' }]}
                  >
                    <Text>🛖</Text>
                  </View>
                  <View>
                    <Text style={[styles.itemTitle]}>Organisation Details</Text>
                    <Text style={styles.itemSubtitle}>
                      Your organisation information
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>

            <View style={styles.combinedItem}>
              <Pressable
                onPress={() => navigate('Billing', {})}
                style={[styles.combinedContent, { paddingBottom: 15 }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={[styles.iconButton, { backgroundColor: '#EBF6EC' }]}
                  >
                    <Text>💰</Text>
                  </View>
                  <View>
                    <Text style={[styles.itemTitle]}>Billing</Text>
                    <Text style={styles.itemSubtitle}>
                      Change Billing & Subscription
                    </Text>
                  </View>
                </View>
              </Pressable>
              <Pressable
                onPress={() => navigate('SecuritySettings')}
                style={[
                  styles.combinedContent,
                  {
                    borderColor: '#f2f2f2',
                    borderTopWidth: 2,
                    paddingVertical: 15,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={[styles.iconButton, { backgroundColor: '#EBF6EC' }]}
                  >
                    <Text>🔒</Text>
                  </View>
                  <View>
                    <Text style={[styles.itemTitle]}>Account Security</Text>
                    <Text style={styles.itemSubtitle}>
                      Manage your account security
                    </Text>
                  </View>
                </View>
              </Pressable>
              <Pressable
                onPress={() => navigate('PrivacySettings')}
                style={[
                  styles.combinedContent,

                  {
                    borderColor: '#f2f2f2',
                    borderTopWidth: 2,
                    paddingVertical: 15,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={[styles.iconButton, { backgroundColor: '#E6DFF6' }]}
                  >
                    <Text>👁️</Text>
                  </View>
                  <View>
                    <Text style={[styles.itemTitle]}>Privacy</Text>
                    <Text style={styles.itemSubtitle}>T&Cs and your data</Text>
                  </View>
                </View>
              </Pressable>
              <View
                style={[
                  styles.combinedContent,
                  { borderColor: '#f2f2f2', borderTopWidth: 2, paddingTop: 15 },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={[styles.iconButton, { backgroundColor: '#D1E7F5' }]}
                  >
                    <Text>🔑</Text>
                  </View>
                  <View>
                    <Text style={[styles.itemTitle]}>Enable 2FA</Text>
                    <Text style={styles.itemSubtitle}>{data?.email}</Text>
                  </View>
                </View>
                <Switch
                  onValueChange={handleChangeBiomentrics}
                  value={isBiometricEnabled ?? false}
                />
              </View>
            </View>

            <Pressable
              onPress={() => navigate('NotificationSettings')}
              style={styles.item}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={[styles.iconButton, { backgroundColor: '#E9E3F7' }]}
                >
                  <Text>🔔</Text>
                </View>
                <View>
                  <Text style={[styles.itemTitle]}>Notifications</Text>
                  <Text style={styles.itemSubtitle}>
                    Emails & Push Notifications
                  </Text>
                </View>
              </View>
            </Pressable>

            <View style={styles.combinedItem}>
              <Pressable
                onPress={() => handleNavigate('faq')}
                style={[styles.combinedContent, { paddingBottom: 15 }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={[styles.iconButton, { backgroundColor: '#EBF6EC' }]}
                  >
                    <Text>❓</Text>
                  </View>
                  <View>
                    <Text style={[styles.itemTitle]}>Help</Text>
                    <Text style={styles.itemSubtitle}>FAQ & Support</Text>
                  </View>
                </View>
              </Pressable>
              <Pressable
                onPress={() => bottomSheetRef.current?.present()}
                style={[
                  styles.combinedContent,
                  {
                    borderColor: '#f2f2f2',
                    borderTopWidth: 2,
                    paddingTop: 15,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={[styles.iconButton, { backgroundColor: '#FDF3FB' }]}
                  >
                    <Text>⚖️</Text>
                  </View>
                  <View>
                    <Text style={[styles.itemTitle]}>
                      {'Currency - '}
                      {userData?.currency ?? 'GBP'}
                    </Text>
                    <Text style={styles.itemSubtitle}>
                      Select default currency
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
            <View style={styles.combinedItem}>
              <Pressable
                onPress={onLogout}
                style={[styles.combinedContent, { paddingBottom: 15 }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={[styles.iconButton, { backgroundColor: '#FFCEC0' }]}
                  >
                    <Text>👋</Text>
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.itemTitle,
                        { color: theme.colors.error.primary },
                      ]}
                    >
                      Logout
                    </Text>
                    <Text style={styles.itemSubtitle}>
                      Sign out of my account
                    </Text>
                  </View>
                </View>
              </Pressable>
              <Pressable
                onPress={() => {
                  deleteAccountBottomSheetRef.current?.present();
                }}
                style={[
                  styles.combinedContent,
                  {
                    borderColor: '#f2f2f2',
                    borderTopWidth: 2,
                    paddingTop: 15,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={[styles.iconButton, { backgroundColor: '#FDF3FB' }]}
                  >
                    <Text>🗑️</Text>
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.itemTitle,
                        { color: theme.colors.error.primary },
                      ]}
                    >
                      Delete Account
                    </Text>
                    <Text style={styles.itemSubtitle}>
                      Permanently remove your account
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
          </ScrollView>

          <BottomSheetModal
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            animateOnMount={true}
            backdropComponent={renderBackdrop}
          >
            <CurrencyList
              onItemPress={item => {
                onChangeCurrency(item.currency);
                bottomSheetRef?.current?.close();
              }}
            />
          </BottomSheetModal>

          <BottomSheetModal
            ref={deleteAccountBottomSheetRef}
            snapPoints={[300]}
            index={0}
            backdropComponent={renderBackdrop}
            style={styles.bottomSheet}
          >
            <BottomSheetScrollView
              style={{
                padding: 20,
              }}
            >
              <Text style={styles.heading}>Delete Your Account?</Text>
              <Text style={styles.subText}>
                Deleting your account will permanently remove your data from our
                servers without the ability to restore it. Proceed with caution.
              </Text>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { marginBottom: 15, backgroundColor: '#FF0000' },
                ]}
                onPress={async () => {
                  deleteAccountBottomSheetRef.current?.close();
                  await deleteAccount();
                }}
              >
                <Text
                  style={{
                    color: '#fff',
                  }}
                >
                  Yes Delete Account
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  deleteAccountBottomSheetRef.current?.close();
                }}
                style={[
                  styles.primaryBtn,
                  {
                    backgroundColor: undefined,
                    borderWidth: 1,
                    borderColor: theme.colors.grey.light,
                  },
                ]}
              >
                <Text>No Keep</Text>
              </TouchableOpacity>
            </BottomSheetScrollView>
          </BottomSheetModal>
        </View>
        {(isLoading || isDeleting) && <Spinner />}
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
}

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    primaryBtn: {
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: theme.colors.text.main,
      paddingVertical: 12,
      paddingHorizontal: 14,
    },

    bottomSheet: {
      backgroundColor: '#f2f2f2',
      borderRadius: 20,
    },
    heading: {
      fontFamily: theme.font.semibold,
      fontSize: 18,
      color: theme.colors.text.main,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    subText: {
      fontFamily: theme.font.regular,
      color: theme.colors.text.primary,
      fontSize: 15,
      marginBottom: theme.spacing.md,
      lineHeight: 22,
      textAlign: 'center',
    },

    combinedContent: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    combinedItem: {
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.card.background,
      borderRadius: 15,
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: '#e6e6e6',
    },
    item: {
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.card.background,
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: '#e6e6e6',
    },
    iconButton: {
      width: 50,
      height: 50,
      backgroundColor: 'rgba(0,15,72,0.1)',
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
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
      paddingBottom: theme.spacing.xxl,
    },
    featuredItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    featuredItemText: {
      color: theme.colors.text.darkGrey,
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
    name: {
      color: theme.colors.text.darkGrey,
      fontSize: 18,
      fontFamily: theme.font.semibold,
      marginTop: theme.spacing.md,
    },
    content: {
      width: '100%',
      backgroundColor: '#f5f5f5',
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      marginTop: theme.spacing.xxs,
      height: Dimensions.get('window').height * 0.65,
      zIndex: 1000,
    },
    scrollview: {
      padding: theme.spacing.md,
    },
    profileContainer: {
      width: 110,
      height: 110,
      borderRadius: 110,
      borderWidth: 2,
      borderColor: theme.colors.text.main,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 100,
      backgroundColor: theme.colors.text.main,
    },
    overlay: {
      position: 'absolute',
      width: 100,
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 100,
      backgroundColor: 'rgba(0,0,0,0.7)',
    },
    headerCardContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.xl,
    },
    headerCardText: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.regular,
      fontSize: 14,
      marginLeft: theme.spacing.xs,
    },
    container: {
      flex: 1,
      backgroundColor: '#f6f6f6',
    },
    leftHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerText: {
      color: '#333',
      fontFamily: theme.font.semibold,
      fontSize: 16,
      marginLeft: theme.spacing.xs,
    },
    wrapper: {
      padding: '5%',
      paddingBottom: 0,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    editProfile: {
      position: 'absolute',
      backgroundColor: theme.colors.text.main,
      borderWidth: 2,
      borderColor: '#fff',
      width: 40,
      height: 40,
      borderRadius: 40,
      bottom: 0,
      right: 120,
      top: 70,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    username: {
      color: 'rgba(0,0,0,0.8)',
      fontFamily: theme.font.medium,
      paddingBottom: theme.spacing.md,
      fontSize: 13,
    },
  }),
);
