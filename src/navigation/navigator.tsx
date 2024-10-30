import useBackButtonHandler from 'hooks/use-back-handler';
import auth from '@react-native-firebase/auth';
import React, { useCallback, useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme, useTheme } from 'theme';
import { linking, navigationReference } from './navigation-helpers';
import Styles from './navigator-styles';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import SplashScreen from 'screens/splash';
import LoginScreen from 'screens/auth/login';
import SignupScreen from 'screens/auth/signup';
import { useDispatch, useSelector } from 'react-redux';
import ReactNativeBiometrics from 'react-native-biometrics';
import {
  getToken,
  setToken,
} from 'features/authentication/authentication-reducer';
import HomeScreen from 'screens/app/home';
import FolderScreen from 'screens/app/folder';
import ReceiptScreen from 'screens/app/receipt';
import ProfileScreen from 'screens/app/profile';
import ProfileSettingsScreen from 'screens/app/settings/profile';
import PrivacySettingsScreen from 'screens/app/settings/privacy';
import SecuritySettingsScreen from 'screens/app/settings/security';
import { ScanScreen } from 'screens/app/receipt/scan';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ReceiptDetailsScreen from 'screens/app/receipt/receipt-details';
import {
  useLazyReadUserQuery,
  useUpdateFcmTokenMutation,
} from 'features/profile/profile-reducer';
import OnboardScreen from 'screens/auth/onboard';
import NotificationSettingsScreen from 'screens/app/settings/notifications';
import { Folder, OrganisationFolder, Receipt } from 'utils/type';
import { HomeIcon } from 'assets/svg/home';
import { FolderTabIcon } from 'assets/svg/folder';
import { ReceiptTabIcon } from 'assets/svg/receipt';
import { parseJwt } from 'features/authentication/authentication-helpers';
import { UploadProgressScreen } from 'screens/app/receipt/upload-progress';
import VerifyAccountScreen from 'screens/auth/verify-account';
import ForgotPasswordScreen from 'screens/auth/forgot-password';
import { useAuthState } from '@skillnation/react-native-firebase-hooks/auth';
import {
  getFcmToken,
  isBiometricsEnabled,
  setEnableBiometrics,
} from 'features/settings/settings-reducer';
import Spinner from 'components/spinner';
import OnBoarding from 'screens/auth/onboarding';
import ReceiptDetailsAfterScanScreen from 'screens/app/receipt/receipt-details-after-scan';
import { clear } from '../redux/clear';
import { TabContextProvider, useTabMenu } from '../context/tab-context';
import CameraButton from './camera-button';
import { Platform } from 'expo-modules-core';
import NotificationScreen from 'screens/app/notifications';
import { AssignedFolderDetailsScreen } from '../screens/app/workspace/folder-details';
import { OrganisationOwnerScreen } from '../screens/app/workspace/owner';
import { Billing } from '../screens/app/billing/Billing';
import WorkspaceTabIcon from '../assets/svg/WorkspaceTabIcon';
import SelectOrganisationScreen from '../screens/app/workspace/organisations';
import FolderDetailsScreen from '../screens/app/folder/folder-details';
import { OrganisationFoldersScreen } from '../screens/app/workspace/organisation-folders';
import GetStarted from '../screens/auth/get_started';
import { Organisation } from '../entities/organisation';
import OrganisationScreen from '../screens/app/organisation/screens/organisation';
import SetupOrganisationScreen from '../screens/app/organisation/screens/setup_organisation';
import InvoiceScreen from '../screens/app/invoice/screens/invoice_screen';
import InvoiceIcon from '../assets/svg/invoice';
import ClientsScreen from '../screens/app/invoice/screens/clients_screen';
import CreateInvoiceScreen from '../screens/app/invoice/screens/create_invoice_screen';
import { Invoice } from '../entities/invoice';
import EditInvoiceScreen from '../screens/app/invoice/screens/edit_invoice_screen';
import InvoiceDetailsScreen from '../screens/app/invoice/screens/invoice_details_screen';

