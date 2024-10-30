import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import notifee from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import React from 'react';
import {
  Appearance,
  AppRegistry,
  Platform,
  Text,
  TextInput,
} from 'react-native';
import codePush from 'react-native-code-push';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import { name as appName } from './app.json';
import App from './src/app';
import store from './src/redux/store';

const persistor = persistStore(store);

messaging().setBackgroundMessageHandler(async remoteMessage => {
  const { data, notification } = remoteMessage;
  Appearance.setColorScheme('light');
  Platform.OS === 'ios' &&
    notifee.displayNotification({
      ios: {
        sound: 'default',
      },
      android: {
        sound: 'default',
        channelId: 'default',
      },
      title: notification.title,
      body: notification.body,
      ...(data && { data }),
    });
});

// Set up a listener for dynamic link events

const WrappedApp = () => (
  <Provider store={store}>
    <PersistGate loading={undefined} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);

function HeadlessCheck({ isHeadless }) {
  if (isHeadless) {
    // ignore if app has been launched in the background by iOS
    return null;
  }

  return <WrappedApp />;
}

const CodePushApp = codePush({
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.IMMEDIATE,
})(HeadlessCheck);

// Disable Font Scaling
// TODO: support font scaling
if (Text.defaultProps) {
  Text.defaultProps.allowFontScaling = false;
} else {
  Text.defaultProps = {};
  Text.defaultProps.allowFontScaling = false;
}

// Override Text scaling in input fields
if (TextInput.defaultProps) {
  TextInput.defaultProps.allowFontScaling = false;
} else {
  TextInput.defaultProps = {};
  TextInput.defaultProps.allowFontScaling = false;
}

// Import the functions you need from the SDKs you need
// import { initializeApp } from 'firebase/app';
// import { getAnalytics } from 'firebase/analytics';
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries
//
// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: 'AIzaSyC46v5LB017ZEJvV3LuYIKLD3AMmHMItfc',
//   authDomain: 'proceipt-9b5bb.firebaseapp.com',
//   projectId: 'proceipt-9b5bb',
//   storageBucket: 'proceipt-9b5bb.appspot.com',
//   messagingSenderId: '236766359073',
//   appId: '1:236766359073:web:bfbd23a9c82a0c87f4fd60',
//   measurementId: 'G-6PPKZDBWPR',
// };
//
// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

AppRegistry.registerComponent('Proceipt', () => CodePushApp);
