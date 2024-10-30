import type {
  NavigationAction,
  NavigationState,
  PartialState,
} from '@react-navigation/native';
import {
  createNavigationContainerRef,
  getActionFromState,
  getPathFromState,
  getStateFromPath,
} from '@react-navigation/native';
import { Platform } from 'react-native';

import { Routes } from './navigator';

const scheme = 'proceipt';
export const prefix =
  Platform.OS === 'android' ? `${scheme}://proceipt/` : `${scheme}://`;

export const RootNavigation = {
  navigate(_name: string, _parameters?: any) {},
  goBack() {},
  resetRoot(_state?: PartialState<NavigationState> | NavigationState) {},
  getRootState(): NavigationState {
    return {} as any;
  },
  dispatch(_action: NavigationAction) {},
};

export const navigationReference = createNavigationContainerRef();

/**
 * Gets the current screen from any navigation state.
 */
export function getActiveRouteName(
  state: NavigationState | PartialState<NavigationState>,
) {
  if (state.index) {
    const route = state.routes[state.index];
    // Found the active route -- return the name
    if (!route.state) {
      return route.name;
    }

    // Recursive call to deal witjh nested routers
    return getActiveRouteName(route.state);
  }
}

/**
 * use this to navigate to navigate without the navigation
 * prop. If you have access to the navigation prop, do not use this.
 * More info: https://reactnavigation.org/docs/navigating-without-navigation-prop/
 */
export function navigate(name: keyof Routes, parameters?: any) {
  if (navigationReference.isReady()) {
    navigationReference.navigate(name as never, parameters as never);
  }
}

export function goBack() {
  if (navigationReference.isReady() && navigationReference.canGoBack()) {
    navigationReference.goBack();
  }
}

export function resetRoot(parameters: any) {
  if (navigationReference.isReady()) {
    parameters
      ? navigationReference.resetRoot(parameters)
      : navigationReference.resetRoot({ index: 0, routes: [] });
  }
}

const cleanPathString = (path: string) => {
  const queryVairablesIndex = path.indexOf('?');
  if (queryVairablesIndex === -1) {
    return path;
  }
  return path.slice(0, Math.max(0, queryVairablesIndex));
};

export const checkDeepLinkResult = (url: string) => {
  const extractedUrl = url.replace(prefix, '');

  const currentState =
    navigationReference.current?.getRootState() as NavigationState;

  const linkState = getStateFromPath(
    extractedUrl,
    linking.config as any,
  ) as PartialState<NavigationState>;

  const currentPath = cleanPathString(getPathFromState(currentState));

  const linkPath = cleanPathString(getPathFromState(linkState));

  const action = getActionFromState(linkState);

  return {
    action,
    linkPath,
    didDeepLinkLand: currentPath === linkPath,
  };
};

export const linking = {
  prefixes: [prefix],
  config: {
    screens: {
      Auth: {
        screens: {
          Onboading: 'Onboading',
          Login: 'Login',
        },
      },
    },
  },
};
