import { useMemo } from 'react';
import {
  NavigationProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import { RootStackParameterList } from 'navigation/navigator';

const NAV_REPLACE_ACTION = 'REPLACE';

interface UseNavAPI extends NavigationProp<RootStackParameterList> {
  /**
   * Navigate by replace to a route in current navigation tree.
   *
   * @param name Name of the route to navigate to.
   * @param [params] Params object for the route.
   */
  replace<RouteName extends keyof RootStackParameterList>(
    routeName: RouteName,
    params?: RootStackParameterList[RouteName],
  ): void;
}

export function useNav(): UseNavAPI {
  const navigation = useNavigation<NavigationProp<RootStackParameterList>>();
  return useMemo(
    () =>
      ({
        ...navigation,
        replace<RouteName extends keyof RootStackParameterList>(
          routeName: RouteName,
          params?: RootStackParameterList[RouteName],
        ): void {
          return navigation.dispatch(
            StackActions.replace(routeName as string, params),
          );
        },
      } as UseNavAPI),
    [navigation],
  );
}