export type RootStackParameterList = {
  Onboard: undefined;
  Auth: undefined;
  App: undefined;

  FolderDetails: Folder;

  ProfileSettings: undefined;
  SecuritySettings: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  Notification: undefined;
  Scan: {
    folderId?: string;
  };
  UploadProgress: {
    receipts: { uri: string; type: 'PDF' | 'IMG' }[];
    folderId?: string;
  };
  ReceiptDetails: { receipt: Receipt; folderId?: string };
  ReceiptDetailsAfterScan: Receipt;
  Profile: undefined;
  Billing: {
    scansThreHold?: boolean;
  };

  OrganisationFolders: { id: string; name: string };
  /// List of folders assigned to an employee in a department
  AssignedFolderDetails: OrganisationFolder;
  /// Dashboard for organisation owners
  OrganisationOwner: Organisation;

  MyOrganisation: undefined;

  SetupOrganisation: undefined;

  Clients: undefined;

  CreateInvoice: undefined;
  EditInvoice: Invoice;
  InvoiceDetails: Invoice;
};

export type AuthStackParameterList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  Signup: undefined;
  GetStarted: undefined;
  VerifyAccount: {
    email: string;
  };
};

export type AppStackParameterList = {
  Home: undefined;
  Folder?: {
    id: number;
    action: 'createFolder';
  };
  Receipt?: {
    id: number;
  };
  PreScan: undefined;

  Invoice: undefined;

  WorkSpace: undefined;
};

export type Routes = AuthStackParameterList & RootStackParameterList;

const styles = StyleSheet.create({
  tabBar: {
    ...(Platform.OS === 'ios'
      ? {
          height: 90,
        }
      : {
          height: 60,
        }),
    paddingBottom: 5,
    borderRadius: 16,
    backgroundColor: 'white',
    borderTopColor: 'transparent',
    shadowColor: '#f2f2f2',
    shadowOffset: {
      height: 6,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarLabel: {
    fontFamily: theme.font.medium,
    ...(Platform.OS === 'ios' && {
      marginBottom: 30,
    }),
  },
  tabIcon: {},
});

const Tabs = () => {
  const Tab = createBottomTabNavigator<AppStackParameterList>();
  const [hideFAB, setHideFAB] = useState(false);

  const { opened, toggleOpened } = useTabMenu();
  return (
    <>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarIconStyle: styles.tabIcon,
        }}
      >
        <Tab.Screen
          options={{
            tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          }}
          component={HomeScreen}
          name="Home"
          listeners={{
            tabPress: () => {
              setHideFAB(false);
              if (opened) {
                toggleOpened();
              }
            },
          }}
        />

        <Tab.Screen
          options={{
            tabBarIcon: ({ color }) => <FolderTabIcon color={color} />,
          }}
          component={FolderScreen}
          name="Folder"
          listeners={({ navigation }) => ({
            blur: () => navigation.setParams({ id: undefined }),
            tabPress: () => {
              setHideFAB(false);
              if (opened) {
                toggleOpened();
              }
            },
          })}
        />

        <Tab.Screen
          options={{
            tabBarIcon: ({ color }) => <ReceiptTabIcon color={color} />,
          }}
          component={ReceiptScreen}
          name="Receipt"
          listeners={({ navigation }) => ({
            blur: () => navigation.setParams({ id: undefined }),
            tabPress: () => {
              setHideFAB(false);
              if (opened) {
                toggleOpened();
              }
            },
          })}
        />
        <Tab.Screen
          options={{
            tabBarIcon: ({ color }) => <InvoiceIcon color={color} />,
          }}
          component={InvoiceScreen}
          name="Invoice"
          listeners={({ navigation }) => ({
            blur: () => navigation.setParams({ id: undefined }),
            tabPress: () => {
              setHideFAB(true);
              if (opened) {
                toggleOpened();
              }
            },
          })}
        />
        <Tab.Screen
          options={{
            tabBarIcon: ({ color }) => <WorkspaceTabIcon color={color} />,
          }}
          component={SelectOrganisationScreen}
          name="WorkSpace"
          listeners={({ navigation }) => ({
            blur: () => navigation.setParams({ id: undefined }),
            tabPress: () => {
              setHideFAB(true);
              if (opened) {
              }
            },
          })}
        />

        <Tab.Screen
          name="PreScan"
          component={HomeScreen}
          listeners={{
            tabPress: e => opened && e.preventDefault(),
          }}
          options={{
            tabBarItemStyle: {
              height: 0,
            },
            tabBarButton: () =>
              !hideFAB && (
                <CameraButton opened={opened} toggleOpened={toggleOpened} />
              ),
          }}
        />
      </Tab.Navigator>
    </>
  );
};

