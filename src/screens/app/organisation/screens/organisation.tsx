import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LeftArrow } from '../../../../assets/svg/left-arrow';
import { styleSheetFactory, theme, useTheme } from '../../../../theme';
import React from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParameterList } from '../../../../navigation/navigator';
import useOrganisation from '../../../../hooks/use_organisation';
import NoOrganisation from '../components/no_organisation';
import UpdateOrganisation from './update_organisation';

const OrganisationScreen = () => {
  const insets = useSafeAreaInsets();
  const [styles] = useTheme(Styles);
  const { goBack } = useNavigation<NavigationProp<RootStackParameterList>>();
  const { organisation } = useOrganisation();
  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top + 15,
        paddingBottom: insets.bottom,
        paddingHorizontal: '5%',
      }}
    >
      <View style={styles.header}>
        <Pressable onPress={() => goBack()} style={styles.leftHeader}>
          <LeftArrow color={theme.colors.text.darkGrey} />
          <Text style={styles.headerText}>Your Organisation</Text>
        </Pressable>
      </View>
      {organisation ? (
        organisation.id ? (
          <UpdateOrganisation />
        ) : (
          <NoOrganisation />
        )
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
};

export default OrganisationScreen;

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    headerText: {
      color: '#333',
      fontFamily: theme.font.semibold,
      fontSize: 16,
      marginLeft: theme.spacing.xs,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  }),
);
