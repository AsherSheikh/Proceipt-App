import 'react-native-url-polyfill/auto';
import ErrorBoundary from 'components/error-boundary/error-boundary-component';
import notifee, { AndroidGroupAlertBehavior } from '@notifee/react-native';
import React, { useCallback, useEffect } from 'react';
import { Platform, StatusBar, StyleSheet } from 'react-native';
import Navigator from 'navigation/navigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { styleSheetFactory, useTheme } from 'theme';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { createDefaultChannel, subscribeToTopic } from 'utils/messaging';
import { useDispatch } from 'react-redux';
import {
  setEnableNotifications,
  setFcmToken,
} from 'features/settings/settings-reducer';
import Toast from 'react-native-toast-message';
import ProvidersHoc from './providers/providers_hoc';
import { StripeProvider } from '@stripe/stripe-react-native';
import { withIAPContext } from 'react-native-iap';

const showNotification = (
  notification?: FirebaseMessagingTypes.Notification,
) => {
  notifee.displayNotification({
    title: notification?.title ?? '',
    subtitle: notification?.body ?? '',
    android: {
      channelId: 'default',
      groupSummary: true,
      sound: 'default',
      groupAlertBehavior: AndroidGroupAlertBehavior.ALL,
    },
    ios: {
      sound: 'default',
      interruptionLevel: 'active',
    },
  });
};

function App() {
  const dispatch = useDispatch();

  const [styles] = useTheme(Styles);

  const getPersmission = useCallback(async () => {
    const authorization = await messaging().requestPermission();

    if (authorization === messaging.AuthorizationStatus.DENIED) {
      dispatch(setEnableNotifications(false));
    } else if (authorization === messaging.AuthorizationStatus.AUTHORIZED) {
      dispatch(setEnableNotifications(true));
      Platform.OS === 'ios'
        ? messaging().registerDeviceForRemoteMessages()
        : createDefaultChannel();

      const token = await messaging().getToken();

      token && dispatch(setFcmToken(token));

      subscribeToTopic('GENERAL');
    }
  }, [dispatch]);

  useEffect(() => {
    getPersmission();
  }, [getPersmission]);

  useEffect(() => {
    messaging().onMessage(response => {
      showNotification(response.notification);
    });
  }, []);

  return (
    <StripeProvider
      publishableKey={
        'pk_live_51MlFrpBq0qU7H3Ck9ugAu73u3uD9fnFnJqernQDFxNt7olrNkg7gdxSiaGp1ZgGGAAn3wHDtV0T0CBOrDfXOtY5g00Ouo1Ruiq'
      }
      merchantIdentifier={'merchant.com.proceipt.customer'}
    >
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <StatusBar barStyle={'dark-content'} />
          <ErrorBoundary>
            <BottomSheetModalProvider>
              <ProvidersHoc>
                <Navigator />
              </ProvidersHoc>
              <Toast position="bottom" />
            </BottomSheetModalProvider>
          </ErrorBoundary>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </StripeProvider>
  );
}

const Styles = styleSheetFactory(() =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
  }),
);

export default withIAPContext(App);