const AuthStack = () => {
  const Stack = createNativeStackNavigator<AuthStackParameterList>();
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen component={SplashScreen} name="Splash" />
      <Stack.Screen component={LoginScreen} name="Login" />
      <Stack.Screen component={OnBoarding} name="Onboarding" />
      <Stack.Screen component={ForgotPasswordScreen} name="ForgotPassword" />
      <Stack.Screen component={SignupScreen} name="Signup" />
      <Stack.Screen component={GetStarted} name="GetStarted" />
      <Stack.Screen component={VerifyAccountScreen} name="VerifyAccount" />
    </Stack.Navigator>
  );
};

type NavigationProps = Partial<
  React.ComponentProps<typeof NavigationContainer>
>;

const RootNavigator = (props: NavigationProps) => {
  const dispatch = useDispatch();
  const token = useSelector(getToken);
  const fcm = useSelector(getFcmToken);
  const hasBiometricsBeenEnabled = useSelector(isBiometricsEnabled);

  const [stage, setStage] = useState<
    'SPLASH' | 'ONBOARD' | 'APP' | 'AUTH_REQUIRED'
  >('SPLASH');

  const [fetch, { error, isError, isSuccess, isLoading }] =
    useLazyReadUserQuery();
  const [updateFcmToken] = useUpdateFcmTokenMutation();

  const [user] = useAuthState(auth);

  const handleGoToApp = useCallback(async () => {
    const userProfile = auth().currentUser;
    if (userProfile) {
      const _token = await userProfile.getIdToken();
      dispatch(setToken(_token));
      setStage('APP');
    }
  }, [dispatch]);

  const fetchUserStatus = useCallback(async () => {
    if (user) {
      const _token = await user.getIdToken();
      dispatch(setToken(_token));
      await fetch().unwrap();
      setStage('APP');
      fcm && updateFcmToken({ token: fcm });
    } else {
      dispatch(setToken(''));
      setStage('AUTH_REQUIRED');
    }
  }, [user, dispatch, fetch, fcm, updateFcmToken]);

  const initializeApp = useCallback(async () => {
    if (hasBiometricsBeenEnabled && user) {
      const rnBiometrics = new ReactNativeBiometrics();
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Authenticate',
      });
      if (success) {
        fetchUserStatus();
      } else {
        await auth().signOut();
        setStage('AUTH_REQUIRED');
        dispatch(clear());
        dispatch(setEnableBiometrics(false));
      }
    } else {
      fetchUserStatus();
    }
  }, [fetchUserStatus, dispatch, user, hasBiometricsBeenEnabled]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  const Stack = createNativeStackNavigator<RootStackParameterList>();

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const [styles] = useTheme(Styles);

  useBackButtonHandler(canExit);

  useEffect(() => {
    if (error && 'status' in error && error.status === 404 && user && isError) {
      setStage('ONBOARD');
    } else if (isSuccess) {
      handleGoToApp();
    }
  }, [error, dispatch, isError, user, isSuccess, handleGoToApp]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (token) {
      const result = parseJwt(token);

      if (result?.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeToExpire = (result.exp - currentTime) * 1000 - 60000;

        timer = setTimeout(
          async () => {
            if (user) {
              const _token = await user.getIdToken();
              dispatch(setToken(_token));
            }
          },
          Math.max(0, timeToExpire),
        );
      }
    }

    return () => {
      clearTimeout(timer);
    };
  }, [token, dispatch, user]);

  return (
    <>
      <NavigationContainer
        linking={linking}
        ref={navigationReference}
        theme={DefaultTheme}
        {...props}
      >
        <TabContextProvider>
          <View style={styles.background}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {['SPLASH', 'AUTH_REQUIRED'].includes(stage) ? (
                <Stack.Screen
                  component={AuthStack}
                  name="Auth"
                  options={{ headerShown: false }}
                />
              ) : (
                <>
                  {stage === 'ONBOARD' ? (
                    <Stack.Screen component={OnboardScreen} name="Onboard" />
                  ) : (
                    <>
                      <Stack.Screen
                        component={Tabs}
                        name="App"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        component={FolderDetailsScreen}
                        name="FolderDetails"
                      />

                      <Stack.Screen
                        component={NotificationScreen}
                        name="Notification"
                        options={{
                          presentation: 'transparentModal',
                        }}
                      />
                      <Stack.Screen
                        component={ProfileSettingsScreen}
                        name="ProfileSettings"
                      />
                      <Stack.Screen
                        component={PrivacySettingsScreen}
                        name="PrivacySettings"
                      />
                      <Stack.Screen component={ProfileScreen} name="Profile" />
                      <Stack.Screen
                        component={ReceiptDetailsScreen}
                        name="ReceiptDetails"
                      />
                      <Stack.Screen
                        component={ReceiptDetailsAfterScanScreen}
                        name="ReceiptDetailsAfterScan"
                      />
                      <Stack.Screen component={ScanScreen} name="Scan" />

                      <Stack.Screen
                        component={SecuritySettingsScreen}
                        name="SecuritySettings"
                      />

                      <Stack.Screen
                        component={UploadProgressScreen}
                        name="UploadProgress"
                      />
                      <Stack.Screen
                        component={NotificationSettingsScreen}
                        name="NotificationSettings"
                      />
                      <Stack.Screen
                        component={OrganisationFoldersScreen}
                        name="OrganisationFolders"
                      />
                      <Stack.Screen
                        component={AssignedFolderDetailsScreen}
                        name="AssignedFolderDetails"
                      />
                      <Stack.Screen
                        component={OrganisationOwnerScreen}
                        name="OrganisationOwner"
                      />
                      <Stack.Screen component={Billing} name="Billing" />
                      <Stack.Screen
                        component={OrganisationScreen}
                        name="MyOrganisation"
                      />
                      <Stack.Screen
                        component={SetupOrganisationScreen}
                        name="SetupOrganisation"
                      />
                      <Stack.Screen component={ClientsScreen} name="Clients" />
                      <Stack.Screen
                        component={CreateInvoiceScreen}
                        name="CreateInvoice"
                      />
                      <Stack.Screen
                        component={EditInvoiceScreen}
                        name="EditInvoice"
                      />
                      <Stack.Screen
                        component={InvoiceDetailsScreen}
                        name="InvoiceDetails"
                      />
                    </>
                  )}
                </>
              )}
            </Stack.Navigator>
          </View>
          {user && isLoading && <Spinner />}
        </TabContextProvider>
      </NavigationContainer>
    </>
  );
};

RootNavigator.displayName = 'RootNavigator';

/**
 * A list of routes from which we're allowed to leave the app when
 * the user presses the back button on Android.
 *
 * Anything not on this list will be a standard `back` action in
 * react-navigation.
 */
const exitRoutes = new Set<keyof Routes>(['Login', 'Splash']);

export const canExit = (routeName: keyof Routes) => exitRoutes.has(routeName);

export default RootNavigator;
