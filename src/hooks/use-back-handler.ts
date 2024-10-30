import { Routes } from 'navigation/navigator';
import { useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';

import {
  getActiveRouteName,
  navigationReference,
} from '../navigation/navigation-helpers';

/**
 * handles Android back button presses and forwards those on to
 * the navigation or allows exiting the app.
 */
export default function useBackButtonHandler(
  canExit: (routeName: keyof Routes) => boolean,
) {
  const canExitReference = useRef(canExit);

  useEffect(() => {
    canExitReference.current = canExit;
  }, [canExit]);

  useEffect(() => {
    // We'll fire this when the back button is pressed on Android.
    const onBackPress = () => {
      if (!navigationReference.isReady()) {
        return false;
      }

      // grab the current route
      const routeName = getActiveRouteName(navigationReference.getRootState());

      // are we allowed to exit?
      if (canExitReference.current(routeName)) {
        // exit and let the system know we've handled the event
        BackHandler.exitApp();
        return true;
      }

      // we can't exit, so let's turn this into a back action
      if (navigationReference.canGoBack()) {
        navigationReference.goBack();
        return true;
      }

      return false;
    };

    // Subscribe when we come to life
    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    // Unsubscribe when we're done
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, []);
}
